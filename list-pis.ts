import { stripe } from "./src/lib/stripe";

async function main() {
  // The customer ID comes from the environment. A REAL customer's ID was
  // previously hardcoded in this file — never commit customer IDs.
  const customerId = process.env.STRIPE_CUSTOMER_ID;
  if (!customerId) {
    console.error('Set STRIPE_CUSTOMER_ID to the customer to inspect.');
    process.exit(1);
  }
  const pis = await stripe.paymentIntents.list({
    customer: customerId,
    limit: 5
  });
  // Print a summary, not full PaymentIntent objects (which carry
  // customer details, payment method data and metadata).
  console.log(JSON.stringify(pis.data.map(pi => ({
    id: pi.id, status: pi.status, amount: pi.amount, currency: pi.currency, created: pi.created,
  })), null, 2));
}

main().catch(console.error);
