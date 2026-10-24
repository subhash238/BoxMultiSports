/**
 * ==========================================
 * Email Notification Service
 * ==========================================
 *
 * Sends transactional emails (booking /
 * membership confirmations, enquiries,
 * password resets). Provider is picked from
 * env, first match wins:
 *
 *   RESEND_API_KEY   Resend HTTPS API (works where
 *                    SMTP ports are blocked, e.g.
 *                    DigitalOcean droplets)
 *   BREVO_API_KEY    Brevo HTTPS API
 *   SMTP_HOST/USER/PASS (+ SMTP_PORT)  Nodemailer SMTP
 *
 * Common:
 *   SMTP_FROM           "UniTurf <no-reply@uniturff.com>"
 *                       (used by every provider)
 *   ADMIN_NOTIFY_EMAIL  (optional) venue inbox that gets a copy of
 *                       every confirmation and receives contact-form
 *                       enquiries. Defaults to SMTP_USER.
 *
 * Best-effort: when no provider is configured
 * the calls log and no-op so booking flow never
 * breaks on a missing mailer.
 */

import nodemailer, { Transporter } from "nodemailer";

import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

interface MailMessage {
  to: string;
  subject: string;
  html: string;
  bcc?: string;
  replyTo?: string;
}

type MailProvider = "resend" | "brevo" | "smtp" | null;

let transporter: Transporter | null | undefined;
let warnedUnconfigured = false;

function getProvider(): MailProvider {
  if (process.env.RESEND_API_KEY) return "resend";
  if (process.env.BREVO_API_KEY) return "brevo";
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return "smtp";
  }
  return null;
}

function getFrom(): string {
  return (
    process.env.SMTP_FROM ??
    (process.env.SMTP_USER ? `UniTurf <${process.env.SMTP_USER}>` : "UniTurf <no-reply@uniturff.com>")
  );
}

/** Splits `Name <addr>` into its parts (Brevo wants them separate). */
function parseAddress(value: string): { name?: string; email: string } {
  const match = value.match(/^\s*"?([^"<]*)"?\s*<([^>]+)>\s*$/);
  if (match) {
    return { name: match[1].trim() || undefined, email: match[2].trim() };
  }
  return { email: value.trim() };
}

function getTransporter(): Transporter | null {
  if (transporter !== undefined) {
    return transporter;
  }

  const port = Number(process.env.SMTP_PORT ?? 465);

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  return transporter;
}

/**
 * Returns false (after logging once) when no mail
 * provider is configured. Callers skip DB work then.
 */
function isMailConfigured(): boolean {
  if (getProvider()) {
    return true;
  }

  if (!warnedUnconfigured) {
    warnedUnconfigured = true;
    logger.warn(
      "No email provider configured; transactional emails are disabled.",
      { expected: "RESEND_API_KEY, BREVO_API_KEY or SMTP_HOST/SMTP_USER/SMTP_PASS" }
    );
  }

  return false;
}

async function postJson(
  url: string,
  headers: Record<string, string>,
  body: unknown
): Promise<void> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`${response.status} ${response.statusText}: ${text.slice(0, 300)}`);
  }
}

/**
 * Delivers a message through the configured provider.
 * Throws on failure; callers catch and log.
 */
async function deliverMail(message: MailMessage): Promise<void> {
  const provider = getProvider();
  const from = getFrom();

  switch (provider) {
    case "resend": {
      await postJson(
        "https://api.resend.com/emails",
        { Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
        {
          from,
          to: [message.to],
          bcc: message.bcc ? [message.bcc] : undefined,
          reply_to: message.replyTo,
          subject: message.subject,
          html: message.html,
        }
      );
      return;
    }

    case "brevo": {
      const sender = parseAddress(from);
      await postJson(
        "https://api.brevo.com/v3/smtp/email",
        { "api-key": process.env.BREVO_API_KEY as string },
        {
          sender,
          to: [{ email: message.to }],
          bcc: message.bcc ? [{ email: message.bcc }] : undefined,
          replyTo: message.replyTo ? { email: message.replyTo } : undefined,
          subject: message.subject,
          htmlContent: message.html,
        }
      );
      return;
    }

    case "smtp": {
      const mailer = getTransporter();
      if (!mailer) {
        throw new Error("SMTP transporter unavailable.");
      }
      await mailer.sendMail({
        from,
        to: message.to,
        bcc: message.bcc,
        replyTo: message.replyTo,
        subject: message.subject,
        html: message.html,
      });
      return;
    }

    default:
      throw new Error("No email provider configured.");
  }
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getAdminInbox(): string | undefined {
  return process.env.ADMIN_NOTIFY_EMAIL || process.env.SMTP_USER;
}

export interface EnquiryInput {
  name: string;
  mobile: string;
  email?: string;
  message: string;
}

export interface PasswordResetMailInput {
  to: string;
  name: string;
  link: string;
  scope: "customer" | "admin";
  expiresInMinutes: number;
}

export class NotificationService {
  /**
   * Emails a password reset link. Returns true when handed to SMTP.
   */
  static async sendPasswordReset(
    input: PasswordResetMailInput
  ): Promise<boolean> {
    try {
      if (!isMailConfigured()) {
        return false;
      }


      const label = input.scope === "admin" ? "Admin Console" : "Account";

      const html = `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#0a0f0a;padding:32px;border-radius:16px;color:#fff">
          <h1 style="margin:0;font-size:22px">UNI<span style="color:#B6F000">TURF</span></h1>
          <p style="color:#B6F000;font-size:13px;letter-spacing:2px;text-transform:uppercase;margin:24px 0 8px">${label} · Password Reset</p>
          <h2 style="margin:0 0 16px;font-size:20px">Hi ${escapeHtml(input.name)},</h2>
          <p style="font-size:14px;color:#e5e5e5;line-height:1.6">We received a request to reset your password. Click the button below to choose a new one. This link is valid for ${input.expiresInMinutes} minutes.</p>
          <p style="margin:24px 0"><a href="${input.link}" style="display:inline-block;background:#B6F000;color:#000;font-weight:bold;text-decoration:none;padding:12px 22px;border-radius:10px">Reset Password</a></p>
          <p style="font-size:12px;color:#9ca3af;line-height:1.6">If the button doesn't work, copy this link:<br><a href="${input.link}" style="color:#B6F000;word-break:break-all">${input.link}</a></p>
          <p style="margin-top:24px;font-size:12px;color:#9ca3af">Didn't request this? You can safely ignore this email — your password won't change.</p>
        </div>`;

      await deliverMail({
        to: input.to,
        subject: "Reset your UniTurf password",
        html,
      });

      logger.info("Password reset email sent.", { to: input.to, scope: input.scope });
      return true;
    } catch (error) {
      logger.error("Failed to send password reset email.", {
        error:
          error instanceof Error ? error.message : String(error),
      });
      return false;
    }
  }

  /**
   * Emails a contact-form enquiry to the venue inbox.
   * Returns true when the mail was handed to SMTP.
   */
  static async sendEnquiry(input: EnquiryInput): Promise<boolean> {
    try {
      const to = getAdminInbox();

      if (!isMailConfigured() || !to) {
        return false;
      }


      const html = `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#0a0f0a;padding:32px;border-radius:16px;color:#fff">
          <h1 style="margin:0;font-size:22px">UNI<span style="color:#B6F000">TURF</span></h1>
          <p style="color:#B6F000;font-size:13px;letter-spacing:2px;text-transform:uppercase;margin:24px 0 8px">New Enquiry</p>
          <table style="width:100%;border-collapse:collapse;font-size:14px;color:#e5e5e5">
            <tr><td style="padding:8px 0;color:#9ca3af">Name</td><td style="padding:8px 0;text-align:right;font-weight:bold">${escapeHtml(input.name)}</td></tr>
            <tr><td style="padding:8px 0;color:#9ca3af">Mobile</td><td style="padding:8px 0;text-align:right"><a style="color:#B6F000" href="tel:${escapeHtml(input.mobile)}">${escapeHtml(input.mobile)}</a></td></tr>
            ${input.email ? `<tr><td style="padding:8px 0;color:#9ca3af">Email</td><td style="padding:8px 0;text-align:right">${escapeHtml(input.email)}</td></tr>` : ""}
          </table>
          <p style="margin:16px 0 4px;color:#9ca3af;font-size:13px">Message</p>
          <p style="margin:0;white-space:pre-wrap;font-size:14px;color:#e5e5e5">${escapeHtml(input.message)}</p>
        </div>`;

      await deliverMail({
        to,
        replyTo: input.email || undefined,
        subject: `New enquiry from ${input.name} (${input.mobile})`,
        html,
      });

      logger.info("Enquiry email sent.", { to, mobile: input.mobile });
      return true;
    } catch (error) {
      logger.error("Failed to send enquiry email.", {
        error:
          error instanceof Error ? error.message : String(error),
      });
      return false;
    }
  }

  /**
   * Sends the booking confirmation email to the
   * customer. Fire-and-forget safe: never throws.
   */
  static async sendBookingConfirmation(
    bookingId: string
  ): Promise<void> {
    try {
      if (!isMailConfigured()) {
        return;
      }

      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { sport: { select: { name: true } } },
      });

      if (!booking || !booking.customerEmail) {
        return;
      }


      const slot = `${formatTime(booking.startTime)} - ${formatTime(booking.endTime)}`;
      const amount = `₹${Number(booking.totalAmount).toLocaleString("en-IN")}`;
      const payAtVenue = booking.paymentMethod === "PAY_AT_VENUE";
      const isConfirmed = booking.status === "CONFIRMED" || booking.status === "COMPLETED";
      const heading = isConfirmed ? "Booking Confirmed" : "Booking Received";
      const amountLabel = payAtVenue ? "Amount (pay at venue)" : "Amount Paid";
      const paymentLine = payAtVenue
        ? "Pay by cash/UPI at the venue before your slot starts."
        : "Paid online.";

      const html = `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#0a0f0a;padding:32px;border-radius:16px;color:#fff">
          <h1 style="margin:0;font-size:22px">UNI<span style="color:#B6F000">TURF</span></h1>
          <p style="color:#B6F000;font-size:13px;letter-spacing:2px;text-transform:uppercase;margin:24px 0 8px">${heading}</p>
          <h2 style="margin:0 0 16px;font-size:20px">Hey ${escapeHtml(booking.customerName)}, your slot is booked!</h2>
          <table style="width:100%;border-collapse:collapse;font-size:14px;color:#e5e5e5">
            <tr><td style="padding:8px 0;color:#9ca3af">Booking #</td><td style="padding:8px 0;text-align:right;font-weight:bold">${booking.bookingNumber}</td></tr>
            <tr><td style="padding:8px 0;color:#9ca3af">Sport</td><td style="padding:8px 0;text-align:right">${booking.sport.name}</td></tr>
            <tr><td style="padding:8px 0;color:#9ca3af">Date</td><td style="padding:8px 0;text-align:right">${formatDate(booking.bookingDate)}</td></tr>
            <tr><td style="padding:8px 0;color:#9ca3af">Time</td><td style="padding:8px 0;text-align:right">${slot}</td></tr>
            <tr><td style="padding:8px 0;color:#9ca3af">Players</td><td style="padding:8px 0;text-align:right">${booking.numberOfPlayers}</td></tr>
            <tr><td style="padding:8px 0;color:#9ca3af;border-top:1px solid #333">${amountLabel}</td><td style="padding:8px 0;text-align:right;border-top:1px solid #333;color:#B6F000;font-weight:bold">${amount}</td></tr>
            <tr><td style="padding:8px 0;color:#9ca3af">Payment</td><td style="padding:8px 0;text-align:right">${paymentLine}</td></tr>
          </table>
          <p style="margin-top:24px;font-size:12px;color:#9ca3af">Show this email at the venue. Once booked, slots are non-refundable and cannot be cancelled. See you on the turf!</p>
        </div>`;

      await deliverMail({
        to: booking.customerEmail,
        bcc: getAdminInbox(),
        subject: `${heading} — ${booking.sport.name} on ${formatDate(booking.bookingDate)} (${booking.bookingNumber})`,
        html,
      });

      logger.info("Booking confirmation email sent.", {
        bookingId,
        bookingNumber: booking.bookingNumber,
        to: booking.customerEmail,
      });
    } catch (error) {
      logger.error("Failed to send booking confirmation email.", {
        bookingId,
        error:
          error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Sends the membership activation email.
   * Fire-and-forget safe: never throws.
   */
  static async sendMembershipConfirmation(
    membershipId: string
  ): Promise<void> {
    try {
      if (!isMailConfigured()) {
        return;
      }

      const membership = await prisma.membership.findUnique({
        where: { id: membershipId },
        include: { plan: { select: { name: true } } },
      });

      if (!membership) {
        return;
      }


      const amount = `₹${Number(membership.amount).toLocaleString("en-IN")}`;
      const paidVia =
        membership.paymentMethod === "PAY_AT_VENUE"
          ? "Cash / UPI at venue"
          : "Online (Razorpay)";

      const html = `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#0a0f0a;padding:32px;border-radius:16px;color:#fff">
          <h1 style="margin:0;font-size:22px">UNI<span style="color:#B6F000">TURF</span></h1>
          <p style="color:#B6F000;font-size:13px;letter-spacing:2px;text-transform:uppercase;margin:24px 0 8px">Membership Active</p>
          <h2 style="margin:0 0 16px;font-size:20px">Welcome aboard, ${membership.customerName}!</h2>
          <table style="width:100%;border-collapse:collapse;font-size:14px;color:#e5e5e5">
            <tr><td style="padding:8px 0;color:#9ca3af">Membership #</td><td style="padding:8px 0;text-align:right;font-weight:bold">${membership.membershipNumber}</td></tr>
            <tr><td style="padding:8px 0;color:#9ca3af">Plan</td><td style="padding:8px 0;text-align:right">${membership.plan.name}</td></tr>
            <tr><td style="padding:8px 0;color:#9ca3af">Valid From</td><td style="padding:8px 0;text-align:right">${formatDate(membership.startDate)}</td></tr>
            <tr><td style="padding:8px 0;color:#9ca3af">Valid Till</td><td style="padding:8px 0;text-align:right">${formatDate(membership.endDate)}</td></tr>
            <tr><td style="padding:8px 0;color:#9ca3af">Payment</td><td style="padding:8px 0;text-align:right">${paidVia}</td></tr>
            <tr><td style="padding:8px 0;color:#9ca3af;border-top:1px solid #333">Amount</td><td style="padding:8px 0;text-align:right;border-top:1px solid #333;color:#B6F000;font-weight:bold">${amount}</td></tr>
          </table>
          <p style="margin-top:24px;font-size:12px;color:#9ca3af">Show this email at the venue. See you on the turf!</p>
        </div>`;

      await deliverMail({
        to: membership.customerEmail,
        bcc: getAdminInbox(),
        subject: `Membership Active — ${membership.plan.name} (${membership.membershipNumber})`,
        html,
      });

      logger.info("Membership confirmation email sent.", {
        membershipId,
        membershipNumber: membership.membershipNumber,
        to: membership.customerEmail,
      });
    } catch (error) {
      logger.error("Failed to send membership confirmation email.", {
        membershipId,
        error:
          error instanceof Error ? error.message : String(error),
      });
    }
  }
}
