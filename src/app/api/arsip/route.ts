import { NextResponse } from "next/server";
import { db, ensureSchema } from "@/lib/db";
import { uploadFile } from "@/lib/blob";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function nextNomor(): Promise<string> {
  const sql = db();
  const rows = await sql`SELECT COUNT(*)::int AS count FROM arsip_surat`;
  const count = (rows[0]?.count as number) ?? 0;
  const year = new Date().getFullYear();
  return `${String(count + 1).padStart(3, "0")}/KT-AY/I/${year}`;
}

export async function GET() {
  try {
    await ensureSchema();
    const sql = db();
    const rows = await sql`
      SELECT id, nomor, judul, kategori, deskripsi, file_url, file_name,
             ukuran_kb, diunduh, created_at
      FROM arsip_surat
      ORDER BY created_at DESC
    `;
    return NextResponse.json({ data: rows });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Gagal memuat arsip surat." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: "Tidak diizinkan." }, { status: 401 });
  }

  try {
    await ensureSchema();
    const form = await req.formData();
    const judul = String(form.get("judul") || "").trim();
    const kategori = String(form.get("kategori") || "").trim();
    const deskripsi = String(form.get("deskripsi") || "").trim();
    const file = form.get("file");

    if (!judul || !kategori) {
      return NextResponse.json({ error: "Judul dan kategori wajib diisi." }, { status: 400 });
    }

    let fileUrl: string | null = null;
    let fileName: string | null = null;
    let ukuranKb = 0;

    if (file instanceof File && file.size > 0) {
      const uploaded = await uploadFile(file, "arsip-surat");
      fileUrl = uploaded.url;
      fileName = uploaded.name;
      ukuranKb = uploaded.sizeKb;
    }

    const nomor = await nextNomor();
    const sql = db();
    const rows = await sql`
      INSERT INTO arsip_surat (nomor, judul, kategori, deskripsi, file_url, file_name, ukuran_kb)
      VALUES (${nomor}, ${judul}, ${kategori}, ${deskripsi}, ${fileUrl}, ${fileName}, ${ukuranKb})
      RETURNING id, nomor, judul, kategori, deskripsi, file_url, file_name, ukuran_kb, diunduh, created_at
    `;
    return NextResponse.json({ data: rows[0] }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Gagal menyimpan arsip surat." },
      { status: 500 }
    );
  }
}
