"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

const LABEL = {
  mimpi:       "Cerita Mimpi",
  tokoh:       "Tokoh yang Muncul",
  tempat:      "Tempat / Setting",
  simbol:      "Simbol / Objek Mencolok",
  angka:       "Angka",
  percakapan:  "Percakapan / Kata-kata",
  perasaan:    "Perasaan Dominan",
};

function LeadForm({ nama, refleksi }) {
  const [email, setEmail] = useState("");
  const [noWa, setNoWa] = useState("");
  const [kirimEmail, setKirimEmail] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(null);
  const [formError, setFormError] = useState(null);

  const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "";
  const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(
    `Halo Ade, saya ${nama}. Saya baru mencoba eksplorasi mimpi dan ingin mendalami lebih lanjut.`
  )}`;

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama, email, noWa, kirimEmail, refleksi }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengirim.");
      setSubmitted(data.emailTerkirim ? "email" : "no-email");
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-2xl p-6 mb-6 text-center" style={{ backgroundColor: "var(--cream-dark)" }}>
        <p className="text-sm font-semibold mb-1" style={{ color: "var(--navy)" }}>
          Terima kasih, {nama}!
        </p>
        <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
          {submitted === "email"
            ? "Refleksimu sudah dikirim ke email. Ade juga akan menghubungimu segera."
            : "Data kamu sudah diterima. Ade akan menghubungimu segera."
          }
        </p>
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-4 rounded-xl text-sm font-semibold"
          style={{ backgroundColor: "#25D366", color: "white" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Chat WhatsApp Sekarang
        </a>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-6 mb-6" style={{ backgroundColor: "var(--cream-dark)" }}>
      <p className="text-sm font-semibold mb-1" style={{ color: "var(--navy)" }}>
        Ingin mendalami lebih lanjut?
      </p>
      <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
        Tinggalkan emailmu — Ade akan menghubungimu untuk eksplorasi yang lebih dalam.
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="emailmu@contoh.com"
          required
          className="w-full px-4 py-3 rounded-xl text-sm outline-none"
          style={{
            border: "1.5px solid var(--cream-dark)",
            backgroundColor: "white",
            color: "var(--text-dark)",
            fontFamily: "var(--font-inter), sans-serif",
          }}
        />
        <input
          type="tel"
          value={noWa}
          onChange={(e) => setNoWa(e.target.value)}
          placeholder="No. WhatsApp (opsional, contoh: 08123456789)"
          className="w-full px-4 py-3 rounded-xl text-sm outline-none"
          style={{
            border: "1.5px solid var(--cream-dark)",
            backgroundColor: "white",
            color: "var(--text-dark)",
            fontFamily: "var(--font-inter), sans-serif",
          }}
        />
        {/* Checkbox kirim refleksi */}
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={kirimEmail}
            onChange={(e) => setKirimEmail(e.target.checked)}
            className="mt-0.5 accent-navy"
            style={{ accentColor: "var(--navy)", width: "16px", height: "16px", flexShrink: 0 }}
          />
          <span className="text-sm leading-relaxed" style={{ color: "var(--text-dark)" }}>
            Kirim refleksi ini ke emailku
          </span>
        </label>

        {formError && (
          <p className="text-xs" style={{ color: "#dc2626" }}>{formError}</p>
        )}
        <button
          type="submit"
          disabled={submitting || !email}
          className="w-full py-3 rounded-xl text-sm font-semibold disabled:opacity-40 transition-all"
          style={{ backgroundColor: "var(--navy)", color: "var(--gold)" }}
        >
          {submitting ? "Mengirim..." : "Kirim"}
        </button>
      </form>

      <div className="flex items-center gap-3 my-4">
        <div className="flex-1 h-px" style={{ backgroundColor: "var(--cream-dark)", filter: "brightness(0.9)" }} />
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>atau</span>
        <div className="flex-1 h-px" style={{ backgroundColor: "var(--cream-dark)", filter: "brightness(0.9)" }} />
      </div>

      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold"
        style={{ backgroundColor: "#25D366", color: "white" }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        Hubungi via WhatsApp
      </a>
    </div>
  );
}

function HasilContent() {
  const params = useSearchParams();
  const router = useRouter();

  const nama = params.get("nama") || "kamu";
  const elemen = Object.fromEntries(
    Object.keys(LABEL).map((k) => [k, params.get(k) || "—"])
  );

  const [refleksi, setRefleksi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function fetchRefleksi() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/refleksi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama, ...elemen }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memuat refleksi.");
      setRefleksi(data.refleksi);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRefleksi();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--cream)" }}>
      <header
        className="px-4 py-4 flex items-center justify-between border-b"
        style={{ backgroundColor: "var(--navy)", borderColor: "rgba(201,168,76,0.2)" }}
      >
        <span
          className="text-sm font-semibold tracking-widest uppercase"
          style={{ color: "var(--gold)", fontFamily: "var(--font-playfair), serif" }}
        >
          Hasil Eksplorasi
        </span>
      </header>

      <main className="flex-1 px-4 py-8 max-w-2xl mx-auto w-full">
        <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
          Halo, <strong style={{ color: "var(--navy)" }}>{nama}</strong>. Berikut elemen-elemen mimpimu yang sudah kita kumpulkan.
        </p>

        {/* Kartu elemen */}
        <div className="space-y-3 mb-8">
          {Object.entries(LABEL).map(([key, label]) => (
            <div
              key={key}
              className="rounded-xl px-4 py-4"
              style={{ backgroundColor: "white", boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}
            >
              <p className="text-xs tracking-wider uppercase mb-1" style={{ color: "var(--gold)" }}>
                {label}
              </p>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-dark)" }}>
                {elemen[key]}
              </p>
            </div>
          ))}
        </div>

        {/* Refleksi AI */}
        <div className="rounded-2xl p-6 mb-4" style={{ backgroundColor: "var(--navy)" }}>
          <p className="text-xs tracking-widest uppercase mb-4" style={{ color: "var(--gold)" }}>
            Refleksi
          </p>
          {loading && (
            <div className="flex gap-1 items-center">
              <span className="animate-bounce" style={{ color: "var(--gold)", animationDelay: "0ms" }}>·</span>
              <span className="animate-bounce" style={{ color: "var(--gold)", animationDelay: "150ms" }}>·</span>
              <span className="animate-bounce" style={{ color: "var(--gold)", animationDelay: "300ms" }}>·</span>
              <span className="text-xs ml-2" style={{ color: "rgba(201,168,76,0.6)" }}>
                Sedang merenungkan mimpimu...
              </span>
            </div>
          )}
          {error && (
            <div>
              <p className="text-sm mb-3" style={{ color: "rgba(250,248,245,0.6)" }}>
                {error}
              </p>
              <button
                onClick={fetchRefleksi}
                className="text-xs px-4 py-2 rounded-lg"
                style={{ backgroundColor: "rgba(201,168,76,0.2)", color: "var(--gold)" }}
              >
                Coba lagi
              </button>
            </div>
          )}
          {refleksi && (
            <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "rgba(250,248,245,0.85)" }}>
              {refleksi}
            </p>
          )}
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-center leading-relaxed mb-8" style={{ color: "var(--text-muted)" }}>
          Refleksi ini adalah bahan perenungan, bukan diagnosis klinis.
          Untuk eksplorasi lebih dalam, temui fasilitator.
        </p>

        {/* Lead form + WhatsApp */}
        <LeadForm nama={nama} refleksi={refleksi} />

        {/* Navigasi */}
        <div className="space-y-3">
          <button
            onClick={() => router.push("/sesi")}
            className="block w-full py-3 rounded-xl text-sm font-semibold"
            style={{ backgroundColor: "var(--navy)", color: "var(--gold)" }}
          >
            Mulai Sesi Baru
          </button>
          <button
            onClick={() => router.push("/")}
            className="block w-full py-3 rounded-xl text-sm"
            style={{ backgroundColor: "var(--cream-dark)", color: "var(--text-dark)" }}
          >
            Kembali ke Beranda
          </button>
        </div>
      </main>
    </div>
  );
}

export default function HasilPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--cream)" }}>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Memuat...</p>
      </div>
    }>
      <HasilContent />
    </Suspense>
  );
}
