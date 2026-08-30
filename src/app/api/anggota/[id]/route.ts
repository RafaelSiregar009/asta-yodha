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
    const nama = String(form.get("nama") || "").trim();
    const jabatan = String(form.get("jabatan") || "").trim();
    const keterangan = String(form.get("keterangan") || "").trim();
    const urutan = Number(form.get("urutan") || 0) || 0;
    const foto = form.get("foto");

    if (!nama || !jabatan) {
      return NextResponse.json({ error: "Nama dan jabatan wajib diisi." }, { status: 400 });
    }

    const sql = db();
    let fotoUrl: string | undefined;

    if (foto instanceof File && foto.size > 0) {
      const existing = await sql`SELECT foto_url FROM anggota WHERE id = ${id}`;
      const uploaded = await uploadFile(foto, "anggota");
      fotoUrl = uploaded.url;
      if (existing[0]?.foto_url) await deleteFile(existing[0].foto_url as string);
    }

    const rows = fotoUrl
      ? await sql`
          UPDATE anggota
          SET nama = ${nama}, jabatan = ${jabatan}, keterangan = ${keterangan},
              urutan = ${urutan}, foto_url = ${fotoUrl}
          WHERE id = ${id}
          RETURNING id, nama, jabatan, foto_url, keterangan, urutan, created_at
        `
      : await sql`
          UPDATE anggota
          SET nama = ${nama}, jabatan = ${jabatan}, keterangan = ${keterangan}, urutan = ${urutan}
          WHERE id = ${id}
          RETURNING id, nama, jabatan, foto_url, keterangan, urutan, created_at
        `;

    if (rows.length === 0) {
      return NextResponse.json({ error: "Data tidak ditemukan." }, { status: 404 });
    }

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
