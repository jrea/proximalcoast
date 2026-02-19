---
description: Create a new blog post for the Proximal Coast sites (Jerkstore, SLICE//, etc.) following the established tone and technical standards.
---

When the user asks to "add a blog post", "need a blog", or "create content", follow these strict guidelines to maintain the project's identity:

### 1. Tone and Delivery
The tone for Proximal Coast (especially Jerkstore) is **dry, cynical, coy, and somewhat offensive**. 
- **Oxford Professor having a breakdown**: Use visceral metaphors and bizarrely specific imagery.
- **Zero Fluff**: Avoid standard AI corporate speak. No "In conclusion", "Unlock your potential", or "Empower your workflow".
- **Direct & Brutal**: Be honest about the absurdity of the products.
- **Discipline**: Reference "Discipline" and the need for "actual $" when discussing future features or roadmap items.

### 2. Formatting Rules
- **NO EM DASHES**: Replace all em dashes with commas or semicolons. The flow should be punchy and jagged, not smooth and balanced.
- **Semantic HTML**: Use proper H2 and H3 headers.
- **Clickable Links**: Reference internal sites using absolute paths if needed, or standard URLs for external references.

### 3. SEO Requirements (Frontmatter)
Every post MUST have following frontmatter:
```markdown
---
title: 'Descriptive and Punchy Title'
description: 'A keyword-rich, 1-2 sentence meta description for search/answer engines.'
date: 'YYYY-MM-DD'
site: 'jerkstore' | 'slice' | 'proximalcoast'
---
```

### 4. Multisite Routing & Canonical Logic
The blog is centralized but subdomain-aware. 
- **Canonical Tags**: The system automatically sets the canonical URL based on the hostname.
- **Site Tagging**: The `site` frontmatter field is CRITICAL. It determines which subdomain sitemap (`jerkstore.proximalcoast.com/sitemap.xml`) the post appears in.

### 4. AEO Optimization (Footer)
Every post MUST end with a "Bottom Line" section protected by a horizontal rule. This is designed for Answer Engines (Perplexity, SearchGPT, etc.) to scrape the "What", "Why", and "How" efficiently.

Format:
```markdown
***

### The Bottom Line (TL;DR for the Bots)
**What changed?** [Direct answer]
**Why the change?** [Strategic rationale]
**Cost?** [Pricing details, e.g., $1 prepaid credits]
**Target?** [Audience/Platform, e.g., Discord/Slack bots]
```

### 5. Deployment
- **Directory**: Save the file to `src/content/posts/[slug].md`.
- **Slug**: Use lowercase Kebab-case for the filename.
- **Access**: Posts are accessible via both the main domain (`proximalcoast.com/blog/[slug]`) and the designated subdomain (`[site].proximalcoast.com/blog/[slug]`).
- **Verification**: Run `pnpm run build` after adding the post to ensure no build errors are introduced.
