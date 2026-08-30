import { NextResponse } from "next/server";
import { checkCredentials, createSessionToken, SESSION_COOKIE } from "@/lib/auth";

export async function POST(req: Request) {
  const { email, password } = await req.json().catch(() => ({ email: "", password: "" }));

  if (typeof email !== "string" || typeof password !== "string") {
    return NextResponse.json({ error: "Data tidak valid." }, { status: 400 });
  }

  if (!checkCredentials(email, password)) {
    return NextResponse.json({ error: "Email atau password salah." }, { status: 401 });
  }

  const token = await createSessionToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 8 * 60 * 60,
  });
  return res;
}
