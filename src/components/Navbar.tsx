import { useEffect, useState } from 'react';
import { Menu, Search, X } from 'lucide-react';
import type { Language, SectionId } from '../types';
import { getTranslations } from '../i18n/translations';

interface NavbarProps {
  lang: Language;
  activeSection: SectionId;
  onNavigate: (section: SectionId) => void;
  onToggleLanguage: () => void;
  onOpenSearch: () => void;
}

export function Navbar({
  lang,
  activeSection,
  onNavigate,
  onToggleLanguage,
  onOpenSearch,
}: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const t = getTranslations(lang);

  const navItems: { id: SectionId; label: string; xlOnly?: boolean }[] = [
    { id: 'ai-lab', label: t.nav.aiLab },
    { id: 'terminal', label: t.nav.terminal },
    { id: 'playground', label: t.nav.playground },
    { id: 'dev-tools', label: t.nav.devTools },
    { id: 'network-lab', label: t.nav.networkLab },
    { id: 'experiments', label: t.nav.experiments },
    { id: 'challenges', label: t.nav.challenges },
    { id: 'knowledge', label: t.nav.knowledge, xlOnly: true },
    { id: 'projects', label: t.nav.projects },
    { id: 'about', label: t.nav.about, xlOnly: true },
    { id: 'contact', label: t.nav.contact, xlOnly: true },
  ];

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mobileOpen]);

  const handleNavClick = (id: SectionId) => {
    onNavigate(id);
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-400/15 bg-[#050508]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-[1320px] items-center justify-between gap-4 px-4 sm:h-16 sm:gap-6 sm:px-6 lg:px-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <button
          type="button"
          onClick={() => handleNavClick('home')}
          aria-current={activeSection === 'home' ? 'page' : undefined}
          className="font-display text-base font-bold tracking-tight text-slate-100 transition-colors hover:text-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 whitespace-nowrap shrink-0 sm:text-lg cursor-pointer"
        >
          {t.brand}
        </button>

        {/* Zone 2: Concise single-line navigation links */}
        <nav
          aria-label="Primary navigation"
          className="hidden lg:flex items-center gap-2.5 xl:gap-4 text-xs xl:text-sm font-medium"
        >
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`relative py-1 whitespace-nowrap shrink-0 transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  item.xlOnly ? 'hidden xl:inline-flex' : 'inline-flex'
                } ${isActive ? 'text-blue-400' : 'text-slate-300 hover:text-white'}`}
              >
                {item.label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 -bottom-[21px] h-[2px] bg-gradient-to-r from-blue-500 to-violet-500"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Global Search, Language Switcher & Mobile Menu Trigger */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenSearch}
            aria-label={t.nav.search}
            title={`${t.nav.search} (Ctrl+K)`}
            className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-slate-400/20 bg-slate-900/80 px-2.5 py-1.5 text-xs font-medium text-slate-300 transition-colors duration-150 hover:border-blue-500/50 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Search className="h-3.5 w-3.5 text-blue-400" />
            <span className="hidden sm:inline">{t.nav.search}</span>
          </button>

          <button
            type="button"
            onClick={onToggleLanguage}
            className="min-h-[38px] rounded-lg border border-slate-400/20 bg-slate-900/80 px-3.5 py-1.5 text-xs font-semibold text-slate-100 transition-colors duration-150 hover:border-blue-500/50 hover:text-blue-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 whitespace-nowrap shrink-0 cursor-pointer"
          >
            {t.nav.switchLang}
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-400/20 text-slate-200 hover:border-blue-500/40 lg:hidden cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Responsive Mobile Navigation Drawer */}
      {mobileOpen && (
        <>
          <div
            aria-hidden="true"
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 top-14 z-40 bg-black/65 backdrop-blur-xs lg:hidden"
          />
          <div className="absolute inset-x-0 top-14 z-50 border-b border-slate-400/20 bg-[#070910] px-4 py-4 shadow-2xl sm:top-16 lg:hidden">
            <nav className="grid grid-cols-2 gap-2" aria-label="Mobile navigation">
              <button
                type="button"
                onClick={() => handleNavClick('home')}
                aria-current={activeSection === 'home' ? 'page' : undefined}
                className={`min-h-[44px] rounded-xl border px-3 text-start text-sm font-medium transition-colors cursor-pointer ${
                  activeSection === 'home'
                    ? 'border-blue-500/50 bg-blue-500/15 text-blue-300'
                    : 'border-slate-400/10 bg-slate-900/40 text-slate-300 hover:text-white'
                }`}
              >
                {t.nav.home}
              </button>
              {navItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  aria-current={activeSection === item.id ? 'page' : undefined}
                  className={`min-h-[44px] rounded-xl border px-3 text-start text-sm font-medium transition-colors cursor-pointer ${
                    activeSection === item.id
                      ? 'border-blue-500/50 bg-blue-500/15 text-blue-300'
                      : 'border-slate-400/10 bg-slate-900/40 text-slate-300 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  onOpenSearch();
                }}
                className="col-span-2 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/10 px-3 text-sm font-medium text-blue-300 hover:bg-blue-500/20 cursor-pointer"
              >
                <Search className="h-4 w-4" />
                <span>{t.searchModal.title}</span>
              </button>
            </nav>
          </div>
        </>
      )}
    </header>
  );
}
