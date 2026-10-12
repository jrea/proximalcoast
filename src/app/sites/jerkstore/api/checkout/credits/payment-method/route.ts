import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";

function customerId(customer: string | { id: string } | null) {
  return typeof customer === "string" ? customer : customer?.id;
}

function paymentMethodId(paymentMethod: string | { id: string } | null) {
  return typeof paymentMethod === "string" ? paymentMethod : paymentMethod?.id;
}

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  const { paymentIntentId } = await req.json().catch(() => ({}));
  if (typeof paymentIntentId !== "string") {
    return NextResponse.json({ error: "Missing payment intent." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { stripeCustomerId: true },
  });
  if (!user?.stripeCustomerId) {
    return NextResponse.json({ error: "No billing customer found." }, { status: 404 });
  }

  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
  const intentCustomerId = customerId(paymentIntent.customer);
  const intentPaymentMethodId = paymentMethodId(paymentIntent.payment_method);

  if (
    paymentIntent.status !== "succeeded" ||
    paymentIntent.metadata.userId !== session.user.id ||
    intentCustomerId !== user.stripeCustomerId ||
    !intentPaymentMethodId
  ) {
    return NextResponse.json({ error: "Payment method could not be verified." }, { status: 400 });
  }

  const paymentMethod = await stripe.paymentMethods.retrieve(intentPaymentMethodId);
  if (
    paymentMethod.type !== "card" ||
    !paymentMethod.card ||
    customerId(paymentMethod.customer) !== user.stripeCustomerId
  ) {
    return NextResponse.json({ error: "Payment method could not be verified." }, { status: 400 });
  }

  await stripe.customers.update(user.stripeCustomerId, {
    invoice_settings: { default_payment_method: paymentMethod.id },
  });

  return NextResponse.json({
    paymentMethod: {
      brand: paymentMethod.card.brand,
      last4: paymentMethod.card.last4,
    },
  });
}
