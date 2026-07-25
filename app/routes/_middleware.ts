// app/routes/_middleware.ts
import { getCookie } from 'hono/cookie'
import { createMiddleware } from 'hono/factory'

export default [
  createMiddleware(async (c, next) => {
    // Ambil path, pastikan membersihkan trailing slash jika ada
    let currentPath = c.req.path;
    if (currentPath.endsWith('/') && currentPath.length > 1) {
      currentPath = currentPath.slice(0, -1);
    }

    // Pengecualian mutlak: Biarkan rute ini lewat tanpa pengecekan cookie
    if (
      currentPath === '/login' || 
      currentPath === '/api/login' || 
      currentPath === '/api/inbound'
    ) {
      return next();
    }

    const authCookie = getCookie(c, 'mailbox_session');
    
    // Jika ada cookie valid, izinkan masuk ke halaman utama
    if (authCookie === 'authenticated') {
      return next();
    }

    // Selain itu, tendang ke halaman login
    return c.redirect('/login');
  })
];
