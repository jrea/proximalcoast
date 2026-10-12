import type { Metadata } from "next";
import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { BillingContent } from "../_components/billing-content";
import { Loader2 } from "lucide-react";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Billing | Jerkstore",
  robots: { index: false, follow: false },
};

async function getDefaultPaymentMethod(customerId: string | null) {
  if (!customerId) return null;

  try {
    const customer = await stripe.customers.retrieve(customerId);
    if (customer.deleted) return null;

    const defaultPaymentMethod = customer.invoice_settings.default_payment_method;
    const paymentMethodId = typeof defaultPaymentMethod === "string"
      ? defaultPaymentMethod
      : defaultPaymentMethod?.id;

    if (!paymentMethodId) return null;

    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
    if (paymentMethod.type !== "card" || !paymentMethod.card) return null;

    return {
      brand: paymentMethod.card.brand,
      last4: paymentMethod.card.last4,
    };
  } catch (error) {
    console.error("Unable to load the saved payment method", error);
    return null;
  }
}

export default async function BillingManagementPage() {
  const sessionUser = await auth.api.getSession({
    headers: await headers(),
  });

  if (!sessionUser) {
    redirect("/");
  }

  // Fetch user credit balance
  const user = await prisma.user.findUnique({
    where: { id: sessionUser.user.id },
    select: { credits: true, stripeCustomerId: true }
  });
  const initialPaymentMethod = await getDefaultPaymentMethod(user?.stripeCustomerId ?? null);

  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-100 flex items-center justify-center"><Loader2 className="animate-spin w-8 h-8" /></div>}>
      <BillingContent
        creditBalance={user?.credits ?? 0}
        initialPaymentMethod={initialPaymentMethod}
      />
    </Suspense>
  );
}
