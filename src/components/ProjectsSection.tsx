import { useMemo, useState } from 'react';
import { ExternalLink, Layers } from 'lucide-react';
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

  return (
    <section className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 border-b border-slate-400/15 pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
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

      {/* 2-Column Responsive Portfolio Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {visibleProjects.map((project) => (
          <article
            key={project.id}
            className="glass-panel glass-panel-hover group flex flex-col overflow-hidden rounded-2xl"
          >
            <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-slate-400/15 bg-[#04060c]">
              <ProjectImage project={project} lang={lang} />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050508]/80 via-transparent to-transparent"
              />
            </div>

            <div className="flex flex-1 flex-col justify-between p-6">
              <div>
                <p className="text-xs font-medium text-blue-300">
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
                <div dir="ltr" className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-xs text-slate-400">
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

                {project.projectUrl ? (
                  <a
                    href={project.projectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[40px] items-center gap-1.5 text-xs font-semibold text-blue-400 transition-colors hover:text-blue-300"
                  >
                    <span>{t.projects.visitLink}</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                ) : (
                  <p className="text-xs text-slate-500">{t.projects.linkUnavailable}</p>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
