<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

# Project rules

- All public site content comes from Lovable Cloud tables (site_settings, hero, portfolio_items, services, clients, gallery_items); never hardcode demo copy — empty collections render nothing on the public site.
- Public data is read through the `getSiteData` server function with a publishable client — keeps SSR working without exposing admin data.
- Admin access is gated by the `user_roles` table + `has_role()` in RLS; the default admin is created idempotently by `ensureDefaultAdmin` because migrations cannot write auth users.
- Admin image uploads go through the admin-only `POST /api/upload` route, which forwards to Cloudinary with an unsigned preset (config in env vars), so no credentials reach the browser.
- Admin input is sanitized client-side (`src/lib/sanitize.ts`) before saving; URLs are restricted to http(s)/mailto/tel/anchors to prevent stored XSS.
