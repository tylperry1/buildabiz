"use client";
import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";
function subscribe(fn: () => void) { window.addEventListener("theme", fn); return () => window.removeEventListener("theme", fn); }
export function Theme() { const dark = useSyncExternalStore(subscribe, () => document.documentElement.dataset.theme === "dark", () => false); return <button className="icon-button" aria-label={dark ? "Use light mode" : "Use dark mode"} onClick={() => { document.documentElement.dataset.theme = dark ? "light" : "dark"; localStorage.setItem("bab-theme", dark ? "light" : "dark"); window.dispatchEvent(new Event("theme")); }}>{dark ? <Sun size={18}/> : <Moon size={18}/>}</button>; }
