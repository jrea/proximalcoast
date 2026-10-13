import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const sessionUser = await auth.api.getSession({
    headers: await headers(),
  });

  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: sessionUser.user.id },
      select: { stripeCustomerId: true },
    });

    if (!user?.stripeCustomerId) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 400 }
      );
    }

    const { siteSlug = "jerkstore" } = await req.json().catch(() => ({}));

    // The return URL is built only from a validated site slug and the
    // configured root domain — never from a raw slug (which could reshape
    // the URL with /, .., ? or #) — and it points at the site's public
    // billing page, not the internal /sites/<slug> rewrite path.
    const ACTIVE_SITES = new Set(["backlinks", "bkd", "jerkstore", "overmake", "slice"]);
    if (typeof siteSlug !== "string" || !ACTIVE_SITES.has(siteSlug)) {
      return NextResponse.json({ error: "Invalid site" }, { status: 400 });
    }
    const rootDomain = (process.env.ROOT_DOMAIN || "proximalcoast.com").split(":")[0];
    let returnUrl = `https://${siteSlug}.${rootDomain}/billing`;

    // Local development exception: when the request comes from a dev
    // origin (localhost or a *.lvh.me subsite host) outside production,
    // return to that origin — the public production URL would leave the
    // dev environment entirely. Only the validated origin is used (never
    // a raw path/query), and the path is the public /billing page.
    if (process.env.NODE_ENV !== "production") {
      const origin = req.headers.get("origin");
      if (origin) {
        try {
          const originHost = new URL(origin).hostname.toLowerCase();
          if (
            originHost === "localhost" ||
            originHost === "lvh.me" ||
            originHost.endsWith(".lvh.me")
          ) {
            returnUrl = `${origin}/billing`;
          }
        } catch {
          // Unparseable Origin — fall back to the production construction.
        }
      }
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: returnUrl,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe Portal Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
