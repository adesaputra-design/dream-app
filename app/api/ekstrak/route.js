import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request) {
  try {
    const { nama, mimpi, history } = await request.json();

    const percakapan = (history || [])
      .map((m) => `${m.role === "user" ? nama : "Pendamping"}: ${m.content}`)
      .join("\n");

    const prompt = `Berdasarkan percakapan eksplorasi mimpi berikut, ekstrak elemen-elemen mimpi yang disebutkan.

Cerita mimpi awal:
${mimpi}

Percakapan identifikasi elemen:
${percakapan}

Ekstrak dan kembalikan dalam format JSON berikut (isi dengan apa yang disebutkan, tulis "tidak disebutkan" jika memang tidak ada):
{
  "tokoh": "...",
  "tempat": "...",
  "simbol": "...",
  "angka": "...",
  "percakapan": "...",
  "perasaan": "..."
}

Hanya kembalikan JSON, tanpa penjelasan lain.`;

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 400,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = response.content[0].text.trim();
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Format JSON tidak valid.");

    const elemen = JSON.parse(jsonMatch[0]);
    return Response.json({ elemen });
  } catch (error) {
    console.error("Ekstrak API error:", error);
    return Response.json(
      { error: "Gagal mengekstrak elemen." },
      { status: 500 }
    );
  }
}
