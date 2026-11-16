import { useState } from 'react';
import { Network, BarChart3, Palette, Cpu, Info } from 'lucide-react';
import type { Language } from '../types';
import { getTranslations } from '../i18n/translations';
import { NetworkSimulator } from './experiments/NetworkSimulator';
import { AlgorithmVisualizer } from './experiments/AlgorithmVisualizer';
import { CssPlayground } from './experiments/CssPlayground';
import { DigitalLogicLab } from './experiments/DigitalLogicLab';

interface LiveExperimentsSectionProps {
  lang: Language;
}

type ExperimentTab = 'network' | 'algorithms' | 'css' | 'logic';

export function LiveExperimentsSection({ lang }: LiveExperimentsSectionProps) {
  const t = getTranslations(lang);
  const exp = t.experiments;
  const [activeTab, setActiveTab] = useState<ExperimentTab>('network');

  const tabs: { id: ExperimentTab; label: string; Icon: typeof Network }[] = [
    { id: 'network', label: exp.tabs.network, Icon: Network },
    { id: 'algorithms', label: exp.tabs.algorithms, Icon: BarChart3 },
    { id: 'css', label: exp.tabs.css, Icon: Palette },
    { id: 'logic', label: exp.tabs.logic, Icon: Cpu },
  ];

  const instructionText =
    activeTab === 'network'
      ? exp.network.instructions
      : activeTab === 'algorithms'
      ? exp.algorithms.instructions
      : activeTab === 'css'
      ? exp.css.instructions
      : exp.logic.instructions;

  return (
    <section className="mx-auto max-w-[1320px] px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 border-b border-slate-400/15 pb-5 sm:mb-8 sm:pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-4xl">
            {exp.heading}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-300 sm:text-base">
            {exp.subheading}
          </p>
        </div>

        <div
          role="tablist"
          aria-label={exp.heading}
          className="grid grid-cols-2 gap-1 rounded-xl border border-slate-400/20 bg-[#0b0e17] p-1 sm:flex sm:flex-wrap"
        >
          {tabs.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={activeTab === id}
              onClick={() => setActiveTab(id)}
              className={`inline-flex min-h-[40px] items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === id
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Contextual Experiment Instructions */}
      <div className="mb-6 flex items-start gap-3 rounded-xl border border-blue-500/25 bg-blue-950/20 p-4 text-xs leading-relaxed text-blue-100">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
        <div>
          <span className="font-semibold text-white">{exp.instructionsLabel}: </span>
          <span>{instructionText}</span>
        </div>
      </div>

      {activeTab === 'network' && <NetworkSimulator lang={lang} />}
      {activeTab === 'algorithms' && <AlgorithmVisualizer lang={lang} />}
      {activeTab === 'css' && <CssPlayground lang={lang} />}
      {activeTab === 'logic' && <DigitalLogicLab lang={lang} />}
    </section>
  );
}
