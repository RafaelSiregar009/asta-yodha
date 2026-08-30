import { NextResponse } from "next/server";
import { db, ensureSchema } from "@/lib/db";
import { uploadFile, deleteFile } from "@/lib/blob";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

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
    const judul = String(form.get("judul") || "").trim();
    const kategori = String(form.get("kategori") || "").trim();
    const deskripsi = String(form.get("deskripsi") || "").trim();
    const file = form.get("file");

    if (!judul || !kategori) {
      return NextResponse.json({ error: "Judul dan kategori wajib diisi." }, { status: 400 });
    }

    const sql = db();
    let fileUrl: string | undefined;
    let fileName: string | undefined;
    let ukuranKb: number | undefined;

    if (file instanceof File && file.size > 0) {
      const existing = await sql`SELECT file_url FROM arsip_surat WHERE id = ${id}`;
      const uploaded = await uploadFile(file, "arsip-surat");
      fileUrl = uploaded.url;
      fileName = uploaded.name;
      ukuranKb = uploaded.sizeKb;
      if (existing[0]?.file_url) await deleteFile(existing[0].file_url as string);
    }

    const rows = fileUrl
      ? await sql`
          UPDATE arsip_surat
          SET judul = ${judul}, kategori = ${kategori}, deskripsi = ${deskripsi},
              file_url = ${fileUrl}, file_name = ${fileName}, ukuran_kb = ${ukuranKb}
          WHERE id = ${id}
          RETURNING id, nomor, judul, kategori, deskripsi, file_url, file_name, ukuran_kb, diunduh, created_at
        `
      : await sql`
          UPDATE arsip_surat
          SET judul = ${judul}, kategori = ${kategori}, deskripsi = ${deskripsi}
          WHERE id = ${id}
          RETURNING id, nomor, judul, kategori, deskripsi, file_url, file_name, ukuran_kb, diunduh, created_at
        `;

    if (rows.length === 0) {
      return NextResponse.json({ error: "Data tidak ditemukan." }, { status: 404 });
    }

    return NextResponse.json({ data: rows[0] });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Gagal memperbarui arsip surat." },
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
    const rows = await sql`DELETE FROM arsip_surat WHERE id = ${id} RETURNING file_url`;
    if (rows.length === 0) {
      return NextResponse.json({ error: "Data tidak ditemukan." }, { status: 404 });
    }
    if (rows[0].file_url) await deleteFile(rows[0].file_url as string);

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Gagal menghapus arsip surat." },
      { status: 500 }
    );
  }
}
