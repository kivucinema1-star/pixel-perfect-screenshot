import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  Home, Info, Film, Images, Mail, Briefcase, Users, Instagram, Youtube, Facebook, Linkedin, Twitter,
  Globe, MessageCircle, Play, X, Circle,
} from "lucide-react";
import { getSiteData, type SiteData } from "@/lib/site.functions";
import { toEmbedUrl } from "@/lib/sanitize";

const siteQuery = queryOptions({ queryKey: ["site"], queryFn: () => getSiteData() });

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Clipset Production — Creative Film Production Agency" },
      { name: "description", content: "Clipset Production crafts cinematic films, commercials and brand stories." },
      { property: "og:title", content: "Clipset Production — Creative Film Production Agency" },
      { property: "og:description", content: "Clipset Production crafts cinematic films, commercials and brand stories." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(siteQuery),
  pendingComponent: () => (
    <div className="flex min-h-screen items-center justify-center bg-hero">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  ),
  errorComponent: () => (
    <div className="flex min-h-screen items-center justify-center text-muted-foreground">Unable to load the site right now.</div>
  ),
  component: Index,
});

function navIcon(label: string) {
  const l = label.toLowerCase();
  if (l.includes("home")) return Home;
  if (l.includes("about")) return Info;
  if (l.includes("portfolio") || l.includes("work")) return Film;
  if (l.includes("gallery")) return Images;
  if (l.includes("contact")) return Mail;
  if (l.includes("service")) return Briefcase;
  if (l.includes("team")) return Users;
  return Circle;
}
function socialIcon(p: string) {
  const l = p.toLowerCase();
  if (l.includes("insta")) return Instagram;
  if (l.includes("you")) return Youtube;
  if (l.includes("face")) return Facebook;
  if (l.includes("linked")) return Linkedin;
  if (l.includes("twit") || l === "x") return Twitter;
  return Globe;
}

function Index() {
  const { data } = useSuspenseQuery(siteQuery);
  const s = data.settings;
  const nav = s?.nav_items ?? [];
  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <Header data={data} />
      <HeroSection data={data} />
      <Portfolio data={data} />
      <Services data={data} />
      <Clients data={data} />
      <Team data={data} />
      <Footer data={data} />
      <HirePopup data={data} />
      {nav.length > 0 && (
        <nav className="fixed inset-x-0 bottom-0 z-40 flex justify-around border-t border-border bg-card/95 py-2 backdrop-blur md:hidden">
          {nav.map((n, i) => {
            const Icon = navIcon(n.label);
            return (
              <a key={i} href={n.href} className="flex min-w-0 flex-1 flex-col items-center gap-1 text-[11px] text-muted-foreground hover:text-primary">
                <Icon className="h-5 w-5" />
                <span className="truncate">{n.label}</span>
              </a>
            );
          })}
        </nav>
      )}
    </div>
  );
}

function Header({ data }: { data: SiteData }) {
  const s = data.settings;
  if (!s) return null;
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/70 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
        <a href="#home" className="flex items-center gap-2 font-display text-xl font-bold tracking-tight">
          <img
            src="/clipset-logo.webp"
            alt={s.logo_text || "Logo"}
            width={91}
            height={128}
            loading="eager"
            fetchPriority="high"
            decoding="sync"
            className="h-10 w-auto"
          />
          {s.logo_text}
          {s.logo_text && <span className="text-primary">.</span>}
        </a>
        <nav className="hidden items-center gap-8 md:flex">
          {s.nav_items.map((n, i) => (
            <a key={i} href={n.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">{n.label}</a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          {s.social_links.map((l, i) => {
            const Icon = socialIcon(l.platform);
            return (
              <a key={i} href={l.url} target="_blank" rel="noopener noreferrer" aria-label={l.platform} className="text-muted-foreground hover:text-primary">
                <Icon className="h-4 w-4" />
              </a>
            );
          })}
        </div>
      </div>
    </header>
  );
}

function HeroSection({ data }: { data: SiteData }) {
  const h = data.hero;
  if (!h || (!h.headline && !h.subtext)) return <section id="home" />;
  return (
    <section id="home" className="relative overflow-hidden bg-hero">
      <div className="mx-auto max-w-7xl px-5 py-24 md:py-36">
        <h1 className="max-w-4xl text-4xl font-bold leading-[1.05] sm:text-6xl md:text-7xl">{h.headline}</h1>
        {h.subtext && <p className="mt-6 max-w-2xl text-lg text-muted-foreground">{h.subtext}</p>}
        <div className="mt-10 flex flex-wrap gap-4">
          {h.cta1_label && (
            <a href={h.cta1_link || "#"} className="rounded-full bg-primary px-7 py-3 font-medium text-primary-foreground shadow-glow transition-transform hover:-translate-y-0.5">{h.cta1_label}</a>
          )}
          {h.cta2_label && (
            <a href={h.cta2_link || "#"} className="rounded-full border border-border px-7 py-3 font-medium hover:bg-foreground/5">{h.cta2_label}</a>
          )}
        </div>
        {h.stats.length > 0 && (
          <div className="mt-16 grid max-w-2xl grid-cols-3 gap-6 border-t border-border pt-8">
            {h.stats.slice(0, 3).map((st, i) => (
              <div key={i}>
                <div className="font-display text-3xl font-bold md:text-4xl">{st.value}</div>
                <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{st.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-12">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-bold md:text-5xl">{title}</h2>
    </div>
  );
}

function Portfolio({ data }: { data: SiteData }) {
  const [open, setOpen] = useState<string | null>(null);
  if (!data.portfolio.length) return null;
  return (
    <section id="portfolio" className="mx-auto max-w-7xl px-5 py-24">
      <SectionTitle eyebrow="Portfolio" title="Selected reels" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {data.portfolio.map((p) => (
          <button key={p.id} onClick={() => p.video_url && setOpen(p.video_url)} className="group overflow-hidden rounded-2xl border border-border bg-card text-left">
            <div className="relative aspect-video overflow-hidden bg-muted">
              {p.thumbnail_url && <img src={p.thumbnail_url} alt={p.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />}
              {p.video_url && (
                <span className="absolute inset-0 flex items-center justify-center bg-background/20 opacity-0 transition-opacity group-hover:opacity-100">
                  <span className="rounded-full bg-primary p-4 text-primary-foreground shadow-glow"><Play className="h-5 w-5" /></span>
                </span>
              )}
            </div>
            <div className="p-5">
              <h3 className="text-lg font-semibold">{p.title}</h3>
              {p.subtitle && <p className="mt-1 text-sm text-muted-foreground">{p.subtitle}</p>}
            </div>
          </button>
        ))}
      </div>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 p-4" onClick={() => setOpen(null)}>
          <button className="absolute right-5 top-5 text-foreground" aria-label="Close"><X /></button>
          <div className="aspect-video w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <iframe src={toEmbedUrl(open)} title="Video" className="h-full w-full rounded-xl" allow="autoplay; fullscreen" allowFullScreen />
          </div>
        </div>
      )}
    </section>
  );
}

function Services({ data }: { data: SiteData }) {
  if (!data.services.length) return null;
  return (
    <section id="services" className="border-y border-border bg-navy/30">
      <div className="mx-auto max-w-7xl px-5 py-24">
        <SectionTitle eyebrow="Services" title="What we do" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {data.services.map((s, i) => (
            <div key={s.id} className="rounded-2xl border border-border bg-card p-7 transition-colors hover:border-primary/60">
              <div className="font-display text-sm text-primary">{String(i + 1).padStart(2, "0")}</div>
              <h3 className="mt-3 text-xl font-semibold">{s.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.description}</p>
              {s.tags.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {s.tags.map((t, j) => <span key={j} className="rounded-full bg-secondary px-3 py-1 text-xs">{t}</span>)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Clients({ data }: { data: SiteData }) {
  if (!data.clients.length) return null;
  const items = [...data.clients, ...data.clients];
  return (
    <section id="clients" className="overflow-hidden py-16">
      <p className="mb-8 text-center text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">Trusted by</p>
      <div className="flex w-max animate-marquee gap-16">
        {items.map((c, i) => (
          <div key={i} className="flex h-12 items-center">
            {c.logo_url ? <img src={c.logo_url} alt={c.name} className="h-10 w-auto object-contain opacity-70" /> : <span className="font-display text-2xl font-semibold text-muted-foreground">{c.name}</span>}
          </div>
        ))}
      </div>
    </section>
  );
}

function Team({ data }: { data: SiteData }) {
  if (!data.team.length) return null;
  return (
    <section id="team" className="mx-auto max-w-7xl px-5 py-24">
      <SectionTitle eyebrow="Team" title="The crew" />
      <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
        {data.team.map((m) => (
          <div key={m.id}>
            <div className="aspect-[3/4] overflow-hidden rounded-2xl bg-muted">
              {m.photo_url && <img src={m.photo_url} alt={m.name} loading="lazy" className="h-full w-full object-cover" />}
            </div>
            <h3 className="mt-4 font-semibold">{m.name}</h3>
            <p className="text-sm text-muted-foreground">{m.role}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Footer({ data }: { data: SiteData }) {
  const s = data.settings;
  if (!s) return null;
  const wa = s.whatsapp.replace(/[^\d]/g, "");
  return (
    <footer id="contact">
      {(s.cta_heading || s.cta_subtext) && (
        <div className="bg-band">
          <div className="mx-auto max-w-7xl px-5 py-20 text-center">
            <h2 className="text-3xl font-bold md:text-5xl">{s.cta_heading}</h2>
            {s.cta_subtext && <p className="mx-auto mt-4 max-w-xl text-foreground/80">{s.cta_subtext}</p>}
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              {wa && <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 font-medium text-background"><MessageCircle className="h-4 w-4" />WhatsApp</a>}
              {s.email && <a href={`mailto:${s.email}`} className="inline-flex items-center gap-2 rounded-full border border-foreground/40 px-6 py-3 font-medium"><Mail className="h-4 w-4" />{s.email}</a>}
            </div>
          </div>
        </div>
      )}
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-10 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <div>{s.footer_text}</div>
        <div>{s.copyright_text}</div>
      </div>
    </footer>
  );
}

function HirePopup({ data }: { data: SiteData }) {
  const s = data.settings;
  const [show, setShow] = useState(false);
  const interval = Math.max(5, s?.popup_interval_sec ?? 30) * 1000;
  const duration = Math.max(1, s?.popup_duration_sec ?? 5) * 1000;
  const enabled = !!s?.popup_heading;
  useEffect(() => {
    if (!enabled) return;
    let hide: ReturnType<typeof setTimeout>;
    const id = setInterval(() => {
      setShow(true);
      hide = setTimeout(() => setShow(false), duration);
    }, interval);
    return () => { clearInterval(id); clearTimeout(hide); };
  }, [enabled, interval, duration]);
  if (!enabled || !s) return null;
  return (
    <div className={`fixed left-3 top-20 z-50 w-[calc(100vw-1.5rem)] max-w-xs rounded-2xl border border-primary/40 bg-card p-5 shadow-glow transition-all duration-500 sm:left-5 ${show ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-4 opacity-0"}`}>
      <button onClick={() => setShow(false)} className="absolute right-3 top-3 text-muted-foreground" aria-label="Close"><X className="h-4 w-4" /></button>
      <h4 className="pr-6 font-display text-lg font-semibold">{s.popup_heading}</h4>
      {s.popup_subtext && <p className="mt-1 text-sm text-muted-foreground">{s.popup_subtext}</p>}
      {s.popup_link && <a href={s.popup_link} className="mt-4 inline-block rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground">Hire us</a>}
    </div>
  );
}

