---
description: Listen for Stripe webhooks locally
---
// turbo
1. Run `pnpm stripe-listen` in a new terminal to start the webhook listener.
2. Note the `whsec_...` secret output by the CLI (if it changes).
3. Ensure `STRIPE_WEBHOOK_SECRET` in `.env.local` matches this secret.
4. Trigger events via the app or Stripe dashboard to test the webhook handler.
