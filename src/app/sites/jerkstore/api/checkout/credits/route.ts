
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    return new NextResponse("User not found", { status: 404 });
  }

  let customerId = user.stripeCustomerId;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email || undefined,
      name: user.name || undefined,
      metadata: {
        userId: user.id,
      },
    });
    customerId = customer.id;
    await prisma.user.update({
      where: { id: user.id },
      data: { stripeCustomerId: customerId },
    });
  }

  const origin = (await headers()).get("origin") || "https://jerkstore.proximalcoast.com";

  // 1. Check for Default Payment Method
  if (customerId) {
    const customer = await stripe.customers.retrieve(customerId) as any;
    const defaultPaymentMethod = customer.invoice_settings?.default_payment_method;

    if (defaultPaymentMethod) {
      try {
        // Attempt immediate charge
        const paymentIntent = await stripe.paymentIntents.create({
          amount: 100, // $1.00
          currency: 'usd',
          customer: customerId,
          payment_method: defaultPaymentMethod as string,
          off_session: true,
          confirm: true,
          metadata: {
            userId: user.id,
            siteSlug: "jerkstore",
            type: "credits_purchase"
          },
          description: "50 Roast Credits Refill"
        });

        if (paymentIntent.status === 'succeeded') {
          // Credit the user immediately
          await prisma.user.update({
            where: { id: user.id },
            data: { credits: { increment: 50 } }
          });
          return NextResponse.json({ success: true, message: "Tank refilled instantly." });
        }
      } catch (err) {
        console.warn("Auto-charge failed, falling back to checkout UI:", err);
      }
    }
  }

  // 2. Fallback: Create PaymentIntent (for Custom Elements UI)
  const paymentIntent = await stripe.paymentIntents.create({
    amount: 100, // $1.00
    currency: 'usd',
    customer: customerId,
    setup_future_usage: 'off_session',
    metadata: {
      userId: user.id,
      siteSlug: "jerkstore",
      type: "credits_purchase"
    },
    description: "50 Roast Credits Refill",
    automatic_payment_methods: {
      enabled: true,
    },
  });

  return NextResponse.json({
    clientSecret: paymentIntent.client_secret
  });
}
