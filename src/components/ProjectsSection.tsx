import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Layers, Info, ExternalLink } from 'lucide-react';
import type { Language, ProjectCategory, ProjectItem } from '../types';
import { getTranslations } from '../i18n/translations';
import { PROJECTS } from '../data/projects';

interface ProjectsSectionProps {
  lang: Language;
}

function ProjectImage({ project, lang }: { project: ProjectItem; lang: Language }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#0d1426] via-[#090d19] to-[#150e29] p-6">
        <div className="text-center">
          <Layers className="mx-auto h-8 w-8 text-blue-400" />
          <p className="mt-2 font-display text-sm font-semibold text-slate-200">
            {project.title[lang]}
          </p>
        </div>
      </div>
    );
  }

  return (
    <img
      src={project.image}
      alt={project.title[lang]}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
    />
  );
}

export function ProjectsSection({ lang }: ProjectsSectionProps) {
  const t = getTranslations(lang);
  const [filter, setFilter] = useState<ProjectCategory>('all');
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const BackIcon = lang === 'ar' ? ArrowRight : ArrowLeft;

  const visibleProjects = useMemo(() => {
    if (filter === 'all') return PROJECTS;
    return PROJECTS.filter((p) => p.category === filter);
  }, [filter]);

  const filterOptions: { id: ProjectCategory; label: string }[] = [
    { id: 'all', label: t.projects.filters.all },
    { id: 'networking', label: t.projects.filters.networking },
    { id: 'systems', label: t.projects.filters.systems },
    { id: 'web', label: t.projects.filters.web },
  ];

  // Full Project Details View
  if (selectedProject) {
    return (
      <section className="mx-auto max-w-[1320px] px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <button
          type="button"
          onClick={() => {
            setSelectedProject(null);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="mb-6 inline-flex min-h-[40px] items-center gap-2 rounded-xl border border-slate-400/20 bg-slate-900/70 px-4 py-2 text-xs font-semibold text-slate-200 hover:border-blue-500/40 hover:text-white cursor-pointer"
        >
          <BackIcon className="h-4 w-4" />
          <span>{t.projects.backToGrid}</span>
        </button>

        <div className="glass-panel rounded-2xl p-5 sm:p-8 space-y-8">
          <div className="border-b border-slate-400/15 pb-6">
            <p className="text-xs font-medium text-violet-300">
              {selectedProject.statusLabel[lang]}
            </p>
            <p className="mt-1.5 text-sm font-medium text-blue-300">
              {selectedProject.subtitle[lang]}
            </p>
            <h1 className="mt-1.5 font-display text-3xl font-bold text-white sm:text-4xl">
              {selectedProject.title[lang]}
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-slate-200 sm:text-base">
              {selectedProject.summary[lang]}
            </p>
          </div>

          {/* Concept Visual / Screenshot Frame */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <h2 className="mb-3 text-sm font-semibold text-white">
                {t.projects.screenshotsTitle}
              </h2>
              <div className="aspect-[16/10] overflow-hidden rounded-xl border border-slate-400/15 bg-[#04060c]">
                <ProjectImage project={selectedProject} lang={lang} />
              </div>
            </div>

            <div className="flex flex-col justify-between gap-5 lg:col-span-5">
              <div className="rounded-xl border border-slate-400/15 bg-[#04060c] p-5">
                <h2 className="text-sm font-semibold text-white">
                  {t.projects.stackTitle}
                </h2>
                <p dir="ltr" className="mt-2 font-mono text-xs leading-relaxed text-blue-300">
                  {selectedProject.stack.join(' · ')}
                </p>

                <h3 className="mt-5 text-sm font-semibold text-white">
                  {t.projects.capabilitiesTitle}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-300">
                  {selectedProject.capabilities[lang].join(' · ')}
                </p>
              </div>

              <div className="rounded-xl border border-slate-400/15 bg-[#04060c] p-5 space-y-3">
                <h2 className="text-sm font-semibold text-white">
                  {t.projects.linksTitle}
                </h2>
                <div className="space-y-2 text-xs text-slate-300">
                  {selectedProject.demoUrl ? (
                    <a
                      href={selectedProject.demoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 font-semibold text-blue-400 hover:underline"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>{t.projects.openDemo}</span>
                    </a>
                  ) : (
                    <p className="text-slate-400">{t.projects.demoPending}</p>
                  )}

                  {selectedProject.sourceUrl ? (
                    <a
                      href={selectedProject.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 font-semibold text-blue-400 hover:underline"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>{t.projects.openSource}</span>
                    </a>
                  ) : (
                    <p className="text-slate-400">{t.projects.sourcePending}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Features & System Architecture */}
          <div className="grid grid-cols-1 gap-6 border-t border-slate-400/15 pt-6 md:grid-cols-2">
            <div>
              <h2 className="font-display text-lg font-semibold text-white">
                {t.projects.featuresTitle}
              </h2>
              <ul className="mt-3 space-y-2.5 text-sm text-slate-300">
                {selectedProject.features[lang].map((feat) => (
                  <li key={feat} className="flex items-start gap-2.5">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="font-display text-lg font-semibold text-white">
                {t.projects.architectureTitle}
              </h2>
              <ul className="mt-3 space-y-2.5 text-sm text-slate-300">
                {selectedProject.architecture[lang].map((arch) => (
                  <li key={arch} className="flex items-start gap-2.5">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />
                    <span>{arch}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Engineering Challenges & Solutions */}
          <div className="border-t border-slate-400/15 pt-6">
            <h2 className="font-display text-lg font-semibold text-white">
              {t.projects.challengesTitle}
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              {selectedProject.challenges.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-400/15 bg-[#04060c] p-5 space-y-3"
                >
                  <div>
                    <span className="text-xs font-semibold text-amber-300">
                      {t.projects.challengeLabel}
                    </span>
                    <p className="mt-1 text-sm text-slate-200">{item.challenge[lang]}</p>
                  </div>
                  <div className="border-t border-slate-400/10 pt-3">
                    <span className="text-xs font-semibold text-emerald-300">
                      {t.projects.solutionLabel}
                    </span>
                    <p className="mt-1 text-sm text-slate-300">{item.solution[lang]}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-[1320px] px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 border-b border-slate-400/15 pb-5 sm:mb-8 sm:pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-4xl">
            {t.projects.heading}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-300 sm:text-base">
            {t.projects.subheading}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-1 rounded-xl border border-slate-400/20 bg-[#0b0e17] p-1 sm:flex sm:flex-wrap">
          {filterOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setFilter(opt.id)}
              className={`min-h-[38px] rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                filter === opt.id
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Portfolio Demonstration Notice */}
      <div className="mb-6 flex items-start gap-3 rounded-xl border border-violet-500/30 bg-violet-950/20 p-4 text-sm text-violet-100">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-violet-400" />
        <div>
          <p className="font-semibold">{t.projects.demoBannerTitle}</p>
          <p className="mt-0.5 text-xs text-violet-200/85">{t.projects.demoBannerDesc}</p>
        </div>
      </div>

      {/* 2-Column Responsive Portfolio Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {visibleProjects.map((project) => (
          <article
            key={project.id}
            className="glass-panel glass-panel-hover group flex flex-col overflow-hidden rounded-2xl"
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden border-b border-slate-400/15 bg-[#04060c]">
              <ProjectImage project={project} lang={lang} />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050508]/80 via-transparent to-transparent"
              />
            </div>

            <div className="flex flex-1 flex-col justify-between p-5 sm:p-6">
              <div>
                <p className="text-xs font-medium text-violet-300/90">
                  {project.statusLabel[lang]}
                </p>
                <p className="mt-1 text-xs font-medium text-blue-300/90">
                  {project.subtitle[lang]}
                </p>
                <h2 className="mt-1.5 font-display text-xl font-bold text-white sm:text-2xl">
                  {project.title[lang]}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">
                  {project.summary[lang]}
                </p>
              </div>

              <div className="mt-6 space-y-4 border-t border-slate-400/15 pt-4">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400 font-mono">
                  {project.stack.map((tech, idx) => (
                    <span key={tech} className="inline-flex items-center gap-2">
                      <span>{tech}</span>
                      {idx < project.stack.length - 1 && (
                        <span aria-hidden="true" className="text-slate-600">
                          ·
                        </span>
                      )}
                    </span>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedProject(project);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="inline-flex min-h-[44px] items-center gap-1.5 text-xs font-semibold text-blue-400 transition-colors hover:text-blue-300 cursor-pointer"
                >
                  <span>{t.projects.inspectBtn}</span>
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
