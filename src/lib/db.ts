import { neon } from "@neondatabase/serverless";

function getConnectionString(): string {
  const url =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.astayodha_POSTGRES_URL ||
    process.env.astayodha_DATABASE_URL_UNPOOLED;
  if (!url) {
    throw new Error(
      "Database belum terhubung. Tambahkan Postgres (mis. Neon) lewat tab Storage di dashboard Vercel, lalu deploy ulang."
    );
  }
  return url;
}

export function db() {
  // cache: "no-store" memastikan hasil query selalu fresh (tidak di-cache Next.js)
  return neon(getConnectionString(), {
    fetchOptions: { cache: "no-store" },
  });
}

let schemaReady: Promise<void> | null = null;

/**
 * Membuat tabel jika belum ada. Dipanggil di awal setiap request ke API
 * sehingga tidak perlu langkah migrasi manual saat pertama kali deploy.
 */
export async function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = (async () => {
      const sql = db();
      await sql`
        CREATE TABLE IF NOT EXISTS arsip_surat (
          id SERIAL PRIMARY KEY,
          nomor TEXT NOT NULL,
          judul TEXT NOT NULL,
          kategori TEXT NOT NULL,
          deskripsi TEXT NOT NULL DEFAULT '',
          file_url TEXT,
          file_name TEXT,
          ukuran_kb INTEGER NOT NULL DEFAULT 0,
          diunduh INTEGER NOT NULL DEFAULT 0,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS anggota (
          id SERIAL PRIMARY KEY,
          nama TEXT NOT NULL,
          jabatan TEXT NOT NULL,
          foto_url TEXT,
          keterangan TEXT NOT NULL DEFAULT '',
          urutan INTEGER NOT NULL DEFAULT 0,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      `;
      // Kolom tingkat = posisi di bagan pohon (1 = paling atas)
      await sql`
        ALTER TABLE anggota
        ADD COLUMN IF NOT EXISTS tingkat INTEGER NOT NULL DEFAULT 1
      `;
    })();
  }
  return schemaReady;
}
