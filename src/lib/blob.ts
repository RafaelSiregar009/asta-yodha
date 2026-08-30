import { put, del } from "@vercel/blob";

/**
 * Mengunggah file ke Vercel Blob. Membutuhkan env var
 * BLOB_READ_WRITE_TOKEN, yang otomatis tersedia setelah menghubungkan
 * Blob store lewat tab Storage di dashboard Vercel.
 */
export async function uploadFile(file: File, folder: string) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error(
      "Penyimpanan file belum terhubung. Tambahkan Blob store lewat tab Storage di dashboard Vercel, lalu deploy ulang."
    );
  }
  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "-");
  const blob = await put(`${folder}/${Date.now()}-${safeName}`, file, {
    access: "public",
    addRandomSuffix: true,
  });
  return { url: blob.url, name: file.name, sizeKb: Math.max(1, Math.round(file.size / 1024)) };
}

export async function deleteFile(url: string | null | undefined) {
  if (!url || !process.env.BLOB_READ_WRITE_TOKEN) return;
  try {
    await del(url);
  } catch {
    // Abaikan jika file sudah tidak ada / gagal dihapus — tidak boleh
    // menggagalkan operasi utama (mis. hapus data di database).
  }
}
