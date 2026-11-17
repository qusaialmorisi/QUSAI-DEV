import { Mail, MessageCircle } from 'lucide-react';
import type { Language, SectionId } from '../types';
import { getTranslations } from '../i18n/translations';

interface FooterProps {
  lang: Language;
  onNavigate: (section: SectionId) => void;
  onToggleLanguage: () => void;
}

export function Footer({
  lang,
  onNavigate,
  onToggleLanguage,
}: FooterProps) {
  const t = getTranslations(lang);

  const links: { id: SectionId; label: string }[] = [
    { id: 'home', label: t.nav.home },
    { id: 'about', label: t.nav.about },
    { id: 'projects', label: t.nav.projects },
    { id: 'ai-assistant', label: t.nav.aiAssistant },
    { id: 'contact', label: t.nav.contact },
  ];

  return (
    <footer className="border-t border-slate-400/15 bg-[#040509]">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-4 py-8 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="space-y-3">
          <div>
            <p className="font-display text-sm font-bold text-white">{t.brand}</p>
            <p className="mt-1 text-xs text-slate-400">{t.footer.rights}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <a
              href="mailto:hackone465@gmail.com"
              className="group inline-flex min-h-[38px] items-center gap-2 rounded-xl border border-blue-500/35 bg-gradient-to-r from-blue-600/20 to-violet-600/20 px-3.5 py-1.5 text-xs font-semibold text-slate-100 backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-400/70 hover:from-blue-600/30 hover:to-violet-600/30 hover:text-white hover:shadow-[0_0_18px_rgba(59,130,246,0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <Mail className="h-3.5 w-3.5 text-blue-400 transition-transform duration-200 group-hover:scale-110" />
              <span>{t.footer.emailMeBtn}</span>
            </a>

            <a
              href="https://wa.me/967772350689"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex min-h-[38px] items-center gap-2 rounded-xl border border-emerald-500/35 bg-gradient-to-r from-emerald-600/20 to-teal-600/20 px-3.5 py-1.5 text-xs font-semibold text-slate-100 backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-400/70 hover:from-emerald-600/30 hover:to-teal-600/30 hover:text-white hover:shadow-[0_0_18px_rgba(16,185,129,0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              <MessageCircle className="h-3.5 w-3.5 text-emerald-400 transition-transform duration-200 group-hover:scale-110" />
              <span>{t.footer.whatsappMeBtn}</span>
            </a>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-300">
          {links.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className="min-h-[36px] transition-colors hover:text-blue-400 cursor-pointer"
            >
              {item.label}
            </button>
          ))}
          <button
            type="button"
            onClick={onToggleLanguage}
            className="min-h-[36px] rounded-md border border-slate-400/20 px-3 py-1 font-semibold text-slate-200 transition-colors hover:border-blue-500/40 hover:text-white cursor-pointer"
          >
            {t.nav.switchLang}
          </button>
        </div>
      </div>
    </footer>
  );
}
