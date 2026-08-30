"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/", label: "Beranda" },
  { href: "/profil", label: "Profil" },
  { href: "/pengurus", label: "Pengurus" },
  { href: "/arsip-surat", label: "Arsip Surat" },
  { href: "/kontak", label: "Kontak" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-ink/10 bg-cream/95 backdrop-blur">
      <div className="container-page flex h-[72px] items-center justify-between">
        <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/logo-kartar.png"
            alt="Logo Karang Taruna Asta Yodha"
            className="h-10 w-10 object-contain"
          />
          <span className="font-display text-lg tracking-wide">ASTA YODHA</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm transition-colors hover:text-redd ${
                  active ? "font-semibold text-ink" : "text-ink/70"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:block">
          <Link
            href="/arsip-surat"
            className="inline-flex items-center gap-1.5 bg-ink px-5 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-redd"
          >
            Unduh Surat
            <span aria-hidden="true">↗</span>
          </Link>
        </div>

        <button
          className="flex h-10 w-10 items-center justify-center md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="Buka menu navigasi"
        >
          <div className="space-y-1.5">
            <span className={`block h-0.5 w-6 bg-ink transition-transform ${open ? "translate-y-2 rotate-45" : ""}`} />
            <span className={`block h-0.5 w-6 bg-ink transition-opacity ${open ? "opacity-0" : ""}`} />
            <span className={`block h-0.5 w-6 bg-ink transition-transform ${open ? "-translate-y-2 -rotate-45" : ""}`} />
          </div>
        </button>
      </div>

      {open && (
        <div className="border-t border-ink/10 bg-cream md:hidden">
          <nav className="container-page flex flex-col gap-1 py-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`py-2.5 text-base ${
                  pathname === link.href ? "font-semibold text-redd" : "text-ink/80"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/arsip-surat"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex w-fit items-center gap-1.5 bg-ink px-5 py-2.5 text-sm font-semibold text-cream"
            >
              Unduh Surat ↗
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}