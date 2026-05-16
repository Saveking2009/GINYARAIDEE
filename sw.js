// เปลี่ยนเลขนี้ทุกครั้งที่ deploy ใหม่ (หรือใช้ timestamp อัตโนมัติด้านล่าง)
const CACHE_VERSION = 'v20260516-6';
const CACHE_NAME = 'nong-jaidee-' + CACHE_VERSION;

const ASSETS = [
  'index.html',
  'style.css',
  'ChatGPT Image 24 เม.ย. 2569 21_18_08.png'
];

// === Install: cache ไฟล์ใหม่
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS).catch(()=>{}))
  );
  // ⚡ บังคับใช้ sw ใหม่ทันที ไม่รอ tab เก่าปิด
  self.skipWaiting();
});

// === Activate: ลบ cache เก่าทุกอัน
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      // ลบ cache เก่าทั้งหมด
      caches.keys().then(keys =>
        Promise.all(
          keys.filter(k => k !== CACHE_NAME).map(k => {
            console.log('🗑️ ลบ cache เก่า:', k);
            return caches.delete(k);
          })
        )
      ),
      // 🚀 ควบคุม client ทุกตัวทันที
      self.clients.claim()
    ])
  );
});

// === Fetch: Network First strategy
// ดึงจาก internet ก่อนเสมอ → ได้เวอร์ชันใหม่ตลอด
// ถ้า offline ค่อย fallback ไป cache
self.addEventListener('fetch', (event) => {
  // ข้าม request ที่ไม่ใช่ GET (เช่น POST ไป API)
  if (event.request.method !== 'GET') return;

  // ข้าม request ไป API ภายนอก (เช่น OpenRouter, CDN)
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // ได้ไฟล์ใหม่จาก network → cache ไว้
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => {
        // offline → ใช้ cache
        return caches.match(event.request);
      })
  );
});

// === Listen for skip waiting message
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});