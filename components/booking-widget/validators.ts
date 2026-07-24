export interface ValidationErrors {
  sport?: string;
  date?: string;
  time?: string;
  duration?: string;
  players?: string;
  fullName?: string;
  mobile?: string;
}

export const validateName = (name: string): string => {
  const value = name.trim();

  if (!value) return "Full name is required.";

  if (value.length < 3)
    return "Name must contain at least 3 characters.";

  if (!/^[A-Za-z ]+$/.test(value))
    return "Only letters and spaces are allowed.";

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

export const validatePlayers = (
  players: number,
  maxPlayers: number
): string => {

  if (players < 1)
    return "Minimum 1 player required.";

  if (players > maxPlayers)
    return `Maximum ${maxPlayers} players allowed.`;

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
  players: number;
  fullName: string;
  mobile: string;
}) {

  const errors: ValidationErrors = {};

  errors.sport = validateRequired(data.sport, "Sport");
  errors.date = validateDate(data.date);
  errors.time = validateRequired(data.time, "Time Slot");
  errors.duration = validateRequired(data.duration, "Duration");
  errors.fullName = validateName(data.fullName);
  errors.mobile = validateMobile(data.mobile);
  errors.players = validatePlayers(data.players, 22);

  return errors;
}