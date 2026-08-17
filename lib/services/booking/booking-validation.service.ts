import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors";
import { Sport } from "@prisma/client";
import { BOOKING_MESSAGES } from "./booking.responses";

import { CreateBookingInput } from "@/lib/validators/booking";

import { BOOKING_CONFIG } from "./booking.config";

import {
  BookingTimeResult,
  BookingValidationResult,
} from "./booking.types";

import {
  buildBookingTime,
  isSameDay,
  normalizeDate,
} from "./booking.utils";

export class BookingValidationService {
  /**
   * ==========================================
   * Validate Booking
   * ==========================================
   */
  static async validate(
    data: CreateBookingInput
  ): Promise<BookingValidationResult> {
    const sport =
      await this.getSportOrThrow(
        data.sportId
      );

    this.validateSportActive(
      sport
    );

    this.validatePlayerCount(
      data.numberOfPlayers,
      sport.maxPlayers
    );

    const bookingTime =
      buildBookingTime(
        data.bookingDate,
        data.startTime,
        data.endTime
      );

    this.validateBookingDate(
      bookingTime.bookingDate
    );

    this.validatePastTime(
      bookingTime
    );

    this.validateEndTime(
      bookingTime
    );

    this.validateBusinessHours(
      bookingTime,
      sport.slug
    );

    return {
      sport,
      bookingTime,
      numberOfPlayers:
        data.numberOfPlayers,
    };
  }

  /**
   * ==========================================
   * Get Sport Or Throw
   * ==========================================
   */
  private static async getSportOrThrow(
    sportId: string
  ): Promise<Sport> {
    const sport =
      await prisma.sport.findUnique({
        where: {
          id: sportId,
        },
      });

    if (!sport) {
      throw new AppError(
        BOOKING_MESSAGES.SPORT_NOT_FOUND,
        404
      );
    }

    return sport;
  }

  /**
   * ==========================================
   * Validate Sport Active
   * ==========================================
   */
  private static validateSportActive(
    sport: Sport
  ): void {
    if (!sport.isActive) {
      throw new AppError(
        BOOKING_MESSAGES.SPORT_INACTIVE,
        400
      );
    }
  }

  /**
   * ==========================================
   * Validate Player Count
   * ==========================================
   *
   * Player count is controlled by the
   * sport's maxPlayers value.
   *
   * Current limits:
   *
   * Cricket     → 22
   * Football    → 22
   * Volleyball  → 11
   *
   * Players do NOT affect pricing.
   * ==========================================
   */
  private static validatePlayerCount(
    numberOfPlayers: number,
    maxPlayers: number
  ): void {
    if (
      !Number.isInteger(
        numberOfPlayers
      ) ||
      numberOfPlayers < 1
    ) {
      throw new AppError(
        "Number of players must be at least 1.",
        400
      );
    }

    if (
      numberOfPlayers >
      maxPlayers
    ) {
      throw new AppError(
        `Maximum ${maxPlayers} players are allowed for this sport.`,
        400
      );
    }
  }

  /**
   * ==========================================
   * Validate Booking Date
   * ==========================================
   */
  private static validateBookingDate(
    bookingDate: Date
  ): void {
    const today =
      normalizeDate(
        new Date()
      );

    const normalizedBookingDate =
      normalizeDate(
        bookingDate
      );

    if (
      normalizedBookingDate <
      today
    ) {
      throw new AppError(
        BOOKING_MESSAGES.PAST_DATE,
        400
      );
    }
  }

  /**
   * ==========================================
   * Validate Past Time
   * ==========================================
   */
  private static validatePastTime(
    bookingTime: BookingTimeResult
  ): void {
    const now =
      new Date();

    if (
      isSameDay(
        bookingTime.bookingDate,
        now
      ) &&
      bookingTime.startDateTime <=
        now
    ) {
      throw new AppError(
        BOOKING_MESSAGES.PAST_TIME,
        400
      );
    }
  }

  /**
   * ==========================================
   * Validate End Time
   * ==========================================
   */
  private static validateEndTime(
    bookingTime: BookingTimeResult
  ): void {
    const {
      startDateTime,
      endDateTime,
    } = bookingTime;

    if (
      endDateTime <=
      startDateTime
    ) {
      throw new AppError(
        BOOKING_MESSAGES.INVALID_TIME_RANGE,
        400
      );
    }
  }

  /**
   * ==========================================
   * Validate Business Hours
   * ==========================================
   */
  private static validateBusinessHours(
    bookingTime: BookingTimeResult,
    sportSlug: string
  ): void {
    const isYoga =
      sportSlug === "yoga";

    const {
      openingTime,
      closingTime,
    } =
      this.buildBusinessHours(
        bookingTime.bookingDate,
        isYoga ? "05:00" : undefined,
        isYoga ? "07:00" : undefined
      );

    if (
      bookingTime.startDateTime <
        openingTime ||
      bookingTime.endDateTime >
        closingTime
    ) {
      throw new AppError(
        isYoga
          ? "Yoga bookings are allowed only between 05:00 AM and 07:00 AM."
          : BOOKING_MESSAGES.BUSINESS_HOURS,
        400
      );
    }
  }

  /**
   * ==========================================
   * Build Business Hours
   * ==========================================
   */
  private static buildBusinessHours(
    bookingDate: Date,
    configuredOpeningTime?: string,
    configuredClosingTime?: string
  ) {
    const openingTimeValue =
      configuredOpeningTime ??
      BOOKING_CONFIG.OPENING_TIME;

    const closingTimeValue =
      configuredClosingTime ??
      BOOKING_CONFIG.CLOSING_TIME;

    const openingTime =
      new Date(
        bookingDate
      );

    openingTime.setHours(
      Number(
        openingTimeValue
          .split(":")[0]
      ),
      Number(
        openingTimeValue
          .split(":")[1]
      ),
      0,
      0
    );

    const closingTime =
      new Date(
        bookingDate
      );

    closingTime.setHours(
      Number(
        closingTimeValue
          .split(":")[0]
      ),
      Number(
        closingTimeValue
          .split(":")[1]
      ),
      0,
      0
    );

    return {
      openingTime,
      closingTime,
    };
  }
}
