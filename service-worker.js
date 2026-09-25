const CACHE_NAME = "curriloop-v7-8-1-red-team-freeze-20260924";
const CACHE_PREFIX = "curriloop-";

// 설치가 성공했다면 최소한 앱 본체와 설치 아이콘은 반드시 캐시에 존재하게 한다.
const CORE_PRECACHE = [
  "/index.html",
  "/assets/css/styles.css?v=7.8.1",
  "/data/curriculum/2022/curriculum.js?v=7.8.1",
  "/data/curriculum/2015/transition-reference.js?v=7.8.1",
  "/data/curriculum/mappings/2015-2022.js?v=7.8.1",
  "/data/learning-aids/general-bank.js?v=7.8.1",
  "/data/learning-aids/core-flow.js?v=7.8.1",
  "/data/learning-aids/gap-intensity.js?v=7.8.1",
  "/js/engines/day-engine.js?v=7.8.1",
  "/js/engines/learning-engine.js?v=7.8.1",
  "/js/engines/practical-engine.js?v=7.8.1",
  "/js/engines/grading-engine.js?v=7.8.1",
  "/js/engines/recall-engine.js?v=7.8.1",
  "/js/engines/intensity-engine.js?v=7.8.1",
  "/js/engines/structure-engine.js?v=7.8.1",
  "/js/engines/review-engine.js?v=7.8.1",
  "/js/engines/history-engine.js?v=7.8.1",
  "/js/engines/storage-engine.js?v=7.8.1",
  "/js/engines/planner-engine.js?v=7.8.1",
  "/data/questions/production.js?v=7.8.1",
  "/js/practice/practice-engine.js?v=7.8.1",
  "/js/practice/practice-ui.js?v=7.8.1",
  "/js/app.js?v=7.8.1",
  "/manifest.webmanifest",
  "/assets/icons/icon-192.png",
  "/assets/icons/icon-512.png",
  "/assets/icons/apple-touch-icon.png"
];

// 공유 카드·검색엔진 파일과 루트 별칭은 오프라인 핵심 동작을 막지 않는다.
const OPTIONAL_PRECACHE = [
  "/",
  "/assets/icons/og-card.png",
  "/robots.txt",
  "/sitemap.xml"
];

async function fetchAndCache(cache, url, {required = false} = {}) {
  try {
    const response = await fetch(url, {cache: "reload"});
    if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
    await cache.put(url, response.clone());
  } catch (error) {
    if (required) throw error;
  }
}

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    // 핵심 파일 하나라도 실패하면 새 SW 설치를 완료하지 않아 불완전한 오프라인판을 활성화하지 않는다.
    await Promise.all(CORE_PRECACHE.map(url => fetchAndCache(cache, url, {required: true})));
    // 부가 파일은 배포 환경에 따라 없어도 앱 설치·업데이트를 막지 않는다.
    await Promise.all(OPTIONAL_PRECACHE.map(url => fetchAndCache(cache, url)));
  })());
});

self.addEventListener("message", event => {
  // 사용자가 화면의 업데이트 알림에서 새로고침을 선택했을 때만 대기 중 SW를 즉시 활성화한다.
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // HTML 탐색은 network-first: 새 배포를 가능한 한 빨리 받고, 오프라인일 때만 검증된 캐시로 후퇴한다.
  if (request.mode === "navigate") {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response.ok) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put("/index.html", response.clone());
        }
        return response;
      } catch {
        return (await caches.match("/index.html")) || (await caches.match("/"));
      }
    })());
    return;
  }

  // 아이콘·manifest 등의 정적 자산은 cache-first, 미캐시 자산은 성공 응답만 런타임 캐시한다.
  event.respondWith((async () => {
    const cached = await caches.match(request);
    if (cached) return cached;
    try {
      const response = await fetch(request);
      if (response.ok && response.type === "basic") {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(request, response.clone());
      }
      return response;
    } catch {
      return Response.error();
    }
  })());
});
