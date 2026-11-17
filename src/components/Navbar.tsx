import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import type { Language, SectionId } from '../types';
import { getTranslations } from '../i18n/translations';

interface NavbarProps {
  lang: Language;
  activeSection: SectionId;
  onNavigate: (section: SectionId) => void;
  onToggleLanguage: () => void;
}

export function Navbar({
  lang,
  activeSection,
  onNavigate,
  onToggleLanguage,
}: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const t = getTranslations(lang);

  const navItems: { id: SectionId; label: string }[] = [
    { id: 'home', label: t.nav.home },
    { id: 'about', label: t.nav.about },
    { id: 'projects', label: t.nav.projects },
    { id: 'ai-assistant', label: t.nav.aiAssistant },
    { id: 'contact', label: t.nav.contact },
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
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <button
          type="button"
          onClick={() => handleNavClick('home')}
          aria-current={activeSection === 'home' ? 'page' : undefined}
          className="font-display text-lg font-bold tracking-tight text-white transition-colors duration-150 hover:text-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 whitespace-nowrap shrink-0 cursor-pointer"
        >
          {t.brand}
        </button>

        {/* Zone 2: 5 Concise Single-line Navigation Links */}
        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium"
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
                  isActive ? 'text-blue-400' : 'text-slate-300 hover:text-white'
                }`}
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

        {/* Zone 3: Language Switcher & Mobile Menu Toggle */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onToggleLanguage}
            className="min-h-[38px] rounded-lg border border-slate-400/20 bg-slate-900/80 px-4 py-1.5 text-xs font-semibold text-slate-100 transition-colors duration-150 hover:border-blue-500/50 hover:text-blue-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 whitespace-nowrap shrink-0 cursor-pointer"
          >
            {t.nav.switchLang}
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-400/20 text-slate-200 hover:border-blue-500/40 md:hidden cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
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
            className="fixed inset-0 top-16 z-40 bg-black/65 backdrop-blur-xs md:hidden"
          />
          <div className="absolute inset-x-0 top-16 z-50 border-b border-slate-400/20 bg-[#070910] px-4 py-4 shadow-2xl md:hidden">
            <nav className="grid grid-cols-1 gap-2" aria-label="Mobile navigation">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  aria-current={activeSection === item.id ? 'page' : undefined}
                  className={`min-h-[44px] rounded-xl border px-4 text-start text-sm font-medium transition-colors cursor-pointer ${
                    activeSection === item.id
                      ? 'border-blue-500/50 bg-blue-500/15 text-blue-300'
                      : 'border-slate-400/10 bg-slate-900/40 text-slate-300 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </>
      )}
    </header>
  );
}
