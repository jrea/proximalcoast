import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";

export async function reportUsage(userId: string, quantity: number = 1) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { stripeCustomerId: true },
    });

    if (user?.stripeCustomerId) {
      await stripe.billing.meterEvents.create({
        event_name: 'roasts',
        payload: {
          value: quantity.toString(),
          stripe_customer_id: user.stripeCustomerId,
        },
      });
      console.log(`[Usage] Reported ${quantity} units for user ${userId} via Meter Events`);
    } else {
      console.warn(`[Usage] No stripeCustomerId found for user ${userId}`);
    }
  } catch (error) {
    console.error(`[Usage] Failed to report usage for user ${userId}:`, error);
  }
}
