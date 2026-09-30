const BUILD='9.0.29-study-rc.1';
self.addEventListener('install',event=>{self.skipWaiting();});
self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k.startsWith('curriloop-')).map(k=>caches.delete(k)));
    await self.registration.unregister();
    const clients=await self.clients.matchAll({type:'window'});
    clients.forEach(client=>client.navigate(client.url));
  })());
});
