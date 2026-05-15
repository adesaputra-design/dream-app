import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--navy)" }}>
      {/* Header */}
      <header className="px-6 py-6 flex items-center justify-between">
        <span
          className="text-sm tracking-widest uppercase"
          style={{ color: "var(--gold)", fontFamily: "var(--font-inter), sans-serif" }}
        >
          Ade Saputra
        </span>
        <span
          className="text-xs tracking-wider"
          style={{ color: "rgba(201,168,76,0.6)" }}
        >
          Psikoterapi Psikoanalisis
        </span>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
        <p
          className="text-xs tracking-widest uppercase mb-6"
          style={{ color: "var(--gold)" }}
        >
          Eksplorasi Mimpi
        </p>

        <h1
          className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight"
          style={{
            fontFamily: "var(--font-playfair), serif",
            color: "var(--cream)",
          }}
        >
          Mimpimu menyimpan
          <br />
          <span style={{ color: "var(--gold)" }}>sesuatu yang penting</span>
        </h1>

        <p
          className="text-base sm:text-lg max-w-xl mb-3 leading-relaxed"
          style={{ color: "rgba(250,248,245,0.75)" }}
        >
          Mimpi bukan sekadar gangguan tidur. Ia adalah pesan dari bagian
          dirimu yang belum sempat berbicara saat terjaga.
        </p>
        <p
          className="text-base sm:text-lg max-w-xl mb-12 leading-relaxed"
          style={{ color: "rgba(250,248,245,0.75)" }}
        >
          Dalam beberapa menit, kita akan menelusuri mimpimu bersama —
          menyajikannya, mengidentifikasi elemen-elemennya, dan membaca
          apa yang mungkin sedang ingin disampaikan.
        </p>

        <Link
          href="/sesi"
          className="inline-block px-10 py-4 rounded-full text-sm font-semibold tracking-wider uppercase transition-all duration-200 hover:scale-105"
          style={{
            backgroundColor: "var(--gold)",
            color: "var(--navy)",
            fontFamily: "var(--font-inter), sans-serif",
          }}
        >
          Mulai Telusuri Mimpi
        </Link>

        <p
          className="mt-10 text-xs max-w-sm leading-relaxed"
          style={{ color: "rgba(250,248,245,0.4)" }}
        >
          Eksplorasi ini adalah bahan refleksi, bukan diagnosis klinis.
          Semua hasil bersifat pribadi dan tidak disimpan.
        </p>
      </section>

      {/* Footer */}
      <footer className="px-6 py-6 text-center">
        <p
          className="text-xs"
          style={{ color: "rgba(201,168,76,0.4)" }}
        >
          © 2025 Ade Saputra · Psikoterapi Psikoanalisis
        </p>
      </footer>
    </main>
  );
}
