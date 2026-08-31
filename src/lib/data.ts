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
  created_at: string;
};

export type Berita = {
  id: number;
  judul: string;
  ringkasan: string;
  isi: string;
  foto_url: string | null;
  created_at: string;
  updated_at: string;
};
