import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { CREDIT_PACKAGES_MAP } from "../../../constants";
import { CREDIT_FULFILLMENT_VERSION, grantPurchasedCredits } from "../../../_lib/credit-purchases";
import { resolveStripeCustomerId } from "@/lib/billing/customer";

const PurchaseSchema = z.object({ packageId: z.enum(["pkg_basic", "pkg_pro", "pkg_elite"]).default("pkg_basic"), requestId: z.string().uuid().optional() });
const privateHeaders = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" };
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: privateHeaders });

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return json({ error: "Sign in required" }, 401);
    const body = await req.json().catch(() => null);
    const parsed = PurchaseSchema.safeParse(body);
    if (!parsed.success) return json({ error: "Choose a valid credit pack." }, 400);
    const { packageId } = parsed.data;
    const selected = CREDIT_PACKAGES_MAP[packageId];
    const requestId = parsed.data.requestId ?? randomUUID();
    const idempotencyKey = `jerkstore:${session.user.id}:${packageId}:${requestId}`;
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) return json({ error: "User not found" }, 404);
    const customerId = await resolveStripeCustomerId(user);
    const metadata = { userId: user.id, siteSlug: "jerkstore", type: "credits_purchase", creditsAmount: selected.credits.toString(), packageId, fulfillmentVersion: CREDIT_FULFILLMENT_VERSION };
    const customer = await stripe.customers.retrieve(customerId);
    const paymentMethod = "deleted" in customer ? null : customer.invoice_settings?.default_payment_method;
    if (paymentMethod) {
      let intent;
      try {
        intent = await stripe.paymentIntents.create({ amount: selected.amount, currency: "usd", customer: customerId, payment_method: typeof paymentMethod === "string" ? paymentMethod : paymentMethod.id, off_session: true, confirm: true, metadata: { ...metadata, source: "immediate" }, description: selected.name }, { idempotencyKey: `${idempotencyKey}:saved-card` });
      } catch (error) {
        // Only a card failure can start a new checkout attempt. Network or
        // fulfillment failures must not create a second, potentially paid PI.
        if ((error as { type?: string }).type !== "StripeCardError") throw error;
      }
      if (intent?.status === "succeeded") {
        // This is outside the payment catch: a DB error after charging must
        // return an error and let the same receipt/webhook retry fulfillment.
        const granted = await grantPurchasedCredits(intent.id, user.id, selected.credits);
        return json({ success: true, message: granted ? "Tank refilled." : "This purchase is already in your balance.", creditsAdded: granted ? selected.credits : 0, paymentIntentId: intent.id, livemode: intent.livemode });
      }
      if (intent?.status === "processing") return json({ pending: true, message: "Your payment is processing. Check your balance before trying again." }, 202);
      if (intent?.client_secret) return json({ clientSecret: intent.client_secret, amount: selected.amount, credits: selected.credits });
    }
    const intent = await stripe.paymentIntents.create({ amount: selected.amount, currency: "usd", customer: customerId, setup_future_usage: "off_session", metadata, description: selected.name, automatic_payment_methods: { enabled: true } }, { idempotencyKey: `${idempotencyKey}:checkout` });
    return json({ clientSecret: intent.client_secret, amount: selected.amount, credits: selected.credits });
  } catch (error) {
    console.error("Jerkstore checkout unavailable", {
      code: (error as { code?: string }).code,
      type: (error as { type?: string }).type,
      name: (error as Error).name,
      message: (error as Error).message,
    });
    return json({ error: "Checkout is temporarily unavailable. Check your balance before buying again. Contact support if a charge is missing credits." }, 503);
  }
}
