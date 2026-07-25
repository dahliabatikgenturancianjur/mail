// app/server.ts
import { createApp } from 'honox/server'
import PostalMime from 'postal-mime'

const app = createApp();

// Injeksi fungsi email langsung ke dalam instance aplikasi.
// Tanda titik koma (;) pada akhir createApp() di atas sangat penting agar tidak terjadi error kompilasi.
(app as any).email = async (message: any, env: any, ctx: any) => {
  try {
    const rawEmail = await new Response(message.raw).arrayBuffer();
    const parser = new PostalMime();
    const parsedEmail = await parser.parse(rawEmail);

    const id = crypto.randomUUID();
    const sender = message.from;
    const recipient = message.to;
    const subject = parsedEmail.subject || '(Tanpa Subjek)';
    const body_text = parsedEmail.text || '';
    const body_html = parsedEmail.html || '';

    const stmt = env.DB.prepare(
      "INSERT INTO emails (id, sender, recipient, subject, body_text, body_html) VALUES (?, ?, ?, ?, ?, ?)"
    ).bind(id, sender, recipient, subject, body_text, body_html);

    await stmt.run();
  } catch (error) {
    console.error("Gagal memproses email masuk:", error);
  }
};

// WAJIB export default app agar HonoX bisa memetakan seluruh rute (menghindari error .map)
export default app;
