import { Search } from 'lucide-react';
import type { Language, SectionId } from '../types';
import { getTranslations } from '../i18n/translations';

interface FooterProps {
  lang: Language;
  onNavigate: (section: SectionId) => void;
  onToggleLanguage: () => void;
  onOpenSearch: () => void;
}

export function Footer({
  lang,
  onNavigate,
  onToggleLanguage,
  onOpenSearch,
}: FooterProps) {
  const t = getTranslations(lang);

  const links: { id: SectionId; label: string }[] = [
    { id: 'home', label: t.nav.home },
    { id: 'ai-lab', label: t.nav.aiLab },
    { id: 'terminal', label: t.nav.terminal },
    { id: 'playground', label: t.nav.playground },
    { id: 'dev-tools', label: t.nav.devTools },
    { id: 'network-lab', label: t.nav.networkLab },
    { id: 'experiments', label: t.nav.experiments },
    { id: 'challenges', label: t.nav.challenges },
    { id: 'knowledge', label: t.nav.knowledge },
    { id: 'projects', label: t.nav.projects },
    { id: 'about', label: t.nav.about },
    { id: 'contact', label: t.nav.contact },
    { id: 'not-found', label: t.footer.test404 },
  ];

  return (
    <footer className="border-t border-slate-400/15 bg-[#040509]">
      <div className="mx-auto flex max-w-[1320px] flex-col gap-6 px-4 py-8 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div>
          <p className="font-display text-sm font-bold text-white">{t.brand}</p>
          <p className="mt-1 text-xs text-slate-400">{t.footer.rights}</p>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-300">
          {links.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className="min-h-[36px] hover:text-blue-400 transition-colors cursor-pointer"
            >
              {item.label}
            </button>
          ))}
          <button
            type="button"
            onClick={onOpenSearch}
            className="inline-flex min-h-[36px] items-center gap-1.5 rounded-md border border-slate-400/20 px-3 py-1 font-medium text-slate-300 hover:border-blue-500/40 hover:text-white cursor-pointer"
          >
            <Search className="h-3.5 w-3.5 text-blue-400" />
            <span>{t.footer.shortcutsHint}</span>
          </button>
          <button
            type="button"
            onClick={onToggleLanguage}
            className="min-h-[36px] rounded-md border border-slate-400/20 px-3 py-1 font-semibold text-slate-200 hover:border-blue-500/40 hover:text-white cursor-pointer"
          >
            {t.nav.switchLang}
          </button>
        </div>
      </div>
    </footer>
  );
}
