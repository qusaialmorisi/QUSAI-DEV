import { Home } from 'lucide-react';
import type { Language, SectionId } from '../types';
import { getTranslations } from '../i18n/translations';

interface NotFoundSectionProps {
  lang: Language;
  onNavigate: (section: SectionId) => void;
}

export function NotFoundSection({ lang, onNavigate }: NotFoundSectionProps) {
  const t = getTranslations(lang);

  return (
    <section className="mx-auto flex max-w-[1200px] flex-col items-center justify-center px-4 py-20 text-center sm:px-6 lg:px-8">
      <div className="glass-panel max-w-md rounded-2xl p-8 sm:p-10">
        <p className="font-mono text-5xl font-bold neon-gradient-text tabular-nums">
          {t.notFound.code}
        </p>
        <h1 className="mt-4 font-display text-2xl font-bold text-white sm:text-3xl">
          {t.notFound.title}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-300">
          {t.notFound.description}
        </p>

        <div className="mt-7 flex justify-center">
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="neon-action-btn inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-xs font-semibold text-white cursor-pointer"
          >
            <Home className="h-4 w-4" />
            <span>{t.notFound.homeBtn}</span>
          </button>
        </div>
      </div>
    </section>
  );
}
