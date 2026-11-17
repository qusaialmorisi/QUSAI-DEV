import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Bot, Code2, Layers, Mail, User } from 'lucide-react';
import type { Language, SectionId } from '../types';
import { getTranslations } from '../i18n/translations';
import { HeroCanvas } from './HeroCanvas';

interface HomeSectionProps {
  lang: Language;
  onNavigate: (section: SectionId) => void;
}

export function HomeSection({ lang, onNavigate }: HomeSectionProps) {
  const t = getTranslations(lang);
  const [imgError, setImgError] = useState(false);
  const ArrowIcon = lang === 'ar' ? ArrowLeft : ArrowRight;

  const highlightIcons = {
    about: User,
    projects: Layers,
    'ai-assistant': Bot,
  } as const;

  return (
    <section aria-label={t.nav.home} className="relative overflow-hidden">
      {/* Hero Banner */}
      <div className="relative border-b border-slate-400/15">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-40 start-1/4 h-[420px] w-[420px] rounded-full bg-blue-600/15 blur-[120px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 end-1/4 h-[380px] w-[380px] rounded-full bg-violet-600/15 blur-[120px]"
        />
        <HeroCanvas />

        <div className="relative z-10 mx-auto max-w-[1200px] px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-24">
          <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12 lg:gap-10">
            {/* Typographic Intro */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col justify-between lg:col-span-7"
            >
              <div className="space-y-4 sm:space-y-5">
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-blue-300 sm:text-sm">
                  <span>{t.home.greeting}</span>
                  <span aria-hidden="true" className="text-slate-500">
                    ·
                  </span>
                  <span className="text-violet-300">{t.home.role}</span>
                </div>

                <h1 className="font-display max-w-2xl text-3xl font-bold leading-[1.15] tracking-tight text-white [text-wrap:balance] sm:text-5xl lg:text-[3.25rem]">
                  <span className="neon-gradient-text">{t.home.headline}</span>
                </h1>

                <p className="max-w-xl text-sm leading-relaxed text-slate-300 sm:text-lg">
                  {t.home.intro}
                </p>
              </div>

              <div className="mt-8 flex flex-col gap-3 pt-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
                <button
                  type="button"
                  onClick={() => onNavigate('projects')}
                  className="neon-action-btn inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white whitespace-nowrap shrink-0 sm:w-auto cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                >
                  <span>{t.home.exploreProjectsBtn}</span>
                  <ArrowIcon className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('contact')}
                  className="inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl border border-slate-400/25 bg-slate-900/75 px-6 py-3 text-sm font-semibold text-slate-100 transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-500/50 hover:text-white whitespace-nowrap shrink-0 sm:w-auto cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                >
                  <Mail className="h-4 w-4 text-blue-400" />
                  <span>{t.home.contactMeBtn}</span>
                </button>
              </div>
            </motion.div>

            {/* Right Visual Showcase */}
            <motion.div
              initial={{ opacity: 0, scale: 0.985 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-5"
            >
              <div className="glass-panel relative h-full min-h-[240px] overflow-hidden rounded-2xl sm:min-h-[300px]">
                {!imgError ? (
                  <img
                    src="/src/assets/images/hero_futuristic_core_1794862949398.jpg"
                    alt={t.home.visualAlt}
                    referrerPolicy="no-referrer"
                    onError={() => setImgError(true)}
                    className="h-full w-full object-cover lg:h-full"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#0b1021] via-[#090d1a] to-[#120b24] p-8">
                    <div className="text-center">
                      <Code2 className="mx-auto h-10 w-10 text-blue-400" />
                      <p className="mt-3 font-display text-sm font-semibold text-slate-200">
                        {t.brand}
                      </p>
                    </div>
                  </div>
                )}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050508]/90 via-[#050508]/25 to-transparent"
                />
                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                  <p className="text-xs font-medium text-slate-200">{t.home.visualCaption}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Concise 3-Column Portfolio Overview Strip */}
      <div className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <h2 className="mb-6 font-display text-xl font-bold tracking-tight text-white sm:text-2xl">
          {t.home.highlightsTitle}
        </h2>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {t.home.highlights.map((item) => {
            const Icon = highlightIcons[item.section];
            return (
              <button
                key={item.section}
                type="button"
                onClick={() => onNavigate(item.section)}
                className="glass-panel glass-panel-hover group flex flex-col justify-between rounded-2xl p-6 text-start cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <Icon className="h-5 w-5 text-blue-400" />
                    <ArrowIcon className="h-4 w-4 text-slate-500 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-blue-400 rtl:group-hover:-translate-x-0.5" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-white">
                    {item.title}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-slate-300">{item.desc}</p>
                </div>

                <div className="mt-5 border-t border-slate-400/10 pt-3 text-xs font-semibold text-blue-400">
                  {item.cta}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
