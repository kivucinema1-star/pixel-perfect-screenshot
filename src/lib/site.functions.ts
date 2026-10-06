import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"] || import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"];
  const url = process.env["SUPABASE_URL"] || import.meta.env["VITE_SUPABASE_URL"];
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export type NavItem = { label: string; href: string };
export type SocialLink = { platform: string; url: string };
export type Stat = { value: string; label: string };

export const getSiteData = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const [settings, hero, portfolio, services, clients, gallery] = await Promise.all([
    sb.from("site_settings").select("logo_text,nav_items,social_links,cta_heading,cta_subtext,whatsapp,email,footer_text,copyright_text,popup_heading,popup_subtext,popup_link,popup_interval_sec,popup_duration_sec").eq("id", 1).maybeSingle(),
    sb.from("hero").select("headline,subtext,cta1_label,cta1_link,cta2_label,cta2_link,stats").eq("id", 1).maybeSingle(),
    sb.from("portfolio_items").select("id,title,subtitle,thumbnail_url,video_url").order("sort_order"),
    sb.from("services").select("id,title,description,tags").order("sort_order"),
    sb.from("clients").select("id,name,logo_url").order("sort_order"),
    sb.from("gallery_items").select("id,photo_url").order("sort_order"),
  ]);
  const s = settings.data;
  const h = hero.data;
  return {
    settings: s
      ? { ...s, nav_items: (s.nav_items ?? []) as NavItem[], social_links: (s.social_links ?? []) as SocialLink[] }
      : null,
    hero: h ? { ...h, stats: (h.stats ?? []) as Stat[] } : null,
    portfolio: portfolio.data ?? [],
    services: services.data ?? [],
    clients: clients.data ?? [],
    gallery: gallery.data ?? [],
  };
});

export type SiteData = Awaited<ReturnType<typeof getSiteData>>;

// Seed: creates the single default admin account the first time, only if no admin exists.
export const ensureDefaultAdmin = createServerFn({ method: "POST" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { count, error } = await supabaseAdmin.from("user_roles").select("id", { count: "exact", head: true }).eq("role", "admin");
  if (error) {
    console.error("seed check failed", error);
    return { ok: false };
  }
  if ((count ?? 0) > 0) return { ok: true };
  const { data, error: cErr } = await supabaseAdmin.auth.admin.createUser({
    email: "admin@clipsetproduction.com",
    password: "ChangeMe@123",
    email_confirm: true,
  });
  if (cErr || !data.user) {
    console.error("seed create failed", cErr);
    return { ok: false };
  }
  await supabaseAdmin.from("user_roles").insert({ user_id: data.user.id, role: "admin", must_change_password: true });
  return { ok: true };
});
