"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Gagal masuk. Coba lagi.");
        return;
      }
      router.push("/admin/dashboard");
      router.refresh();
    } catch {
      setError("Terjadi kesalahan jaringan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-ink px-6 py-16 text-cream">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center gap-2">
          <span className="h-3 w-3 bg-redd" aria-hidden="true" />
          <span className="font-display text-lg tracking-wide">DASHBOARD ADMIN</span>
        </div>

        <h1 className="font-display text-3xl">MASUK</h1>
        <p className="mt-2 text-sm text-cream/60">
          Khusus pengurus yang memiliki akses arsip surat.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label htmlFor="email" className="eyebrow text-cream/50">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full border border-cream/20 bg-transparent px-4 py-3 text-sm outline-none focus-visible:border-redd"
              placeholder="admin@astayodha.id"
            />
          </div>

          <div>
            <label htmlFor="password" className="eyebrow text-cream/50">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full border border-cream/20 bg-transparent px-4 py-3 text-sm outline-none focus-visible:border-redd"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-redd">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-redd px-6 py-3.5 text-sm font-semibold text-cream transition-colors hover:bg-redd-dark disabled:opacity-60"
          >
            {loading ? "Memproses…" : "Masuk"}
          </button>
        </form>
      </div>
    </div>
  );
}
