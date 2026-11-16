import { Code2, Cpu, Globe, Layers } from 'lucide-react';
import type { Language } from '../types';
import { getTranslations } from '../i18n/translations';

interface AboutSectionProps {
  lang: Language;
}

export function AboutSection({ lang }: AboutSectionProps) {
  const t = getTranslations(lang);
  const focusIcons = [Code2, Cpu, Globe];

  return (
    <section className="mx-auto max-w-[1320px] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 border-b border-slate-400/15 pb-6">
        <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {t.about.heading}
        </h1>
      </div>

      {/* Developer Intro Card */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="text-xs font-semibold text-blue-400">{t.brand}</p>
            <h2 className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl">
              {t.about.name}
            </h2>
            <p className="mt-1 text-sm font-medium text-violet-300">{t.about.role}</p>
            <p className="mt-4 text-sm leading-relaxed text-slate-300 sm:text-base">
              {t.about.bio}
            </p>
          </div>

          <div className="lg:col-span-7">
            <h3 className="text-sm font-semibold text-white">{t.about.focusTitle}</h3>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {t.about.focusItems.map((item, idx) => {
                const Icon = focusIcons[idx] ?? Layers;
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
      </div>

      {/* Skills & Technologies Matrix */}
      <div className="mt-8 glass-panel rounded-2xl p-6 sm:p-8">
        <h2 className="font-display text-xl font-bold text-white">
          {t.about.skillsTitle}
        </h2>

        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {t.about.skillGroups.map((group) => (
            <div
              key={group.group}
              className="border-t border-slate-400/15 pt-4"
            >
              <h3 className="text-sm font-semibold text-blue-300">{group.group}</h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-300">
                {group.items.map((skill) => (
                  <li key={skill} className="flex items-center gap-2">
                    <span className="h-1 w-1 rounded-full bg-violet-400" />
                    <span>{skill}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
