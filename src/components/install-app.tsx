"use client";
import { useEffect, useState } from "react";
type InstallPrompt = Event & { prompt(): Promise<void>; userChoice: Promise<{ outcome: string }> };
export function InstallApp({ full = false }: { full?: boolean }) {
  const [prompt, setPrompt] = useState<InstallPrompt | null>(null);
  const [installed, setInstalled] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => {
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});
    const capture = (event: Event) => { event.preventDefault(); setPrompt(event as InstallPrompt); };
    const done = () => { setInstalled(true); setPrompt(null); };
    const standalone = window.matchMedia("(display-mode: standalone)");
    if (standalone.matches) done();
    window.addEventListener("beforeinstallprompt", capture);
    window.addEventListener("appinstalled", done);
    return () => { window.removeEventListener("beforeinstallprompt", capture); window.removeEventListener("appinstalled", done); };
  }, []);
  async function install() {
    if (!prompt) return;
    try { await prompt.prompt(); const choice = await prompt.userChoice; setPrompt(null); setMessage(choice.outcome === "accepted" ? "Installation requested. Follow your browser’s instructions." : "You can install later from your browser menu."); }
    catch { setPrompt(null); setMessage("Use your browser menu to install Build A Biz."); }
  }
  if (!full) return prompt && !installed ? <button className="button small" onClick={install}>Install app</button> : null;
  return <div>{installed ? <p>Build A Biz is running as an installed app.</p> : prompt ? <button className="button" onClick={install}>Install Build A Biz</button> : <p>Use your browser’s install option, or follow the instructions below.</p>}<p role="status">{message}</p></div>;
}
