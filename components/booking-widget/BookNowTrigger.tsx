"use client";

import {
  type MouseEvent,
  type ReactNode,
  type RefObject,
} from "react";

import { useBookingModal } from "./BookingModalProvider";

type BookNowTriggerProps = {
  children: ReactNode;
  className?: string;
  sportSlug?: string | null;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  focusFallbackRef?: RefObject<HTMLElement | null>;
};

export default function BookNowTrigger({
  children,
  className,
  sportSlug = null,
  onClick,
  focusFallbackRef,
}: BookNowTriggerProps) {
  const { openBookingModal } = useBookingModal();

  return (
    <button
      type="button"
      onClick={(event) => {
        onClick?.(event);
        openBookingModal(
          sportSlug,
          focusFallbackRef?.current ?? null
        );
      }}
      className={className}
    >
      {children}
    </button>
  );
}
