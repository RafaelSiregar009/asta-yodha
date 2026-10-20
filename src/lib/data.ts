export type KategoriSurat =
  | "Surat Pengantar"
  | "Surat Keterangan"
  | "Undangan"
  | "Proposal"
  | "Lainnya";

export const kategoriList: KategoriSurat[] = [
  "Surat Pengantar",
  "Surat Keterangan",
  "Undangan",
  "Proposal",
  "Lainnya",
];

export type Surat = {
  id: number;
  nomor: string;
  judul: string;
  kategori: KategoriSurat;
  deskripsi: string;
  file_url: string | null;
  file_name: string | null;
  ukuran_kb: number;
  diunduh: number;
  created_at: string;
};

export type Anggota = {
  id: number;
  nama: string;
  jabatan: string;
  foto_url: string | null;
  keterangan: string;
  urutan: number;
  tingkat: number;
  created_at: string;
};

export const tingkatOptions: { value: number; label: string }[] = [
  { value: 1, label: "Tingkat 1 — Pimpinan (Ketua)" },
  { value: 2, label: "Tingkat 2 — Wakil Ketua" },
  { value: 3, label: "Tingkat 3 — Sekretaris & Bendahara" },
  { value: 4, label: "Tingkat 4 — Seksi / Bidang" },
  { value: 5, label: "Tingkat 5 — Anggota" },
];
