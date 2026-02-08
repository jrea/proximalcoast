import { betterAuth } from "better-auth";
import { organization } from "better-auth/plugins";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./db";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  plugins: [
    organization(),
  ],
  email: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  advanced: {
    useSecureCookies: false, // For local dev
  },
  trustedOrigins: [
    "http://localhost:3000",
    "http://jerkstore.localhost:3000",
    `https://${process.env.ROOT_DOMAIN}`,
    `https://jerkstore.${process.env.ROOT_DOMAIN}`,
    // Add other origins as needed
  ],
});
