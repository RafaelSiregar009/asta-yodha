import { NextResponse } from "next/server";
import { db, ensureSchema } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  try {
    await ensureSchema();
    const id = Number(params.id);
    if (!Number.isInteger(id)) {
      return NextResponse.json({ error: "ID tidak valid." }, { status: 400 });
    }

    const sql = db();
    const rows = await sql`
      UPDATE arsip_surat SET diunduh = diunduh + 1
      WHERE id = ${id}
      RETURNING file_url, diunduh
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: "Data tidak ditemukan." }, { status: 404 });
    }
    if (!rows[0].file_url) {
      return NextResponse.json({ error: "Belum ada file untuk surat ini." }, { status: 404 });
    }

    return NextResponse.json({ url: rows[0].file_url, diunduh: rows[0].diunduh });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Gagal memproses unduhan." },
      { status: 500 }
    );
  }
}
