import type { Metadata } from "next";
import "./globals.css";
import Footer from "@/components/footer/Footer";
import Navbar from "@/components/navbar/Navbar";

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
        <Navbar />
        <div className="public-page-shell flex-1">
          {children}
        </div>

        <Footer />
      </body>
    </html>
  );
}
