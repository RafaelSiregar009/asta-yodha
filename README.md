# Karang Taruna Asta Yodha

Website profil, susunan pengurus, dan arsip surat untuk Karang Taruna Asta
Yodha — Next.js 14 (App Router) + TypeScript + Tailwind CSS, dengan
dashboard admin ber-CRUD sungguhan (tersimpan permanen, bukan demo).

## Halaman

- `/` — Beranda (hero dengan foto latar + running banner)
- `/profil` — Tentang, Visi, Misi
- `/pengurus` — Susunan Pengurus (data dari database)
- `/arsip-surat` — Arsip surat dengan pencarian, filter, dan unduh (data dari database)
- `/kontak` — Info kontak & sekretariat
- `/admin` — Login dashboard admin
- `/admin/dashboard` — CRUD Arsip Surat & Keanggotaan (dilindungi login)

## Arsitektur

| Bagian | Teknologi |
| --- | --- |
| Frontend & routing | Next.js 14 App Router |
| Data (arsip surat, anggota) | Postgres lewat [Neon](https://neon.tech) (integrasi native Vercel) |
| File (dokumen surat, foto anggota) | [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) |
| Sesi login admin | Cookie httpOnly ditandatangani (HMAC), diverifikasi di `middleware.ts` |

Semua perubahan lewat dashboard admin (tambah/edit/hapus surat & anggota)
langsung tersimpan di database dan tampil di halaman publik — bukan lagi
mode demo.

## Menjalankan secara lokal

```bash
npm install
cp .env.example .env.local   # lalu isi semua variabel (lihat bawah)
npm run dev
```

Buka http://localhost:3000

## Environment variables

| Variabel | Wajib | Keterangan |
| --- | --- | --- |
| `ADMIN_EMAIL` | ✅ | Email untuk login dashboard |
| `ADMIN_PASSWORD` | ✅ | Password untuk login dashboard |
| `ADMIN_SECRET` | ✅ | String acak panjang untuk menandatangani sesi login (`openssl rand -hex 32`) |
| `DATABASE_URL` | ✅ | Connection string Postgres — untuk data arsip surat & anggota |
| `BLOB_READ_WRITE_TOKEN` | ✅ | Token Vercel Blob — untuk unggahan file surat & foto anggota |

**Wajib diganti/diisi** sebelum deploy ke publik.

## Deploy ke Vercel

### 1. Push ke GitHub

```bash
git init
git add .
git commit -m "Website Karang Taruna Asta Yodha"
git branch -M main
git remote add origin <url-repo-anda>
git push -u origin main
```

### 2. Import project di Vercel

Buka [vercel.com](https://vercel.com) → **Add New Project** → pilih
repository tadi → Vercel otomatis mendeteksi Next.js, tidak perlu ubah
build settings.

### 3. Hubungkan Database (Postgres/Neon)

Di dashboard project Vercel → tab **Storage** → **Create Database** →
pilih **Postgres (Neon)** → ikuti langkah, lalu **Connect** ke project ini.
Vercel otomatis menambahkan env var `DATABASE_URL` (atau `POSTGRES_URL`).

Tabel database (`arsip_surat`, `anggota`) dibuat otomatis saat pertama
kali API dipanggil — tidak perlu migrasi manual.

### 4. Hubungkan Penyimpanan File (Blob)

Masih di tab **Storage** → **Create Database** → pilih **Blob** →
**Connect** ke project ini. Vercel otomatis menambahkan env var
`BLOB_READ_WRITE_TOKEN`.

### 5. Tambahkan sisa environment variables

Di tab **Settings → Environment Variables**, tambahkan:
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `ADMIN_SECRET`

### 6. Deploy

Klik **Deploy** (atau **Redeploy** kalau sudah pernah deploy sebelum
Database/Blob terhubung, supaya env var baru terbaca).

## Posisi asset gambar

| Asset | Lokasi file | Dipakai di |
| --- | --- | --- |
| Foto latar hero (kampung/bendera) | `public/images/kartar.png` | Background section hero di Beranda (`src/app/page.tsx`) — saat ini terisi gambar placeholder tekstur gelap; **timpa file ini dengan foto asli Anda** (nama file & path harus tetap sama, atau ubah path di kode jika ingin nama lain) |
| Logo (kotak merah + teks "ASTA YODHA") | Teks + `<span>` di kode, bukan file gambar | `src/components/Navbar.tsx` dan `src/components/Footer.tsx` — kalau punya file logo sendiri, taruh di `public/images/logo.png` lalu ganti span tersebut dengan `<img src="/images/logo.png" ... />` |
| Favicon | `src/app/icon.svg` | Otomatis dipakai Next.js sebagai favicon tab browser — ganti isi SVG ini atau taruh `icon.png`/`favicon.ico` di `src/app/` untuk mengganti |
| Foto anggota/pengurus | **Tidak perlu ditaruh manual** | Diunggah langsung lewat form "Tambah/Edit Anggota" di dashboard admin, tersimpan otomatis ke Vercel Blob |
| File surat (PDF/DOCX) | **Tidak perlu ditaruh manual** | Diunggah langsung lewat form "Unggah/Edit Surat" di dashboard admin, tersimpan otomatis ke Vercel Blob |

## Fitur CRUD Dashboard Admin

**Arsip Surat** — tambah, lihat, ubah, hapus surat (judul, kategori,
deskripsi, file PDF/DOCX). Nomor surat & tanggal dibuat otomatis. Setiap
unduhan oleh warga di halaman publik menambah penghitung otomatis.

**Keanggotaan / Pengurus** — tambah, lihat, ubah, hapus anggota (nama,
jabatan, keterangan, urutan tampil, foto). Urutan tampil menentukan posisi
kartu di halaman `/pengurus`.

Kedua modul dilindungi login admin di dua lapis: `middleware.ts` menolak
akses ke endpoint API yang mengubah data (POST/PATCH/DELETE) tanpa sesi
valid, dan setiap route handler memverifikasi ulang secara independen.

## Mengganti konten statis lainnya

- Info kontak & alamat: `src/app/kontak/page.tsx` dan `src/components/Footer.tsx`
- Teks tagline running banner: `items` di pemanggilan `<Marquee />` dalam `src/app/page.tsx`
- Teks Tentang/Visi/Misi: `src/app/profil/page.tsx`
- Warna & tipografi: `tailwind.config.ts` dan `src/app/layout.tsx`
