const meta = document.createElement('div');
meta.style.cssText = "position:fixed;right:12px;bottom:12px;color:#ffe37a;font:12px/1.2 system-ui;background:#101010;border:1px solid #2a2a2a;padding:8px 10px;border-radius:10px;opacity:.95";
meta.textContent = "Flexcoin ready • Vite build OK";
setTimeout(()=>document.body.appendChild(meta), 300);

const btn = document.querySelector('.btn');
if (btn) {
  btn.addEventListener('click', (e) => {
    if (btn.hash === '#presale') {
      e.preventDefault();
      alert('Presale module will be connected to your smart contracts when ready.');
    }
  });
}
