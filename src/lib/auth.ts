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
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
    crossSubdomainCookies: {
      enabled: true,
      domain: process.env.ROOT_DOMAIN?.split(":")[0],
    },
  },
  trustedOrigins: [
    "http://localhost:3000",
    "http://lvh.me:3000",
    "http://jerkstore.lvh.me:3000",
    "http://dnbk.lvh.me:3000",
    "http://bkd.lvh.me:3000",
    `https://${process.env.ROOT_DOMAIN}`,
    `https://jerkstore.${process.env.ROOT_DOMAIN}`,
    `https://dnbk.${process.env.ROOT_DOMAIN}`,
    `https://bkd.${process.env.ROOT_DOMAIN}`,
  ],
});
