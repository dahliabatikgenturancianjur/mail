// app/server.ts
import { showRoutes } from 'hono/dev'
import { createApp } from 'honox/server'
import PostalMime from 'postal-mime'

const app = createApp()

showRoutes(app)

export default {
  // 1. Menangani semua request web (halaman UI dan API)
  fetch: app.fetch,

  // 2. Menangani trigger dari Cloudflare Email Routing
  async email(message: any, env: any, ctx: any) {
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
  }
}
