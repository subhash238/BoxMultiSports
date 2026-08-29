"use client";

import clsx from "clsx";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface Option {
  label: string;
  value: string;
}

interface BookingSelectProps {
  label: string;
  value: string;
  options: Option[];

  onChange: (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => void;

  onBlur?: () => void;

  error?: string;

  success?: boolean;

  required?: boolean;
}

export default function BookingSelect({
  label,
  value,
  options,
  onChange,
  onBlur,
  error,
  success = false,
  required = false,
}: BookingSelectProps) {
  return (
    <div className="space-y-2">

      <label className="flex items-center gap-1 text-sm font-medium text-gray-300">
        {label}

        {required && (
          <span className="text-red-500">*</span>
        )}
      </label>

      <div className="relative">

        <select
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          className={clsx(
            "h-14 w-full rounded-2xl bg-black/40 px-4 text-white outline-none transition-all duration-300",

            {
              "border border-white/10 focus:border-[#B6F000]":
                !error && !success,

              "border border-red-500":
                error,

              "border border-green-500":
                success,
            }
          )}
        >
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              className="bg-[#11130F] text-white"
              style={{ backgroundColor: "#11130F", color: "#FFFFFF" }}
            >
              {option.label}
            </option>
          ))}
        </select>

        {success && !error && (
          <CheckCircle2
            size={20}
            className="absolute right-4 top-4 text-green-500"
          />
        )}

        {error && (
          <AlertCircle
            size={20}
            className="absolute right-4 top-4 text-red-500"
          />
        )}

      </div>

      {error && (
        <p className="flex items-center gap-2 text-sm text-red-500">
          <AlertCircle size={15} />
          {error}
        </p>
      )}
    </div>
  );
}
