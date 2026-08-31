import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import type { Metadata } from "next";
import { db, ensureSchema } from "@/lib/db";
import type { Berita } from "@/lib/data";

export const metadata: Metadata = { title: "Berita Kegiatan — Karang Taruna Asta Yodha" };
export const dynamic = "force-dynamic";

async function getBerita(): Promise<Berita[]> {
  noStore();
  await ensureSchema();
  const sql = db();
  return (await sql`
    SELECT id, judul, ringkasan, isi, foto_url, created_at, updated_at
    FROM berita ORDER BY created_at DESC
  `) as unknown as Berita[];
}

export default async function BeritaPage() {
  let berita: Berita[] = [];
  let error: string | null = null;
  try { berita = await getBerita(); } catch (err) { error = err instanceof Error ? err.message : "Gagal memuat berita."; }

  return (
    <div className="py-16 md:py-24">
      <div className="container-page">
        <div className="mb-6 flex items-center gap-3 text-redd"><span className="h-px w-10 bg-redd" /><span className="eyebrow">Kabar Organisasi</span></div>
        <h1 className="font-display text-5xl leading-[0.9] md:text-7xl"><span className="block text-ink">BERITA &amp;</span><span className="block text-redd">KEGIATAN</span></h1>
        <p className="mt-6 max-w-xl text-ink/70">Informasi terbaru serta dokumentasi kegiatan Karang Taruna Asta Yodha.</p>
      </div>
      {error && <div className="container-page mt-14"><p className="border border-redd/30 bg-redd/5 px-4 py-3 text-sm text-redd">{error}</p></div>}
      {!error && berita.length === 0 && <div className="container-page mt-14"><p className="border border-ink/10 px-4 py-8 text-center text-sm text-ink/50">Belum ada berita yang dipublikasikan.</p></div>}
      {berita.length > 0 && <div className="container-page mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {berita.map((item) => <Link key={item.id} href={`/berita/${item.id}`} className="group border border-ink/10 bg-white transition-shadow hover:shadow-lg">
          <div className="aspect-[16/10] overflow-hidden bg-ink/5">
            {item.foto_url ? <img src={item.foto_url} alt={item.judul} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" /> : <div className="flex h-full items-center justify-center font-display text-3xl text-ink/20">ASTA YODHA</div>}
          </div>
          <div className="p-5"><p className="eyebrow text-redd">{new Date(item.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p><h2 className="mt-3 font-display text-2xl leading-tight">{item.judul}</h2><p className="mt-3 line-clamp-3 text-sm leading-relaxed text-ink/65">{item.ringkasan || item.isi}</p><p className="mt-5 text-sm font-semibold text-redd">Baca selengkapnya →</p></div>
        </Link>)}
      </div>}
    </div>
  );
}
