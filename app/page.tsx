import Navbar from "../components/navbar/Navbar";
import Hero from "../components/hero/Hero";
import BookingWidget from "../components/booking-widget/BookingWidget";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <BookingWidget />
    </>
  );
}