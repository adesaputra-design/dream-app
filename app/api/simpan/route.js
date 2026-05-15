const NOTION_VERSION = "2022-06-28";

function teks(str) {
  const content = (str || "").slice(0, 2000);
  return { rich_text: [{ text: { content } }] };
}

export async function POST(request) {
  try {
    const { nama, mimpi, elemen, refleksi } = await request.json();

    const body = {
      parent: { database_id: process.env.NOTION_DATABASE_ID },
      properties: {
        Nama: { title: [{ text: { content: (nama || "").slice(0, 2000) } }] },
        Tanggal: { date: { start: new Date().toISOString() } },
        Mimpi: teks(mimpi),
        Tokoh: teks(elemen?.tokoh),
        Tempat: teks(elemen?.tempat),
        Simbol: teks(elemen?.simbol),
        Angka: teks(elemen?.angka),
        Percakapan: teks(elemen?.percakapan),
        Perasaan: teks(elemen?.perasaan),
        Refleksi: teks(refleksi),
      },
    };

    const res = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.NOTION_API_TOKEN}`,
        "Content-Type": "application/json",
        "Notion-Version": NOTION_VERSION,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Notion API error");
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Simpan API error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
