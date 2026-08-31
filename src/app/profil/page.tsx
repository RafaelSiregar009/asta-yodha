import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profil — Karang Taruna Asta Yodha",
};

const sections = [
  {
    no: "01",
    label: "Tentang Kami",
    body: (
      <>
        <p>
          Karang Taruna Asta Yodha adalah wadah pengembangan generasi muda
          yang berdiri sejak 2023 di Perumahan Mustika Blok F RT 06 RW 09 Desa Matagara Kecamatan Tigaraksa. Kami lahir dari
          semangat gotong royong pemuda kampung yang ingin berkontribusi
          nyata bagi lingkungannya.
        </p>
        <p className="mt-4">
          Dari kerja bakti, turnamen olahraga, hingga pelayanan
          surat-menyurat warga — kami hadir sebagai jembatan antara pemuda,
          warga, dan perangkat kelurahan.
        </p>
      </>
    ),
  },
  {
    no: "02",
    label: "Visi",
    body: (
      <p className="font-display text-2xl leading-snug md:text-3xl">
        &ldquo;Mewujudkan pemuda yang kreatif, mandiri, dan berbakti bagi
        masyarakat.&rdquo;
      </p>
    ),
  },
  {
    no: "03",
    label: "Misi",
    body: (
      <ol className="space-y-2">
        <li>1. Menumbuhkan jiwa kepemimpinan dan kewirausahaan pemuda melalui pelatihan rutin.</li>
        <li>2. Menyelenggarakan kegiatan sosial, budaya, dan olahraga yang mempererat warga.</li>
        <li>3. Membantu pelayanan administrasi warga melalui arsip surat yang tertib dan mudah diakses.</li>
        <li>4. Menjadi mitra aktif RT/RW dan kelurahan dalam setiap program pembangunan.</li>
      </ol>
    ),
  },
];

export default function ProfilPage() {
  return (
    <div className="container-page py-16 md:py-24">
      {sections.map((section, i) => (
        <div
          key={section.no}
          className={`grid gap-6 py-10 md:grid-cols-[140px_200px_1fr] md:gap-10 md:py-14 ${
            i !== 0 ? "border-t border-ink/10" : ""
          }`}
        >
          <p className="font-display text-6xl text-redd md:text-7xl">
            {section.no}
          </p>
          <p className="font-display text-lg tracking-wide">{section.label}</p>
          <div className="text-ink/80">{section.body}</div>
        </div>
      ))}

      <div className="border-t border-ink/10 pt-10">
        <Link
          href="/pengurus"
          className="group inline-flex items-center gap-2 font-display text-sm tracking-widest2"
        >
          <span className="border-b-2 border-redd pb-1">KENALI PENGURUS KAMI</span>
          <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
            →
          </span>
        </Link>
      </div>
    </div>
  );
}
