// 틀린 그림 찾기 Service Worker
const CACHE = 'tg-v2';
const ASSETS = [
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e=>{
  e.waitUntil(caches.keys().then(keys=>
    Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e=>{
  // HTML은 네트워크 우선 — 업데이트 즉시 반영, 오프라인 시 캐시 사용
  if(e.request.mode==='navigate'){
    e.respondWith(
      fetch(e.request)
        .then(res=>{
          const clone=res.clone();
          caches.open(CACHE).then(c=>c.put(e.request,clone));
          return res;
        })
        .catch(()=>caches.match(e.request))
    );
    return;
  }
  // 아이콘 등 정적 파일은 캐시 우선
  e.respondWith(
    caches.match(e.request).then(r=>r||fetch(e.request).catch(()=>
      caches.match('./index.html')
    ))
  );
});
