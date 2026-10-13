import { betterAuth } from "better-auth";
import { organization } from "better-auth/plugins";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./db";

const organizationPlugin = organization();

const IS_PROD = process.env.NODE_ENV === "production";
const SUBSITES = ["jerkstore", "dnbk", "bkd", "hanko"];

/**
 * ROOT_DOMAIN drives both the cross-subdomain cookie domain and the
 * trusted origins, so it is validated once, here:
 * - production: it is REQUIRED. Previously an unset ROOT_DOMAIN silently
 *   produced literal "https://undefined" trusted origins and a host-only
 *   cookie, and localhost/lvh.me dev origins shipped to production —
 *   trusting http://localhost:3000 for credentialed auth requests whose
 *   session cookie is scoped to the whole root domain.
 * - development: localhost/lvh.me origins are added, and only here.
 */
function resolveRootDomain(): string | undefined {
  const raw = process.env.ROOT_DOMAIN?.split(":")[0]?.trim();
  if (raw) return raw;
  if (IS_PROD) {
    throw new Error(
      "ROOT_DOMAIN must be set in production (it configures the auth cookie domain and trusted origins)"
    );
  }
  return undefined;
}

const rootDomain = resolveRootDomain();

const trustedOrigins: string[] = rootDomain
  ? [
      `https://${rootDomain}`,
      ...SUBSITES.map((site) => `https://${site}.${rootDomain}`),
    ]
  : [];

if (!IS_PROD) {
  trustedOrigins.push(
    "http://localhost:3000",
    "http://lvh.me:3000",
    ...SUBSITES.map((site) => `http://${site}.lvh.me:3000`)
  );
}

export const authConfig = {
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  plugins: [
    organizationPlugin,
  ] as [typeof organizationPlugin],
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
    useSecureCookies: IS_PROD,
    crossSubdomainCookies: {
      enabled: true,
      domain: rootDomain,
    },
  },
  trustedOrigins,
};

export const auth = betterAuth(authConfig);
