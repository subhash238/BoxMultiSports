"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { X } from "lucide-react";
import { usePathname } from "next/navigation";

import BookingWidget from "./BookingWidget";

type BookingModalContextValue = {
  openBookingModal: (
    sportSlug?: string | null,
    focusFallback?: HTMLElement | null
  ) => void;
};

const BookingModalContext =
  createContext<BookingModalContextValue | null>(null);

export function useBookingModal() {
  const context = useContext(BookingModalContext);

  if (!context) {
    throw new Error(
      "useBookingModal must be used within BookingModalProvider."
    );
  }

  return context;
}

export default function BookingModalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isBookingAllowed =
    pathname !== "/login" &&
    pathname !== "/admin" &&
    !pathname.startsWith("/admin/");

  return (
    <BookingModalRouteState
      pathname={pathname}
      isBookingAllowed={isBookingAllowed}
    >
      {children}
    </BookingModalRouteState>
  );
}

function BookingModalRouteState({
  children,
  pathname,
  isBookingAllowed,
}: {
  children: React.ReactNode;
  pathname: string;
  isBookingAllowed: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSportSlug, setSelectedSportSlug] =
    useState<string | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const focusFallbackRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // A route change is a modal boundary; never carry an open booking UI
    // into another public route or an excluded admin/login route.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsOpen(false);
  }, [pathname]);

  const openBookingModal = useCallback(
    (
      sportSlug?: string | null,
      focusFallback?: HTMLElement | null
    ) => {
      if (!isBookingAllowed) {
        return;
      }

      triggerRef.current = document.activeElement as HTMLElement | null;
      focusFallbackRef.current = focusFallback ?? null;
      setSelectedSportSlug(sportSlug ?? null);
      setIsOpen(true);
    },
    [isBookingAllowed]
  );

  const closeBookingModal = useCallback(() => {
    setIsOpen(false);
    window.requestAnimationFrame(() => {
      const focusTarget =
        focusFallbackRef.current ?? triggerRef.current;

      if (focusTarget?.isConnected) {
        focusTarget.focus();
      }
    });
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeBookingModal();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeBookingModal, isOpen]);

  return (
    <BookingModalContext.Provider value={{ openBookingModal }}>
      {children}

      {isBookingAllowed && isOpen && (
        <div
          className="fixed inset-0 z-[90] overflow-y-auto bg-[#050705]/95 backdrop-blur-xl"
          role="dialog"
          aria-modal="true"
          aria-labelledby="booking-modal-title"
        >
          <div className="min-h-full px-3 pb-6 pt-16 sm:px-6 sm:pb-10 sm:pt-20 lg:px-8">
            <h2 id="booking-modal-title" className="sr-only">
              Book your game
            </h2>

            <button
              ref={closeButtonRef}
              type="button"
              onClick={closeBookingModal}
              aria-label="Close booking dialog"
              className="fixed right-4 top-4 z-[95] flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-[#11130F] text-white shadow-xl transition hover:border-[#B6F000]/60 hover:text-[#B6F000] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B6F000] sm:right-6 sm:top-6"
            >
              <X size={22} aria-hidden="true" />
            </button>

            <BookingWidget
              variant="modal"
              selectedSportSlug={selectedSportSlug}
            />
          </div>
        </div>
      )}
    </BookingModalContext.Provider>
  );
}
