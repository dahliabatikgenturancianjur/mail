// app/routes/api/send.ts
import { createRoute } from 'honox/factory'

export const POST = createRoute(async (c) => {
  try {
    const body = await c.req.json();
    const { to, subject, body_html } = body;
    const apiKey = c.env.BREVO_API_KEY;

    if (!to || !subject || !body_html) {
      return c.json({ error: 'Atribut "to", "subject", dan "body_html" wajib dilampirkan.' }, 400);
    }

    if (!apiKey) {
      return c.json({ error: 'Sistem belum dikonfigurasi dengan API Key Brevo.' }, 500);
    }

    const payload = {
      sender: { name: "Pengirim Mailbox", email: "noreply@domainanda.com" },
      to: [{ email: to }],
      subject: subject,
      htmlContent: body_html
    };

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': apiKey
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.text();
      return c.json({ error: `Kegagalan dari Brevo API: ${errorData}` }, response.status);
    }

    const responseData = await response.json();
    return c.json({ success: true, data: responseData }, 200);

  } catch (error: any) {
    return c.json({ error: error.message || 'Terjadi kesalahan internal pada Endpoint API Hono.' }, 500);
  }
})
