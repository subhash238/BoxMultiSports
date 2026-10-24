import "server-only";

import { PINNED_INSTAGRAM_REELS } from "@/config/instagram-gallery";
import { getInstagramToken } from "./token";
import {
  InstagramMediaItem,
  InstagramMediaResponse,
  InstagramReel,
  InstagramReelsResult,
} from "./types";

type InstagramReelsOptions = {
  limit?: number;
  after?: string;
};

const INSTAGRAM_MEDIA_URL =
  "https://graph.instagram.com/me/media";
const INSTAGRAM_MEDIA_FIELDS = [
  "id",
  "caption",
  "media_type",
  "media_product_type",
  "media_url",
  "thumbnail_url",
  "permalink",
  "timestamp",
].join(",");
const DEFAULT_PAGE_SIZE = 6;
const MAX_PAGE_SIZE = 100;
const MAX_SCAN_PAGES = 10;

function canonicalPermalink(permalink: string): string {
  return permalink.replace(/\/$/, "");
}

function reelKey(reel: InstagramReel): string[] {
  return [
    `id:${reel.id}`,
    ...(reel.permalink
      ? [`url:${canonicalPermalink(reel.permalink)}`]
      : []),
  ];
}

function isPinnedReel(
  reel: InstagramReel,
  identifier: string
): boolean {
  return reel.id === identifier ||
    (reel.permalink !== null &&
      canonicalPermalink(reel.permalink) ===
        canonicalPermalink(identifier));
}

function mapReels(items: InstagramMediaItem[]): InstagramReel[] {
  try {
    return items
      // Everything posted to the account: reels,
      // videos, photos and carousels.
      .filter(
        (item) =>
          typeof item.id === "string" &&
          (item.media_type === "VIDEO" ||
            item.media_type === "IMAGE" ||
            item.media_type === "CAROUSEL_ALBUM")
      )
      .map((item) => ({
        id: item.id as string,
        caption: item.caption ?? null,
        mediaType: item.media_type as string,
        mediaProductType:
          (item.media_product_type as string | undefined) ?? "FEED",
        thumbnailUrl: item.thumbnail_url ?? item.media_url ?? null,
        permalink: item.permalink ?? null,
        timestamp: item.timestamp ?? null,
      }));
  } catch {
    throw new Error("Instagram media mapping failed.");
  }
}

async function fetchMediaPage(
  token: string,
  limit: number,
  after?: string
): Promise<InstagramMediaResponse> {
  let requestUrl: string;

  try {
    const params = new URLSearchParams({
      fields: INSTAGRAM_MEDIA_FIELDS,
      limit: String(limit),
    });

    if (after) {
      params.set("after", after);
    }

    requestUrl = `${INSTAGRAM_MEDIA_URL}?${params.toString()}`;
  } catch {
    throw new Error("Instagram request could not be built.");
  }

  let response: Response;

  try {
    response = await fetch(requestUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });
  } catch {
    throw new Error("Instagram request failed.");
  }

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as
      | { error?: { message?: string; type?: string; code?: number } }
      | null;
    const detail = body?.error
      ? `${body.error.type ?? "Error"} (${body.error.code ?? "?"}): ${body.error.message ?? ""}`
      : "";
    throw new Error(
      `Instagram request returned HTTP ${response.status}. ${detail}`.trim()
    );
  }

  let payload: InstagramMediaResponse;

  try {
    payload = (await response.json()) as InstagramMediaResponse;
  } catch {
    throw new Error("Instagram response could not be parsed.");
  }

  if (
    !payload ||
    typeof payload !== "object" ||
    !Array.isArray(payload.data)
  ) {
    throw new Error("Instagram response was invalid.");
  }

  return payload;
}

export async function getInstagramReels(
  optionsOrPageSize: InstagramReelsOptions | number = {
    limit: DEFAULT_PAGE_SIZE,
  },
  legacyAfter?: string
): Promise<InstagramReelsResult> {
  const token = await getInstagramToken();

  if (!token) {
    throw new Error("Instagram configuration is missing.");
  }

  const requestedLimit =
    typeof optionsOrPageSize === "number"
      ? optionsOrPageSize
      : optionsOrPageSize.limit ?? DEFAULT_PAGE_SIZE;
  const initialAfter =
    typeof optionsOrPageSize === "number"
      ? legacyAfter
      : optionsOrPageSize.after;
  const safeRequestedLimit = Number.isFinite(requestedLimit)
    ? requestedLimit
    : DEFAULT_PAGE_SIZE;
  const normalizedLimit = Math.min(
    Math.max(1, Math.trunc(safeRequestedLimit)),
    MAX_PAGE_SIZE
  );

  const candidates: InstagramReel[] = [];
  const seenKeys = new Set<string>();
  let cursor = initialAfter;
  let nextCursor: string | null = null;

  for (let page = 0; page < MAX_SCAN_PAGES; page += 1) {
    const payload = await fetchMediaPage(
      token,
      normalizedLimit,
      cursor
    );
    const pageReels = mapReels(payload.data ?? []);

    for (const reel of pageReels) {
      if (reelKey(reel).some((key) => seenKeys.has(key))) {
        continue;
      }

      reelKey(reel).forEach((key) => seenKeys.add(key));
      candidates.push(reel);
    }

    nextCursor = payload.paging?.cursors?.after ?? null;
    const pinnedFound = PINNED_INSTAGRAM_REELS.every((identifier) =>
      candidates.some((reel) => isPinnedReel(reel, identifier))
    );

    if (
      candidates.length >= normalizedLimit &&
      pinnedFound
    ) {
      break;
    }

    if (!nextCursor) {
      break;
    }

    cursor = nextCursor;
  }

  const pinned: InstagramReel[] = [];
  const pinnedKeys = new Set<string>();

  for (const identifier of PINNED_INSTAGRAM_REELS) {
    const reel = candidates.find((item) =>
      isPinnedReel(item, identifier)
    );

    if (!reel) {
      continue;
    }

    const keys = reelKey(reel);

    if (keys.some((key) => pinnedKeys.has(key))) {
      continue;
    }

    keys.forEach((key) => pinnedKeys.add(key));
    pinned.push(reel);
  }

  const latestRemaining = candidates.filter(
    (reel) => !reelKey(reel).some((key) => pinnedKeys.has(key))
  );

  return {
    reels: [...pinned, ...latestRemaining].slice(
      0,
      normalizedLimit
    ),
    nextCursor,
  };
}
