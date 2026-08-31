import { NextResponse } from "next/server";
import { db, ensureSchema } from "@/lib/db";
import { uploadFile } from "@/lib/blob";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await ensureSchema();
    const sql = db();
    const rows = await sql`
      SELECT id, judul, ringkasan, isi, foto_url, created_at, updated_at
      FROM berita
      ORDER BY created_at DESC
    `;
    return NextResponse.json({ data: rows });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Gagal memuat berita." },
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
    const ringkasan = String(form.get("ringkasan") || "").trim();
    const isi = String(form.get("isi") || "").trim();
    const foto = form.get("foto");

    if (!judul || !isi) {
      return NextResponse.json({ error: "Judul dan isi berita wajib diisi." }, { status: 400 });
    }

    let fotoUrl: string | null = null;
    if (foto instanceof File && foto.size > 0) {
      fotoUrl = (await uploadFile(foto, "berita")).url;
    }

    const sql = db();
    const rows = await sql`
      INSERT INTO berita (judul, ringkasan, isi, foto_url)
      VALUES (${judul}, ${ringkasan}, ${isi}, ${fotoUrl})
      RETURNING id, judul, ringkasan, isi, foto_url, created_at, updated_at
    `;
    return NextResponse.json({ data: rows[0] }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Gagal menyimpan berita." },
      { status: 500 }
    );
  }
}
