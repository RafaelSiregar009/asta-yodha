import { NextResponse } from "next/server";
import { db, ensureSchema } from "@/lib/db";

export const dynamic = "force-dynamic";

function mask(url: string | undefined): string {
  if (!url) return "(tidak ada)";
  const match = url.match(/@([^/]+)\/([^?]+)/);
  return match ? `...@${match[1]}/${match[2]}` : "(format tidak dikenali)";
}

export async function GET() {
  const sources = {
    DATABASE_URL: process.env.DATABASE_URL,
    POSTGRES_URL: process.env.POSTGRES_URL,
    POSTGRES_PRISMA_URL: process.env.POSTGRES_PRISMA_URL,
    astayodha_POSTGRES_URL: process.env.astayodha_POSTGRES_URL,
    astayodha_DATABASE_URL_UNPOOLED: process.env.astayodha_DATABASE_URL_UNPOOLED,
  };

  const active =
    sources.DATABASE_URL ||
    sources.POSTGRES_URL ||
    sources.POSTGRES_PRISMA_URL ||
    sources.astayodha_POSTGRES_URL ||
    sources.astayodha_DATABASE_URL_UNPOOLED;

  let count: number | string = "?";
  let names: string[] = [];
  try {
    await ensureSchema();
    const sql = db();
    const rows = await sql`SELECT nama FROM anggota ORDER BY id`;
    count = rows.length;
    names = rows.map((r) => r.nama as string);
  } catch (err) {
    count = `error: ${err instanceof Error ? err.message : String(err)}`;
  }

  return NextResponse.json({
    which_env_vars_exist: Object.fromEntries(
      Object.entries(sources).map(([k, v]) => [k, v ? "ADA" : "kosong"])
    ),
    active_connection_host_db: mask(active),
    jumlah_anggota: count,
    nama_anggota: names,
  });
}