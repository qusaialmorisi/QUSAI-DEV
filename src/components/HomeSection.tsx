import { useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight,
  ArrowLeft,
  Cpu,
  Terminal,
  Code2,
  Network,
  Wrench,
  BookOpen,
  Layers,
  User,
  Mail,
  FlaskConical,
  Trophy,
} from 'lucide-react';
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

  const moduleCards: {
    id: SectionId;
    title: string;
    meta: string;
    desc: string;
    action: string;
    Icon: typeof Cpu;
    accentClass: string;
  }[] = [
    {
      id: 'ai-lab',
      ...t.home.cards.ai,
      Icon: Cpu,
      accentClass: 'text-blue-400',
    },
    {
      id: 'terminal',
      ...t.home.cards.terminal,
      Icon: Terminal,
      accentClass: 'text-emerald-400',
    },
    {
      id: 'playground',
      ...t.home.cards.playground,
      Icon: Code2,
      accentClass: 'text-violet-400',
    },
    {
      id: 'network-lab',
      ...t.home.cards.network,
      Icon: Network,
      accentClass: 'text-sky-400',
    },
  ];

  const secondarySections: { id: SectionId; label: string; Icon: typeof Wrench }[] = [
    { id: 'experiments', label: t.nav.experiments, Icon: FlaskConical },
    { id: 'challenges', label: t.nav.challenges, Icon: Trophy },
    { id: 'dev-tools', label: t.nav.devTools, Icon: Wrench },
    { id: 'knowledge', label: t.nav.knowledge, Icon: BookOpen },
    { id: 'projects', label: t.nav.projects, Icon: Layers },
    { id: 'about', label: t.nav.about, Icon: User },
    { id: 'contact', label: t.nav.contact, Icon: Mail },
  ];

  return (
    <section aria-label={t.nav.home} className="relative overflow-hidden">
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

        <div className="relative z-10 mx-auto max-w-[1320px] px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-20">
          <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12">
            {/* Left Hero Column */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col justify-between lg:col-span-7"
            >
              <div className="space-y-5 sm:space-y-6">
                <p className="text-xs font-medium text-blue-300/90 sm:text-sm">
                  {t.home.kicker}
                </p>

                <h1 className="font-display max-w-2xl text-3xl font-bold leading-[1.15] tracking-tight text-white [text-wrap:balance] sm:text-5xl lg:text-[3.5rem]">
                  <span className="neon-gradient-text">{t.home.headline}</span>
                </h1>

                <p className="max-w-xl text-sm leading-relaxed text-slate-300 sm:text-lg">
                  {t.home.lead}
                </p>
              </div>

              <div className="mt-7 flex flex-col gap-3 pt-2 sm:mt-8 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4 sm:pt-4">
                <button
                  type="button"
                  onClick={() => onNavigate('ai-lab')}
                  className="neon-action-btn inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white whitespace-nowrap shrink-0 sm:w-auto cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                >
                  <span>{t.home.primaryCta}</span>
                  <ArrowIcon className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('terminal')}
                  className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-slate-400/25 bg-slate-900/70 px-6 py-3 text-sm font-semibold text-slate-100 transition-colors duration-150 hover:border-blue-500/50 hover:text-white whitespace-nowrap shrink-0 sm:w-auto cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                >
                  <Terminal className="h-4 w-4 text-emerald-400" />
                  <span>{t.home.secondaryCta}</span>
                </button>
              </div>
            </motion.div>

            {/* Right Hero Visual Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.985 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-5"
            >
              <div className="glass-panel relative h-full min-h-[240px] overflow-hidden rounded-2xl sm:min-h-[280px]">
                {!imgError ? (
                  <img
                    src="/src/assets/images/hero_futuristic_core_1794862949398.jpg"
                    alt={t.home.visualCaption}
                    referrerPolicy="no-referrer"
                    onError={() => setImgError(true)}
                    className="h-full w-full object-cover lg:h-full"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#0b1021] via-[#090d1a] to-[#120b24] p-8">
                    <div className="text-center">
                      <Cpu className="mx-auto h-10 w-10 text-blue-400" />
                      <p className="mt-3 text-sm font-medium text-slate-200">{t.brand}</p>
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

      {/* Interactive 4-Column Laboratory Workbenches Strip */}
      <div className="mx-auto max-w-[1320px] px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
        <div className="mb-6 flex flex-col gap-2 sm:mb-8">
          <h2 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {t.home.modulesTitle}
          </h2>
          <p className="max-w-2xl text-sm text-slate-400 sm:text-base">
            {t.home.modulesSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
          {moduleCards.map((card) => {
            const Icon = card.Icon;
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => onNavigate(card.id)}
                className="glass-panel glass-panel-hover group flex flex-col justify-between rounded-2xl p-5 text-start sm:p-6 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <Icon className={`h-5 w-5 ${card.accentClass}`} />
                    <ArrowIcon className="h-4 w-4 text-slate-500 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-blue-400 rtl:group-hover:-translate-x-0.5" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-white">
                    {card.title}
                  </h3>
                  <p className="mt-1 text-xs text-slate-400">{card.meta}</p>
                  <p className="mt-3 text-sm leading-relaxed text-slate-300">{card.desc}</p>
                </div>

                <div className="mt-5 border-t border-slate-400/10 pt-3 text-xs font-semibold text-blue-400">
                  {card.action}
                </div>
              </button>
            );
          })}
        </div>

        {/* Secondary Platform Quick Links */}
        <div className="mt-8 rounded-2xl border border-slate-400/15 bg-[#070a12]/80 p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-xs font-semibold text-slate-400">
              {t.home.secondaryLinksTitle}
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {secondarySections.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => onNavigate(id)}
                  className="inline-flex min-h-[38px] items-center gap-2 rounded-xl border border-slate-400/15 bg-slate-900/60 px-3.5 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:border-blue-500/45 hover:text-white cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <Icon className="h-3.5 w-3.5 text-blue-400" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
