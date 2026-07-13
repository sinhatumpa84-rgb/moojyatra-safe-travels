import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import { useEffect, useState } from "react";
import { Lang } from "@/lib/i18n";

export default function Layout() {
  const [lang, setLang] = useState<Lang>(() => (localStorage.getItem("mooj_lang") as Lang) || "en");
  
  useEffect(() => {
    localStorage.setItem("mooj_lang", lang);
    const isRtl = lang === "ar" || lang === "ur";
    const htmlEl = document.documentElement;
    htmlEl.setAttribute("dir", isRtl ? "rtl" : "ltr");
    htmlEl.setAttribute("lang", lang);
    htmlEl.style.direction = isRtl ? "rtl" : "ltr";
  }, [lang]);

  return (
    <div className="min-h-screen flex flex-col w-full">
      <Navbar lang={lang} setLang={setLang} />
      <main className="flex-1 w-full">
        <Outlet context={{ lang, setLang }} />
      </main>
      <footer className="w-full container px-3 sm:px-4 mt-12 sm:mt-16 mb-6 sm:mb-8 text-xs sm:text-sm text-muted-foreground text-center">
        Built with ❤️ for safer travel · MoojYatra · Informational only — not legal advice
      </footer>
    </div>
  );
}
