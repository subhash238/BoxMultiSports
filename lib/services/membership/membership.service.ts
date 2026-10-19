import crypto from "crypto";
import { MembershipStatus, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors";
import { logger } from "@/lib/logger";

import {
  generateGuestPaymentToken,
  hashGuestPaymentToken,
  verifyGuestPaymentToken,
} from "../payment/guest-payment-token";
import { NotificationService } from "../notification/email.service";

import type { CreateMembershipInput } from "@/lib/validators/membership";

/**
 * ==========================================
 * Membership Service
 * ==========================================
 *
 * Monthly plans (Pickleball membership, Kids
 * Academy). Independent of slot bookings but
 * shares the Razorpay account + verification
 * rules: signature check, provider fetch,
 * amount/order/currency reconciliation.
 */

const PAYMENT_TOKEN_TTL_MINUTES = 30;
const MAX_START_OFFSET_DAYS = 60;
const MEMBERSHIP_PREFIX = "UTM";

const PUBLIC_SELECT = {
  id: true,
  membershipNumber: true,
  customerName: true,
  customerEmail: true,
  customerMobile: true,
  startDate: true,
  endDate: true,
  amount: true,
  status: true,
  paymentMethod: true,
  paymentStatus: true,
  plan: {
    select: { id: true, slug: true, name: true, durationDays: true },
  },
} satisfies Prisma.MembershipSelect;

function todayInIndia(): Date {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  return new Date(`${parts}T00:00:00.000Z`);
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

function formatNumberDate(date: Date): string {
  return date.toISOString().slice(0, 10).replace(/-/g, "").slice(2);
}

function randomSuffix(): string {
  return crypto.randomBytes(3).toString("hex").toUpperCase();
}

async function getRazorpay() {
  const { razorpay } = await import("@/lib/razorpay");
  return razorpay;
}

function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET;

  if (!secret) {
    throw new AppError("Razorpay secret key is not configured.", 500);
  }

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(signature, "utf8");

  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export class MembershipService {
  // ==========================================
  // Plans
  // ==========================================

  static listActivePlans() {
    return prisma.membershipPlan.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        price: true,
        durationDays: true,
        features: true,
      },
    });
  }

  // ==========================================
  // Create Membership (PENDING)
  // ==========================================

  static async createMembership(
    userId: string | null,
    data: CreateMembershipInput
  ) {
    const plan = await prisma.membershipPlan.findUnique({
      where: { slug: data.planSlug },
    });

    if (!plan || !plan.isActive) {
      throw new AppError("This plan is not available.", 404);
    }

    const today = todayInIndia();
    const startDate = data.startDate
      ? new Date(`${data.startDate}T00:00:00.000Z`)
      : today;

    if (Number.isNaN(startDate.getTime())) {
      throw new AppError("Invalid start date.", 400);
    }

    if (startDate < today) {
      throw new AppError("Start date cannot be in the past.", 400);
    }

    if (startDate > addDays(today, MAX_START_OFFSET_DAYS)) {
      throw new AppError(
        `Start date cannot be more than ${MAX_START_OFFSET_DAYS} days ahead.`,
        400
      );
    }

    const endDate = addDays(startDate, plan.durationDays - 1);
    const paymentMethod = data.paymentMethod ?? "ONLINE";

    const rawToken =
      paymentMethod === "ONLINE" ? generateGuestPaymentToken() : null;

    const baseData = {
      planId: plan.id,
      customerName: data.fullName,
      customerEmail: data.email.toLowerCase(),
      customerMobile: data.mobile,
      notes: data.notes ?? null,
      startDate,
      endDate,
      amount: plan.price,
      status: MembershipStatus.PENDING,
      paymentMethod,
      paymentTokenHash: rawToken ? hashGuestPaymentToken(rawToken) : null,
      paymentTokenExpiresAt: rawToken
        ? new Date(Date.now() + PAYMENT_TOKEN_TTL_MINUTES * 60 * 1000)
        : null,
      userId,
    };

    // Retry on the (very unlikely) number collision.
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        const membership = await prisma.membership.create({
          data: {
            ...baseData,
            membershipNumber: `${MEMBERSHIP_PREFIX}-${formatNumberDate(
              today
            )}-${randomSuffix()}`,
          },
          select: PUBLIC_SELECT,
        });

        logger.info("Membership created.", {
          membershipId: membership.id,
          membershipNumber: membership.membershipNumber,
          plan: plan.slug,
          paymentMethod,
        });

        return { membership, paymentToken: rawToken };
      } catch (error) {
        const isUniqueConflict =
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2002" &&
          Array.isArray(error.meta?.target) &&
          (error.meta.target as string[]).includes("membershipNumber");

        if (!isUniqueConflict) {
          throw error;
        }
      }
    }

    throw new AppError("Unable to create membership. Please retry.", 500);
  }

  // ==========================================
  // Authorization (guest token)
  // ==========================================

  private static async authorize(
    membershipId: string,
    paymentToken: string
  ) {
    const membership = await prisma.membership.findUnique({
      where: { id: membershipId },
      include: { plan: { select: { name: true, slug: true } } },
    });

    if (!membership) {
      throw new AppError("Membership not found.", 404);
    }

    const tokenValid =
      membership.paymentTokenHash !== null &&
      verifyGuestPaymentToken(paymentToken, membership.paymentTokenHash);

    if (!tokenValid) {
      throw new AppError(
        "You are not authorized to pay for this membership.",
        403
      );
    }

    return membership;
  }

  // ==========================================
  // Create Razorpay Order
  // ==========================================

  static async createRazorpayOrder(
    membershipId: string,
    paymentToken: string
  ) {
    const membership = await this.authorize(membershipId, paymentToken);

    if (membership.status === MembershipStatus.CANCELLED) {
      throw new AppError("Cancelled memberships cannot be paid.", 400);
    }

    if (membership.paymentStatus === "CAPTURED") {
      throw new AppError("This membership is already paid.", 400);
    }

    if (
      membership.paymentTokenExpiresAt &&
      membership.paymentTokenExpiresAt <= new Date()
    ) {
      throw new AppError(
        "Payment window expired. Please start again.",
        410
      );
    }

    const amountInPaise = Math.round(Number(membership.amount) * 100);

    if (membership.razorpayOrderId) {
      return {
        order: {
          id: membership.razorpayOrderId,
          amount: amountInPaise,
          currency: "INR",
          receipt: membership.membershipNumber,
        },
      };
    }

    const razorpay = await getRazorpay();

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: membership.membershipNumber,
      notes: {
        type: "MEMBERSHIP",
        membershipId: membership.id,
        plan: membership.plan.slug,
      },
    });

    await prisma.membership.update({
      where: { id: membership.id },
      data: { razorpayOrderId: order.id },
    });

    return {
      order: {
        id: order.id,
        amount: amountInPaise,
        currency: "INR",
        receipt: membership.membershipNumber,
      },
    };
  }

  // ==========================================
  // Verify Payment (browser callback)
  // ==========================================

  static async verifyPayment(input: {
    membershipId: string;
    paymentToken: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) {
    const membership = await this.authorize(
      input.membershipId,
      input.paymentToken
    );

    if (
      !membership.razorpayOrderId ||
      membership.razorpayOrderId !== input.razorpayOrderId
    ) {
      throw new AppError("Payment verification failed.", 400);
    }

    if (
      !verifyRazorpaySignature(
        input.razorpayOrderId,
        input.razorpayPaymentId,
        input.razorpaySignature
      )
    ) {
      throw new AppError("Invalid Razorpay payment signature.", 400);
    }

    // Idempotent replay (webhook may have won).
    if (membership.paymentStatus === "CAPTURED") {
      if (membership.razorpayPaymentId !== input.razorpayPaymentId) {
        throw new AppError("Payment verification failed.", 400);
      }

      return this.getPublic(membership.id);
    }

    const razorpay = await getRazorpay();

    let providerPayment;

    try {
      providerPayment = await razorpay.payments.fetch(
        input.razorpayPaymentId
      );
    } catch {
      throw new AppError("Payment verification failed.", 400);
    }

    const expectedPaise = Math.round(Number(membership.amount) * 100);

    const mismatch =
      providerPayment.id !== input.razorpayPaymentId ||
      providerPayment.order_id !== input.razorpayOrderId ||
      Number(providerPayment.amount) !== expectedPaise ||
      providerPayment.currency !== "INR" ||
      providerPayment.status !== "captured";

    if (mismatch) {
      throw new AppError("Payment verification failed.", 400);
    }

    await this.activate(membership.id, {
      razorpayPaymentId: input.razorpayPaymentId,
      razorpaySignature: input.razorpaySignature,
    });

    return this.getPublic(membership.id);
  }

  // ==========================================
  // Webhook fallback (payment.captured)
  // ==========================================

  /**
   * Returns true when the order belonged to a
   * membership (handled), false otherwise.
   */
  static async handleWebhookCapture(entity: {
    id: string;
    order_id: string;
    amount?: number | string;
  }): Promise<boolean> {
    const membership = await prisma.membership.findUnique({
      where: { razorpayOrderId: entity.order_id },
      select: { id: true, amount: true, paymentStatus: true },
    });

    if (!membership) {
      return false;
    }

    if (membership.paymentStatus === "CAPTURED") {
      return true;
    }

    const expectedPaise = Math.round(Number(membership.amount) * 100);
    const webhookPaise = Number(entity.amount);

    if (Number.isFinite(webhookPaise) && webhookPaise !== expectedPaise) {
      logger.error("Membership payment.captured amount mismatch.", {
        membershipId: membership.id,
        expectedPaise,
        webhookPaise,
      });
      return true;
    }

    await this.activate(membership.id, {
      razorpayPaymentId: entity.id,
      razorpaySignature: null,
    });

    return true;
  }

  private static async activate(
    membershipId: string,
    payment: {
      razorpayPaymentId: string;
      razorpaySignature: string | null;
    }
  ) {
    const updated = await prisma.membership.updateMany({
      where: {
        id: membershipId,
        paymentStatus: { not: "CAPTURED" },
      },
      data: {
        status: MembershipStatus.ACTIVE,
        paymentStatus: "CAPTURED",
        razorpayPaymentId: payment.razorpayPaymentId,
        razorpaySignature: payment.razorpaySignature,
        paidAt: new Date(),
      },
    });

    if (updated.count === 1) {
      logger.info("Membership activated.", { membershipId });
      void NotificationService.sendMembershipConfirmation(membershipId);
    }
  }

  // ==========================================
  // Read
  // ==========================================

  static async getPublic(membershipId: string) {
    const membership = await prisma.membership.findUnique({
      where: { id: membershipId },
      select: PUBLIC_SELECT,
    });

    if (!membership) {
      throw new AppError("Membership not found.", 404);
    }

    return membership;
  }

  // ==========================================
  // Admin
  // ==========================================

  static async getAdminMemberships(params: {
    page: number;
    limit: number;
    status?: string;
    search?: string;
  }) {
    const where: Prisma.MembershipWhereInput = {};

    if (
      params.status &&
      (Object.values(MembershipStatus) as string[]).includes(params.status)
    ) {
      where.status = params.status as MembershipStatus;
    }

    if (params.search) {
      where.OR = [
        { membershipNumber: { contains: params.search, mode: "insensitive" } },
        { customerName: { contains: params.search, mode: "insensitive" } },
        { customerMobile: { contains: params.search } },
        { customerEmail: { contains: params.search, mode: "insensitive" } },
      ];
    }

    const [memberships, total] = await prisma.$transaction([
      prisma.membership.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        select: { ...PUBLIC_SELECT, notes: true, paidAt: true, createdAt: true },
      }),
      prisma.membership.count({ where }),
    ]);

    return {
      memberships,
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / params.limit)),
      },
    };
  }

  static async updateStatus(
    membershipId: string,
    status: "ACTIVE" | "CANCELLED",
    adminId: string
  ) {
    const membership = await prisma.membership.findUnique({
      where: { id: membershipId },
      select: { id: true, status: true, paymentStatus: true, paymentMethod: true },
    });

    if (!membership) {
      throw new AppError("Membership not found.", 404);
    }

    if (membership.status === status) {
      throw new AppError(`Membership is already ${status}.`, 400);
    }

    if (membership.status === MembershipStatus.CANCELLED) {
      throw new AppError("Cancelled memberships cannot be changed.", 400);
    }

    const data: Prisma.MembershipUpdateInput = { status };

    // Admin confirming a pay-at-venue plan = cash/UPI collected.
    if (status === "ACTIVE" && membership.paymentStatus !== "CAPTURED") {
      data.paymentStatus = "CAPTURED";
      data.paidAt = new Date();
    }

    const updated = await prisma.membership.update({
      where: { id: membershipId },
      data,
      select: PUBLIC_SELECT,
    });

    logger.info("Membership status updated by admin.", {
      membershipId,
      from: membership.status,
      to: status,
      adminId,
    });

    if (status === "ACTIVE") {
      void NotificationService.sendMembershipConfirmation(membershipId);
    }

    return updated;
  }
}
