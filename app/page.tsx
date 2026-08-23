import HomeClient from "./HomeClient";
import { getPexelsHeroPhoto } from "@/lib/integrations/pexels";

export default async function Home() {
  const [
    heroPhoto,
    cricketPhoto,
    footballPhoto,
    badmintonPhoto,
    pickleballPhoto,
    netPracticePhoto,
  ] = await Promise.all([
    getPexelsHeroPhoto("indoor sports turf"),
    getPexelsHeroPhoto("indoor cricket"),
    getPexelsHeroPhoto("indoor football turf"),
    getPexelsHeroPhoto("indoor badminton court"),
    getPexelsHeroPhoto("indoor pickleball court"),
    getPexelsHeroPhoto("cricket net practice"),
  ]);

  const sportHeroImages = {
    cricket: cricketPhoto?.imageUrl ?? null,
    football: footballPhoto?.imageUrl ?? null,
    badminton: badmintonPhoto?.imageUrl ?? null,
    pickleball: pickleballPhoto?.imageUrl ?? null,
    "net-practice": netPracticePhoto?.imageUrl ?? null,
  };

  return (
    <HomeClient
      heroImageUrl={heroPhoto?.imageUrl ?? null}
      sportHeroImages={sportHeroImages}
    />
  );
}