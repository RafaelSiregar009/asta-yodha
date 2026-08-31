import { NextResponse } from "next/server";
import { db, ensureSchema } from "@/lib/db";
import { deleteFile, uploadFile } from "@/lib/blob";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

function validId(value: string) {
  const id = Number(value);
  return Number.isInteger(id) ? id : null;
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  if (!(await requireAdmin(req))) return NextResponse.json({ error: "Tidak diizinkan." }, { status: 401 });

  try {
    await ensureSchema();
    const id = validId(params.id);
    if (id === null) return NextResponse.json({ error: "ID tidak valid." }, { status: 400 });

    const form = await req.formData();
    const judul = String(form.get("judul") || "").trim();
    const ringkasan = String(form.get("ringkasan") || "").trim();
    const isi = String(form.get("isi") || "").trim();
    const foto = form.get("foto");
    if (!judul || !isi) return NextResponse.json({ error: "Judul dan isi berita wajib diisi." }, { status: 400 });

    const sql = db();
    let fotoUrl: string | undefined;
    let fotoLama: string | null = null;
    if (foto instanceof File && foto.size > 0) {
      const existing = await sql`SELECT foto_url FROM berita WHERE id = ${id}`;
      fotoLama = (existing[0]?.foto_url as string | null) ?? null;
      fotoUrl = (await uploadFile(foto, "berita")).url;
    }

    const rows = fotoUrl
      ? await sql`
          UPDATE berita SET judul = ${judul}, ringkasan = ${ringkasan}, isi = ${isi}, foto_url = ${fotoUrl}, updated_at = now()
          WHERE id = ${id}
          RETURNING id, judul, ringkasan, isi, foto_url, created_at, updated_at
        `
      : await sql`
          UPDATE berita SET judul = ${judul}, ringkasan = ${ringkasan}, isi = ${isi}, updated_at = now()
          WHERE id = ${id}
          RETURNING id, judul, ringkasan, isi, foto_url, created_at, updated_at
        `;
    if (!rows.length) return NextResponse.json({ error: "Berita tidak ditemukan." }, { status: 404 });
    if (fotoUrl && fotoLama) await deleteFile(fotoLama);
    return NextResponse.json({ data: rows[0] });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Gagal memperbarui berita." }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  if (!(await requireAdmin(req))) return NextResponse.json({ error: "Tidak diizinkan." }, { status: 401 });

  try {
    await ensureSchema();
    const id = validId(params.id);
    if (id === null) return NextResponse.json({ error: "ID tidak valid." }, { status: 400 });
    const sql = db();
    const rows = await sql`DELETE FROM berita WHERE id = ${id} RETURNING foto_url`;
    if (!rows.length) return NextResponse.json({ error: "Berita tidak ditemukan." }, { status: 404 });
    await deleteFile(rows[0].foto_url as string | null);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Gagal menghapus berita." }, { status: 500 });
  }
}
