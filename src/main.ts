const LINKS = {
  website: "#",
  x: "#",
  telegram: "#",
};

function byId<T extends HTMLElement = HTMLElement>(id: string): T {
  return document.getElementById(id) as T;
}

function setStatusUrl() {
  const el = byId<HTMLElement>("status-url");
  if (!el) return;
  el.textContent = typeof window !== "undefined" ? window.location.origin : "";
}

function wireLinks() {
  const aWeb = byId<HTMLAnchorElement>("lnk-website");
  const aX = byId<HTMLAnchorElement>("lnk-x");
  const aTg = byId<HTMLAnchorElement>("lnk-telegram");
  if (aWeb) aWeb.href = LINKS.website;
  if (aX) aX.href = LINKS.x;
  if (aTg) aTg.href = LINKS.telegram;
}

function startCountdown() {
  const el = byId<HTMLElement>("countdown");
  if (!el) return;
  // demo countdown: 24h from now
  const target = Date.now() + 24 * 60 * 60 * 1000;
  const tick = () => {
    const ms = Math.max(0, target - Date.now());
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    el.textContent = `Presale starts in ${h}h ${m}m ${s}s`;
  };
  tick();
  setInterval(tick, 1000);
}

function startHeroRotator() {
  const el = byId<HTMLElement>("hero-rotator");
  if (!el) return;
  const imgs = ["/hero/1.jpg","/hero/2.jpg","/hero/3.jpg","/hero/4.jpg","/hero/5.jpg","/hero/6.jpg","/hero/7.jpg"];
  let i = 0;
  const paint = () => {
    el.style.backgroundImage = `url(${imgs[i % imgs.length]})`;
    i++;
  };
  paint();
  setInterval(paint, 8000);
}

setStatusUrl();
wireLinks();
startCountdown();
startHeroRotator();