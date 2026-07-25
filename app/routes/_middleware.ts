// app/routes/_middleware.ts
import { getCookie } from 'hono/cookie'
import { createMiddleware } from 'hono/factory'

export default [
  createMiddleware(async (c, next) => {
    if (c.req.path === '/login' || c.req.path === '/api/login') {
      return next();
    }

    const authCookie = getCookie(c, 'mailbox_session');
    
    if (authCookie === 'authenticated') {
      return next();
    }

    return c.redirect('/login');
  })
];
