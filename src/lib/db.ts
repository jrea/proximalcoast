import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prismaClientSingleton = () => {
  return new PrismaClient({ adapter });
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;

export { prisma };

/**
 * Helper to ensure queries are scoped to the correct Organization.
 * 
 * Usage:
 * const orgId = await getActiveOrgId();
 * const data = await prisma.someModel.findMany({
 *   where: { orgId } 
 * });
 * 
 * Note: Since we are using standard Postgres (Nile), we don't have built-in tenant isolation
 * at the connection level. We must rely on application-level checks.
 * 
 * Ideally, we would use a Prisma Extension to automatically inject this filter,
 * but for now, we will be explicit.
 */
export const withOrg = (orgId: string) => ({
  orgId,
});
