"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

// Tahap 1: scripted (nama + mimpi)
const SAMBUTAN =
  "Halo. Selamat datang di ruang eksplorasi mimpi.\n\nAku di sini untuk menemanimu menelusuri apa yang hadir dalam tidurmu.\n\nTidak ada yang benar atau salah dalam proses ini. Kita hanya akan melihat bersama — apa yang muncul, apa yang kamu rasakan, dan apa yang mungkin ingin disampaikan oleh mimpimu.\n\nSebelum kita mulai, boleh aku tahu namamu?";

function ekstrakNama(teks) {
  const t = teks.trim();
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
      const kata = nama.split(/\s+/);
      const hasil = kata.length <= 3 ? nama : kata[0];
      return hasil.charAt(0).toUpperCase() + hasil.slice(1);
    }
  }
  const kata = t.split(/\s+/);
  const hasil = kata.length <= 3 ? t : kata[0];
  return hasil.charAt(0).toUpperCase() + hasil.slice(1);
}

// fase: "nama" | "mimpi" | "ai" | "ekstrak"
export default function SesiPage() {
  const router = useRouter();
  const [messages, setMessages] = useState([{ id: "0", role: "assistant", content: SAMBUTAN }]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [fase, setFase] = useState("nama");
  const [nama, setNama] = useState("");
  const [mimpi, setMimpi] = useState("");
  const [aiHistory, setAiHistory] = useState([]); // riwayat Tahap 2
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

  // Hitung progres
  const totalSteps = 10; // estimasi max pesan AI
  const progressPct = fase === "nama" ? 10
    : fase === "mimpi" ? 20
    : fase === "ekstrak" ? 95
    : Math.min(20 + (aiHistory.filter(m => m.role === "user").length / 6) * 75, 90);

  async function handleSend() {
    const text = input.trim();
    if (!text || isLoading) return;

    addMessage("user", text);
    setInput("");
    setIsLoading(true);

    if (fase === "nama") {
      const namaDiekstrak = ekstrakNama(text);
      setNama(namaDiekstrak);
      setTimeout(() => {
        addMessage("assistant",
          `Terima kasih, ${namaDiekstrak}.\n\nSekarang — ceritakan mimpimu. Tulis apa yang kamu ingat, sebisanya, tanpa disaring. Tidak perlu rapi, tidak perlu lengkap.`
        );
        setFase("mimpi");
        setIsLoading(false);
      }, 700);
      return;
    }

    if (fase === "mimpi") {
      setMimpi(text);
      // Mulai Tahap 2 — panggil AI untuk pertanyaan pertama
      await kirimKeAI(text, nama, []);
      setFase("ai");
      return;
    }

    if (fase === "ai") {
      // Tambah pesan user ke history AI
      const historyBaru = [...aiHistory, { role: "user", content: text }];
      setAiHistory(historyBaru);
      await kirimKeAI(mimpi, nama, historyBaru);
    }
  }

  async function kirimKeAI(mimpiTeks, namaPengguna, history) {
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama: namaPengguna, mimpi: mimpiTeks, history }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Gagal mendapat respons.");

      addMessage("assistant", data.teks);

      const historyDenganAI = [...history, { role: "assistant", content: data.teks }];
      setAiHistory(historyDenganAI);

      if (data.selesai) {
        setFase("ekstrak");
        await ekstrakDanNavigasi(mimpiTeks, namaPengguna, historyDenganAI);
      }
    } catch (err) {
      addMessage("assistant", "Maaf, ada gangguan koneksi. Silakan coba kirim ulang pesanmu.");
    } finally {
      setIsLoading(false);
    }
  }

  async function ekstrakDanNavigasi(mimpiTeks, namaPengguna, history) {
    try {
      const res = await fetch("/api/ekstrak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama: namaPengguna, mimpi: mimpiTeks, history }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const params = new URLSearchParams({
        nama: namaPengguna,
        ...data.elemen,
      });
      router.push(`/hasil?${params.toString()}`);
    } catch {
      router.push(`/hasil?nama=${encodeURIComponent(namaPengguna)}&mimpi=${encodeURIComponent(mimpiTeks)}`);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const placeholder = fase === "nama" ? "Tulis namamu di sini..."
    : fase === "mimpi" ? "Ceritakan mimpimu di sini..."
    : "Tulis jawabanmu di sini...";

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
          {fase === "ekstrak" ? "Menyusun hasil..." : ""}
        </span>
      </header>

      {/* Progress bar */}
      <div style={{ backgroundColor: "var(--navy-light)", height: "3px" }}>
        <div
          className="h-full transition-all duration-700"
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
            placeholder={placeholder}
            rows={1}
            disabled={isLoading || fase === "ekstrak"}
            className="flex-1 resize-none rounded-xl px-4 py-3 text-sm outline-none disabled:opacity-50"
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
            disabled={!input.trim() || isLoading || fase === "ekstrak"}
            className="px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-150 disabled:opacity-40"
            style={{ backgroundColor: "var(--navy)", color: "var(--gold)", fontFamily: "var(--font-inter), sans-serif" }}
          >
            Kirim
          </button>
        </div>
        <p className="text-center text-xs mt-3" style={{ color: "var(--text-muted)" }}>
          {fase === "ekstrak" ? "Sedang menyusun hasilmu..." : "Enter untuk kirim · Shift+Enter untuk baris baru"}
        </p>
      </div>
    </div>
  );
}
