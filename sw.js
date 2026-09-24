// Service worker Pivního plánovače: aplikace funguje i bez internetu.
// HTML se bere ze sítě (když je), jinak z cache; ostatní soubory z cache s obnovou na pozadí.
const CACHE='pivo-8421f121232b';
const CORE=['./','index.html','manifest.webmanifest','icon-180.png','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('pivo-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
function netFirst(req){return fetch(req).then(r=>{if(r.ok){const c=r.clone();caches.open(CACHE).then(x=>x.put(req,c));}return r;})
  .catch(()=>caches.match(req).then(r=>r||caches.match('index.html')));}
function cacheFirst(req){return caches.match(req).then(hit=>{const net=fetch(req).then(r=>{if(r.ok||r.type==='opaque'){const c=r.clone();caches.open(CACHE).then(x=>x.put(req,c));}return r;});
  return hit||net;});}
self.addEventListener('fetch',e=>{const req=e.request;if(req.method!=='GET')return;const u=new URL(req.url);
  if(req.mode==='navigate'){e.respondWith(netFirst(req));return;}
  if(u.origin===location.origin||/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname))e.respondWith(cacheFirst(req));});