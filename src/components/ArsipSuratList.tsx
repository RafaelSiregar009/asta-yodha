"use client";

import { useEffect, useMemo, useState } from "react";
import { kategoriList, type Surat, type KategoriSurat } from "@/lib/data";

type FilterValue = "SEMUA" | KategoriSurat;
const filters: FilterValue[] = ["SEMUA", ...kategoriList];

function formatTanggal(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export default function ArsipSuratList() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterValue>("SEMUA");
  const [data, setData] = useState<Surat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetch("/api/arsip")
      .then((res) => res.json())
      .then((json) => {
        if (!active) return;
        if (json.error) setError(json.error);
        else setData(json.data ?? []);
      })
      .catch(() => active && setError("Gagal memuat arsip surat."))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return data
      .filter((s) => (filter === "SEMUA" ? true : s.kategori === filter))
      .filter(
        (s) =>
          q === "" ||
          s.judul.toLowerCase().includes(q) ||
          s.nomor.toLowerCase().includes(q)
      );
  }, [data, query, filter]);

  async function handleDownload(surat: Surat) {
    if (!surat.file_url) return;
    try {
      const res = await fetch(`/api/arsip/${surat.id}/download`, { method: "POST" });
      const json = await res.json();
      if (json.url) {
        setData((prev) =>
          prev.map((s) => (s.id === surat.id ? { ...s, diunduh: json.diunduh } : s))
        );
        window.open(json.url, "_blank", "noopener,noreferrer");
      }
    } catch {
      // Kalau gagal mencatat unduhan, tetap izinkan buka file langsung.
      window.open(surat.file_url, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink/40">
            ⌕
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari judul / nomor surat..."
            className="w-full border border-ink/15 bg-cream py-3 pl-10 pr-4 text-sm outline-none placeholder:text-ink/40 focus-visible:border-redd"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`whitespace-nowrap border px-4 py-2.5 text-xs font-semibold tracking-wide transition-colors ${
                filter === f
                  ? "border-ink bg-ink text-cream"
                  : "border-ink/15 text-ink/70 hover:border-ink/40"
              }`}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-10 divide-y divide-ink/10 border-t border-ink/10">
        {loading && (
          <div className="py-16 text-center text-ink/40">Memuat arsip surat…</div>
        )}

        {!loading && error && (
          <div className="py-16 text-center">
            <p className="font-display text-xl text-redd">{error}</p>
          </div>
        )}

        {!loading && !error && results.length === 0 && (
          <div className="py-16 text-center">
            <p className="font-display text-2xl text-ink/30">
              TIDAK ADA SURAT DITEMUKAN
            </p>
            <p className="mt-2 text-sm text-ink/50">
              Coba kata kunci lain atau pilih kategori &ldquo;Semua&rdquo;.
            </p>
          </div>
        )}

        {!loading &&
          !error &&
          results.map((surat, idx) => (
            <div
              key={surat.id}
              className="flex flex-col gap-4 py-6 md:flex-row md:items-center md:justify-between"
            >
              <div className="flex gap-4 md:gap-6">
                <span className="font-display text-lg text-ink/25 md:text-xl">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <div>
                  <p className="font-display text-xl tracking-wide md:text-2xl">
                    {surat.judul}
                  </p>
                  <p className="mt-1 max-w-xl text-sm text-ink/60">
                    No. {surat.nomor}
                    {surat.deskripsi ? ` — ${surat.deskripsi}` : ""}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-6 pl-9 md:pl-0">
                <span className="border border-ink/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-ink/60">
                  {surat.kategori}
                </span>

                <div className="text-right text-xs text-ink/50">
                  <p>{formatTanggal(surat.created_at)}</p>
                  <p>
                    {surat.ukuran_kb}KB • {surat.diunduh}x diunduh
                  </p>
                </div>

                <button
                  onClick={() => handleDownload(surat)}
                  disabled={!surat.file_url}
                  aria-label={`Unduh ${surat.judul}`}
                  className="flex h-10 w-10 shrink-0 items-center justify-center bg-ink text-cream transition-colors hover:bg-redd disabled:cursor-not-allowed disabled:opacity-30"
                >
                  ↓
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
