import { useMemo, useState } from 'react';
import { BookOpen, Copy, Check, Search } from 'lucide-react';
import type { KnowledgeCategory, Language } from '../types';
import { getTranslations } from '../i18n/translations';
import { KNOWLEDGE_ARTICLES } from '../data/knowledge';
import { useToast } from './ToastContext';

interface KnowledgeCenterSectionProps {
  lang: Language;
}

export function KnowledgeCenterSection({ lang }: KnowledgeCenterSectionProps) {
  const t = getTranslations(lang);
  const { showToast } = useToast();
  const [category, setCategory] = useState<KnowledgeCategory>('all');
  const [query, setQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredArticles = useMemo(() => {
    const q = query.trim().toLowerCase();
    return KNOWLEDGE_ARTICLES.filter((article) => {
      if (category !== 'all' && article.category !== category) return false;
      if (!q) return true;
      return (
        article.title.en.toLowerCase().includes(q) ||
        article.title.ar.toLowerCase().includes(q) ||
        article.summary.en.toLowerCase().includes(q) ||
        article.summary.ar.toLowerCase().includes(q) ||
        article.code.toLowerCase().includes(q) ||
        article.category.toLowerCase().includes(q)
      );
    });
  }, [category, query]);

  const categories: { id: KnowledgeCategory; label: string }[] = [
    { id: 'all', label: t.knowledge.categories.all },
    { id: 'networking', label: t.knowledge.categories.networking },
    { id: 'python', label: t.knowledge.categories.python },
    { id: 'flutter', label: t.knowledge.categories.flutter },
    { id: 'react', label: t.knowledge.categories.react },
    { id: 'php', label: t.knowledge.categories.php },
    { id: 'programming', label: t.knowledge.categories.programming },
  ];

  const handleCopyCode = async (id: string, code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedId(id);
      showToast(t.toast.copied, 'success');
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      showToast(t.toast.copyFailed, 'error');
    }
  };

  return (
    <section className="mx-auto max-w-[1320px] px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 border-b border-slate-400/15 pb-5 sm:mb-8 sm:pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-4xl">
            {t.knowledge.heading}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-300 sm:text-base">
            {t.knowledge.subheading}
          </p>
        </div>

        <div className="relative w-full lg:w-80">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.knowledge.searchPlaceholder}
            className="w-full rounded-xl border border-slate-400/20 bg-[#0b0e17] py-2.5 ps-9 pe-3 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none sm:text-xs"
          />
        </div>
      </div>

      {/* Category Filter Bar + Educational Notice */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-1 rounded-xl border border-slate-400/20 bg-[#0b0e17] p-1 w-fit">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategory(cat.id)}
              className={`min-h-[38px] rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                category === cat.id
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <p className="text-xs text-slate-400">{t.knowledge.notice}</p>
      </div>

      {/* Articles Grid */}
      {filteredArticles.length === 0 ? (
        <div className="glass-panel rounded-2xl p-10 text-center">
          <BookOpen className="mx-auto h-8 w-8 text-blue-400/80" />
          <h2 className="mt-3 font-display text-lg font-semibold text-white">
            {t.knowledge.emptyTitle}
          </h2>
          <p className="mt-1 text-sm text-slate-400">{t.knowledge.emptyDesc}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {filteredArticles.map((article) => (
            <article
              key={article.id}
              className="glass-panel flex flex-col justify-between rounded-2xl p-5 sm:p-6"
            >
              <div>
                <p className="text-xs font-medium text-blue-300">
                  {article.level[lang]}
                </p>
                <h2 className="mt-1.5 font-display text-xl font-bold text-white">
                  {article.title[lang]}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">
                  {article.summary[lang]}
                </p>

                <div className="mt-5 space-y-4 border-t border-slate-400/15 pt-4">
                  {article.sections.map((sec) => (
                    <div key={sec.heading.en}>
                      <h3 className="text-xs font-semibold text-violet-300">
                        {sec.heading[lang]}
                      </h3>
                      <p className="mt-1 text-xs leading-relaxed text-slate-300 sm:text-sm">
                        {sec.body[lang]}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div
                dir="ltr"
                className="mt-5 overflow-hidden rounded-xl border border-slate-400/15 bg-[#04060c]"
              >
                <div className="flex items-center justify-between border-b border-slate-400/10 px-3 py-2 text-xs text-slate-400">
                  <span className="truncate font-mono">{article.codeLabel[lang]}</span>
                  <button
                    type="button"
                    onClick={() => handleCopyCode(article.id, article.code)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-blue-400 hover:text-blue-300 shrink-0 cursor-pointer"
                  >
                    {copiedId === article.id ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    <span>{t.knowledge.copyCode}</span>
                  </button>
                </div>
                <pre className="overflow-x-auto p-3.5 font-mono text-xs leading-6 text-slate-100">
                  <code>{article.code}</code>
                </pre>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
