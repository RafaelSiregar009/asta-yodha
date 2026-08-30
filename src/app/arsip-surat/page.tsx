import type { Metadata } from "next";
import ArsipSuratList from "@/components/ArsipSuratList";

export const metadata: Metadata = {
  title: "Arsip Surat — Karang Taruna Asta Yodha",
};

export default function ArsipSuratPage() {
  return (
    <div className="py-16 md:py-24">
      <div className="container-page grid gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-center">
        <div>
          <div className="mb-6 flex items-center gap-3 text-redd">
            <span className="h-px w-10 bg-redd" aria-hidden="true" />
            <span className="eyebrow">Layanan Administrasi Warga</span>
          </div>
          <h1 className="font-display text-5xl leading-[0.9] md:text-7xl">
            <span className="block text-ink">ARSIP</span>
            <span className="block text-redd">SURAT</span>
          </h1>
          <p className="mt-6 max-w-md text-ink/70">
            Unduh template surat pengantar RT/RW, surat keterangan, undangan,
            dan proposal — siap cetak untuk keperluan warga.
          </p>
        </div>
        <div
          aria-hidden="true"
          className="hidden aspect-[4/3] items-center justify-center bg-ink/5 md:flex"
        >
          <span className="font-display text-3xl tracking-widest2 text-ink/20">
            ARSIP
          </span>
        </div>
      </div>

      <div className="container-page mt-14">
        <ArsipSuratList />
      </div>
    </div>
  );
}
