// app/routes/api/inbound.ts
import { createRoute } from 'honox/factory'
import PostalMime from 'postal-mime'

export const POST = createRoute(async (c) => {
  const secret = c.req.header('X-Mailbox-Secret');
  if (secret !== c.env.MAILBOX_PASSWORD) {
    return c.json({ error: 'Akses ditolak. Password rahasia tidak cocok.' }, 401);
  }

  try {
    const rawEmail = await c.req.arrayBuffer();
    const parser = new PostalMime();
    const parsedEmail = await parser.parse(rawEmail);

    const id = crypto.randomUUID();
    const sender = parsedEmail.from?.address || 'unknown';
    const recipient = parsedEmail.to?.[0]?.address || 'unknown';
    const subject = parsedEmail.subject || '(Tanpa Subjek)';
    const body_text = parsedEmail.text || '';
    const body_html = parsedEmail.html || '';

    const stmt = c.env.DB.prepare(
      "INSERT INTO emails (id, sender, recipient, subject, body_text, body_html) VALUES (?, ?, ?, ?, ?, ?)"
    ).bind(id, sender, recipient, subject, body_text, body_html);

    await stmt.run();

    return c.json({ success: true }, 200);
  } catch (error: any) {
    return c.json({ error: error.message || 'Gagal memproses email masuk.' }, 500);
  }
})
