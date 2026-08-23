import HomeClient from "./HomeClient";
import { getPexelsHeroPhoto } from "@/lib/integrations/pexels";

export default async function Home() {
  const heroPhoto = await getPexelsHeroPhoto(
    "indoor sports turf"
  );

  return (
    <HomeClient
      heroImageUrl={heroPhoto?.imageUrl ?? null}
    />
  );
}