export async function resolveHeroMain(): Promise<string> {
  const tryOne = (url: string) => new Promise<boolean>(res => {
    const img = new Image();
    img.onload = () => res(true);
    img.onerror = () => res(false);
    img.src = url + (url.includes("?") ? "&" : "?") + "cb=" + Date.now();
  });
  const main = "/hero/main.jpg";
  try {
    const ok = await tryOne(main);
    return ok ? main : "/hero/1.jpg";
  } catch {
    return "/hero/1.jpg";
  }
}
