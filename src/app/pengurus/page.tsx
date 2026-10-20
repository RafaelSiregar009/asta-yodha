import type { Metadata } from "next";
import { db, ensureSchema } from "@/lib/db";
import type { Anggota } from "@/lib/data";

export const metadata: Metadata = {
  title: "Susunan Pengurus — Karang Taruna Asta Yodha",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getAnggota(): Promise<{ data: Anggota[]; error: string | null }> {
  try {
    await ensureSchema();
    const sql = db();
    const rows = await sql`
      SELECT id, nama, jabatan, foto_url, keterangan, urutan, tingkat, created_at
      FROM anggota
      ORDER BY tingkat ASC, urutan ASC, created_at ASC
    `;
    return { data: rows as unknown as Anggota[], error: null };
  } catch (err) {
    return { data: [], error: err instanceof Error ? err.message : "Gagal memuat data." };
  }
}

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

function groupByTingkat(list: Anggota[]): Anggota[][] {
  const map = new Map<number, Anggota[]>();
  for (const person of list) {
    const key = person.tingkat ?? 1;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(person);
  }
  return Array.from(map.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([, people]) => people);
}

function PersonCard({ person }: { person: Anggota }) {
  return (
    <div className="group relative aspect-[3/4] w-44 overflow-hidden bg-ink shadow-[5px_5px_0_0_rgba(10,10,10,0.18)]">
      {person.foto_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={person.foto_url}
          alt={person.nama}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center font-display text-5xl text-cream/15">
          {initials(person.nama)}
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 border-t-2 border-redd bg-gradient-to-t from-ink via-ink/85 to-ink/20 p-3 pt-8">
        <p className="text-sm font-semibold leading-tight text-cream">{person.nama}</p>
        <p className="mt-0.5 text-xs text-cream/65">{person.jabatan}</p>
      </div>
    </div>
  );
}

export default async function PengurusPage() {
  const { data: pengurus, error } = await getAnggota();
  const levels = groupByTingkat(pengurus);

  return (
    <div className="py-16 md:py-24">
      <div className="container-page">
        <div className="mb-6 flex items-center gap-3 text-redd">
          <span className="h-px w-10 bg-redd" aria-hidden="true" />
          <span className="eyebrow">Susunan Organisasi</span>
        </div>

        <h1 className="font-display text-5xl leading-[0.9] md:text-7xl">
          <span className="block text-ink">SUSUNAN</span>
          <span className="block text-redd">PENGURUS</span>
        </h1>

        <p className="mt-6 max-w-md text-ink/70">
          Para pemuda yang menggerakkan roda organisasi — dari ketua hingga
          seksi bidang.
        </p>
      </div>

      {error && (
        <div className="container-page mt-14">
          <p className="border border-redd/30 bg-redd/5 px-4 py-3 text-sm text-redd">
            {error}
          </p>
        </div>
      )}

      {!error && pengurus.length === 0 && (
        <div className="container-page mt-14">
          <p className="border border-ink/10 px-4 py-8 text-center text-sm text-ink/50">
            Data pengurus belum ditambahkan. Kelola lewat dashboard admin.
          </p>
        </div>
      )}

      {levels.length > 0 && (
        <div className="container-page mt-14">
          <div className="org-scroll">
            <div className="org-tree">
              {levels.map((people, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  {idx > 0 && <span className="org-link" aria-hidden="true" />}
                  <div
                    className={`org-row ${idx === 0 ? "org-root" : ""}`}
                    role="list"
                  >
                    {people.map((person) => (
                      <div key={person.id} className="org-item" role="listitem">
                        <span className="org-stub" aria-hidden="true" />
                        <PersonCard person={person} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
