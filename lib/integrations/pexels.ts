import "server-only";

type PexelsPhoto = {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographer_url: string;
  src: {
    original: string;
    large2x: string;
    large: string;
    landscape: string;
  };
};

type PexelsSearchResponse = {
  photos: PexelsPhoto[];
};

export type PexelsHeroPhoto = {
  id: number;
  imageUrl: string;
  pexelsUrl: string;
  photographer: string;
  photographerUrl: string;
};

export async function getPexelsHeroPhoto(
  query: string
): Promise<PexelsHeroPhoto | null> {
  const apiKey = process.env.PEXELS_API_KEY;

  if (!apiKey) {
    return null;
  }

  const params = new URLSearchParams({
    query,
    orientation: "landscape",
    per_page: "10",
  });

  try {
    const response = await fetch(
      `https://api.pexels.com/v1/search?${params.toString()}`,
      {
        headers: {
          Authorization: apiKey,
        },
        next: {
          revalidate: 86400,
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as PexelsSearchResponse;

    const suitablePhotos = data.photos.filter(
      (photo) =>
        photo.width > photo.height &&
        Boolean(photo.src.landscape || photo.src.large2x)
    );

    if (suitablePhotos.length === 0) {
      return null;
    }

    // Pexels already returns results by relevance.
    // Prefer an image whose aspect ratio is close to a wide hero.
    const selectedPhoto = [...suitablePhotos].sort((a, b) => {
      const targetRatio = 16 / 9;
      const aDifference = Math.abs(a.width / a.height - targetRatio);
      const bDifference = Math.abs(b.width / b.height - targetRatio);

      return aDifference - bDifference;
    })[0];

    if (!selectedPhoto) {
      return null;
    }

    return {
      id: selectedPhoto.id,
      imageUrl:
        selectedPhoto.src.landscape ||
        selectedPhoto.src.large2x ||
        selectedPhoto.src.large,
      pexelsUrl: selectedPhoto.url,
      photographer: selectedPhoto.photographer,
      photographerUrl: selectedPhoto.photographer_url,
    };
  } catch {
    // The page should continue using its theme fallback
    // if Pexels is unavailable.
    return null;
  }
}