import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const { nama, email, noWa, kirimEmail, refleksi } = await request.json();

    if (!email || !email.includes("@")) {
      return Response.json({ error: "Email tidak valid." }, { status: 400 });
    }

    const namaParts = nama.trim().split(/\s+/);
    const firstName = namaParts[0] || nama;
    const lastName = namaParts.slice(1).join(" ") || "";

    const bodyParams = {
      api_token: process.env.MAILKETING_API_TOKEN,
      list_id: process.env.MAILKETING_LIST_ID,
      email,
      first_name: firstName,
      last_name: lastName,
    };

    if (noWa && noWa.trim()) {
      bodyParams.mobile = noWa.trim();
    }

    const mailketingRes = await fetch("https://api.mailketing.co.id/api/v1/addsubtolist", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(bodyParams).toString(),
    });

    const mailketingData = await mailketingRes.json();
    if (mailketingData.status !== "success") {
      throw new Error(mailketingData.response || "Gagal mendaftarkan kontak.");
    }

    // Kirim email refleksi jika diminta — error tidak membatalkan keseluruhan request
    let emailTerkirim = false;
    if (kirimEmail && refleksi) {
      try {
        await resend.emails.send({
          from: "Ade Saputra <onboarding@resend.dev>",
          to: email,
          subject: `Refleksi Mimpimu, ${firstName}`,
          html: `
            <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #faf8f5; padding: 40px 32px;">
              <p style="font-size: 12px; letter-spacing: 3px; text-transform: uppercase; color: #c9a84c; margin-bottom: 8px;">
                Ade Saputra · Psikoterapi Psikoanalisis
              </p>
              <h1 style="font-size: 24px; color: #1a1f3c; margin-bottom: 24px; font-weight: bold;">
                Refleksi Mimpimu
              </h1>
              <p style="font-size: 15px; color: #4b5563; margin-bottom: 24px;">
                Halo <strong>${firstName}</strong>, berikut refleksi dari eksplorasi mimpimu hari ini.
              </p>
              <div style="background: #1a1f3c; border-radius: 16px; padding: 28px 24px; margin-bottom: 28px;">
                <p style="font-size: 12px; letter-spacing: 3px; text-transform: uppercase; color: #c9a84c; margin-bottom: 16px;">
                  Refleksi
                </p>
                <p style="font-size: 15px; color: rgba(250,248,245,0.85); line-height: 1.8; white-space: pre-wrap; margin: 0;">
                  ${refleksi}
                </p>
              </div>
              <div style="border-top: 1px solid #e5e0d8; padding-top: 24px;">
                <p style="font-size: 12px; color: #9ca3af; line-height: 1.6; margin-bottom: 16px;">
                  Refleksi ini adalah bahan perenungan, bukan diagnosis klinis. Untuk eksplorasi lebih dalam, temui fasilitator.
                </p>
                <a href="https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}"
                   style="display: inline-block; background: #25D366; color: white; padding: 12px 24px; border-radius: 8px; font-size: 14px; text-decoration: none; font-weight: 600;">
                  Hubungi Ade via WhatsApp
                </a>
              </div>
            </div>
          `,
        });
        emailTerkirim = true;
      } catch (emailError) {
        console.error("Resend error (non-fatal):", emailError);
      }
    }

    return Response.json({ success: true, emailTerkirim });
  } catch (error) {
    console.error("Lead API error:", error);
    return Response.json(
      { error: "Gagal mengirim data. Silakan coba lagi." },
      { status: 500 }
    );
  }
}
