"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

// Urutan langkah percakapan terpandu
const STEPS = [
  { key: "nama",       pertanyaan: null }, // langkah awal: sambutan
  { key: "mimpi",      pertanyaan: (nama) => `Terima kasih, ${nama}.\n\nSekarang — ceritakan mimpimu. Tulis apa yang kamu ingat, sebisanya, tanpa disaring. Tidak perlu rapi, tidak perlu lengkap.` },
  { key: "tokoh",      pertanyaan: () => "Siapa saja yang muncul dalam mimpi itu? Bisa orang yang kamu kenal, orang asing, atau bahkan sosok yang tidak jelas wajahnya." },
  { key: "tempat",     pertanyaan: () => "Di mana mimpi itu terjadi? Gambarkan tempatnya, meski samar." },
  { key: "simbol",     pertanyaan: () => "Adakah benda, objek, atau simbol yang terasa mencolok atau tidak biasa dalam mimpi itu?" },
  { key: "angka",      pertanyaan: () => "Adakah angka yang muncul — entah kamu lihat, dengar, atau rasakan kehadirannya?" },
  { key: "percakapan", pertanyaan: () => "Adakah percakapan atau kata-kata yang kamu ingat dari mimpi itu?" },
  { key: "perasaan",   pertanyaan: () => "Apa perasaan yang paling dominan selama atau setelah mimpi itu? Bisa satu kata atau lebih." },
  { key: "selesai",    pertanyaan: null }, // langkah akhir: transisi ke hasil
];

const SAMBUTAN =
  "Halo. Selamat datang di ruang eksplorasi mimpi.\n\nAku di sini untuk menemanimu menelusuri apa yang hadir dalam tidurmu.\n\nTidak ada yang benar atau salah dalam proses ini. Kita hanya akan melihat bersama — apa yang muncul, apa yang kamu rasakan, dan apa yang mungkin ingin disampaikan oleh mimpimu.\n\nSebelum kita mulai, boleh aku tahu namamu?";

function ekstrakNama(teks) {
  const t = teks.trim();
  // Pola Indonesia umum: "nama saya adalah X", "nama saya X", "namaku X", "saya X", "panggil saya X", "aku X"
  const pola = [
    /nama\s+saya\s+adalah\s+(.+)/i,
    /nama\s+saya\s+(.+)/i,
    /nama\s*ku\s+(.+)/i,
    /namaku\s+(.+)/i,
    /panggil\s+(?:aku|saya)\s+(.+)/i,
    /saya\s+(.+)/i,
    /aku\s+(.+)/i,
    /nama\s*:\s*(.+)/i,
    /nama\s+(.+)/i,
  ];
  for (const re of pola) {
    const m = t.match(re);
    if (m) {
      const nama = m[1].trim().replace(/[.,!?]+$/, "");
      // Ambil kata pertama saja jika hasilnya masih kalimat panjang
      const kata = nama.split(/\s+/);
      const hasil = kata.length <= 3 ? nama : kata[0];
      return hasil.charAt(0).toUpperCase() + hasil.slice(1);
    }
  }
  // Tidak ada pola — gunakan input langsung (asumsi sudah nama)
  const kata = t.split(/\s+/);
  const hasil = kata.length <= 3 ? t : kata[0];
  return hasil.charAt(0).toUpperCase() + hasil.slice(1);
}

export default function SesiPage() {
  const router = useRouter();
  const [messages, setMessages] = useState([{ id: "0", role: "assistant", content: SAMBUTAN }]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [stepIndex, setStepIndex] = useState(0); // indeks di STEPS
  const [elemen, setElemen] = useState({}); // menyimpan jawaban per key
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!isLoading) inputRef.current?.focus();
  }, [isLoading]);

  function addMessage(role, content) {
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString() + Math.random(), role, content },
    ]);
  }

  function handleSend() {
    const text = input.trim();
    if (!text || isLoading) return;

    addMessage("user", text);
    setInput("");
    setIsLoading(true);

    const currentStep = STEPS[stepIndex];
    const nextStepIndex = stepIndex + 1;
    const nextStep = STEPS[nextStepIndex];

    // Simpan jawaban langkah ini — ekstrak nama jika langkah ini adalah "nama"
    const nilaiDisimpan = currentStep.key === "nama" ? ekstrakNama(text) : text;
    const newElemen = { ...elemen, [currentStep.key]: nilaiDisimpan };
    setElemen(newElemen);

    setTimeout(() => {
      if (!nextStep || nextStep.key === "selesai") {
        // Semua elemen terkumpul — kirim ke halaman hasil
        const params = new URLSearchParams();
        Object.entries(newElemen).forEach(([k, v]) => params.set(k, v));
        setIsLoading(false);
        router.push(`/hasil?${params.toString()}`);
      } else {
        const nama = newElemen.nama || ekstrakNama(text);
        addMessage("assistant", nextStep.pertanyaan(nama));
        setStepIndex(nextStepIndex);
        setIsLoading(false);
      }
    }, 700);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  // Label progres
  const stepLabels = ["Nama", "Mimpi", "Tokoh", "Tempat", "Simbol", "Angka", "Percakapan", "Perasaan"];
  const progressPct = Math.min((stepIndex / (STEPS.length - 2)) * 100, 100);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--cream)" }}>
      {/* Top bar */}
      <header
        className="px-4 py-4 flex items-center justify-between border-b"
        style={{ backgroundColor: "var(--navy)", borderColor: "rgba(201,168,76,0.2)" }}
      >
        <button
          onClick={() => router.push("/")}
          className="text-xs tracking-wider"
          style={{ color: "rgba(201,168,76,0.7)" }}
        >
          ← Kembali
        </button>
        <span
          className="text-sm font-semibold tracking-widest uppercase"
          style={{ color: "var(--gold)", fontFamily: "var(--font-playfair), serif" }}
        >
          Telusuri Mimpi
        </span>
        <span className="text-xs" style={{ color: "rgba(201,168,76,0.5)" }}>
          {Math.min(stepIndex, stepLabels.length - 1) + 1}/{stepLabels.length}
        </span>
      </header>

      {/* Progress bar */}
      <div style={{ backgroundColor: "var(--navy-light)", height: "3px" }}>
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${progressPct}%`, backgroundColor: "var(--gold)" }}
        />
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 max-w-2xl w-full mx-auto">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className="max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap"
              style={
                msg.role === "user"
                  ? { backgroundColor: "var(--navy)", color: "var(--cream)", borderBottomRightRadius: "4px" }
                  : { backgroundColor: "white", color: "var(--text-dark)", borderBottomLeftRadius: "4px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }
              }
            >
              {msg.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div
              className="px-4 py-3 rounded-2xl"
              style={{ backgroundColor: "white", borderBottomLeftRadius: "4px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}
            >
              <span className="flex gap-1 items-center" style={{ color: "var(--gold)" }}>
                <span className="animate-bounce" style={{ animationDelay: "0ms" }}>·</span>
                <span className="animate-bounce" style={{ animationDelay: "150ms" }}>·</span>
                <span className="animate-bounce" style={{ animationDelay: "300ms" }}>·</span>
              </span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div
        className="px-4 py-4 border-t"
        style={{ backgroundColor: "white", borderColor: "var(--cream-dark)" }}
      >
        <div className="max-w-2xl mx-auto flex gap-3 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tulis di sini..."
            rows={1}
            disabled={isLoading}
            className="flex-1 resize-none rounded-xl px-4 py-3 text-sm outline-none"
            style={{
              backgroundColor: "var(--cream)",
              border: "1.5px solid var(--cream-dark)",
              color: "var(--text-dark)",
              fontFamily: "var(--font-inter), sans-serif",
              maxHeight: "120px",
            }}
            onInput={(e) => {
              e.target.style.height = "auto";
              e.target.style.height = e.target.scrollHeight + "px";
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-150 disabled:opacity-40"
            style={{ backgroundColor: "var(--navy)", color: "var(--gold)", fontFamily: "var(--font-inter), sans-serif" }}
          >
            Kirim
          </button>
        </div>
        <p className="text-center text-xs mt-3" style={{ color: "var(--text-muted)" }}>
          Enter untuk kirim · Shift+Enter untuk baris baru
        </p>
      </div>
    </div>
  );
}
