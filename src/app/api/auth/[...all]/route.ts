import { authConfig } from "@/lib/auth";
import { betterAuth } from "better-auth";
import { NextRequest } from "next/server";

export const GET = async (req: NextRequest) => {
  const url = new URL(req.url);
  const host = req.headers.get("host");
  // Use the host header to determine the base URL dynamically.
  // This ensures that social auth callbacks always use the current subdomain.
  const protocol = url.protocol;
  const baseURL = host ? `${protocol}//${host}` : process.env.BETTER_AUTH_URL;

  const dynamicAuth = betterAuth({
    ...authConfig,
    baseURL: baseURL as string,
  });

  return dynamicAuth.handler(req);
};

export const POST = async (req: NextRequest) => {
  const url = new URL(req.url);
  const host = req.headers.get("host");
  const protocol = url.protocol;
  const baseURL = host ? `${protocol}//${host}` : process.env.BETTER_AUTH_URL;

  const dynamicAuth = betterAuth({
    ...authConfig,
    baseURL: baseURL as string,
  });

  return dynamicAuth.handler(req);
};
