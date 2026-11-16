import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, X, ArrowRight, ArrowLeft } from 'lucide-react';
import type { Language, SectionId } from '../types';
import { getTranslations } from '../i18n/translations';
import { PROJECTS } from '../data/projects';
import { KNOWLEDGE_ARTICLES } from '../data/knowledge';

interface GlobalSearchModalProps {
  open: boolean;
  lang: Language;
  onClose: () => void;
  onNavigate: (section: SectionId) => void;
}

interface SearchResultItem {
  id: string;
  group: 'section' | 'project' | 'guide';
  title: string;
  subtitle: string;
  section: SectionId;
}

export function GlobalSearchModal({
  open,
  lang,
  onClose,
  onNavigate,
}: GlobalSearchModalProps) {
  const t = getTranslations(lang);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);
  const ArrowIcon = lang === 'ar' ? ArrowLeft : ArrowRight;

  useEffect(() => {
    if (!open) return;
    setQuery('');
    const timer = setTimeout(() => inputRef.current?.focus(), 30);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  const allItems: SearchResultItem[] = useMemo(() => {
    const sections: SearchResultItem[] = [
      { id: 'sec-home', group: 'section', title: t.nav.home, subtitle: t.home.headline, section: 'home' },
      { id: 'sec-ai', group: 'section', title: t.nav.aiLab, subtitle: t.aiLab.subheading, section: 'ai-lab' },
      { id: 'sec-term', group: 'section', title: t.nav.terminal, subtitle: t.terminal.subheading, section: 'terminal' },
      { id: 'sec-pg', group: 'section', title: t.nav.playground, subtitle: t.playground.subheading, section: 'playground' },
      { id: 'sec-tools', group: 'section', title: t.nav.devTools, subtitle: t.devTools.subheading, section: 'dev-tools' },
      { id: 'sec-net', group: 'section', title: t.nav.networkLab, subtitle: t.networkLab.subheading, section: 'network-lab' },
      { id: 'sec-exp', group: 'section', title: t.nav.experiments, subtitle: t.experiments.subheading, section: 'experiments' },
      { id: 'sec-exp-net', group: 'section', title: t.experiments.tabs.network, subtitle: t.experiments.network.instructions, section: 'experiments' },
      { id: 'sec-exp-alg', group: 'section', title: t.experiments.tabs.algorithms, subtitle: t.experiments.algorithms.instructions, section: 'experiments' },
      { id: 'sec-exp-css', group: 'section', title: t.experiments.tabs.css, subtitle: t.experiments.css.instructions, section: 'experiments' },
      { id: 'sec-exp-log', group: 'section', title: t.experiments.tabs.logic, subtitle: t.experiments.logic.instructions, section: 'experiments' },
      { id: 'sec-chal', group: 'section', title: t.nav.challenges, subtitle: t.challenges.subheading, section: 'challenges' },
      { id: 'sec-chal-daily', group: 'section', title: t.challenges.tabs.daily, subtitle: t.challenges.subheading, section: 'challenges' },
      { id: 'sec-chal-prog', group: 'section', title: t.challenges.tabs.programming, subtitle: `${t.challenges.filters.python} · ${t.challenges.filters.javascript} · ${t.challenges.filters.htmlCss}`, section: 'challenges' },
      { id: 'sec-chal-net', group: 'section', title: t.challenges.tabs.networking, subtitle: t.networkLab.subheading, section: 'challenges' },
      { id: 'sec-know', group: 'section', title: t.nav.knowledge, subtitle: t.knowledge.subheading, section: 'knowledge' },
      { id: 'sec-proj', group: 'section', title: t.nav.projects, subtitle: t.projects.subheading, section: 'projects' },
      { id: 'sec-about', group: 'section', title: t.nav.about, subtitle: t.about.role, section: 'about' },
      { id: 'sec-contact', group: 'section', title: t.nav.contact, subtitle: t.contact.subheading, section: 'contact' },
    ];

    const projectItems: SearchResultItem[] = PROJECTS.map((p) => ({
      id: `proj-${p.id}`,
      group: 'project',
      title: p.title[lang],
      subtitle: `${p.subtitle[lang]} · ${p.stack.join(', ')}`,
      section: 'projects',
    }));

    const guideItems: SearchResultItem[] = KNOWLEDGE_ARTICLES.map((g) => ({
      id: `guide-${g.id}`,
      group: 'guide',
      title: g.title[lang],
      subtitle: `${g.level[lang]} · ${g.summary[lang]}`,
      section: 'knowledge',
    }));

    return [...sections, ...projectItems, ...guideItems];
  }, [lang, t]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allItems.slice(0, 10);
    return allItems.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.section.toLowerCase().includes(q)
    );
  }, [allItems, query]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t.searchModal.title}
      className="fixed inset-0 z-[60] flex items-start justify-center bg-black/80 p-4 pt-16 backdrop-blur-sm sm:pt-24"
      onClick={onClose}
    >
      <div
        className="glass-panel w-full max-w-2xl overflow-hidden rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-slate-400/15 px-4 py-3.5">
          <Search className="h-4 w-4 shrink-0 text-blue-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.searchModal.placeholder}
            className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="rounded-lg p-1 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[340px] overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <p className="p-6 text-center text-xs text-slate-400">
              {t.searchModal.noResults}
            </p>
          ) : (
            <div className="space-y-1">
              {filtered.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onNavigate(item.section);
                    onClose();
                  }}
                  className="flex w-full items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 text-start transition-colors hover:bg-blue-600/15 cursor-pointer"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-xs text-blue-300">
                      <span>{t.searchModal.groups[item.group]}</span>
                      <span aria-hidden="true">·</span>
                      <span className="truncate font-semibold text-white text-sm">
                        {item.title}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-slate-400">
                      {item.subtitle}
                    </p>
                  </div>
                  <ArrowIcon className="h-4 w-4 shrink-0 text-slate-500" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-400/15 bg-[#060911] px-4 py-3 text-[11px] text-slate-400">
          <span className="font-semibold text-slate-300">{t.searchModal.shortcutsTitle}:</span>
          <div className="flex flex-wrap items-center gap-4">
            {t.searchModal.shortcuts.map((sc) => (
              <span key={sc.keys}>
                <kbd dir="ltr" className="font-mono text-blue-300">{sc.keys}</kbd> — {sc.desc}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
