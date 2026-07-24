"use client";

import clsx from "clsx";

interface BookingFieldProps {
  label: string;
  type?: string;
  placeholder?: string;
  value: string | number;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  textarea?: boolean;

  error?: string;
  success?: boolean;
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
  textarea = false,
  error,
  success,
  disabled = false,
  maxLength,
  className,
}: BookingFieldProps) {
  const inputClass = clsx(
    "w-full rounded-2xl bg-black/40 px-4 text-white placeholder:text-gray-500 outline-none transition-all duration-300",
    textarea ? "py-3" : "h-14",
    {
      "border border-white/10 focus:border-[#B6F000] focus:ring-2 focus:ring-[#B6F000]/30":
        !error && !success,

      "border border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/30":
        !!error,

      "border border-green-500 focus:border-green-500 focus:ring-2 focus:ring-green-500/30":
        success,

      "opacity-50 cursor-not-allowed": disabled,
    },
    className
  );

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-300">
        {label}
      </label>

      {textarea ? (
        <textarea
          rows={4}
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          disabled={disabled}
          className={inputClass}
        />
      ) : (
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          disabled={disabled}
          maxLength={maxLength}
          className={inputClass}
        />
      )}

      {error && (
        <p className="text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}