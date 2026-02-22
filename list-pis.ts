import { stripe } from "./src/lib/stripe";

async function main() {
  const customerId = 'cus_U1nm8oh3abojJz';
  const pis = await stripe.paymentIntents.list({
    customer: customerId,
    limit: 5
  });
  console.log(JSON.stringify(pis.data, null, 2));
}

main().catch(console.error);
