import { motion } from 'motion/react';
import {
  Braces,
  Code2,
  Cpu,
  Database,
  Flame,
  Globe,
  Layers,
  Network,
  Server,
  Smartphone,
  Terminal,
} from 'lucide-react';
import type { Language, SkillIconId } from '../types';
import { SKILLS, getTranslations } from '../i18n/translations';

interface AboutSectionProps {
  lang: Language;
}

const SKILL_ICON_MAP: Record<SkillIconId, typeof Code2> = {
  flutter: Smartphone,
  dart: Code2,
  python: Terminal,
  javascript: Braces,
  react: Layers,
  php: Server,
  laravel: Cpu,
  mysql: Database,
  firebase: Flame,
  networking: Network,
};

export function AboutSection({ lang }: AboutSectionProps) {
  const t = getTranslations(lang);
  const highlightIcons = [Smartphone, Server, Globe];

  return (
    <section className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 border-b border-slate-400/15 pb-6">
        <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {t.about.heading}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-300 sm:text-base">
          {t.about.subheading}
        </p>
      </div>

      {/* Developer Bio & Core Pillars */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="glass-panel rounded-2xl p-6 sm:p-8"
      >
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="text-xs font-semibold text-blue-400">{t.brand}</p>
            <h2 className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl">
              {t.creator}
            </h2>
            <p className="mt-1 text-sm font-medium text-violet-300">{t.roleTitle}</p>
            <p className="mt-4 text-sm leading-relaxed text-slate-300 sm:text-base">
              {t.about.introBody}
            </p>
          </div>

          <div className="lg:col-span-7">
            <h3 className="text-sm font-semibold text-white">{t.about.introTitle}</h3>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {t.about.highlights.map((item, idx) => {
                const Icon = highlightIcons[idx] ?? Layers;
                return (
                  <div
                    key={item.title}
                    className="rounded-xl border border-slate-400/15 bg-[#04060c] p-4"
                  >
                    <Icon className="h-5 w-5 text-blue-400" />
                    <h4 className="mt-3 text-sm font-semibold text-white">{item.title}</h4>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
                      {item.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>

      {/* 10 Requested Skills Grid with Icons */}
      <div className="mt-10">
        <h2 className="font-display text-xl font-bold text-white sm:text-2xl">
          {t.about.skillsHeading}
        </h2>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {SKILLS.map((skill) => {
            const Icon = SKILL_ICON_MAP[skill.id];
            return (
              <div
                key={skill.id}
                className="glass-panel glass-panel-hover flex flex-col justify-between rounded-2xl p-5"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-500/25 bg-blue-500/10 text-blue-300">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-xs text-slate-400">{skill.category[lang]}</span>
                  </div>
                  <h3 className="mt-4 font-display text-base font-bold text-white">
                    {skill.name}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-300">
                    {skill.summary[lang]}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
