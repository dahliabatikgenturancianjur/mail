// app/routes/index.tsx
import { createRoute } from 'honox/factory'

export const GET = createRoute(async (c) => {
  const db = c.env.DB
  
  // Logika Paginasi
  const limit = 50;
  const pageParam = c.req.query('page');
  const currentPage = pageParam && !isNaN(parseInt(pageParam)) ? parseInt(pageParam) : 1;
  const offset = (currentPage - 1) * limit;

  // Menghitung total data untuk navigasi
  const totalCountResult = await db.prepare("SELECT COUNT(*) as count FROM emails").first();
  const totalItems = (totalCountResult?.count as number) || 0;
  const totalPages = Math.ceil(totalItems / limit);
  
  // Mengambil data berdasarkan offset dan limit
  const { results } = await db.prepare("SELECT * FROM emails ORDER BY created_at DESC LIMIT ? OFFSET ?").bind(limit, offset).all()

  return c.render(
    <div class="legacy-container">
      <div class="header">
        <h1>Mailbox Personal</h1>
        <button onclick="document.cookie='mailbox_session=; Max-Age=0; path=/;'; window.location.reload();" class="text-sm text-red-600 hover:underline">Logout</button>
      </div>

      <div style="display: flex; gap: 30px;">
        <div style="flex: 1; position: relative;">
          <h2>Kotak Masuk</h2>
          <ul class="email-list" style="height: 450px;">
            {results.map((email: any) => (
              <li class="email-item" onclick={`openEmailModal('${email.id}')`}>
                <div class="email-subject">{email.subject}</div>
                <div class="email-meta">Dari: {email.sender}</div>
                <div class="email-meta">Waktu: {new Date(email.created_at).toLocaleString('id-ID')}</div>
                
                {/* Menyimpan data rahasia untuk diambil oleh JavaScript Modal */}
                <div id={`email-content-${email.id}`} style="display: none;">
                  <div class="modal-sender"><b>Dari:</b> {email.sender}</div>
                  <div class="modal-recipient"><b>Kepada:</b> {email.recipient}</div>
                  <div class="modal-time"><b>Waktu:</b> {new Date(email.created_at).toLocaleString('id-ID')}</div>
                  <hr style="margin: 10px 0;" />
                  {/* Gunakan body_html jika ada, jika tidak gunakan body_text, atau kosong */}
                  <div class="modal-body" dangerouslySetInnerHTML={{ __html: email.body_html || email.body_text || '<i>(Isi pesan kosong)</i>' }}></div>
                </div>
              </li>
            ))}
            {results.length === 0 && <p>Belum ada email masuk yang tercatat di database.</p>}
          </ul>

          {/* Kontrol Paginasi */}
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 15px; padding-top: 10px; border-top: 1px solid #eee;">
            <a href={`/?page=${currentPage - 1}`} style={{ visibility: currentPage > 1 ? 'visible' : 'hidden', textDecoration: 'none', color: '#007bff', fontWeight: 'bold' }}>
              &laquo; Sebelumnya
            </a>
            <span style={{ fontSize: '0.9em', color: '#666' }}>
              Halaman {currentPage} dari {totalPages || 1}
            </span>
            <a href={`/?page=${currentPage + 1}`} style={{ visibility: currentPage < totalPages ? 'visible' : 'hidden', textDecoration: 'none', color: '#007bff', fontWeight: 'bold' }}>
              Selanjutnya &raquo;
            </a>
          </div>
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

      {/* Modal Element (Disembunyikan secara default) */}
      <div id="email-modal" style="display: none; position: fixed; z-index: 100; left: 0; top: 0; width: 100%; height: 100%; overflow: auto; background-color: rgba(0,0,0,0.5);">
        <div style="background-color: #fefefe; margin: 10% auto; padding: 20px; border: 1px solid #888; width: 80%; max-width: 800px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.2);">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #ddd; padding-bottom: 10px; margin-bottom: 15px;">
            <h2 id="modal-title" style="margin: 0; color: #333;">Subjek Email</h2>
            <span id="close-modal" style="color: #aaa; font-size: 28px; font-weight: bold; cursor: pointer;">&times;</span>
          </div>
          <div id="modal-content-area" style="font-size: 0.95em; line-height: 1.5; color: #444; max-height: 60vh; overflow-y: auto; padding-right: 10px;">
            {/* Isi email akan diinjeksi ke sini oleh JavaScript */}
          </div>
        </div>
      </div>

      <script src="https://cdn.quilljs.com/1.3.6/quill.js"></script>
      <script dangerouslySetInnerHTML={{ __html: `
        // --- Skrip Editor Quill & Form Pengiriman ---
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

        // --- Skrip Penanganan Modal ---
        var modal = document.getElementById("email-modal");
        var span = document.getElementById("close-modal");

        // Fungsi yang dipanggil saat list email diklik
        window.openEmailModal = function(id) {
          // Ambil elemen konten rahasia berdasarkan ID
          var contentDiv = document.getElementById('email-content-' + id);
          var subjectText = contentDiv.parentElement.querySelector('.email-subject').innerText;
          
          // Set judul dan isi modal
          document.getElementById('modal-title').innerText = subjectText;
          document.getElementById('modal-content-area').innerHTML = contentDiv.innerHTML;
          
          // Tampilkan modal
          modal.style.display = "block";
        }

        // Tutup modal jika tombol X diklik
        span.onclick = function() {
          modal.style.display = "none";
        }

        // Tutup modal jika area di luar kotak modal diklik
        window.onclick = function(event) {
          if (event.target == modal) {
            modal.style.display = "none";
          }
        }
      ` }} />
    </div>,
    { title: 'Mailbox Modern (Cloudflare & Brevo)' }
  )
})
