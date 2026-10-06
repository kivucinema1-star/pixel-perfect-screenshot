import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState, useCallback, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { toast } from "sonner";
import { GripVertical, Plus, Trash2, Upload, LogOut, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ensureDefaultAdmin } from "@/lib/site.functions";
import { cleanText, cleanUrl } from "@/lib/sanitize";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Admin — Clipset Production" },
      { name: "description", content: "Clipset Production content management." },
      { property: "og:title", content: "Admin — Clipset Production" },
      { property: "og:description", content: "Clipset Production content management." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const seed = useServerFn(ensureDefaultAdmin);
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [role, setRole] = useState<{ must_change_password: boolean } | null | undefined>(undefined);

  useEffect(() => {
    seed().catch(() => {});
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    return () => sub.subscription.unsubscribe();
  }, [seed]);

  const loadRole = useCallback(async () => {
    if (!session) return setRole(undefined);
    const { data } = await supabase.from("user_roles").select("must_change_password").eq("user_id", session.user.id).eq("role", "admin").maybeSingle();
    setRole(data ?? null);
  }, [session]);
  useEffect(() => { loadRole(); }, [loadRole]);

  if (session === undefined || (session && role === undefined)) return <Center><Loader2 className="animate-spin" /></Center>;
  if (!session) return <Login />;
  if (!role) return (
    <Center>
      <p className="text-muted-foreground">This account doesn't have admin access.</p>
      <Button className="mt-4" onClick={() => supabase.auth.signOut()}>Sign out</Button>
    </Center>
  );
  if (role.must_change_password) return <ChangePassword userId={session.user.id} onDone={loadRole} />;
  return <Dashboard email={session.user.email ?? ""} />;
}

function Center({ children }: { children: ReactNode }) {
  return <div className="flex min-h-screen flex-col items-center justify-center bg-hero px-4">{children}</div>;
}

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (error) toast.error(error.status === 429 ? "Too many attempts. Try again later." : "Invalid email or password");
  }
  return (
    <Center>
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-2xl border border-border bg-card p-8">
        <h1 className="text-2xl font-bold">Admin sign in</h1>
        <div className="space-y-2"><Label>Email</Label><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" /></div>
        <div className="space-y-2"><Label>Password</Label><Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" /></div>
        <Button className="w-full" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</Button>
      </form>
    </Center>
  );
}

function ChangePassword({ userId, onDone }: { userId: string; onDone: () => void }) {
  const [current, setCurrent] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pw.length < 10) { toast.error("Use at least 10 characters"); return; }
    if (pw !== pw2) { toast.error("Passwords don't match"); return; }
    if (pw === current) { toast.error("Choose a new password"); return; }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw, current_password: current } as { password: string });
    if (error) { setBusy(false); toast.error(error.message); return; }
    await supabase.from("user_roles").update({ must_change_password: false }).eq("user_id", userId);
    toast.success("Password updated");
    onDone();
  }
  return (
    <Center>
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-2xl border border-border bg-card p-8">
        <h1 className="text-2xl font-bold">You must change your password</h1>
        <p className="text-sm text-muted-foreground">For security, set a new password before continuing.</p>
        <div className="space-y-2"><Label>Current password</Label><Input type="password" required value={current} onChange={(e) => setCurrent(e.target.value)} /></div>
        <div className="space-y-2"><Label>New password</Label><Input type="password" required value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="new-password" /></div>
        <div className="space-y-2"><Label>Confirm new password</Label><Input type="password" required value={pw2} onChange={(e) => setPw2(e.target.value)} autoComplete="new-password" /></div>
        <Button className="w-full" disabled={busy}>Update password</Button>
      </form>
    </Center>
  );
}

function Dashboard({ email }: { email: string }) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <span className="font-display font-bold">Clipset Admin</span>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="hidden sm:inline">{email}</span>
            <Button size="sm" variant="ghost" onClick={() => supabase.auth.signOut()}><LogOut className="h-4 w-4" /></Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Tabs defaultValue="hero">
          <TabsList className="mb-6 flex h-auto flex-wrap">
            {["hero", "portfolio", "services", "clients", "gallery", "settings"].map((t) => (
              <TabsTrigger key={t} value={t} className="capitalize">{t}</TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value="hero"><HeroEditor /></TabsContent>
          <TabsContent value="portfolio">
            <CollectionEditor table="portfolio_items" empty="No portfolio items yet." fields={[
              { key: "title", label: "Title" }, { key: "subtitle", label: "Subtitle" },
              { key: "thumbnail_url", label: "Thumbnail", type: "image" }, { key: "video_url", label: "Video embed URL (YouTube/Vimeo)", type: "url" },
            ]} />
          </TabsContent>
          <TabsContent value="services">
            <CollectionEditor table="services" empty="No services yet." fields={[
              { key: "title", label: "Title" }, { key: "description", label: "Description", type: "textarea" }, { key: "tags", label: "Tags (comma-separated)", type: "tags" },
            ]} />
          </TabsContent>
          <TabsContent value="clients">
            <CollectionEditor table="clients" empty="No clients yet." fields={[
              { key: "name", label: "Name" }, { key: "logo_url", label: "Logo (optional)", type: "image" },
            ]} />
          </TabsContent>
          <TabsContent value="gallery">
            <CollectionEditor table="gallery_items" empty="No gallery photos yet." fields={[
              { key: "photo_url", label: "Photo", type: "image" },
            ]} />
          </TabsContent>
          <TabsContent value="settings"><SettingsEditor /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

/* ---------- uploads ---------- */
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
// Reusable: every admin image field uploads through POST /api/upload (Cloudinary).
async function uploadImage(file: File): Promise<string | null> {
  if (!ALLOWED.includes(file.type)) { toast.error("Only JPG, PNG or WEBP images are allowed"); return null; }
  if (file.size > 5 * 1024 * 1024) { toast.error("Image is too large (max 5MB)"); return null; }
  const { data: { session } } = await supabase.auth.getSession();
  const body = new FormData();
  body.append("file", file);
  try {
    const res = await fetch("/api/upload", { method: "POST", body, headers: { Authorization: `Bearer ${session?.access_token ?? ""}` } });
    const json = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
    if (!res.ok || !json.url) { toast.error(json.error ?? "Upload failed"); return null; }
    toast.success("Image uploaded — click Save to keep it");
    return json.url;
  } catch {
    toast.error("Upload failed. Check your connection.");
    return null;
  }
}

function ImageField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [busy, setBusy] = useState(false);
  return (
    <div className="flex items-center gap-3">
      <div className="h-16 w-24 shrink-0 overflow-hidden rounded-md bg-muted">{value && <img src={value} alt="" className="h-full w-full object-cover" />}</div>
      <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 text-sm hover:bg-muted">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Upload
        <input type="file" accept={ALLOWED.join(",")} className="hidden" onChange={async (e) => {
          const f = e.target.files?.[0]; if (!f) return;
          setBusy(true); const url = await uploadImage(f); setBusy(false);
          if (url) onChange(url);
          e.target.value = "";
        }} />
      </label>
      {value && <Button size="sm" variant="ghost" onClick={() => onChange("")}>Remove</Button>}
    </div>
  );
}

/* ---------- collections ---------- */
type Field = { key: string; label: string; type?: "text" | "textarea" | "url" | "image" | "tags" };
type Table = "portfolio_items" | "services" | "clients" | "gallery_items";
type Row = Record<string, unknown> & { id: string; sort_order: number };

function cleanRow(fields: Field[], row: Row) {
  const out: Record<string, unknown> = {};
  for (const f of fields) {
    const v = row[f.key];
    if (f.type === "tags") out[f.key] = (Array.isArray(v) ? v : []).map((t) => cleanText(String(t), 40)).filter(Boolean);
    else if (f.type === "url") out[f.key] = cleanUrl(String(v ?? ""));
    else if (f.type === "image") out[f.key] = /^(https:\/\/|\/images\/)/.test(String(v ?? "")) ? String(v) : "";
    else out[f.key] = cleanText(String(v ?? ""), f.type === "textarea" ? 2000 : 200);
  }
  return out;
}

function CollectionEditor({ table, fields, empty }: { table: Table; fields: Field[]; empty: string }) {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [drag, setDrag] = useState<number | null>(null);

  const load = useCallback(async () => {
    const { data, error } = await supabase.from(table).select("*").order("sort_order");
    if (error) toast.error("Failed to load");
    setRows((data ?? []) as unknown as Row[]);
  }, [table]);
  useEffect(() => { load(); }, [load]);

  async function add() {
    const next = rows?.length ? Math.max(...rows.map((r) => r.sort_order)) + 1 : 0;
    const { error } = await supabase.from(table).insert({ sort_order: next } as never);
    if (error) { toast.error("Failed to add"); return; }
    load();
  }
  async function save(row: Row) {
    const { error } = await supabase.from(table).update(cleanRow(fields, row) as never).eq("id", row.id);
    if (error) { toast.error("Failed to save"); return; }
    toast.success("Saved");
    load();
  }
  async function remove(id: string) {
    if (!confirm("Delete this item?")) return;
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) { toast.error("Failed to delete"); return; }
    load();
  }
  async function reorder(from: number, to: number) {
    if (!rows || from === to) return;
    const next = [...rows];
    const [m] = next.splice(from, 1);
    next.splice(to, 0, m!);
    setRows(next.map((r, i) => ({ ...r, sort_order: i })));
    const results = await Promise.all(next.map((r, i) => supabase.from(table).update({ sort_order: i } as never).eq("id", r.id)));
    if (results.some((r) => r.error)) toast.error("Failed to save order");
  }

  if (!rows) return <Loader2 className="animate-spin" />;
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Drag the handle to reorder.</p>
        <Button onClick={add}><Plus className="mr-1 h-4 w-4" />Add</Button>
      </div>
      {rows.length === 0 && <div className="rounded-xl border border-dashed border-border p-10 text-center text-muted-foreground">{empty}</div>}
      {rows.map((row, i) => (
        <div key={row.id}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => { if (drag !== null) reorder(drag, i); setDrag(null); }}
          className={`flex gap-3 rounded-xl border border-border bg-card p-4 ${drag === i ? "opacity-50" : ""}`}>
          <div draggable onDragStart={() => setDrag(i)} onDragEnd={() => setDrag(null)} className="cursor-grab pt-1 text-muted-foreground"><GripVertical className="h-5 w-5" /></div>
          <RowForm fields={fields} row={row} onSave={save} onDelete={() => remove(row.id)} />
        </div>
      ))}
    </div>
  );
}

function RowForm({ fields, row, onSave, onDelete }: { fields: Field[]; row: Row; onSave: (r: Row) => void; onDelete: () => void }) {
  const [draft, setDraft] = useState<Row>(row);
  useEffect(() => setDraft(row), [row]);
  const set = (k: string, v: unknown) => setDraft((d) => ({ ...d, [k]: v }));
  return (
    <div className="grid flex-1 gap-3 md:grid-cols-2">
      {fields.map((f) => (
        <div key={f.key} className={`space-y-1 ${f.type === "textarea" || f.type === "image" ? "md:col-span-2" : ""}`}>
          <Label className="text-xs">{f.label}</Label>
          {f.type === "textarea" ? <Textarea value={String(draft[f.key] ?? "")} onChange={(e) => set(f.key, e.target.value)} />
            : f.type === "image" ? <ImageField value={String(draft[f.key] ?? "")} onChange={(v) => set(f.key, v)} />
            : f.type === "tags" ? <Input value={(Array.isArray(draft[f.key]) ? (draft[f.key] as string[]) : []).join(", ")} onChange={(e) => set(f.key, e.target.value.split(",").map((t) => t.trimStart()))} />
            : <Input value={String(draft[f.key] ?? "")} onChange={(e) => set(f.key, e.target.value)} />}
        </div>
      ))}
      <div className="flex gap-2 md:col-span-2">
        <Button size="sm" onClick={() => onSave(draft)}>Save</Button>
        <Button size="sm" variant="ghost" onClick={onDelete}><Trash2 className="mr-1 h-4 w-4" />Delete</Button>
      </div>
    </div>
  );
}

/* ---------- list-of-pairs editor ---------- */
function PairList({ label, items, keys, onChange, max }: {
  label: string; items: Record<string, string>[]; keys: [string, string][]; onChange: (v: Record<string, string>[]) => void; max?: number;
}) {
  return (
    <div className="space-y-2 md:col-span-2">
      <Label>{label}</Label>
      {items.map((it, i) => (
        <div key={i} className="flex gap-2">
          {keys.map(([k, ph]) => (
            <Input key={k} placeholder={ph} value={it[k] ?? ""} onChange={(e) => onChange(items.map((x, j) => (j === i ? { ...x, [k]: e.target.value } : x)))} />
          ))}
          <Button size="icon" variant="ghost" onClick={() => onChange(items.filter((_, j) => j !== i))}><Trash2 className="h-4 w-4" /></Button>
        </div>
      ))}
      {(!max || items.length < max) && (
        <Button size="sm" variant="outline" onClick={() => onChange([...items, Object.fromEntries(keys.map(([k]) => [k, ""]))])}><Plus className="mr-1 h-4 w-4" />Add</Button>
      )}
    </div>
  );
}

function TextField({ label, value, onChange, area }: { label: string; value: string; onChange: (v: string) => void; area?: boolean }) {
  return (
    <div className={`space-y-1 ${area ? "md:col-span-2" : ""}`}>
      <Label>{label}</Label>
      {area ? <Textarea value={value} onChange={(e) => onChange(e.target.value)} /> : <Input value={value} onChange={(e) => onChange(e.target.value)} />}
    </div>
  );
}

type Hero = { headline: string; subtext: string; cta1_label: string; cta1_link: string; cta2_label: string; cta2_link: string; stats: Record<string, string>[] };

function HeroEditor() {
  const [h, setH] = useState<Hero | null>(null);
  useEffect(() => {
    supabase.from("hero").select("*").eq("id", 1).single().then(({ data }) => data && setH({ ...data, stats: (data.stats ?? []) as Record<string, string>[] }));
  }, []);
  if (!h) return <Loader2 className="animate-spin" />;
  const set = (k: keyof Hero) => (v: string) => setH({ ...h, [k]: v });
  async function save() {
    if (!h) return;
    const { error } = await supabase.from("hero").update({
      headline: cleanText(h.headline, 200), subtext: cleanText(h.subtext, 600),
      cta1_label: cleanText(h.cta1_label, 40), cta1_link: cleanUrl(h.cta1_link),
      cta2_label: cleanText(h.cta2_label, 40), cta2_link: cleanUrl(h.cta2_link),
      stats: h.stats.slice(0, 3).map((s) => ({ value: cleanText(s["value"] ?? "", 20), label: cleanText(s["label"] ?? "", 40) })),
      updated_at: new Date().toISOString(),
    }).eq("id", 1);
    error ? toast.error("Failed to save") : toast.success("Hero saved");
  }
  return (
    <div className="grid gap-4 rounded-xl border border-border bg-card p-6 md:grid-cols-2">
      <TextField label="Headline" value={h.headline} onChange={set("headline")} area />
      <TextField label="Subtext" value={h.subtext} onChange={set("subtext")} area />
      <TextField label="Button 1 label" value={h.cta1_label} onChange={set("cta1_label")} />
      <TextField label="Button 1 link" value={h.cta1_link} onChange={set("cta1_link")} />
      <TextField label="Button 2 label" value={h.cta2_label} onChange={set("cta2_label")} />
      <TextField label="Button 2 link" value={h.cta2_link} onChange={set("cta2_link")} />
      <PairList label="Stat counters (max 3)" max={3} items={h.stats} keys={[["value", "e.g. 120+"], ["label", "e.g. Projects"]]} onChange={(stats) => setH({ ...h, stats })} />
      <div className="md:col-span-2"><Button onClick={save}>Save hero</Button></div>
    </div>
  );
}

type Settings = {
  logo_text: string; nav_items: Record<string, string>[]; social_links: Record<string, string>[];
  cta_heading: string; cta_subtext: string; whatsapp: string; email: string; footer_text: string; copyright_text: string;
  popup_heading: string; popup_subtext: string; popup_link: string; popup_interval_sec: number; popup_duration_sec: number;
};

function SettingsEditor() {
  const [s, setS] = useState<Settings | null>(null);
  useEffect(() => {
    supabase.from("site_settings").select("*").eq("id", 1).single().then(({ data }) => data && setS({
      ...data, nav_items: (data.nav_items ?? []) as Record<string, string>[], social_links: (data.social_links ?? []) as Record<string, string>[],
    }));
  }, []);
  if (!s) return <Loader2 className="animate-spin" />;
  const set = (k: keyof Settings) => (v: string) => setS({ ...s, [k]: v });
  async function save() {
    if (!s) return;
    const email = cleanText(s.email, 200);
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { toast.error("Invalid email"); return; }
    const { error } = await supabase.from("site_settings").update({
      logo_text: cleanText(s.logo_text, 60),
      nav_items: s.nav_items.map((n) => ({ label: cleanText(n["label"] ?? "", 30), href: cleanUrl(n["href"] ?? "") })).filter((n) => n.label),
      social_links: s.social_links.map((n) => ({ platform: cleanText(n["platform"] ?? "", 30), url: cleanUrl(n["url"] ?? "") })).filter((n) => n.url),
      cta_heading: cleanText(s.cta_heading, 200), cta_subtext: cleanText(s.cta_subtext, 600),
      whatsapp: cleanText(s.whatsapp, 30).replace(/[^\d+\s]/g, ""), email,
      footer_text: cleanText(s.footer_text, 400), copyright_text: cleanText(s.copyright_text, 200),
      popup_heading: cleanText(s.popup_heading, 80), popup_subtext: cleanText(s.popup_subtext, 200), popup_link: cleanUrl(s.popup_link),
      popup_interval_sec: Math.min(3600, Math.max(5, Number(s.popup_interval_sec) || 30)),
      popup_duration_sec: Math.min(120, Math.max(1, Number(s.popup_duration_sec) || 5)),
      updated_at: new Date().toISOString(),
    }).eq("id", 1);
    error ? toast.error("Failed to save") : toast.success("Settings saved");
  }
  return (
    <div className="grid gap-4 rounded-xl border border-border bg-card p-6 md:grid-cols-2">
      <TextField label="Logo text" value={s.logo_text} onChange={set("logo_text")} />
      <div />
      <PairList label="Navigation (link e.g. #portfolio, #services, #clients, #gallery, #contact)" items={s.nav_items} keys={[["label", "Label"], ["href", "#section"]]} onChange={(nav_items) => setS({ ...s, nav_items })} />
      <PairList label="Social links" items={s.social_links} keys={[["platform", "Instagram, YouTube…"], ["url", "https://…"]]} onChange={(social_links) => setS({ ...s, social_links })} />
      <TextField label="CTA heading" value={s.cta_heading} onChange={set("cta_heading")} />
      <TextField label="CTA subtext" value={s.cta_subtext} onChange={set("cta_subtext")} />
      <TextField label="WhatsApp number" value={s.whatsapp} onChange={set("whatsapp")} />
      <TextField label="Email" value={s.email} onChange={set("email")} />
      <TextField label="Footer text" value={s.footer_text} onChange={set("footer_text")} />
      <TextField label="Copyright text" value={s.copyright_text} onChange={set("copyright_text")} />
      <TextField label="Popup heading" value={s.popup_heading} onChange={set("popup_heading")} />
      <TextField label="Popup subtext" value={s.popup_subtext} onChange={set("popup_subtext")} />
      <TextField label="Popup button link" value={s.popup_link} onChange={set("popup_link")} />
      <div className="grid grid-cols-2 gap-3">
        <TextField label="Popup every (sec)" value={String(s.popup_interval_sec)} onChange={(v) => setS({ ...s, popup_interval_sec: Number(v) })} />
        <TextField label="Visible for (sec)" value={String(s.popup_duration_sec)} onChange={(v) => setS({ ...s, popup_duration_sec: Number(v) })} />
      </div>
      <div className="md:col-span-2"><Button onClick={save}>Save settings</Button></div>
    </div>
  );
}
