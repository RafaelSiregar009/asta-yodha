import { NextResponse } from "next/server";
import { db, ensureSchema } from "@/lib/db";
import { uploadFile } from "@/lib/blob";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

function parseTingkat(value: FormDataEntryValue | null): number {
  const n = Number(value || 1) || 1;
  return Math.min(5, Math.max(1, Math.round(n)));
}

export async function GET() {
  try {
    await ensureSchema();
    const sql = db();
    const rows = await sql`
      SELECT id, nama, jabatan, foto_url, keterangan, urutan, tingkat, created_at
      FROM anggota
      ORDER BY tingkat ASC, urutan ASC, created_at ASC
    `;
    return NextResponse.json({ data: rows });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Gagal memuat data keanggotaan." },
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
    const nama = String(form.get("nama") || "").trim();
    const jabatan = String(form.get("jabatan") || "").trim();
    const keterangan = String(form.get("keterangan") || "").trim();
    const urutan = Number(form.get("urutan") || 0) || 0;
    const tingkat = parseTingkat(form.get("tingkat"));
    const foto = form.get("foto");

    if (!nama || !jabatan) {
      return NextResponse.json({ error: "Nama dan jabatan wajib diisi." }, { status: 400 });
    }

    let fotoUrl: string | null = null;
    if (foto instanceof File && foto.size > 0) {
      const uploaded = await uploadFile(foto, "anggota");
      fotoUrl = uploaded.url;
    }

    const sql = db();
    const rows = await sql`
      INSERT INTO anggota (nama, jabatan, foto_url, keterangan, urutan, tingkat)
      VALUES (${nama}, ${jabatan}, ${fotoUrl}, ${keterangan}, ${urutan}, ${tingkat})
      RETURNING id, nama, jabatan, foto_url, keterangan, urutan, tingkat, created_at
    `;
    return NextResponse.json({ data: rows[0] }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Gagal menyimpan anggota." },
      { status: 500 }
    );
  }
}
