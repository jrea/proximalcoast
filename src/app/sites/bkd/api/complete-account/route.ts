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

    const email = session.customer_details?.email;
    const customerId = session.customer as string;
    const subscriptionId = session.subscription as string;

    if (!email) {
      return NextResponse.json({ error: "No email found in session" }, { status: 400 });
    }

    // 2. Find or create the user using better-auth API to avoid missing field errors
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Create user with better-auth to ensure all required fields (id, dates) are handled
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

      user = signUpResult.user as any;

      // Update stripeCustomerId on the newly created user
      await prisma.user.update({
        where: { id: signUpResult.user.id },
        data: { stripeCustomerId: customerId }
      });
    } else {
      // User already exists (possibly created by webhook). 
      // Link the Stripe ID if missing.
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId }
      });
    }

    if (!user) {
      throw new Error("User object is missing after creation/fetch");
    }

    // 3. Explicitly link the subscription to the user (since guest checkouts don't have userId in webhook)
    if (subscriptionId) {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const expiresAt = (subscription as any).current_period_end
        ? new Date((subscription as any).current_period_end * 1000)
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      await prisma.user_subscription.upsert({
        where: { stripeSubscriptionId: subscriptionId },
        update: {
          userId: user.id,
          status: subscription.status,
          plan: "standard",
          expiresAt,
        },
        create: {
          userId: user.id,
          siteSlug: "bkd",
          stripeSubscriptionId: subscriptionId,
          status: subscription.status,
          plan: "standard",
          expiresAt,
        }
      });
    }

    return NextResponse.json({ success: true, email: user.email });
  } catch (error) {
    console.error("Complete Account Error:", error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Internal Server Error"
    }, { status: 500 });
  }
}
