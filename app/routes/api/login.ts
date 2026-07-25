// app/routes/api/login.ts
import { createRoute } from 'honox/factory'
import { setCookie } from 'hono/cookie'

export const POST = createRoute(async (c) => {
  try {
    const body = await c.req.json();
    const { username, password } = body;

    const validUser = c.env.MAILBOX_USERNAME;
    const validPass = c.env.MAILBOX_PASSWORD;

    if (username === validUser && password === validPass) {
      setCookie(c, 'mailbox_session', 'authenticated', {
        path: '/',
        secure: true,
        httpOnly: true,
        maxAge: 60 * 60 * 24 // Berlaku 1 hari
      });
      return c.json({ success: true }, 200);
    } else {
      return c.json({ error: 'Kredensial tidak valid. Silakan coba lagi.' }, 401);
    }
  } catch (error) {
    return c.json({ error: 'Terjadi kesalahan internal server.' }, 500);
  }
})
