export type InstagramMediaItem = {
  id?: string;
  caption?: string | null;
  media_type?: string | null;
  media_product_type?: string | null;
  media_url?: string | null;
  thumbnail_url?: string | null;
  permalink?: string | null;
  timestamp?: string | null;
};

export type InstagramMediaResponse = {
  data?: InstagramMediaItem[];
  paging?: {
    cursors?: {
      after?: string | null;
    };
  };
};

export type InstagramReel = {
  id: string;
  caption: string | null;
  mediaType: string;
  mediaProductType: string;
  mediaUrl: string | null;
  thumbnailUrl: string | null;
  permalink: string | null;
  timestamp: string | null;
};

export type InstagramReelsResult = {
  reels: InstagramReel[];
  nextCursor: string | null;
};
