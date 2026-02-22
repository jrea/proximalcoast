import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";

export const HANKO_CREDIT_PACKS = {
  starter: {
    id: "starter",
    name: "Starter Pack — 1,000 Signatures",
    credits: 1000,
    amount: 10,
    label: "1,000 signatures",
    price: "$0.10",
  },
  pro: {
    id: "pro",
    name: "Pro Pack — 10,000 Signatures",
    credits: 10000,
    amount: 90,
    label: "10,000 signatures",
    price: "$0.90",
  },
  studio: {
    id: "studio",
    name: "Studio Pack — 100,000 Signatures",
    credits: 100000,
    amount: 800,
    label: "100,000 signatures",
    price: "$8.00",
  },
} as const;

export type HankoCreditPackId = keyof typeof HANKO_CREDIT_PACKS;

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { pack = "starter" } = await req.json().catch(() => ({ pack: "starter" }));
  const selectedPack = HANKO_CREDIT_PACKS[pack as HankoCreditPackId] ?? HANKO_CREDIT_PACKS.starter;

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return new NextResponse("User not found", { status: 404 });

  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email ?? undefined,
      name: user.name ?? undefined,
      metadata: { userId: user.id },
    });
    customerId = customer.id;
    await prisma.user.update({ where: { id: user.id }, data: { stripeCustomerId: customerId } });
  }

  // Attempt immediate charge on saved default payment method
  const customer = await stripe.customers.retrieve(customerId) as any;
  const defaultPaymentMethod = customer.invoice_settings?.default_payment_method;

  if (defaultPaymentMethod) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: selectedPack.amount,
        currency: "usd",
        customer: customerId,
        payment_method: defaultPaymentMethod as string,
        off_session: true,
        confirm: true,
        metadata: {
          userId: user.id,
          siteSlug: "hanko",
          type: "credits_purchase",
          source: "immediate",
          creditsAmount: selectedPack.credits.toString(),
        },
        description: selectedPack.name,
      });

      if (paymentIntent.status === "succeeded") {
        await prisma.user.update({
          where: { id: user.id },
          data: { credits: { increment: selectedPack.credits } },
        });
        return NextResponse.json({
          success: true,
          immediate: true,
          creditsAdded: selectedPack.credits,
          newBalance: (user.credits ?? 0) + selectedPack.credits,
        });
      }
    } catch (err) {
      console.warn("[Hanko] Auto-charge failed, falling back to Elements:", err);
    }
  }

  // Fallback: return clientSecret for Stripe Elements form
  const paymentIntent = await stripe.paymentIntents.create({
    amount: selectedPack.amount,
    currency: "usd",
    customer: customerId,
    setup_future_usage: "off_session",
    metadata: {
      userId: user.id,
      siteSlug: "hanko",
      type: "credits_purchase",
      creditsAmount: selectedPack.credits.toString(),
    },
    description: selectedPack.name,
    automatic_payment_methods: { enabled: true },
  });

  return NextResponse.json({
    clientSecret: paymentIntent.client_secret,
    amount: selectedPack.amount,
    credits: selectedPack.credits,
    pack: selectedPack,
  });
}
