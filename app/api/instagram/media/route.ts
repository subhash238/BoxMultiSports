import { NextRequest, NextResponse } from "next/server";

import { getInstagramReels } from "@/lib/instagram/client";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawLimit = searchParams.get("limit");
  const rawAfter = searchParams.get("after");

  let limit: number | undefined;

  if (rawLimit !== null) {
    const parsedLimit = Number(rawLimit);

    if (Number.isFinite(parsedLimit)) {
      limit = parsedLimit;
    }
  }

  const after =
    rawAfter && rawAfter.trim().length > 0
      ? rawAfter
      : undefined;

  try {
    const result = await getInstagramReels(limit, after);

    return NextResponse.json({
      success: true,
      reels: result.reels,
      nextCursor: result.nextCursor,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Unable to load Instagram gallery.",
      },
      { status: 502 }
    );
  }
}
