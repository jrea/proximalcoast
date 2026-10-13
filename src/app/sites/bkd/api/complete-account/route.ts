import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(req: Request) {
  const { sessionId, password } = await req.json();

  if (!sessionId || !password) {
    return NextResponse.json({ error: "Missing session or password" }, { status: 400 });
  }

  try {
    // 1. Retrieve the session from Stripe to get the customer email
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid' && session.payment_status !== 'no_payment_required') {
      return NextResponse.json({ error: "Session not paid" }, { status: 400 });
    }

    // Only a BKD subscription checkout may complete an account. Previously
    // ANY paid session — any site, any mode — was accepted as proof of
    // identity for setting a password or re-linking a Stripe customer.
    if (session.mode !== 'subscription') {
      return NextResponse.json({ error: "Session is not a subscription checkout" }, { status: 400 });
    }
    const sessionSite = session.metadata?.siteSlug;
    if (sessionSite && sessionSite !== "bkd") {
      return NextResponse.json({ error: "Session does not belong to this site" }, { status: 400 });
    }

    // Single-use: a session ID may complete an account exactly once.
    // Session IDs travel in URLs and leak via history/logs/referrers, so
    // without this, holding one was a permanent account-takeover token.
    const priorClaim = await prisma.stripe_session_claim.findUnique({
      where: { sessionId },
    });
    if (priorClaim) {
      return NextResponse.json({ error: "This checkout session has already been used to complete an account" }, { status: 409 });
    }

    const email = session.customer_details?.email;
    const customerId = session.customer as string;
    const subscriptionId = session.subscription as string;

    if (!email) {
      return NextResponse.json({ error: "No email found in session" }, { status: 400 });
    }

    // 2. Do every Stripe READ up front. The session claim must not be
    // consumed until all fallible external reads have succeeded: the old
    // order claimed the session first, so one transient failure after the
    // claim left a paid customer with an account but no entitlement, and
    // every retry then 409'd on the consumed claim.
    let subscriptionExpiresAt: Date | null = null;
    let subscriptionStatus: string | null = null;
    if (subscriptionId) {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const periodEnd = subscription.items.data[0]?.current_period_end;
      subscriptionExpiresAt = periodEnd
        ? new Date(periodEnd * 1000)
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      subscriptionStatus = subscription.status;
    }

    // 3. Find or create the user using better-auth API to avoid missing field errors
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Create user with better-auth to ensure all required fields (id, dates) are handled.
      // (Account creation cannot join the Prisma transaction below; if that
      // transaction fails transiently, a retry finds this user and completes
      // through the existing-user path.)
      const signUpResult = await auth.api.signUpEmail({
        body: {
          email,
          password,
          name: session.customer_details?.name || email.split('@')[0],
        },
        headers: await headers()
      });

      if (!signUpResult || !signUpResult.user) {
        throw new Error("Failed to create user during signup");
      }

      user = await prisma.user.findUnique({
        where: { id: signUpResult.user.id },
      });

      if (!user) {
        throw new Error("Failed to load the newly created user");
      }
    } else {
      // User already exists (possibly created by webhook).
      // Link the Stripe ID only if the account has none yet. NEVER
      // overwrite a different, existing stripeCustomerId: that reassigned
      // another customer's subscriptions and payment methods to whoever
      // presented the session ID.
      if (user.stripeCustomerId && customerId && user.stripeCustomerId !== customerId) {
        return NextResponse.json(
          { error: "This account is already linked to a different Stripe customer" },
          { status: 409 }
        );
      }
    }

    if (!user) {
      throw new Error("User object is missing after creation/fetch");
    }

    const completedUser = user;

    // 4. Commit every local write atomically: the Stripe-customer link,
    // the subscription link (guest checkouts don't have userId in the
    // webhook), and the single-use session claim. The claim row's primary
    // key enforces single-use even under concurrent requests; because the
    // claim lives in the same transaction, a transient failure rolls the
    // claim back too and a retry can complete the whole flow.
    try {
      await prisma.$transaction(async (tx) => {
        if (!completedUser.stripeCustomerId && customerId) {
          await tx.user.update({
            where: { id: completedUser.id },
            data: { stripeCustomerId: customerId }
          });
        }

        if (subscriptionId && subscriptionExpiresAt && subscriptionStatus) {
          await tx.user_subscription.upsert({
            where: { stripeSubscriptionId: subscriptionId },
            update: {
              userId: completedUser.id,
              status: subscriptionStatus,
              plan: "standard",
              expiresAt: subscriptionExpiresAt,
            },
            create: {
              userId: completedUser.id,
              siteSlug: "bkd",
              stripeSubscriptionId: subscriptionId,
              status: subscriptionStatus,
              plan: "standard",
              expiresAt: subscriptionExpiresAt,
            }
          });
        }

        await tx.stripe_session_claim.create({
          data: { sessionId, userId: completedUser.id },
        });
      });
    } catch (txError) {
      if ((txError as { code?: unknown })?.code === "P2002") {
        return NextResponse.json({ error: "This checkout session has already been used to complete an account" }, { status: 409 });
      }
      throw txError;
    }

    return NextResponse.json({ success: true, email: user.email });
  } catch (error) {
    console.error("Complete Account Error:", error);
    return NextResponse.json({
      error: "Internal Server Error"
    }, { status: 500 });
  }
}
