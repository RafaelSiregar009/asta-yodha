import Link from "next/link";
import { notFound } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import type { Metadata } from "next";
import { db, ensureSchema } from "@/lib/db";
import type { Berita } from "@/lib/data";

export const dynamic = "force-dynamic";

async function getBerita(id: number): Promise<Berita | null> {
  noStore();
  await ensureSchema();
  const sql = db();
  const rows = await sql`SELECT id, judul, ringkasan, isi, foto_url, created_at, updated_at FROM berita WHERE id = ${id}`;
  return (rows[0] as Berita | undefined) ?? null;
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const item = await getBerita(Number(params.id));
  return { title: item ? `${item.judul} — Asta Yodha` : "Berita tidak ditemukan — Asta Yodha" };
}

export default async function DetailBeritaPage({ params }: { params: { id: string } }) {
  const item = await getBerita(Number(params.id));
  if (!item) notFound();
  return <article className="py-16 md:py-24"><div className="container-page max-w-4xl"><Link href="/berita" className="text-sm font-semibold text-redd hover:text-redd-dark">← Semua berita</Link><p className="mt-8 eyebrow text-redd">{new Date(item.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p><h1 className="mt-4 font-display text-4xl leading-[0.95] md:text-6xl">{item.judul}</h1>{item.ringkasan && <p className="mt-6 text-lg leading-relaxed text-ink/70">{item.ringkasan}</p>}{item.foto_url && <img src={item.foto_url} alt={item.judul} className="mt-10 aspect-[16/9] w-full object-cover" />}<div className="mt-10 whitespace-pre-wrap text-base leading-8 text-ink/80">{item.isi}</div></div></article>;
}
