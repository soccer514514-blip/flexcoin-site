type TrustItem = { enabled: boolean; label: string; url?: string };

type TrustCfg = {
  kyc: TrustItem;
  audit: TrustItem;
  safu: TrustItem;
  lp_lock: TrustItem;
  team_lock: TrustItem; // 🆕 팀 지갑 락업
  renounce: TrustItem;
  vesting: TrustItem;
  wallets: Record<string, string>;
  locale?: "ko" | "en";
};

async function fetchJSON<T = any>(url: string): Promise<T | null> {
  try {
    const r = await fetch(url, { cache: "no-cache" });
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null;
  }
}

function el<K extends keyof HTMLElementTagNameMap>(tag: K, cls?: string) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  return e;
}

function card(icon: string, text: string, href?: string) {
  const a = el("a", "trust-card") as HTMLAnchorElement;
  if (href) {
    a.href = href;
    a.target = "_blank";
    a.rel = "noreferrer";
  }
  const img = el("img") as HTMLImageElement;
  img.src = "/badges/" + icon + ".png";
  a.appendChild(img);

  const box = el("div");
  const title = el("div", "title");
  title.textContent = text;
  box.appendChild(title);

  if (href) {
    const sub = el("div", "sub");
    sub.textContent = href;
    box.appendChild(sub);
  }

  a.appendChild(box);
  return a;
}

function makeRibbonPill(icon: string, text: string, href?: string) {
  const a = el("a", "pill") as HTMLAnchorElement;
  if (href) {
    a.href = href;
    a.target = "_blank";
    a.rel = "noreferrer";
  }
  const img = el("img") as HTMLImageElement;
  img.src = "/badges/" + icon + ".png";
  a.appendChild(img);

  const span = el("span");
  span.textContent = text;
  a.appendChild(span);
  return a;
}

async function mountRibbon(cfg: TrustCfg) {
  const bar = el("div", "trust-ribbon");
  const inner = el("div", "trust-ribbon-inner");

  if (cfg.kyc?.enabled)
    inner.appendChild(makeRibbonPill("kyc", cfg.kyc.label, cfg.kyc.url));
  if (cfg.audit?.enabled)
    inner.appendChild(makeRibbonPill("audit", cfg.audit.label, cfg.audit.url));
  if (cfg.safu?.enabled)
    inner.appendChild(makeRibbonPill("safu", cfg.safu.label, cfg.safu.url));
  if (cfg.lp_lock?.enabled)
    inner.appendChild(makeRibbonPill("lock", cfg.lp_lock.label, cfg.lp_lock.url));
  if (cfg.team_lock?.enabled)
    inner.appendChild(
      makeRibbonPill("lock", cfg.team_lock.label, cfg.team_lock.url)
    ); // 🆕 팀 락업 리본 (아이콘은 lock 재사용)
  if (cfg.renounce?.enabled)
    inner.appendChild(
      makeRibbonPill("renounce", cfg.renounce.label, cfg.renounce.url)
    );
  if (cfg.vesting?.enabled)
    inner.appendChild(
      makeRibbonPill("vesting", cfg.vesting.label, cfg.vesting.url)
    );

  bar.appendChild(inner);
  document.body.insertBefore(bar, document.body.firstChild);
}

export async function mountTrustSection(where?: Element | null) {
  const cfg = await fetchJSON<TrustCfg>("/config/trust.json");
  if (!cfg) return;

  // ribbon first
  await mountRibbon(cfg);

  const section = el("section", "trust-section");

  const header = el("div", "trust-header");
  const h2 = el("h2");
  h2.textContent =
    cfg.locale === "en"
      ? "Flexcoin Trust & Transparency"
      : "Flexcoin 신뢰 & 투명성";
  const small = el("div", "small");
  small.textContent =
    cfg.locale === "en"
      ? "All items are verifiable on-chain."
      : "모든 항목은 온체인으로 검증됩니다.";
  header.appendChild(h2);
  header.appendChild(small);
  section.appendChild(header);

  const grid = el("div", "trust-grid");

  if (cfg.kyc?.enabled)
    grid.appendChild(card("kyc", cfg.kyc.label, cfg.kyc.url));
  if (cfg.audit?.enabled)
    grid.appendChild(card("audit", cfg.audit.label, cfg.audit.url));
  if (cfg.safu?.enabled)
    grid.appendChild(card("safu", cfg.safu.label, cfg.safu.url));
  if (cfg.lp_lock?.enabled)
    grid.appendChild(card("lock", cfg.lp_lock.label, cfg.lp_lock.url));
  if (cfg.team_lock?.enabled)
    grid.appendChild(card("lock", cfg.team_lock.label, cfg.team_lock.url)); // 🆕 팀 락업 카드 (lock 아이콘 재사용)
  if (cfg.renounce?.enabled)
    grid.appendChild(
      card("renounce", cfg.renounce.label, cfg.renounce.url)
    );
  if (cfg.vesting?.enabled)
    grid.appendChild(card("vesting", cfg.vesting.label, cfg.vesting.url));

  section.appendChild(grid);

  const wallets = cfg.wallets || {};
  const foot = el("div", "small");
  foot.innerHTML =
    "<b>" +
    (cfg.locale === "en" ? "Public wallets" : "공개 지갑") +
    ":</b> " +
    Object.values(wallets)
      .map((v) => "<code>" + v + "</code>")
      .join(" • ");
  section.appendChild(foot);

  const mountPoint =
    where ||
    document.querySelector("#trust-transparency") ||
    document.querySelector(".wrap") ||
    document.body;
  mountPoint.appendChild(section);
}

document.addEventListener("DOMContentLoaded", () => {
  mountTrustSection(null);
});
