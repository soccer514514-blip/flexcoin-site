// /src/utils/heroLoader.ts
export async function resolveHeroMain(): Promise<string> {
  const tryOne = (url: string) =>
    new Promise<boolean>((res) => {
      const img = new Image();
      img.onload = () => res(true);
      img.onerror = () => res(false);
      img.src = url;
    });
  const main = "/hero/main.jpg";
  return (await tryOne(main)) ? main : "/hero/1.jpg";
}
export function startHeroRotate(el: HTMLImageElement, total = 8, ms = 6000) {
  const list = Array.from({ length: total }, (_, i) => `/hero/${i + 1}.jpg`);
  let idx = 0;
  setInterval(() => { idx = (idx + 1) % list.length; el.src = list[idx]; }, ms);
}
