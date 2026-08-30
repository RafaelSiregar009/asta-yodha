import Link from "next/link";
import Marquee from "@/components/Marquee";

export default function BerandaPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-ink text-cream">
        {/* Foto latar kampung/bendera — taruh file di public/images/kartar.png */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[url('/images/kartar2.png')] bg-cover bg-center"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(220,53,53,0.25),_transparent_55%)]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,10,0.55)_0%,rgba(10,10,10,0.88)_100%)]"
        />

        <div className="container-page relative flex min-h-[85vh] flex-col justify-center py-24">
          <div className="mb-6 flex items-center gap-3 text-cream/70">
            <span className="h-px w-10 bg-redd" aria-hidden="true" />
            <span className="eyebrow">Wadah Pemuda Kelurahan Sukamaju</span>
          </div>

          <h1 className="display-tight font-display text-[15vw] leading-[0.86] sm:text-[10vw] lg:text-[7.2vw]">
            <span className="block text-cream">KARANG</span>
            <span className="block text-cream">TARUNA</span>
            <span className="block text-redd">ASTA</span>
            <span className="block text-redd">YODHA</span>
          </h1>

          <p className="mt-8 max-w-md text-cream/70">
            Organisasi kepemudaan yang tumbuh dari kampung, untuk kampung.
            Menggerakkan pemuda melalui kegiatan sosial, budaya, olahraga, dan
            pelayanan administrasi warga.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/arsip-surat"
              className="inline-flex items-center gap-2 bg-redd px-6 py-3.5 text-sm font-semibold text-cream transition-colors hover:bg-redd-dark"
            >
              Jelajahi Arsip Surat
              <span aria-hidden="true">→</span>
            </Link>
            <Link
              href="/pengurus"
              className="inline-flex items-center gap-2 border border-cream/40 px-6 py-3.5 text-sm font-semibold text-cream transition-colors hover:border-cream hover:bg-cream/10"
            >
              Susunan Pengurus
            </Link>
          </div>
        </div>
      </section>

      <Marquee items={["RUKUN","BERKAH","BERKARYA", "BERBAKTI", "BERBUDAYA", "BERSATU"]} />

      <section className="container-page py-20 md:py-28">
        <div className="grid gap-6 md:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="border-t-2 border-ink pt-5">
              <p className="font-display text-4xl text-redd">{stat.value}</p>
              <p className="mt-2 text-sm text-ink/70">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-ink/10 bg-ink/[0.03] py-20 md:py-28">
        <div className="container-page grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <span className="eyebrow text-redd">Apa yang kami lakukan</span>
            <h2 className="mt-4 font-display text-4xl leading-[0.95] md:text-5xl">
              DARI KEGIATAN WARGA HINGGA URUSAN SURAT-MENYURAT
            </h2>
          </div>
          <div className="space-y-6">
            {kegiatan.map((item) => (
              <div key={item.title} className="flex gap-4 border-b border-ink/10 pb-6">
                <span className="font-display text-2xl text-ink/30">
                  {item.no}
                </span>
                <div>
                  <p className="font-semibold">{item.title}</p>
                  <p className="mt-1 text-sm text-ink/60">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

const stats = [
  { value: "2015", label: "Tahun berdiri di Kelurahan Sukamaju" },
  { value: "80+", label: "Anggota aktif dari 4 RW" },
  { value: "4", label: "Jenis layanan surat untuk warga" },
];

const kegiatan = [
  {
    no: "01",
    title: "Kegiatan Sosial & Budaya",
    desc: "Kerja bakti, perayaan hari besar, dan kegiatan budaya kampung.",
  },
  {
    no: "02",
    title: "Olahraga & Kepemudaan",
    desc: "Turnamen antar-RW dan pembinaan minat bakat pemuda.",
  },
  {
    no: "03",
    title: "Pelayanan Administrasi",
    desc: "Surat pengantar, keterangan, undangan, dan proposal untuk warga.",
  },
];
