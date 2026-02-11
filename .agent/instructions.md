# Project Context

## Architecture
- **Multisite via Proxy**: This project uses a "mini-site" architecture where multiple subdomains are served from a single Next.js codebase.
- **Directory Structure**: Minisites are located in `src/app/sites/[site-name]`.
- **Routing**: `src/proxy.ts` handles domain-based rewriting. It extracts the subdomain from the host header and rewrites the request to `/sites/[subdomain]/[path]`.
- **Shared Resources**:
    - **Components**: Shared UI components are in `src/components`.
    - **Database**: A single Prisma schema is used across all sites.
    - **Auth**: `better-auth` is used for unified authentication across subdomains using cross-subdomain cookies.
- **Independence**: Each site in `src/app/sites/` is treated as an independent application logic-wise, though they share the underlying infrastructure. All code should be co-located in th the `src/app/sites/[site-name]` directory

## Key Sites
- **Jerkstore**: An unhinged AI insult generator.
    - Path: `src/app/sites/jerkstore`
    - API: `src/app/sites/jerkstore/api/generate-insult`
    - Components: `src/app/sites/jerkstore/components/insult-generator.tsx`

## Standards
- Use **Vanilla CSS** for styling.
- Follow **Lucide React** for icons.
- Ensure **Aesthetics** are premium and modern.
- Use **cn()** for conditional class names (avoid ternary operators for classes).
