// Shim for 'server-only' package.
// In Next.js this throws if used outside a Server Component.
// In tests we just no-op it so route files can be imported.
export { };
