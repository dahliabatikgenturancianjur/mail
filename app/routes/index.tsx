// app/routes/index.tsx
import { createRoute } from 'honox/factory'

export const GET = createRoute(async (c) => {
  const db = c.env.DB
  
  const { results } = await db.prepare("SELECT * FROM emails ORDER BY created_at DESC LIMIT 50").all()

  return c.render(
    <div class="legacy-container">
      <div class="header">
        <h1>Mailbox Personal</h1>
        <button onclick="document.cookie='mailbox_session=; Max-Age=0; path=/;'; window.location.reload();" class="text-sm text-red-600 hover:underline">Logout</button>
      </div>

      <div style="display: flex; gap: 30px;">
        <div style="flex: 1;">
          <h2>Kotak Masuk</h2>
          <ul class="email-list">
            {results.map((email: any) => (
              <li class="email-item">
                <div class="email-subject">{email.subject}</div>
                <div class="email-meta">Dari: {email.sender}</div>
                <div class="email-meta">Waktu: {new Date(email.created_at).toLocaleString('id-ID')}</div>
              </li>
            ))}
            {results.length === 0 && <p>Belum ada email masuk yang tercatat di database.</p>}
          </ul>
        </div>

        <div style="flex: 1; border-left: 1px solid #ddd; padding-left: 30px;">
          <h2>Tulis Pesan Baru</h2>
          <form id="send-form">
            <div class="form-group">
              <label for="to">Kirim Kepada</label>
              <input type="email" id="to" name="to" required placeholder="email@tujuan.com" />
            </div>
            <div class="form-group">
              <label for="subject">Subjek Pesan</label>
              <input type="text" id="subject" name="subject" required placeholder="Subjek email..." />
            </div>
            <div class="form-group">
              <label>Isi Pesan (HTML Editor)</label>
              <div id="editor-container"></div>
              <input type="hidden" id="body_html" name="body_html" />
            </div>
            <button type="submit" class="btn-legacy" id="submit-btn">Kirim Sekarang</button>
          </form>
          <div id="status-message" style="margin-top: 15px; font-weight: bold;"></div>
        </div>
      </div>

      <script src="https://cdn.quilljs.com/1.3.6/quill.js"></script>
      <script dangerouslySetInnerHTML={{ __html: `
        var quill = new Quill('#editor-container', {
          theme: 'snow',
          placeholder: 'Mulai menulis pesan Anda di sini...',
          modules: {
            toolbar: [
              ['bold', 'italic', 'underline', 'strike'],
              ['blockquote', 'code-block'],
              [{ 'header': 1 }, { 'header': 2 }],
              [{ 'list': 'ordered'}, { 'list': 'bullet' }],
              [{ 'color': [] }, { 'background': [] }],
              ['link', 'image'],
              ['clean']
            ]
          }
        });

        document.getElementById('send-form').addEventListener('submit', async function(e) {
          e.preventDefault();
          var btn = document.getElementById('submit-btn');
          var status = document.getElementById('status-message');
          
          btn.disabled = true;
          btn.textContent = 'Memproses Pengiriman...';
          status.textContent = '';
          status.style.color = 'black';

          document.getElementById('body_html').value = quill.root.innerHTML;

          var formData = new FormData(this);
          var data = {
            to: formData.get('to'),
            subject: formData.get('subject'),
            body_html: formData.get('body_html')
          };

          try {
            var response = await fetch('/api/send', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(data)
            });

            var result = await response.json();
            
            if (response.ok) {
              status.textContent = 'Email sukses dikirim melalui Brevo!';
              status.style.color = 'green';
              this.reset();
              quill.root.innerHTML = '';
            } else {
              status.textContent = 'Gagal mengirim email: ' + (result.error || 'Kesalahan sistem');
              status.style.color = 'red';
            }
          } catch (err) {
            status.textContent = 'Terjadi kesalahan jaringan atau server.';
            status.style.color = 'red';
          } finally {
            btn.disabled = false;
            btn.textContent = 'Kirim Sekarang';
          }
        });
      ` }} />
    </div>,
    { title: 'Mailbox Modern (Cloudflare & Brevo)' }
  )
})
