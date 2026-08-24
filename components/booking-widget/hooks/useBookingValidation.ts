import { useMemo, useState } from "react";
import { BookingData } from "../BookingWidget";
import {
  validateBooking,
  ValidationErrors,
} from "../validators";

export interface TouchedFields {
  sport: boolean;
  date: boolean;
  time: boolean;
  duration: boolean;
  fullName: boolean;
  email: boolean;
  mobile: boolean;
  specialRequest: boolean;
}

const initialTouchedState: TouchedFields = {
  sport: false,
  date: false,
  time: false,
  duration: false,
  fullName: false,
  email: false,
  mobile: false,
  specialRequest: false,
};

export function useBookingValidation(
  bookingData: BookingData,
  setBookingData: React.Dispatch<
    React.SetStateAction<BookingData>
  >
) {
  /* ---------------- Errors ---------------- */
/* ---------------- Errors ---------------- */

const errors = useMemo<ValidationErrors>(() => {
  return validateBooking(bookingData);
}, [bookingData]);
 

  /* ---------------- Touched ---------------- */

  const [touched, setTouched] =
    useState<TouchedFields>(initialTouchedState);

  /* ---------------- Validate ---------------- */

  

  /* ---------------- Update Field ---------------- */

  const updateField = (
    field: keyof BookingData,
    value: BookingData[keyof BookingData]
  ) => {
    setBookingData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  /* ---------------- Blur ---------------- */

  const handleBlur = (
    field: keyof TouchedFields
  ) => {
    setTouched((prev) => ({
      ...prev,
      [field]: true,
    }));
  };

  /* ---------------- Touch All ---------------- */

  const markAllTouched = () => {
    setTouched({
      sport: true,
      date: true,
      time: true,
      duration: true,
      fullName: true,
      email: true,
      mobile: true,
      specialRequest: true,
    });
  };

  /* ---------------- Reset ---------------- */

  const resetTouched = () => {
    setTouched(initialTouchedState);
  };

  /* ---------------- Form Valid ---------------- */

  const isValid = useMemo(() => {
    return Object.values(errors).every(
      (error) => !error
    );
  }, [errors]);

  /* ---------------- Progress ---------------- */

  const progress = useMemo(() => {
    return 0;
  }, []);

  /* ---------------- Return ---------------- */

  return {
    errors,
    touched,

    isValid,
    progress,

    updateField,
    handleBlur,

    markAllTouched,
    resetTouched,
  };
}
