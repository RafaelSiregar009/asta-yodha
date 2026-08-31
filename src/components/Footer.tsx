import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-ink text-cream">
      <div className="overflow-hidden">
        <div
          aria-hidden="true"
          className="select-none whitespace-nowrap py-6 text-center font-display text-[18vw] leading-none text-cream/5 md:text-[11vw]"
        >
          ASTA YODHA
        </div>
      </div>

      <div className="container-page grid gap-10 border-t border-cream/10 py-12 md:grid-cols-3">
        <div>
          <p className="font-display text-sm tracking-widest2">
            KARANG TARUNA ASTA YODHA
          </p>
          <p className="mt-3 text-sm text-cream/60">
            Perumahan Mustika Tigaraksa Blok F RT 06 RW 09
          </p>
          <p className="text-sm text-cream/60">
            astayodhaa@gmail.com
          </p>
        </div>

        <div>
          <p className="eyebrow text-cream/50">Navigasi</p>
          <ul className="mt-3 space-y-2 text-sm text-cream/80">
            <li>
              <Link href="/" className="hover:text-redd">Beranda</Link>
            </li>
            <li>
              <Link href="/pengurus" className="hover:text-redd">Susunan Pengurus</Link>
            </li>
            <li>
              <Link href="/berita" className="hover:text-redd">Berita Kegiatan</Link>
            </li>
            <li>
              <Link href="/arsip-surat" className="hover:text-redd">Arsip Surat</Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="eyebrow text-cream/50">Sekretariat</p>
          <p className="mt-3 text-sm text-cream/80">
            Buka setiap Sabtu, 19.30 – 21.30 WIB
          </p>
          <p className="text-sm text-cream/80">Instagram: @astayodha</p>
        </div>
      </div>

      <div className="container-page border-t border-cream/10 py-5 text-xs text-cream/40">
        © 2026 Karang Taruna Asta Yodha. Rukun • Berkah •
      </div>
    </footer>
  );
}
