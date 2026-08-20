export interface ValidationErrors {
  sport?: string;
  date?: string;
  time?: string;
  duration?: string;
  fullName?: string;
  email?: string;
  mobile?: string;
}

export const validateName = (name: string): string => {
  const value = name.trim();

  if (
    !value ||
    value.length > 100 ||
    !/^[A-Za-z]/.test(value)
  ) {
    return "Please enter a valid full name.";
  }

  return "";
};

export const validateEmail = (email: string): string => {
  const value = email.trim();

  if (
    !value ||
    value.length > 255 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  ) {
    return "Please enter a valid email address.";
  }

  return "";
};

export const validateMobile = (mobile: string): string => {
  const value = mobile.replace(/\D/g, "");

  if (!value)
    return "Mobile number is required.";

  if (value.length !== 10)
    return "Please enter a valid 10-digit mobile number.";

  if (!/^[6-9]\d{9}$/.test(value))
    return "Enter a valid Indian mobile number.";

  return "";
};

export const validateDate = (date: string): string => {

  if (!date)
    return "Please select a booking date.";

  const today = new Date();

  today.setHours(0, 0, 0, 0);

  const selected = new Date(date);

  if (selected < today)
    return "Past dates are not allowed.";

  return "";
};

export const validateRequired = (
  value: string,
  field: string
): string => {

  if (!value.trim())
    return `${field} is required.`;

  return "";
};

export function validateBooking(data: {
  sport: string;
  date: string;
  time: string;
  duration: string;
  fullName: string;
  email?: string;
  mobile: string;
}) {

  const errors: ValidationErrors = {};

  errors.sport = validateRequired(data.sport, "Sport");
  errors.date = validateDate(data.date);
  errors.time = validateRequired(data.time, "Time Slot");
  errors.duration = validateRequired(data.duration, "Duration");
  errors.fullName = validateName(data.fullName);
  errors.email = validateEmail(data.email ?? "");
  errors.mobile = validateMobile(data.mobile);

  return errors;
}
