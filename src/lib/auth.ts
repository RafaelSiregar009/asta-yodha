export const SESSION_COOKIE = "asta_admin_session";
const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours

function getSecret(): string {
  return process.env.ADMIN_SECRET || "dev-only-insecure-secret-change-me";
}

async function hmac(value: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sigBuffer = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return Array.from(new Uint8Array(sigBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function createSessionToken(): Promise<string> {
  const expires = Date.now() + SESSION_TTL_MS;
  const payload = `${expires}`;
  const sig = await hmac(payload);
  return `${payload}.${sig}`;
}

export async function verifySessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  const expected = await hmac(payload);
  if (expected !== sig) return false;
  const expires = Number(payload);
  if (!Number.isFinite(expires) || Date.now() > expires) return false;
  return true;
}

export function checkCredentials(email: string, password: string): boolean {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@astayodha.id";
  const adminPassword = process.env.ADMIN_PASSWORD || "ubah-password-ini";
  return email.trim().toLowerCase() === adminEmail.toLowerCase() && password === adminPassword;
}

/**
 * Dipakai di dalam API route handler (bukan middleware) untuk memverifikasi
 * bahwa permintaan datang dari admin yang sudah login, berdasarkan cookie
 * sesi yang sama dengan yang dipakai untuk melindungi /admin/dashboard.
 */
export async function requireAdmin(req: Request): Promise<boolean> {
  const cookieHeader = req.headers.get("cookie") || "";
  const match = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${SESSION_COOKIE}=`));
  const token = match?.slice(SESSION_COOKIE.length + 1);
  return verifySessionToken(token);
}
