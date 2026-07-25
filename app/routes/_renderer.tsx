// app/routes/_renderer.tsx
import { jsxRenderer } from 'hono/jsx-renderer'

export default jsxRenderer(({ children, title }) => {
  return (
    <html lang="id">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title || 'Mailbox Cloudflare'}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.quilljs.com/1.3.6/quill.snow.css" rel="stylesheet" />
        <style>
          {`
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f9; }
            .legacy-container { max-width: 1000px; margin: auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #ddd; padding-bottom: 10px; margin-bottom: 20px; }
            .email-list { list-style: none; padding: 0; margin: 0; height: 500px; overflow-y: auto; }
            .email-item { padding: 15px; border-bottom: 1px solid #eee; }
            .email-item:hover { background-color: #f9f9f9; cursor: pointer; }
            .email-subject { font-weight: bold; font-size: 1.1em; color: #333; }
            .email-meta { font-size: 0.85em; color: #666; margin-top: 5px; }
            .form-group { margin-bottom: 15px; }
            .form-group label { display: block; margin-bottom: 5px; font-weight: bold; color: #444; }
            .form-group input { width: 100%; padding: 10px; box-sizing: border-box; border: 1px solid #ccc; border-radius: 4px; }
            #editor-container { height: 250px; margin-bottom: 15px; background: white; }
            .btn-legacy { background-color: #007bff; color: white; border: none; padding: 10px 20px; cursor: pointer; border-radius: 4px; font-weight: bold; }
            .btn-legacy:hover { background-color: #0056b3; }
            .btn-legacy:disabled { background-color: #aaa; cursor: not-allowed; }
          `}
        </style>
      </head>
      <body>
        {children}
      </body>
    </html>
  )
})
