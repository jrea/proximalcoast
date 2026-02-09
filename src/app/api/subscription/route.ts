import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  const sessionUser = await auth.api.getSession({
    headers: await headers(),
  });

  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const siteSlug = searchParams.get("siteSlug") || "jerkstore";

  try {
    const subscription = await prisma.user_subscription.findUnique({
      where: {
        userId_siteSlug: {
          userId: sessionUser.user.id,
          siteSlug,
        },
      },
    });

    return NextResponse.json({ subscription });
  } catch (error) {
    console.error("Subscription Fetch Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
