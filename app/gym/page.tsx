import GymClient from "./GymClient";
import { getPexelsHeroPhoto } from "@/lib/integrations/pexels";

export default async function GymPage() {
  const gymPhoto = await getPexelsHeroPhoto(
    "modern gym interior"
  );

  return (
    <GymClient
      heroImageUrl={gymPhoto?.imageUrl ?? null}
    />
  );
}
