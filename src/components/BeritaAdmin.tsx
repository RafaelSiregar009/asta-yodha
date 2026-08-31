"use client";

import { useEffect, useState } from "react";
import type { Berita } from "@/lib/data";

export default function BeritaAdmin() {
  const [items, setItems] = useState<Berita[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [modal, setModal] = useState<null | { mode: "create" } | { mode: "edit"; item: Berita }>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/berita", { cache: "no-store" });
      const json = await res.json();
      if (json.error) setError(json.error);
      else setItems(json.data ?? []);
    } catch {
      setError("Gagal memuat berita.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function save(form: FormData, existing?: Berita) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(existing ? `/api/berita/${existing.id}` : "/api/berita", {
        method: existing ? "PATCH" : "POST",
        body: form,
      });
      const json = await res.json();
      if (json.error) {
        setError(json.error);
        return false;
      }
      setItems((current) =>
        existing ? current.map((item) => (item.id === existing.id ? json.data : item)) : [json.data, ...current]
      );
      return true;
    } catch {
      setError("Gagal menyimpan berita. Periksa koneksi database dan Blob.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function remove(item: Berita) {
    if (!confirm(`Hapus berita "${item.judul}"? Tindakan ini tidak bisa dibatalkan.`)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/berita/${item.id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.error) {
        setError(json.error);
        return;
      }
      setItems((current) => current.filter((news) => news.id !== item.id));
    } catch {
      setError("Gagal menghapus berita.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl tracking-wide">BERITA KEGIATAN</h1>
          <p className="mt-1 text-sm text-ink/60">Publikasikan informasi dan dokumentasi kegiatan.</p>
        </div>
        <button
          onClick={() => setModal({ mode: "create" })}
          className="inline-flex items-center gap-2 bg-redd px-5 py-2.5 text-sm font-semibold text-cream hover:bg-redd-dark"
        >
          + Tambah Berita
        </button>
      </div>

      {error && <p className="mb-4 border border-redd/30 bg-redd/5 px-4 py-3 text-sm text-redd">{error}</p>}

      <div className="overflow-x-auto border border-ink/10 bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-ink/10 text-xs uppercase tracking-wide text-ink/50">
              <th className="px-5 py-3 font-medium">Foto</th>
              <th className="px-5 py-3 font-medium">Judul</th>
              <th className="px-5 py-3 font-medium">Tanggal</th>
              <th className="px-5 py-3 text-right font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading && <Row colSpan={4}>Memuat…</Row>}
            {!loading && items.map((item) => (
              <tr key={item.id} className="border-b border-ink/5 last:border-0">
                <td className="px-5 py-4">
                  {item.foto_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.foto_url} alt="" className="h-12 w-16 object-cover" />
                  ) : (
                    <div className="flex h-12 w-16 items-center justify-center bg-ink/5 text-xs text-ink/40">—</div>
                  )}
                </td>
                <td className="px-5 py-4">
                  <p className="font-semibold">{item.judul}</p>
                  <p className="mt-1 max-w-md truncate text-xs text-ink/50">{item.ringkasan || item.isi}</p>
                </td>
                <td className="px-5 py-4 text-ink/70">{new Date(item.created_at).toLocaleDateString("id-ID")}</td>
                <td className="px-5 py-4">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setModal({ mode: "edit", item })} className="border border-ink/15 px-3 py-1.5 text-xs font-semibold hover:border-ink/40">Edit</button>
                    <button onClick={() => remove(item)} disabled={busy} className="border border-ink/15 px-3 py-1.5 text-xs font-semibold text-redd hover:border-redd disabled:opacity-50">Hapus</button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && items.length === 0 && !error && <Row colSpan={4}>Belum ada berita. Klik “Tambah Berita” untuk memulai.</Row>}
          </tbody>
        </table>
      </div>

      {modal && (
        <BeritaModal
          initial={modal.mode === "edit" ? modal.item : undefined}
          busy={busy}
          onClose={() => setModal(null)}
          onSubmit={async (form) => {
            const ok = await save(form, modal.mode === "edit" ? modal.item : undefined);
            if (ok) setModal(null);
          }}
        />
      )}
    </div>
  );
}

function Row({ colSpan, children }: { colSpan: number; children: React.ReactNode }) {
  return <tr><td colSpan={colSpan} className="px-5 py-10 text-center text-ink/40">{children}</td></tr>;
}

function BeritaModal({ initial, busy, onClose, onSubmit }: { initial?: Berita; busy: boolean; onClose: () => void; onSubmit: (form: FormData) => void }) {
  const [judul, setJudul] = useState(initial?.judul ?? "");
  const [ringkasan, setRingkasan] = useState(initial?.ringkasan ?? "");
  const [isi, setIsi] = useState(initial?.isi ?? "");
  const [foto, setFoto] = useState<File | null>(null);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const form = new FormData();
    form.set("judul", judul);
    form.set("ringkasan", ringkasan);
    form.set("isi", isi);
    if (foto) form.set("foto", foto);
    onSubmit(form);
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-ink/60 p-4 md:p-6">
      <div className="mx-auto my-4 w-full max-w-2xl bg-cream p-6 md:my-10">
        <h2 className="font-display text-xl">{initial ? "EDIT BERITA" : "TAMBAH BERITA"}</h2>
        <form onSubmit={submit} className="mt-5 space-y-4">
          <div>
            <label className="eyebrow text-ink/50">Judul Kegiatan</label>
            <input autoFocus required value={judul} onChange={(event) => setJudul(event.target.value)} className="mt-2 w-full border border-ink/15 bg-white px-4 py-2.5 text-sm outline-none focus-visible:border-redd" placeholder="Contoh: Kerja Bakti Menyambut HUT RI" />
          </div>
          <div>
            <label className="eyebrow text-ink/50">Ringkasan</label>
            <textarea value={ringkasan} onChange={(event) => setRingkasan(event.target.value)} rows={2} className="mt-2 w-full border border-ink/15 bg-white px-4 py-2.5 text-sm outline-none focus-visible:border-redd" placeholder="Ringkasan singkat untuk daftar berita" />
          </div>
          <div>
            <label className="eyebrow text-ink/50">Deskripsi Lengkap</label>
            <textarea required value={isi} onChange={(event) => setIsi(event.target.value)} rows={8} className="mt-2 w-full border border-ink/15 bg-white px-4 py-2.5 text-sm outline-none focus-visible:border-redd" placeholder="Ceritakan kegiatan, waktu, lokasi, dan hasilnya…" />
          </div>
          <div>
            <label className="eyebrow text-ink/50">Foto Kegiatan {initial ? "(kosongkan jika tidak diganti)" : "(opsional)"}</label>
            <input type="file" accept="image/*" onChange={(event) => setFoto(event.target.files?.[0] ?? null)} className="mt-2 w-full border border-ink/15 bg-white px-4 py-2.5 text-sm outline-none file:mr-3 file:border-0 file:bg-ink file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-cream" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-ink/60 hover:text-ink">Batal</button>
            <button type="submit" disabled={busy} className="bg-ink px-5 py-2.5 text-sm font-semibold text-cream hover:bg-redd disabled:opacity-60">{busy ? "Menyimpan…" : "Simpan"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
