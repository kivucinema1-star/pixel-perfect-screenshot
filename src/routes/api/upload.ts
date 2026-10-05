import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
const MAX = 5 * 1024 * 1024;
const fail = (error: string, status: number) => Response.json({ error }, { status });

// POST /api/upload — admin-only. Accepts multipart "file", forwards to Cloudinary, returns { url }.
export const Route = createFileRoute("/api/upload")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const token = request.headers.get("authorization")?.replace(/^Bearer /, "");
        if (!token) return fail("Please sign in again.", 401);

        const url = process.env["SUPABASE_URL"] || import.meta.env["VITE_SUPABASE_URL"];
        const key = process.env["SUPABASE_PUBLISHABLE_KEY"] || import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"];
        const sb = createClient<Database>(url, key, {
          auth: { persistSession: false, autoRefreshToken: false },
          global: {
            headers: { Authorization: `Bearer ${token}` },
            fetch: (input, init) => {
              const h = new Headers(init?.headers);
              h.set("apikey", key);
              return fetch(input, { ...init, headers: h });
            },
          },
        });
        const { data: claims } = await sb.auth.getClaims(token);
        const userId = claims?.claims?.sub;
        if (!userId) return fail("Please sign in again.", 401);
        const { data: isAdmin } = await sb.rpc("has_role", { _user_id: userId, _role: "admin" });
        if (!isAdmin) return fail("Not allowed.", 403);

        let file: FormDataEntryValue | null = null;
        try {
          file = (await request.formData()).get("file");
        } catch {
          return fail("No file received.", 400);
        }
        if (!(file instanceof File)) return fail("No file received.", 400);
        if (!ALLOWED.includes(file.type)) return fail("Only JPG, PNG or WEBP images are allowed.", 400);
        if (file.size > MAX) return fail("Image is too large (max 5MB).", 400);

        const cloud = process.env["CLOUDINARY_CLOUD_NAME"];
        const preset = process.env["CLOUDINARY_UPLOAD_PRESET"];
        if (!cloud || !preset) return fail("Upload is not configured.", 500);

        const body = new FormData();
        body.append("file", file);
        body.append("upload_preset", preset);
        body.append("folder", "clipset");
        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, { method: "POST", body });
        if (!res.ok) {
          console.error("Cloudinary upload failed", res.status, await res.text());
          return fail("Upload failed. Please try again.", 502);
        }
        const json = (await res.json()) as { secure_url?: string };
        if (!json.secure_url) return fail("Upload failed. Please try again.", 502);
        return Response.json({ url: json.secure_url });
      },
    },
  },
});
