import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kontak — Karang Taruna Asta Yodha",
};

const kontak = [
  {
    icon: "📍",
    label: "Alamat",
    value: "JPerumahan Mustika Blok F RT 06 RW 09 Desa Matagara Kecamatan Tigaraksa Kabupaten Tangerang Provinsi Banten",
  },
  {
    icon: "✉",
    label: "Email",
    value: "astayodhaa@gmail.com",
    href: "astayodha@gmail.com",
  },
  {
    icon: "📞",
    label: "WhatsApp",
    value: "0812-3456-7890",
    href: "https://wa.me/6281234567890",
  },
  {
    icon: "📷",
    label: "Instagram",
    value: "@astayodha",
    href: "https://instagram.com/astayodha",
  },
];

export default function KontakPage() {
  return (
    <div className="bg-ink py-16 text-cream md:py-24">
      <div className="container-page grid gap-12 md:grid-cols-2">
        <div>
          <h1 className="font-display text-5xl leading-[0.9] md:text-6xl">
            MARI
            <br />
            TERHUBUNG<span className="text-redd">.</span>
          </h1>
          <p className="mt-6 max-w-sm text-cream/70">
            Butuh surat pengantar, ingin bergabung, atau punya usulan
            kegiatan? Sapa kami kapan saja — sekretariat buka setiap Sabtu
            malam.
          </p>
        </div>

        <div className="divide-y divide-cream/10 border-t border-cream/10">
          {kontak.map((item) => {
            const content = (
              <div className="flex items-start gap-4 py-6">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-redd text-lg">
                  {item.icon}
                </span>
                <div>
                  <p className="eyebrow text-cream/40">{item.label}</p>
                  <p className="mt-1 text-lg font-semibold">{item.value}</p>
                </div>
              </div>
            );
            return item.href ? (
              <a key={item.label} href={item.href} className="block transition-opacity hover:opacity-80">
                {content}
              </a>
            ) : (
              <div key={item.label}>{content}</div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
