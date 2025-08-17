const CACHE_NAME = 'webtorrent-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    'https://cdn.tailwindcss.com',
    'https://cdn.jsdelivr.net/npm/webtorrent@latest/webtorrent.min.js',
    'https://cdn.jsdelivr.net/npm/qrcode-generator/qrcode.js',
    'https://unpkg.com/html5-qrcode',
    'https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js',
    'https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js',
    'https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js',
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // キャッシュに見つかったらそれを返す
                if (response) {
                    return response;
                }
                // 見つからなかったら、ネットワークから取得
                return fetch(event.request).then(
                    networkResponse => {
                        // ネットワークから取得したレスポンスをキャッシュに追加
                        return caches.open(CACHE_NAME).then(cache => {
                            // キャッシュに追加するのはGETリクエストと正常なレスポンスのみ
                            if (event.request.method === 'GET' && networkResponse.status === 200) {
                                cache.put(event.request, networkResponse.clone());
                            }
                            return networkResponse;
                        });
                    }
                );
            }).catch(() => {
                // キャッシュにもネットワークにも見つからなかった場合
                return new Response('Offline Mode');
            })
    );
});

self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
