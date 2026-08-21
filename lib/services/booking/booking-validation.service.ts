import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors";
import { Sport } from "@prisma/client";
import { BOOKING_MESSAGES } from "./booking.responses";
import {
  BOOKING_CONFIG,
  MAIN_BOOKING_SPORT_SLUGS,
  YOGA_ALLOWED_DURATIONS_MINUTES,
} from "./booking.config";

import { CreateBookingInput } from "@/lib/validators/booking";

import {
  BookingTimeResult,
  BookingValidationResult,
} from "./booking.types";

import {
  buildBookingTime,
  buildBookingTimeFromDuration,
  buildIstDateTimeForBookingDate,
  calculateDurationMinutes,
  isWithinBookingDayOperatingHours,
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

    const isMainBookingSport =
      MAIN_BOOKING_SPORT_SLUGS.has(
        sport.slug
      );

    if (
      isMainBookingSport &&
      data.durationMinutes === undefined
    ) {
      throw new AppError(
        "Booking duration is required.",
        400
      );
    }

    const bookingTime =
      isMainBookingSport
        ? buildBookingTimeFromDuration(
            data.bookingDate,
            data.startTime,
            data.durationMinutes!
          )
        : buildBookingTime(
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

    if (isMainBookingSport) {
      this.validateMainBusinessHours(
        bookingTime
      );
    }

    if (sport.slug === "yoga") {
      this.validateYogaDuration(
        bookingTime
      );

      this.validateYogaStartGrid(
        bookingTime
      );

      this.validateBusinessHours(
        bookingTime
      );
    }

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
   * The configured maxPlayers value is enforced for
   * sports that define an explicit capacity. Normal
   * shared sports do not receive an additional
   * time-window restriction.
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

  private static validateMainBusinessHours(
    bookingTime: BookingTimeResult
  ): void {
    const isWithinOperatingHours =
      isWithinBookingDayOperatingHours(
        bookingTime,
        BOOKING_CONFIG.MAIN_OPENING_MINUTES_FROM_MIDNIGHT,
        BOOKING_CONFIG.MAIN_CLOSING_MINUTES_FROM_MIDNIGHT
      );

    if (!isWithinOperatingHours) {
      throw new AppError(
        "Bookings are available between 5:00 AM and 12:00 AM.",
        400
      );
    }
  }

  private static validateYogaDuration(
    bookingTime: BookingTimeResult
  ): void {
    const durationMinutes =
      calculateDurationMinutes(
        bookingTime.startDateTime,
        bookingTime.endDateTime
      );

    if (
      !YOGA_ALLOWED_DURATIONS_MINUTES.has(
        durationMinutes
      )
    ) {
      throw new AppError(
        "Yoga bookings support only 60, 90, or 120 minutes.",
        400
      );
    }
  }

  private static validateYogaStartGrid(
    bookingTime: BookingTimeResult
  ): void {
    if (
      bookingTime.startDateTime.getUTCMinutes() % 30 !== 0
    ) {
      throw new AppError(
        "Yoga bookings must start on a 30-minute time slot.",
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
    bookingTime: BookingTimeResult
  ): void {
    const {
      openingTime,
      closingTime,
    } =
      this.buildBusinessHours(
        bookingTime.bookingDate,
        "05:00",
        "07:00"
      );

    if (
      bookingTime.startDateTime <
        openingTime ||
      bookingTime.endDateTime >
        closingTime
    ) {
      throw new AppError(
        "Yoga bookings are allowed only between 05:00 AM and 07:00 AM.",
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
    openingTimeValue: string,
    closingTimeValue: string
  ) {
    const toMinutesFromMidnight = (
      value: string
    ) => {
      const [hours, minutes] =
        value.split(":").map(Number);

      return hours * 60 + minutes;
    };

    const openingTime =
      buildIstDateTimeForBookingDate(
        bookingDate,
        toMinutesFromMidnight(
          openingTimeValue
        )
      );

    const closingTime =
      buildIstDateTimeForBookingDate(
        bookingDate,
        toMinutesFromMidnight(
          closingTimeValue
        )
      );

    return {
      openingTime,
      closingTime,
    };
  }
}
