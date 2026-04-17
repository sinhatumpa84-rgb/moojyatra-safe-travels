import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import { useEffect, useState } from "react";
import { Lang } from "@/lib/i18n";

export default function Layout() {
  const [lang, setLang] = useState<Lang>(() => (localStorage.getItem("mooj_lang") as Lang) || "en");
  useEffect(() => { localStorage.setItem("mooj_lang", lang); }, [lang]);
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar lang={lang} setLang={setLang} />
      <main className="flex-1">
        <Outlet context={{ lang, setLang }} />
      </main>
      <footer className="container mt-16 mb-8 text-xs text-muted-foreground text-center">
        Built with ❤️ for safer travel · MoojYatra · Informational only — not legal advice
      </footer>
    </div>
  );
}
