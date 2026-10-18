/**
 * ==========================================
 * Email Notification Service
 * ==========================================
 *
 * Sends transactional emails (booking
 * confirmations) over SMTP. Configured via
 * env vars:
 *
 *   SMTP_HOST   e.g. smtp.gmail.com
 *   SMTP_PORT   465 (secure) or 587 (starttls)
 *   SMTP_USER   sender account
 *   SMTP_PASS   password / app password
 *   SMTP_FROM   "UniTurf <no-reply@uniturff.com>"
 *
 * Best-effort: when SMTP is not configured
 * the calls log and no-op so booking flow
 * never breaks on a missing mailer.
 */

import nodemailer, { Transporter } from "nodemailer";

import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

let transporter: Transporter | null | undefined;

function getTransporter(): Transporter | null {
  if (transporter !== undefined) {
    return transporter;
  }

  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const port = Number(process.env.SMTP_PORT ?? 465);

  if (!host || !user || !pass) {
    logger.warn(
      "SMTP is not configured; booking emails are disabled.",
      { missing: [!host && "SMTP_HOST", !user && "SMTP_USER", !pass && "SMTP_PASS"].filter(Boolean) }
    );
    transporter = null;
    return null;
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  return transporter;
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

export class NotificationService {
  /**
   * Sends the booking confirmation email to the
   * customer. Fire-and-forget safe: never throws.
   */
  static async sendBookingConfirmation(
    bookingId: string
  ): Promise<void> {
    try {
      const mailer = getTransporter();

      if (!mailer) {
        return;
      }

      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { sport: { select: { name: true } } },
      });

      if (!booking || !booking.customerEmail) {
        return;
      }

      const from =
        process.env.SMTP_FROM ??
        `UniTurf <${process.env.SMTP_USER}>`;

      const slot = `${formatTime(booking.startTime)} - ${formatTime(booking.endTime)}`;
      const amount = `₹${Number(booking.totalAmount).toLocaleString("en-IN")}`;

      const html = `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#0a0f0a;padding:32px;border-radius:16px;color:#fff">
          <h1 style="margin:0;font-size:22px">UNI<span style="color:#B6F000">TURF</span></h1>
          <p style="color:#B6F000;font-size:13px;letter-spacing:2px;text-transform:uppercase;margin:24px 0 8px">Booking Confirmed</p>
          <h2 style="margin:0 0 16px;font-size:20px">Hey ${booking.customerName}, your slot is booked!</h2>
          <table style="width:100%;border-collapse:collapse;font-size:14px;color:#e5e5e5">
            <tr><td style="padding:8px 0;color:#9ca3af">Booking #</td><td style="padding:8px 0;text-align:right;font-weight:bold">${booking.bookingNumber}</td></tr>
            <tr><td style="padding:8px 0;color:#9ca3af">Sport</td><td style="padding:8px 0;text-align:right">${booking.sport.name}</td></tr>
            <tr><td style="padding:8px 0;color:#9ca3af">Date</td><td style="padding:8px 0;text-align:right">${formatDate(booking.bookingDate)}</td></tr>
            <tr><td style="padding:8px 0;color:#9ca3af">Time</td><td style="padding:8px 0;text-align:right">${slot}</td></tr>
            <tr><td style="padding:8px 0;color:#9ca3af">Players</td><td style="padding:8px 0;text-align:right">${booking.numberOfPlayers}</td></tr>
            <tr><td style="padding:8px 0;color:#9ca3af;border-top:1px solid #333">Amount Paid</td><td style="padding:8px 0;text-align:right;border-top:1px solid #333;color:#B6F000;font-weight:bold">${amount}</td></tr>
          </table>
          <p style="margin-top:24px;font-size:12px;color:#9ca3af">Show this email at the venue. See you on the turf!</p>
        </div>`;

      await mailer.sendMail({
        from,
        to: booking.customerEmail,
        subject: `Booking Confirmed — ${booking.sport.name} on ${formatDate(booking.bookingDate)} (${booking.bookingNumber})`,
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
}
