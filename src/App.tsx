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
import { AboutSection } from './components/AboutSection';
import { ProjectsSection } from './components/ProjectsSection';
import { AiAssistantSection } from './components/AiAssistantSection';
import { ContactSection } from './components/ContactSection';
import { NotFoundSection } from './components/NotFoundSection';
import { Footer } from './components/Footer';

const SECTION_TO_PATH: Record<SectionId, string> = {
  home: '/',
  about: '/about',
  projects: '/projects',
  'ai-assistant': '/ai-assistant',
  contact: '/contact',
  'not-found': '/404',
};

const PATH_TO_SECTION: Record<string, SectionId> = {
  '/': 'home',
  '/about': 'about',
  '/projects': 'projects',
  '/ai-assistant': 'ai-assistant',
  '/ai-lab': 'ai-assistant',
  '/contact': 'contact',
};

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
        />

        <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
          {activeSection === 'home' && (
            <HomeSection lang={lang} onNavigate={handleNavigate} />
          )}
          {activeSection === 'about' && <AboutSection lang={lang} />}
          {activeSection === 'projects' && <ProjectsSection lang={lang} />}
          {activeSection === 'ai-assistant' && <AiAssistantSection lang={lang} />}
          {activeSection === 'contact' && <ContactSection lang={lang} />}
          {activeSection === 'not-found' && (
            <NotFoundSection lang={lang} onNavigate={handleNavigate} />
          )}
        </main>

        <Footer
          lang={lang}
          onNavigate={handleNavigate}
          onToggleLanguage={handleToggleLanguage}
        />
      </div>
    </ToastProvider>
  );
}
