// app/routes/_middleware.ts
import { basicAuth } from 'hono/basic-auth'
import { createMiddleware } from 'hono/factory'

export default createMiddleware(async (c, next) => {
  const username = c.env.MAILBOX_USERNAME;
  const password = c.env.MAILBOX_PASSWORD;

  // Proteksi ganda: Jika lupa mengatur environment variable, kunci seluruh sistem
  if (!username || !password) {
    return c.text("Kesalahan Sistem: Username dan Password belum dikonfigurasi di Environment Variables.", 500);
  }

  const auth = basicAuth({
    username: username,
    password: password,
  });

  return auth(c, next);
});
