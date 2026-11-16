/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useState } from 'react';
import type { Language, SectionId } from './types';
import { getTranslations } from './i18n/translations';
import { ToastProvider } from './components/ToastContext';
import { Navbar } from './components/Navbar';
import { HomeSection } from './components/HomeSection';
import { AiLabSection } from './components/AiLabSection';
import { TerminalSection } from './components/TerminalSection';
import { CodePlaygroundSection } from './components/CodePlaygroundSection';
import { DevToolsSection } from './components/DevToolsSection';
import { NetworkLabSection } from './components/NetworkLabSection';
import { LiveExperimentsSection } from './components/LiveExperimentsSection';
import { ChallengesSection } from './components/ChallengesSection';
import { KnowledgeCenterSection } from './components/KnowledgeCenterSection';
import { ProjectsSection } from './components/ProjectsSection';
import { AboutSection } from './components/AboutSection';
import { ContactSection } from './components/ContactSection';
import { NotFoundSection } from './components/NotFoundSection';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { Footer } from './components/Footer';

const SECTION_TO_PATH: Record<SectionId, string> = {
  home: '/',
  'ai-lab': '/ai-lab',
  terminal: '/terminal',
  playground: '/playground',
  'dev-tools': '/dev-tools',
  'network-lab': '/network-lab',
  experiments: '/experiments',
  challenges: '/challenges',
  knowledge: '/knowledge',
  projects: '/projects',
  about: '/about',
  contact: '/contact',
  'not-found': '/404',
};

const PATH_TO_SECTION: Record<string, SectionId> = {
  '/': 'home',
  '/ai-lab': 'ai-lab',
  '/terminal': 'terminal',
  '/playground': 'playground',
  '/dev-tools': 'dev-tools',
  '/network-lab': 'network-lab',
  '/experiments': 'experiments',
  '/challenges': 'challenges',
  '/knowledge': 'knowledge',
  '/projects': 'projects',
  '/about': 'about',
  '/contact': 'contact',
};

const ALT_SHORTCUTS: SectionId[] = [
  'home',
  'ai-lab',
  'terminal',
  'playground',
  'dev-tools',
  'network-lab',
  'knowledge',
  'projects',
  'experiments',
];

function resolveSectionFromPathname(pathname: string): SectionId {
  const normalized =
    pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
  return PATH_TO_SECTION[normalized] ?? 'not-found';
}

export default function App() {
  const [lang, setLang] = useState<Language>('en');
  const [activeSection, setActiveSection] = useState<SectionId>(() =>
    resolveSectionFromPathname(window.location.pathname)
  );
  const [searchOpen, setSearchOpen] = useState(false);

  const t = getTranslations(lang);

  useEffect(() => {
    const html = document.documentElement;
    html.lang = lang;
    html.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  const handleNavigate = useCallback((section: SectionId) => {
    setActiveSection(section);
    const targetPath = SECTION_TO_PATH[section];
    if (window.location.pathname !== targetPath) {
      window.history.pushState({ section }, '', targetPath);
    }
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  }, []);

  useEffect(() => {
    const onPopState = () => {
      setActiveSection(resolveSectionFromPathname(window.location.pathname));
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
        return;
      }

      if (e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
        const index = Number(e.key) - 1;
        if (index >= 0 && index < ALT_SHORTCUTS.length) {
          e.preventDefault();
          handleNavigate(ALT_SHORTCUTS[index]);
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleNavigate]);

  const handleToggleLanguage = () => {
    setLang((prev) => (prev === 'en' ? 'ar' : 'en'));
  };

  return (
    <ToastProvider>
      <div className="flex min-h-screen flex-col bg-[#050508] text-slate-100">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:start-3 focus:z-[100] focus:rounded-lg focus:bg-blue-600 focus:px-4 focus:py-2 focus:text-xs focus:font-semibold focus:text-white"
        >
          {t.nav.skipToContent}
        </a>

        <Navbar
          lang={lang}
          activeSection={activeSection}
          onNavigate={handleNavigate}
          onToggleLanguage={handleToggleLanguage}
          onOpenSearch={() => setSearchOpen(true)}
        />

        <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
          {activeSection === 'home' && (
            <HomeSection lang={lang} onNavigate={handleNavigate} />
          )}
          {activeSection === 'ai-lab' && <AiLabSection lang={lang} />}
          {activeSection === 'terminal' && (
            <TerminalSection
              lang={lang}
              onNavigate={handleNavigate}
              onSetLanguage={setLang}
            />
          )}
          {activeSection === 'playground' && <CodePlaygroundSection lang={lang} />}
          {activeSection === 'dev-tools' && <DevToolsSection lang={lang} />}
          {activeSection === 'network-lab' && <NetworkLabSection lang={lang} />}
          {activeSection === 'experiments' && <LiveExperimentsSection lang={lang} />}
          {activeSection === 'challenges' && <ChallengesSection lang={lang} />}
          {activeSection === 'knowledge' && <KnowledgeCenterSection lang={lang} />}
          {activeSection === 'projects' && <ProjectsSection lang={lang} />}
          {activeSection === 'about' && <AboutSection lang={lang} />}
          {activeSection === 'contact' && <ContactSection lang={lang} />}
          {activeSection === 'not-found' && (
            <NotFoundSection
              lang={lang}
              onNavigate={handleNavigate}
              onOpenSearch={() => setSearchOpen(true)}
            />
          )}
        </main>

        <Footer
          lang={lang}
          onNavigate={handleNavigate}
          onToggleLanguage={handleToggleLanguage}
          onOpenSearch={() => setSearchOpen(true)}
        />

        <GlobalSearchModal
          open={searchOpen}
          lang={lang}
          onClose={() => setSearchOpen(false)}
          onNavigate={handleNavigate}
        />
      </div>
    </ToastProvider>
  );
}
