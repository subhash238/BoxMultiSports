"use client";

import clsx from "clsx";
import {
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface BookingFieldProps {
  label: string;

  type?: string;

  placeholder?: string;

  value: string | number;

  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ) => void;

  onBlur?: () => void;

  textarea?: boolean;

  error?: string;

  success?: boolean;

  required?: boolean;

  disabled?: boolean;

  maxLength?: number;

  className?: string;
}

export default function BookingField({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  onBlur,
  textarea = false,
  error,
  success = false,
  required = false,
  disabled = false,
  maxLength,
  className,
}: BookingFieldProps) {
  const inputClass = clsx(
    `
      w-full
      rounded-[14px]
      border
      bg-white
      px-4
      text-[15px]
      font-medium
      text-[#171717]
      placeholder:text-[#A1A1AA]
      outline-none
      transition-all
      duration-200
      shadow-[0_1px_2px_rgba(0,0,0,0.03)]
    `,

    textarea
      ? "min-h-[120px] py-3.5 resize-y"
      : "h-[58px]",

    {
      // Normal
      "border-[#E5E7EB] hover:border-[#D1D5DB] focus:border-[#B6F000] focus:ring-4 focus:ring-[#B6F000]/10":
        !error && !success,

      // Error
      "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 pr-12":
        !!error,

      // Success
      "border-emerald-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 pr-12":
        success,

      // Disabled
      "cursor-not-allowed bg-[#F5F5F5] opacity-60":
        disabled,
    },

    className
  );

  return (
    <div className="space-y-2">

      {/* ======================================
          Label
      ====================================== */}

      <label
        className="
          flex
          items-center
          gap-1
          text-[13px]
          font-semibold
          tracking-[-0.01em]
          text-[#52525B]
        "
      >
        {label}

        {required && (
          <span className="text-[#EF4444]">
            *
          </span>
        )}
      </label>

      {/* ======================================
          Input
      ====================================== */}

      <div className="relative">

        {textarea ? (
          <textarea
            rows={4}
            value={value}
            placeholder={placeholder}
            onChange={onChange}
            onBlur={onBlur}
            disabled={disabled}
            maxLength={maxLength}
            className={inputClass}
          />
        ) : (
          <input
            type={type}
            value={value}
            placeholder={placeholder}
            onChange={onChange}
            onBlur={onBlur}
            disabled={disabled}
            maxLength={maxLength}
            className={inputClass}
          />
        )}

        {/* ====================================
            Success Icon
        ==================================== */}

        {success && !error && (
          <CheckCircle2
            size={18}
            strokeWidth={2}
            className="
              pointer-events-none
              absolute
              right-4
              top-1/2
              -translate-y-1/2
              text-emerald-500
            "
          />
        )}

        {/* ====================================
            Error Icon
        ==================================== */}

        {error && (
          <AlertCircle
            size={18}
            strokeWidth={2}
            className="
              pointer-events-none
              absolute
              right-4
              top-1/2
              -translate-y-1/2
              text-red-500
            "
          />
        )}

      </div>

      {/* ======================================
          Error Message
      ====================================== */}

      {error && (
        <p
          className="
            flex
            items-center
            gap-1.5
            text-[12px]
            font-medium
            text-red-500
          "
        >
          <AlertCircle size={14} />

          {error}
        </p>
      )}

      {/* ======================================
          Success Message
      ====================================== */}

      {success && !error && (
        <p
          className="
            flex
            items-center
            gap-1.5
            text-[12px]
            font-medium
            text-emerald-600
          "
        >
          <CheckCircle2 size={14} />

          Looks good
        </p>
      )}

    </div>
  );
}