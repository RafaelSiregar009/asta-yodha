import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

const PROTECTED_API_PREFIXES = ["/api/arsip", "/api/anggota"];
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isApi = PROTECTED_API_PREFIXES.some((p) => pathname.startsWith(p));

  // Data publik (GET) tetap terbuka untuk halaman Arsip Surat & Pengurus.
  if (isApi && SAFE_METHODS.has(req.method)) {
    return NextResponse.next();
  }
  // Endpoint unduh (POST) untuk warga tetap terbuka.
  if (isApi && pathname.endsWith("/download")) {
    return NextResponse.next();
  }

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const valid = await verifySessionToken(token);

  if (!valid) {
    if (isApi) {
      return NextResponse.json({ error: "Tidak diizinkan." }, { status: 401 });
    }
    const url = req.nextUrl.clone();
    url.pathname = "/admin";
    url.searchParams.set("redirected", "1");
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/dashboard/:path*", "/api/arsip/:path*", "/api/anggota/:path*"],
};
