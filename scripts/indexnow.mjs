// scripts/indexnow.mjs — tell Bing (and other IndexNow engines) about our pages
// ─────────────────────────────────────────────────────────────────────────────
// IndexNow lets a site notify Bing, Yandex, Seznam, Naver… the moment pages
// change, instead of waiting to be crawled. Bing also feeds ChatGPT search and
// DuckDuckGo. (Google does not use IndexNow — it reads the sitemap.)
// The key below is public by design: it must also be served at /<key>.txt so
// the engines can confirm the site is ours.
// Run by .github/workflows/indexnow.yml after a deploy.
// ─────────────────────────────────────────────────────────────────────────────
const SITE = "https://yojanasahay.vercel.app";
const KEY = "5d7f34a90e4ee3e853c9fb737b2ad158";

const sm = await (await fetch(`${SITE}/sitemap.xml`)).text();
const urls = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]).slice(0, 10000);
if (!urls.length) { console.error("No URLs found in sitemap"); process.exit(1); }

const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: new URL(SITE).host, key: KEY, keyLocation: `${SITE}/${KEY}.txt`, urlList: urls }),
});
console.log(`IndexNow: submitted ${urls.length} URLs → HTTP ${res.status}`);
// 200/202 = accepted. 422 usually means the key file isn't live yet.
if (![200, 202].includes(res.status)) { console.error(await res.text().catch(() => "")); process.exit(1); }
