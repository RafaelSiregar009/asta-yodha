import { NextResponse } from "next/server";
import { db, ensureSchema } from "@/lib/db";
import { uploadFile, deleteFile } from "@/lib/blob";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

function parseTingkat(value: FormDataEntryValue | null): number {
  const n = Number(value || 1) || 1;
  return Math.min(5, Math.max(1, Math.round(n)));
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: "Tidak diizinkan." }, { status: 401 });
  }

  try {
    await ensureSchema();
    const id = Number(params.id);
    if (!Number.isInteger(id)) {
      return NextResponse.json({ error: "ID tidak valid." }, { status: 400 });
    }

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

    const sql = db();
    let fotoUrl: string | undefined;
    let fotoLama: string | null = null;

    if (foto instanceof File && foto.size > 0) {
      const existing = await sql`SELECT foto_url FROM anggota WHERE id = ${id}`;
      if (existing.length === 0) {
        return NextResponse.json({ error: "Data tidak ditemukan." }, { status: 404 });
      }
      fotoLama = (existing[0].foto_url as string | null) ?? null;
      fotoUrl = (await uploadFile(foto, "anggota")).url;
    }

    const rows = fotoUrl
      ? await sql`
          UPDATE anggota
          SET nama = ${nama}, jabatan = ${jabatan}, keterangan = ${keterangan},
              urutan = ${urutan}, tingkat = ${tingkat}, foto_url = ${fotoUrl}
          WHERE id = ${id}
          RETURNING id, nama, jabatan, foto_url, keterangan, urutan, tingkat, created_at
        `
      : await sql`
          UPDATE anggota
          SET nama = ${nama}, jabatan = ${jabatan}, keterangan = ${keterangan},
              urutan = ${urutan}, tingkat = ${tingkat}
          WHERE id = ${id}
          RETURNING id, nama, jabatan, foto_url, keterangan, urutan, tingkat, created_at
        `;

    if (rows.length === 0) {
      return NextResponse.json({ error: "Data tidak ditemukan." }, { status: 404 });
    }
    // Hapus foto lama hanya setelah database berhasil diperbarui.
    if (fotoUrl && fotoLama) await deleteFile(fotoLama);

    return NextResponse.json({ data: rows[0] });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Gagal memperbarui anggota." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: "Tidak diizinkan." }, { status: 401 });
  }

  try {
    await ensureSchema();
    const id = Number(params.id);
    if (!Number.isInteger(id)) {
      return NextResponse.json({ error: "ID tidak valid." }, { status: 400 });
    }

    const sql = db();
    const rows = await sql`DELETE FROM anggota WHERE id = ${id} RETURNING foto_url`;
    if (rows.length === 0) {
      return NextResponse.json({ error: "Data tidak ditemukan." }, { status: 404 });
    }
    if (rows[0].foto_url) await deleteFile(rows[0].foto_url as string);

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Gagal menghapus anggota." },
      { status: 500 }
    );
  }
}
