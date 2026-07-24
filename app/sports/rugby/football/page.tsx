import Navbar from "@/components/navbar/Navbar";
import SportPage from "@/components/sport/SportPage";

export default function FootballPage() {
  return (
    <>
      <Navbar />

      <SportPage
        title="Football"
        badge="Football Arena"
        subtitle="PLAY • TRAIN • WIN"
        image="/sports/football/hero.jpg"
        description="Experience professional football turf with FIFA-quality artificial grass, floodlights, coaching programs, tournaments and premium facilities designed for every player."
      />
    </>
  );
}