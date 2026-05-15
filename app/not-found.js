import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ backgroundColor: "var(--navy)" }}>
      <p className="text-xs tracking-widest uppercase mb-4" style={{ color: "var(--gold)" }}>
        404
      </p>
      <h1 className="text-3xl font-bold mb-4" style={{ fontFamily: "var(--font-playfair), serif", color: "var(--cream)" }}>
        Halaman tidak ditemukan
      </h1>
      <p className="text-sm mb-8" style={{ color: "rgba(250,248,245,0.6)" }}>
        Seperti mimpi yang tak bisa diingat kembali.
      </p>
      <Link
        href="/"
        className="px-8 py-3 rounded-full text-sm font-semibold"
        style={{ backgroundColor: "var(--gold)", color: "var(--navy)" }}
      >
        Kembali ke Beranda
      </Link>
    </main>
  );
}
