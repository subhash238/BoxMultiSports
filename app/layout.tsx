import type { Metadata } from "next";
import "./globals.css";
import Chrome from "@/components/layout/Chrome";
import BookingModalProvider from "@/components/booking-widget/BookingModalProvider";

export const metadata: Metadata = {
  title: "UniTurf | Book Your Game",
  description:
    "Book your turf, choose your sport and reserve your game online.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">
        <BookingModalProvider>
          <Chrome>{children}</Chrome>
        </BookingModalProvider>
      </body>
    </html>
  );
}
