"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { kategoriList, type Surat, type Anggota, type KategoriSurat } from "@/lib/data";

type Tab = "arsip" | "anggota";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("arsip");

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-cream">
      <header className="flex items-center justify-between border-b border-ink/10 bg-ink px-6 py-4 text-cream md:px-10">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 bg-redd" aria-hidden="true" />
          <span className="font-display text-base tracking-wide">DASHBOARD ADMIN</span>
        </div>
        <div className="flex items-center gap-6 text-sm">
          <span className="hidden text-cream/50 sm:inline">admin@astayodha.id</span>
          <button onClick={handleLogout} className="flex items-center gap-1.5 hover:text-redd">
            <span aria-hidden="true">↦</span> Keluar
          </button>
        </div>
      </header>

      <div className="flex flex-col md:flex-row">
        <aside className="w-full border-b border-ink/10 bg-white md:w-56 md:border-b-0 md:border-r">
          <nav className="flex gap-1 p-4 md:flex-col">
            <button
              onClick={() => setTab("anggota")}
              className={`flex-1 rounded px-3 py-2.5 text-left text-sm md:flex-none ${
                tab === "anggota" ? "bg-ink font-semibold text-cream" : "text-ink/60 hover:bg-ink/5"
              }`}
            >
              Pengurus
            </button>
            <button
              onClick={() => setTab("arsip")}
              className={`flex-1 rounded px-3 py-2.5 text-left text-sm md:flex-none ${
                tab === "arsip" ? "bg-ink font-semibold text-cream" : "text-ink/60 hover:bg-ink/5"
              }`}
            >
              Arsip Surat
            </button>
          </nav>
        </aside>

        <main className="flex-1 p-6 md:p-10">
          {tab === "arsip" ? <ArsipTab /> : <AnggotaTab />}
        </main>
      </div>
    </div>
  );
}

/* ---------------------------- ARSIP SURAT TAB ---------------------------- */

function ArsipTab() {
  const [items, setItems] = useState<Surat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<null | { mode: "create" } | { mode: "edit"; item: Surat }>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/arsip");
      const json = await res.json();
      if (json.error) setError(json.error);
      else setItems(json.data ?? []);
    } catch {
      setError("Gagal memuat arsip surat.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(item: Surat) {
    if (!confirm(`Hapus "${item.judul}"? Tindakan ini tidak bisa dibatalkan.`)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/arsip/${item.id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.error) {
        setError(json.error);
        return;
      }
      setItems((prev) => prev.filter((s) => s.id !== item.id));
    } finally {
      setBusy(false);
    }
  }

  async function handleSubmit(form: FormData, existing?: Surat) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(existing ? `/api/arsip/${existing.id}` : "/api/arsip", {
        method: existing ? "PATCH" : "POST",
        body: form,
      });
      const json = await res.json();
      if (json.error) {
        setError(json.error);
        return false;
      }
      if (existing) {
        setItems((prev) => prev.map((s) => (s.id === existing.id ? json.data : s)));
      } else {
        setItems((prev) => [json.data, ...prev]);
      }
      return true;
    } catch {
      setError("Gagal menyimpan. Periksa koneksi database/penyimpanan.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl tracking-wide">ARSIP SURAT</h1>
        <button
          onClick={() => setModal({ mode: "create" })}
          className="inline-flex items-center gap-2 bg-redd px-5 py-2.5 text-sm font-semibold text-cream hover:bg-redd-dark"
        >
          + Unggah Surat
        </button>
      </div>

      {error && (
        <p className="mb-4 border border-redd/30 bg-redd/5 px-4 py-3 text-sm text-redd">{error}</p>
      )}

      <div className="overflow-x-auto border border-ink/10 bg-white">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-ink/10 text-xs uppercase tracking-wide text-ink/50">
              <th className="px-5 py-3 font-medium">Judul</th>
              <th className="px-5 py-3 font-medium">Kategori</th>
              <th className="px-5 py-3 font-medium">Ukuran</th>
              <th className="px-5 py-3 font-medium">Diunduh</th>
              <th className="px-5 py-3 font-medium">Tanggal</th>
              <th className="px-5 py-3 text-right font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-ink/40">
                  Memuat…
                </td>
              </tr>
            )}
            {!loading &&
              items.map((s) => (
                <tr key={s.id} className="border-b border-ink/5 last:border-0">
                  <td className="px-5 py-4">
                    <p className="font-semibold">{s.judul}</p>
                    <p className="text-xs text-ink/50">{s.nomor}</p>
                  </td>
                  <td className="px-5 py-4 text-ink/70">{s.kategori}</td>
                  <td className="px-5 py-4 text-ink/70">{s.ukuran_kb}KB</td>
                  <td className="px-5 py-4 text-ink/70">{s.diunduh}x</td>
                  <td className="px-5 py-4 text-ink/70">
                    {new Date(s.created_at).toLocaleDateString("id-ID")}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      {s.file_url && (
                        <a
                          href={s.file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="border border-ink/15 px-3 py-1.5 text-xs font-semibold hover:border-ink/40"
                        >
                          Lihat
                        </a>
                      )}
                      <button
                        onClick={() => setModal({ mode: "edit", item: s })}
                        className="border border-ink/15 px-3 py-1.5 text-xs font-semibold hover:border-ink/40"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(s)}
                        disabled={busy}
                        className="border border-ink/15 px-3 py-1.5 text-xs font-semibold text-redd hover:border-redd disabled:opacity-50"
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            {!loading && items.length === 0 && !error && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-ink/40">
                  Belum ada surat. Klik &ldquo;Unggah Surat&rdquo; untuk menambahkan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modal && (
        <ArsipModal
          initial={modal.mode === "edit" ? modal.item : undefined}
          busy={busy}
          onClose={() => setModal(null)}
          onSubmit={async (form) => {
            const ok = await handleSubmit(form, modal.mode === "edit" ? modal.item : undefined);
            if (ok) setModal(null);
          }}
        />
      )}
    </div>
  );
}

function ArsipModal({
  initial,
  busy,
  onClose,
  onSubmit,
}: {
  initial?: Surat;
  busy: boolean;
  onClose: () => void;
  onSubmit: (form: FormData) => void;
}) {
  const [judul, setJudul] = useState(initial?.judul ?? "");
  const [kategori, setKategori] = useState<KategoriSurat>(
    (initial?.kategori as KategoriSurat) ?? kategoriList[0]
  );
  const [deskripsi, setDeskripsi] = useState(initial?.deskripsi ?? "");
  const [file, setFile] = useState<File | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const form = new FormData();
    form.set("judul", judul);
    form.set("kategori", kategori);
    form.set("deskripsi", deskripsi);
    if (file) form.set("file", file);
    onSubmit(form);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-6">
      <div className="w-full max-w-md bg-cream p-6">
        <h2 className="font-display text-xl">
          {initial ? "EDIT SURAT" : "UNGGAH SURAT"}
        </h2>
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="eyebrow text-ink/50">Judul Surat</label>
            <input
              autoFocus
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              required
              className="mt-2 w-full border border-ink/15 bg-white px-4 py-2.5 text-sm outline-none focus-visible:border-redd"
              placeholder="Contoh: Surat Keterangan Aktif"
            />
          </div>
          <div>
            <label className="eyebrow text-ink/50">Kategori</label>
            <select
              value={kategori}
              onChange={(e) => setKategori(e.target.value as KategoriSurat)}
              className="mt-2 w-full border border-ink/15 bg-white px-4 py-2.5 text-sm outline-none focus-visible:border-redd"
            >
              {kategoriList.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="eyebrow text-ink/50">Deskripsi</label>
            <textarea
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              rows={2}
              className="mt-2 w-full border border-ink/15 bg-white px-4 py-2.5 text-sm outline-none focus-visible:border-redd"
              placeholder="Keterangan singkat surat ini"
            />
          </div>
          <div>
            <label className="eyebrow text-ink/50">
              File {initial ? "(kosongkan jika tidak diganti)" : "(PDF/DOCX)"}
            </label>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="mt-2 w-full border border-ink/15 bg-white px-4 py-2.5 text-sm outline-none file:mr-3 file:border-0 file:bg-ink file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-cream"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-semibold text-ink/60 hover:text-ink"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={busy}
              className="bg-ink px-5 py-2.5 text-sm font-semibold text-cream hover:bg-redd disabled:opacity-60"
            >
              {busy ? "Menyimpan…" : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ------------------------------ ANGGOTA TAB ------------------------------ */

function AnggotaTab() {
  const [items, setItems] = useState<Anggota[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<null | { mode: "create" } | { mode: "edit"; item: Anggota }>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/anggota");
      const json = await res.json();
      if (json.error) setError(json.error);
      else setItems(json.data ?? []);
    } catch {
      setError("Gagal memuat data keanggotaan.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(item: Anggota) {
    if (!confirm(`Hapus "${item.nama}" dari susunan pengurus?`)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/anggota/${item.id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.error) {
        setError(json.error);
        return;
      }
      setItems((prev) => prev.filter((a) => a.id !== item.id));
    } finally {
      setBusy(false);
    }
  }

  async function handleSubmit(form: FormData, existing?: Anggota) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(existing ? `/api/anggota/${existing.id}` : "/api/anggota", {
        method: existing ? "PATCH" : "POST",
        body: form,
      });
      const json = await res.json();
      if (json.error) {
        setError(json.error);
        return false;
      }
      if (existing) {
        setItems((prev) => prev.map((a) => (a.id === existing.id ? json.data : a)));
      } else {
        setItems((prev) => [...prev, json.data]);
      }
      return true;
    } catch {
      setError("Gagal menyimpan. Periksa koneksi database/penyimpanan.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl tracking-wide">KEANGGOTAAN / PENGURUS</h1>
        <button
          onClick={() => setModal({ mode: "create" })}
          className="inline-flex items-center gap-2 bg-redd px-5 py-2.5 text-sm font-semibold text-cream hover:bg-redd-dark"
        >
          + Tambah Anggota
        </button>
      </div>

      {error && (
        <p className="mb-4 border border-redd/30 bg-redd/5 px-4 py-3 text-sm text-redd">{error}</p>
      )}

      <div className="overflow-x-auto border border-ink/10 bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-ink/10 text-xs uppercase tracking-wide text-ink/50">
              <th className="px-5 py-3 font-medium">Foto</th>
              <th className="px-5 py-3 font-medium">Nama</th>
              <th className="px-5 py-3 font-medium">Jabatan</th>
              <th className="px-5 py-3 font-medium">Urutan</th>
              <th className="px-5 py-3 text-right font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-ink/40">
                  Memuat…
                </td>
              </tr>
            )}
            {!loading &&
              items.map((a) => (
                <tr key={a.id} className="border-b border-ink/5 last:border-0">
                  <td className="px-5 py-4">
                    {a.foto_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={a.foto_url}
                        alt={a.nama}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ink/10 text-xs font-semibold text-ink/40">
                        {a.nama.slice(0, 1).toUpperCase()}
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-4 font-semibold">{a.nama}</td>
                  <td className="px-5 py-4 text-ink/70">{a.jabatan}</td>
                  <td className="px-5 py-4 text-ink/70">{a.urutan}</td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setModal({ mode: "edit", item: a })}
                        className="border border-ink/15 px-3 py-1.5 text-xs font-semibold hover:border-ink/40"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(a)}
                        disabled={busy}
                        className="border border-ink/15 px-3 py-1.5 text-xs font-semibold text-redd hover:border-redd disabled:opacity-50"
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            {!loading && items.length === 0 && !error && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-ink/40">
                  Belum ada anggota. Klik &ldquo;Tambah Anggota&rdquo; untuk menambahkan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modal && (
        <AnggotaModal
          initial={modal.mode === "edit" ? modal.item : undefined}
          busy={busy}
          onClose={() => setModal(null)}
          onSubmit={async (form) => {
            const ok = await handleSubmit(form, modal.mode === "edit" ? modal.item : undefined);
            if (ok) setModal(null);
          }}
        />
      )}
    </div>
  );
}

function AnggotaModal({
  initial,
  busy,
  onClose,
  onSubmit,
}: {
  initial?: Anggota;
  busy: boolean;
  onClose: () => void;
  onSubmit: (form: FormData) => void;
}) {
  const [nama, setNama] = useState(initial?.nama ?? "");
  const [jabatan, setJabatan] = useState(initial?.jabatan ?? "");
  const [keterangan, setKeterangan] = useState(initial?.keterangan ?? "");
  const [urutan, setUrutan] = useState(initial?.urutan ?? 0);
  const [foto, setFoto] = useState<File | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const form = new FormData();
    form.set("nama", nama);
    form.set("jabatan", jabatan);
    form.set("keterangan", keterangan);
    form.set("urutan", String(urutan));
    if (foto) form.set("foto", foto);
    onSubmit(form);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-6">
      <div className="w-full max-w-md bg-cream p-6">
        <h2 className="font-display text-xl">
          {initial ? "EDIT ANGGOTA" : "TAMBAH ANGGOTA"}
        </h2>
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="eyebrow text-ink/50">Nama Lengkap</label>
            <input
              autoFocus
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              required
              className="mt-2 w-full border border-ink/15 bg-white px-4 py-2.5 text-sm outline-none focus-visible:border-redd"
              placeholder="Contoh: Rangga Saputra"
            />
          </div>
          <div>
            <label className="eyebrow text-ink/50">Jabatan</label>
            <input
              value={jabatan}
              onChange={(e) => setJabatan(e.target.value)}
              required
              className="mt-2 w-full border border-ink/15 bg-white px-4 py-2.5 text-sm outline-none focus-visible:border-redd"
              placeholder="Contoh: Ketua"
            />
          </div>
          <div>
            <label className="eyebrow text-ink/50">Keterangan (opsional)</label>
            <input
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              className="mt-2 w-full border border-ink/15 bg-white px-4 py-2.5 text-sm outline-none focus-visible:border-redd"
            />
          </div>
          <div>
            <label className="eyebrow text-ink/50">Urutan Tampil</label>
            <input
              type="number"
              value={urutan}
              onChange={(e) => setUrutan(Number(e.target.value))}
              className="mt-2 w-full border border-ink/15 bg-white px-4 py-2.5 text-sm outline-none focus-visible:border-redd"
            />
          </div>
          <div>
            <label className="eyebrow text-ink/50">
              Foto {initial ? "(kosongkan jika tidak diganti)" : ""}
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFoto(e.target.files?.[0] ?? null)}
              className="mt-2 w-full border border-ink/15 bg-white px-4 py-2.5 text-sm outline-none file:mr-3 file:border-0 file:bg-ink file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-cream"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-semibold text-ink/60 hover:text-ink"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={busy}
              className="bg-ink px-5 py-2.5 text-sm font-semibold text-cream hover:bg-redd disabled:opacity-60"
            >
              {busy ? "Menyimpan…" : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
