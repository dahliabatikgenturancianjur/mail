// app/routes/login.tsx
import { createRoute } from 'honox/factory'

export const GET = createRoute((c) => {
  return c.render(
    <div class="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-80 z-50 backdrop-blur-sm">
      <div class="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md transform transition-all">
        <div class="text-center mb-8">
          <h2 class="text-3xl font-extrabold text-gray-900">Secure Mailbox</h2>
          <p class="text-gray-500 mt-2 text-sm">Silakan masukkan kredensial administrator Anda</p>
        </div>
        
        <form id="login-form" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1" for="username">Username</label>
            <input 
              class="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" 
              id="username" name="username" type="text" required placeholder="Masukkan username" 
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1" for="password">Password</label>
            <input 
              class="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" 
              id="password" name="password" type="password" required placeholder="••••••••" 
            />
          </div>

          <div id="login-error" class="text-red-600 text-sm font-medium text-center hidden bg-red-50 py-2 rounded-md"></div>
          
          <div>
            <button 
              class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200" 
              type="submit" id="login-btn">
              Masuk ke Mailbox
            </button>
          </div>
        </form>

        <script dangerouslySetInnerHTML={{ __html: `
          document.getElementById('login-form').addEventListener('submit', async function(e) {
            e.preventDefault();
            var btn = document.getElementById('login-btn');
            var errorDiv = document.getElementById('login-error');
            
            btn.disabled = true;
            btn.innerHTML = '<svg class="animate-spin h-5 w-5 mr-3 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Memverifikasi...';
            errorDiv.classList.add('hidden');

            var formData = new FormData(this);
            var data = Object.fromEntries(formData);

            try {
              var response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
              });
              
              var result = await response.json();
              
              if (response.ok) {
                window.location.href = '/';
              } else {
                errorDiv.textContent = result.error || 'Autentikasi gagal.';
                errorDiv.classList.remove('hidden');
                btn.disabled = false;
                btn.textContent = 'Masuk ke Mailbox';
              }
            } catch(err) {
              errorDiv.textContent = 'Koneksi ke server terputus.';
              errorDiv.classList.remove('hidden');
              btn.disabled = false;
              btn.textContent = 'Masuk ke Mailbox';
            }
          });
        ` }} />
      </div>
    </div>,
    { title: 'Otentikasi Mailbox' }
  )
})
