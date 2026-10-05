// Strip HTML tags/control chars from admin text before saving (content is rendered on the public site).
export function cleanText(v: string, max = 2000): string {
  return v.replace(/<[^>]*>/g, "").replace(/[<>]/g, "").replace(/[\u0000-\u001f\u007f]/g, (c) => (c === "\n" ? c : "")).trim().slice(0, max);
}

// Only allow http(s), mailto, tel, and in-page anchors / relative paths.
export function cleanUrl(v: string): string {
  const s = v.trim();
  if (!s) return "";
  if (s.startsWith("#") || (s.startsWith("/") && !s.startsWith("//"))) return cleanText(s, 500);
  try {
    const u = new URL(s);
    if (["http:", "https:", "mailto:", "tel:"].includes(u.protocol)) return u.toString();
  } catch {
    /* invalid */
  }
  return "";
}

export function toEmbedUrl(url: string): string {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com")) {
      const id = u.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    if (u.hostname === "youtu.be") return `https://www.youtube.com/embed${u.pathname}`;
    if (u.hostname.includes("vimeo.com") && !u.hostname.startsWith("player")) return `https://player.vimeo.com/video${u.pathname}`;
    return u.toString();
  } catch {
    return "";
  }
}
