// app/global.d.ts
import {} from 'hono'

type Head = {
  title?: string
}

declare module 'hono' {
  interface Env {
    Variables: {}
    Bindings: {
      DB: D1Database
      BREVO_API_KEY: string
      MAILBOX_USERNAME: string
      MAILBOX_PASSWORD: string
    }
  }
  interface ContextRenderer {
    (content: string | Promise<string>, head?: Head): Response | Promise<Response>
  }
}
