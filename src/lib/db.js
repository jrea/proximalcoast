"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.withOrg = exports.prisma = void 0;
var client_1 = require("@prisma/client");
require("server-only");
var prismaClientSingleton = function () {
    return new client_1.PrismaClient();
};
var prisma = (_a = globalThis.prismaGlobal) !== null && _a !== void 0 ? _a : prismaClientSingleton();
exports.prisma = prisma;
if (process.env.NODE_ENV !== "production")
    globalThis.prismaGlobal = prisma;
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
var withOrg = function (orgId) { return ({
    orgId: orgId,
}); };
exports.withOrg = withOrg;
