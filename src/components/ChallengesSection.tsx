import { useEffect, useMemo, useState } from 'react';
import {
  Trophy,
  Calendar,
  Code2,
  Network,
  Play,
  RotateCcw,
  Copy,
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  Trash2,
} from 'lucide-react';
import type {
  ChallengeDifficulty,
  ChallengeEvaluationResult,
  Language,
  ProgrammingChallengeLang,
} from '../types';
import { getTranslations } from '../i18n/translations';
import {
  ALL_CHALLENGES,
  NETWORKING_CHALLENGES,
  PROGRAMMING_CHALLENGES,
  getDailyChallenge,
  type DeveloperChallenge,
  type NetworkingChallenge,
  type ProgrammingChallenge,
} from '../data/challenges';
import {
  evaluateNetworkingChallenge,
  runHtmlCssChallengeTests,
  runJavaScriptChallengeTests,
  runPythonChallengeTests,
} from '../utils/challengeEvaluators';
import { useToast } from './ToastContext';

interface ChallengesSectionProps {
  lang: Language;
}

type ChallengesTab = 'daily' | 'programming' | 'networking';
type TrackFilter = 'all' | ProgrammingChallengeLang;
type DifficultyFilter = 'all' | ChallengeDifficulty;

const PROGRESS_STORAGE_KEY = 'qusai_dev_challenges_progress_v1';

interface LocalProgressState {
  solvedIds: string[];
  dailyAttemptedDate: string | null;
  dailySolvedDate: string | null;
}

function loadLocalProgress(): LocalProgressState {
  try {
    const raw = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<LocalProgressState>;
      return {
        solvedIds: Array.isArray(parsed.solvedIds) ? parsed.solvedIds : [],
        dailyAttemptedDate: parsed.dailyAttemptedDate ?? null,
        dailySolvedDate: parsed.dailySolvedDate ?? null,
      };
    }
  } catch {
    // ignore storage errors
  }
  return { solvedIds: [], dailyAttemptedDate: null, dailySolvedDate: null };
}

export function ChallengesSection({ lang }: ChallengesSectionProps) {
  const t = getTranslations(lang);
  const ch = t.challenges;
  const { showToast } = useToast();

  const todayKey = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const dailyChallenge = useMemo(() => getDailyChallenge(), []);

  const [activeTab, setActiveTab] = useState<ChallengesTab>('daily');
  const [trackFilter, setTrackFilter] = useState<TrackFilter>('all');
  const [diffFilter, setDiffFilter] = useState<DifficultyFilter>('all');

  const [selectedProgId, setSelectedProgId] = useState<string>(PROGRAMMING_CHALLENGES[0].id);
  const [selectedNetId, setSelectedNetId] = useState<string>(NETWORKING_CHALLENGES[0].id);

  const [progress, setProgress] = useState<LocalProgressState>(loadLocalProgress);

  // Solution drafts keyed by challenge ID
  const [codeDrafts, setCodeDrafts] = useState<Record<string, string>>({});
  const [htmlDrafts, setHtmlDrafts] = useState<Record<string, string>>({});
  const [cssDrafts, setCssDrafts] = useState<Record<string, string>>({});
  const [netDrafts, setNetDrafts] = useState<Record<string, Record<string, string>>>({});

  const [showHints, setShowHints] = useState<boolean>(false);
  const [showSolution, setShowSolution] = useState<boolean>(false);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [evaluations, setEvaluations] = useState<Record<string, ChallengeEvaluationResult>>({});
  const [emptyNotices, setEmptyNotices] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // ignore storage quota errors
    }
  }, [progress]);

  const filteredProgramming = useMemo(() => {
    return PROGRAMMING_CHALLENGES.filter((item) => {
      if (trackFilter !== 'all' && item.language !== trackFilter) return false;
      if (diffFilter !== 'all' && item.difficulty !== diffFilter) return false;
      return true;
    });
  }, [trackFilter, diffFilter]);

  useEffect(() => {
    if (
      filteredProgramming.length > 0 &&
      !filteredProgramming.some((item) => item.id === selectedProgId)
    ) {
      setSelectedProgId(filteredProgramming[0].id);
    }
  }, [filteredProgramming, selectedProgId]);

  const activeChallenge: DeveloperChallenge = useMemo(() => {
    if (activeTab === 'daily') return dailyChallenge;
    if (activeTab === 'networking') {
      return (
        NETWORKING_CHALLENGES.find((c) => c.id === selectedNetId) ?? NETWORKING_CHALLENGES[0]
      );
    }
    return (
      filteredProgramming.find((c) => c.id === selectedProgId) ??
      filteredProgramming[0] ??
      PROGRAMMING_CHALLENGES[0]
    );
  }, [activeTab, dailyChallenge, selectedNetId, filteredProgramming, selectedProgId]);

  useEffect(() => {
    setShowHints(false);
    setShowSolution(false);
  }, [activeChallenge.id, activeTab]);

  const difficultyLabel = (diff: ChallengeDifficulty) => {
    if (diff === 'beginner') return ch.filters.beginner;
    if (diff === 'intermediate') return ch.filters.intermediate;
    return ch.filters.advanced;
  };

  const trackLabel = (item: DeveloperChallenge) => {
    if (item.kind === 'networking') return ch.tabs.networking;
    if (item.language === 'python') return ch.filters.python;
    if (item.language === 'javascript') return ch.filters.javascript;
    return ch.filters.htmlCss;
  };

  const getCurrentCode = (item: ProgrammingChallenge) =>
    codeDrafts[item.id] ?? item.starterCode ?? '';

  const getCurrentHtml = (item: ProgrammingChallenge) =>
    htmlDrafts[item.id] ?? item.starterHtml ?? '';

  const getCurrentCss = (item: ProgrammingChallenge) =>
    cssDrafts[item.id] ?? item.starterCss ?? '';

  const getCurrentNetAnswers = (item: NetworkingChallenge) =>
    netDrafts[item.id] ?? {};

  const recordAttemptOutcome = (challengeId: string, passedAll: boolean) => {
    setProgress((prev) => {
      const nextSolved =
        passedAll && !prev.solvedIds.includes(challengeId)
          ? [...prev.solvedIds, challengeId]
          : prev.solvedIds;
      const isDaily = challengeId === dailyChallenge.id;
      return {
        solvedIds: nextSolved,
        dailyAttemptedDate: isDaily ? todayKey : prev.dailyAttemptedDate,
        dailySolvedDate:
          isDaily && passedAll ? todayKey : prev.dailySolvedDate,
      };
    });
  };

  const handleEvaluate = async () => {
    if (isEvaluating) return;

    let hasEmpty = false;
    if (activeChallenge.kind === 'networking') {
      const answers = getCurrentNetAnswers(activeChallenge);
      hasEmpty = activeChallenge.fields.some((f) => !(answers[f.id] ?? '').trim());
    } else if (activeChallenge.language === 'html-css') {
      hasEmpty =
        !getCurrentHtml(activeChallenge).trim() && !getCurrentCss(activeChallenge).trim();
    } else {
      hasEmpty = !getCurrentCode(activeChallenge).trim();
    }
    setEmptyNotices((prev) => ({ ...prev, [activeChallenge.id]: hasEmpty }));

    setIsEvaluating(true);

    try {
      let result: ChallengeEvaluationResult;

      if (activeChallenge.kind === 'networking') {
        result = evaluateNetworkingChallenge(
          activeChallenge,
          getCurrentNetAnswers(activeChallenge),
          lang
        );
      } else if (activeChallenge.language === 'python') {
        result = runPythonChallengeTests(
          getCurrentCode(activeChallenge),
          activeChallenge.functionName ?? '',
          activeChallenge.pythonTests ?? []
        );
      } else if (activeChallenge.language === 'javascript') {
        result = await runJavaScriptChallengeTests(
          getCurrentCode(activeChallenge),
          activeChallenge.functionName ?? '',
          activeChallenge.jsTests ?? []
        );
      } else {
        result = await runHtmlCssChallengeTests(
          getCurrentHtml(activeChallenge),
          getCurrentCss(activeChallenge),
          activeChallenge.domAssertions ?? [],
          lang
        );
      }

      setEvaluations((prev) => ({ ...prev, [activeChallenge.id]: result }));
      recordAttemptOutcome(activeChallenge.id, result.passedAll);

      if (activeTab === 'daily') {
        setShowSolution(true);
      }
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleRetryReset = () => {
    if (activeChallenge.kind === 'networking') {
      setNetDrafts((prev) => {
        const copy = { ...prev };
        delete copy[activeChallenge.id];
        return copy;
      });
    } else if (activeChallenge.language === 'html-css') {
      setHtmlDrafts((prev) => {
        const copy = { ...prev };
        delete copy[activeChallenge.id];
        return copy;
      });
      setCssDrafts((prev) => {
        const copy = { ...prev };
        delete copy[activeChallenge.id];
        return copy;
      });
    } else {
      setCodeDrafts((prev) => {
        const copy = { ...prev };
        delete copy[activeChallenge.id];
        return copy;
      });
    }

    setEvaluations((prev) => {
      const copy = { ...prev };
      delete copy[activeChallenge.id];
      return copy;
    });
    setEmptyNotices((prev) => {
      const copy = { ...prev };
      delete copy[activeChallenge.id];
      return copy;
    });
  };

  const handleCopyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast(t.toast.copied, 'success');
    } catch {
      showToast(t.toast.copyFailed, 'error');
    }
  };

  const currentEvaluation = evaluations[activeChallenge.id];
  const dailyAttemptedToday =
    progress.dailyAttemptedDate === todayKey || Boolean(evaluations[dailyChallenge.id]);
  const dailySolvedToday = progress.dailySolvedDate === todayKey;

  const isSolutionUnlocked =
    activeTab === 'daily'
      ? dailyAttemptedToday || showSolution
      : showSolution;

  const formatReferenceSolution = (item: DeveloperChallenge): string => {
    if (item.kind === 'networking') {
      return item.fields.map((f) => `${f.label[lang]}: ${f.expected}`).join('\n');
    }
    if (item.language === 'html-css') {
      return `<!-- HTML -->\n${item.solutionHtml ?? ''}\n\n/* CSS */\n${item.solutionCss ?? ''}`;
    }
    return item.solutionCode ?? '';
  };

  const renderChallengeCard = (challenge: DeveloperChallenge) => {
    const isSolvedLocally = progress.solvedIds.includes(challenge.id);
    const previewHtmlDoc =
      challenge.kind === 'programming' && challenge.language === 'html-css'
        ? `<!doctype html><html><head><style>body{margin:16px;background:#05070e;color:#f8fafc;}${getCurrentCss(
            challenge
          )}</style></head><body>${getCurrentHtml(challenge)}</body></html>`
        : '';

    return (
      <div className="glass-panel rounded-2xl p-4 sm:p-6 space-y-5">
        {/* Challenge Header */}
        <div className="border-b border-slate-400/15 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
              {activeTab === 'daily' && (
                <>
                  <span className="font-semibold text-violet-300">
                    {ch.dailyBadge} ({todayKey})
                  </span>
                  <span aria-hidden="true">·</span>
                </>
              )}
              <span className="font-semibold text-blue-300">{trackLabel(challenge)}</span>
              <span aria-hidden="true">·</span>
              <span
                className={
                  challenge.difficulty === 'beginner'
                    ? 'text-emerald-300'
                    : challenge.difficulty === 'intermediate'
                    ? 'text-amber-300'
                    : 'text-rose-300'
                }
              >
                {difficultyLabel(challenge.difficulty)}
              </span>
              {isSolvedLocally && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="inline-flex items-center gap-1 text-emerald-300">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {ch.solvedTag}
                  </span>
                </>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShowHints((prev) => !prev)}
                className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-slate-400/20 bg-slate-900/70 px-3 py-1.5 text-xs font-medium text-amber-200 hover:border-amber-400/40 cursor-pointer"
              >
                <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
                <span>{showHints ? ch.hintsHide : ch.hintsShow}</span>
              </button>

              {activeTab !== 'daily' && (
                <button
                  type="button"
                  onClick={() => setShowSolution((prev) => !prev)}
                  className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-slate-400/20 bg-slate-900/70 px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-blue-500/40 cursor-pointer"
                >
                  {showSolution ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                  <span>{showSolution ? ch.hideSolutionBtn : ch.showSolutionBtn}</span>
                </button>
              )}
            </div>
          </div>

          <h2 className="mt-2 font-display text-xl font-bold text-white sm:text-2xl">
            {challenge.title[lang]}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">
            {challenge.description[lang]}
          </p>

          {challenge.kind === 'networking' && challenge.scenarioDetails && (
            <p
              dir="ltr"
              className="mt-3 rounded-xl border border-slate-400/15 bg-[#04060c] px-3.5 py-2.5 font-mono text-xs text-blue-200"
            >
              {challenge.scenarioDetails[lang]}
            </p>
          )}
        </div>

        {/* Examples (Programming) */}
        {challenge.kind === 'programming' && challenge.examples.length > 0 && (
          <div>
            <h3 className="mb-2 text-xs font-semibold text-slate-300">
              {ch.examplesTitle}
            </h3>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {challenge.examples.map((ex, idx) => (
                <div
                  key={idx}
                  dir="ltr"
                  className="rounded-xl border border-slate-400/15 bg-[#04060c] p-3 font-mono text-xs"
                >
                  <div className="text-slate-400">
                    {ch.inputLabel}: <span className="text-slate-100">{ex.input}</span>
                  </div>
                  <div className="mt-1 text-slate-400">
                    {ch.outputLabel}: <span className="text-emerald-300">{ex.output}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Progressive Hints */}
        {showHints && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4 space-y-2">
            <h3 className="text-xs font-semibold text-amber-200">{ch.hintsShow}</h3>
            <ul className="list-disc space-y-1 ps-5 text-xs leading-relaxed text-amber-100/90">
              {challenge.hints[lang].map((hint, idx) => (
                <li key={idx}>{hint}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Interactive Editor / Answer Inputs */}
        {challenge.kind === 'programming' ? (
          challenge.language === 'html-css' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div>
                  <label
                    htmlFor={`ch-html-${challenge.id}`}
                    className="mb-1.5 block text-xs font-semibold text-slate-300"
                  >
                    {ch.htmlEditorLabel}
                  </label>
                  <textarea
                    id={`ch-html-${challenge.id}`}
                    dir="ltr"
                    rows={8}
                    spellCheck={false}
                    value={getCurrentHtml(challenge)}
                    onChange={(e) =>
                      setHtmlDrafts((prev) => ({
                        ...prev,
                        [challenge.id]: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-400/20 bg-[#04060c] p-3.5 font-mono text-xs leading-6 text-slate-100 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor={`ch-css-${challenge.id}`}
                    className="mb-1.5 block text-xs font-semibold text-slate-300"
                  >
                    {ch.cssEditorLabel}
                  </label>
                  <textarea
                    id={`ch-css-${challenge.id}`}
                    dir="ltr"
                    rows={8}
                    spellCheck={false}
                    value={getCurrentCss(challenge)}
                    onChange={(e) =>
                      setCssDrafts((prev) => ({
                        ...prev,
                        [challenge.id]: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-400/20 bg-[#04060c] p-3.5 font-mono text-xs leading-6 text-slate-100 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="mb-1.5 text-xs font-semibold text-slate-300">
                  {ch.livePreviewLabel}
                </div>
                <div className="overflow-hidden rounded-xl border border-slate-400/20 bg-[#05070e]">
                  <iframe
                    title={ch.livePreviewLabel}
                    sandbox=""
                    srcDoc={previewHtmlDoc}
                    className="h-[190px] w-full border-0"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label
                  htmlFor={`ch-code-${challenge.id}`}
                  className="text-xs font-semibold text-slate-300"
                >
                  {ch.codeEditorLabel}
                </label>
                <button
                  type="button"
                  onClick={() => handleCopyText(getCurrentCode(challenge))}
                  className="inline-flex items-center gap-1 text-xs font-medium text-blue-400 hover:text-blue-300 cursor-pointer"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>{ch.copyCodeBtn}</span>
                </button>
              </div>
              <textarea
                id={`ch-code-${challenge.id}`}
                dir="ltr"
                rows={10}
                spellCheck={false}
                value={getCurrentCode(challenge)}
                onChange={(e) =>
                  setCodeDrafts((prev) => ({
                    ...prev,
                    [challenge.id]: e.target.value,
                  }))
                }
                className="w-full rounded-xl border border-slate-400/20 bg-[#04060c] p-4 font-mono text-xs leading-6 text-slate-100 focus:border-blue-500 focus:outline-none"
              />
            </div>
          )
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {challenge.fields.map((field) => {
              const currentVals = getCurrentNetAnswers(challenge);
              const val = currentVals[field.id] ?? '';

              if (field.type === 'choice' && field.choices) {
                return (
                  <div key={field.id} className="sm:col-span-2 space-y-2">
                    <div className="text-xs font-semibold text-slate-300">
                      {field.label[lang]}
                    </div>
                    <div className="space-y-2">
                      {field.choices.map((opt) => (
                        <label
                          key={opt.value}
                          className={`flex items-center gap-3 rounded-xl border p-3 text-xs transition-colors cursor-pointer ${
                            val === opt.value
                              ? 'border-blue-500/60 bg-blue-950/35 text-white'
                              : 'border-slate-400/15 bg-[#04060c] text-slate-300 hover:border-slate-400/35'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`net-${challenge.id}-${field.id}`}
                            value={opt.value}
                            checked={val === opt.value}
                            onChange={(e) =>
                              setNetDrafts((prev) => ({
                                ...prev,
                                [challenge.id]: {
                                  ...(prev[challenge.id] ?? {}),
                                  [field.id]: e.target.value,
                                },
                              }))
                            }
                            className="accent-blue-500"
                          />
                          <span>{opt.label[lang]}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              }

              return (
                <div key={field.id}>
                  <label
                    htmlFor={`net-${challenge.id}-${field.id}`}
                    className="mb-1.5 block text-xs font-semibold text-slate-300"
                  >
                    {field.label[lang]}
                  </label>
                  <input
                    id={`net-${challenge.id}-${field.id}`}
                    type="text"
                    dir="ltr"
                    value={val}
                    placeholder={field.placeholder}
                    onChange={(e) =>
                      setNetDrafts((prev) => ({
                        ...prev,
                        [challenge.id]: {
                          ...(prev[challenge.id] ?? {}),
                          [field.id]: e.target.value,
                        },
                      }))
                    }
                    className="w-full rounded-xl border border-slate-400/20 bg-[#04060c] px-3.5 py-2.5 font-mono text-xs text-slate-100 placeholder:text-slate-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={isEvaluating}
            onClick={() => void handleEvaluate()}
            className="neon-action-btn inline-flex min-h-[44px] items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-semibold text-white disabled:opacity-50 cursor-pointer"
          >
            {isEvaluating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            <span>
              {isEvaluating
                ? ch.checkingBtn
                : challenge.kind === 'networking'
                ? ch.checkAnswerBtn
                : ch.runTestsBtn}
            </span>
          </button>

          <button
            type="button"
            onClick={handleRetryReset}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-slate-400/20 bg-slate-900/70 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:border-blue-500/40 cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>{ch.retryBtn}</span>
          </button>

          {challenge.kind === 'programming' && challenge.language === 'html-css' && (
            <button
              type="button"
              onClick={() =>
                handleCopyText(
                  `<!-- HTML -->\n${getCurrentHtml(challenge)}\n\n/* CSS */\n${getCurrentCss(
                    challenge
                  )}`
                )
              }
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-slate-400/20 bg-slate-900/70 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:border-blue-500/40 cursor-pointer"
            >
              <Copy className="h-3.5 w-3.5 text-blue-400" />
              <span>{ch.copyCodeBtn}</span>
            </button>
          )}
        </div>

        {/* Daily Challenge Lock Notice */}
        {activeTab === 'daily' && !isSolutionUnlocked && (
          <p className="text-xs text-slate-400">{ch.dailySubmitNote}</p>
        )}

        {/* Real Test Results */}
        {currentEvaluation && (
          <div className="space-y-4 border-t border-slate-400/15 pt-5">
            {emptyNotices[challenge.id] && !currentEvaluation.passedAll && (
              <div
                role="alert"
                className="flex items-center gap-2 rounded-xl border border-amber-500/35 bg-amber-950/25 px-4 py-3 text-xs text-amber-200"
              >
                <AlertCircle className="h-4 w-4 shrink-0 text-amber-400" />
                <span>{ch.emptyInputWarning}</span>
              </div>
            )}

            <div
              role={currentEvaluation.passedAll ? 'status' : 'alert'}
              className={`flex items-start gap-2.5 rounded-xl border p-4 text-xs ${
                currentEvaluation.passedAll
                  ? 'border-emerald-500/35 bg-emerald-950/25 text-emerald-100'
                  : 'border-rose-500/35 bg-rose-950/25 text-rose-100'
              }`}
            >
              {currentEvaluation.passedAll ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
              )}
              <div>
                <p className="font-semibold">
                  {currentEvaluation.passedAll ? ch.passedAllTitle : ch.failedSomeTitle}
                </p>
                {currentEvaluation.runtimeError && (
                  <p dir="ltr" className="mt-1 font-mono text-rose-200">
                    {currentEvaluation.runtimeError}
                  </p>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table
                dir="ltr"
                className="w-full min-w-[540px] border-collapse text-left font-mono text-xs tabular-nums"
              >
                <thead>
                  <tr className="border-b border-slate-400/15 text-slate-400">
                    <th className="py-2 pe-3 font-medium">{ch.cols.test}</th>
                    <th className="py-2 pe-3 font-medium">{ch.cols.status}</th>
                    <th className="py-2 pe-3 font-medium">{ch.cols.input}</th>
                    <th className="py-2 pe-3 font-medium">{ch.cols.expected}</th>
                    <th className="py-2 font-medium">{ch.cols.actual}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-400/10">
                  {currentEvaluation.tests.map((tc) => (
                    <tr key={tc.id}>
                      <td className="py-2.5 pe-3 text-slate-200">{tc.label}</td>
                      <td className="py-2.5 pe-3">
                        <span
                          className={
                            tc.passed
                              ? 'font-semibold text-emerald-300'
                              : 'font-semibold text-rose-300'
                          }
                        >
                          {tc.passed ? ch.passedLabel : ch.failedLabel}
                        </span>
                      </td>
                      <td className="py-2.5 pe-3 text-slate-300 break-all max-w-[160px]">
                        {tc.inputDisplay}
                      </td>
                      <td className="py-2.5 pe-3 text-emerald-300 break-all max-w-[160px]">
                        {tc.expectedDisplay}
                      </td>
                      <td className="py-2.5 text-slate-100 break-all max-w-[180px]">
                        {tc.error ? tc.error : tc.actualDisplay}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Learning Feedback Explanation */}
            <div className="rounded-xl border border-slate-400/15 bg-[#04060c] p-4 space-y-2">
              <h3 className="text-xs font-semibold text-blue-300">{ch.whyTitle}</h3>
              <p className="text-xs leading-relaxed text-slate-300">
                {challenge.explanation[lang]}
              </p>
            </div>
          </div>
        )}

        {/* Step-by-Step Solution & Reference Code */}
        {isSolutionUnlocked && (
          <div className="rounded-xl border border-violet-500/30 bg-[#070a14] p-4 sm:p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-display text-sm font-semibold text-violet-200">
                {ch.stepsTitle}
              </h3>
              <button
                type="button"
                onClick={() => handleCopyText(formatReferenceSolution(challenge))}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-400 hover:text-blue-300 cursor-pointer"
              >
                <Copy className="h-3.5 w-3.5" />
                <span>{ch.copySolutionBtn}</span>
              </button>
            </div>

            <ol className="list-decimal space-y-1.5 ps-5 text-xs leading-relaxed text-slate-300">
              {challenge.stepByStep[lang].map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ol>

            <div>
              <div className="mb-1.5 text-xs font-semibold text-slate-400">
                {ch.referenceCodeTitle}
              </div>
              <pre
                dir="ltr"
                className="overflow-x-auto rounded-xl border border-slate-400/15 bg-[#04060c] p-3.5 font-mono text-xs leading-6 text-emerald-200"
              >
                <code>{formatReferenceSolution(challenge)}</code>
              </pre>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <section className="mx-auto max-w-[1320px] px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      {/* Header & Mode Switcher */}
      <div className="mb-6 flex flex-col gap-4 border-b border-slate-400/15 pb-5 sm:mb-8 sm:pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-4xl">
            {ch.heading}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-300 sm:text-base">
            {ch.subheading}
          </p>
        </div>

        <div
          role="tablist"
          aria-label={ch.heading}
          className="inline-flex flex-wrap gap-1 rounded-xl border border-slate-400/20 bg-[#0b0e17] p-1"
        >
          {(
            [
              { id: 'daily', label: ch.tabs.daily, Icon: Calendar },
              { id: 'programming', label: ch.tabs.programming, Icon: Code2 },
              { id: 'networking', label: ch.tabs.networking, Icon: Network },
            ] as const
          ).map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={activeTab === id}
              onClick={() => setActiveTab(id)}
              className={`inline-flex min-h-[40px] items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === id
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Honest Local Progress Bar */}
      <div className="mb-6 flex flex-col gap-3 rounded-xl border border-slate-400/15 bg-[#070a13] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Trophy className="mt-0.5 h-5 w-5 shrink-0 text-blue-400" />
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-semibold text-white">{ch.localProgressLabel}</span>
              <span aria-hidden="true" className="text-slate-600">
                ·
              </span>
              <span className="font-mono font-semibold text-blue-300 tabular-nums">
                {ch.solvedCounter}: {progress.solvedIds.length} / {ALL_CHALLENGES.length}
              </span>
              <span aria-hidden="true" className="text-slate-600">
                ·
              </span>
              <span className={dailySolvedToday ? 'text-emerald-300' : 'text-slate-300'}>
                {ch.tabs.daily}: {dailySolvedToday ? ch.dailyDone : ch.dailyPending}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-400">{ch.localProgressNote}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            setProgress({
              solvedIds: [],
              dailyAttemptedDate: null,
              dailySolvedDate: null,
            })
          }
          className="inline-flex min-h-[36px] items-center gap-1.5 self-start rounded-lg border border-slate-400/20 px-3 py-1.5 text-xs text-slate-300 hover:border-rose-400/40 hover:text-rose-200 whitespace-nowrap shrink-0 sm:self-center cursor-pointer"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>{ch.resetProgressBtn}</span>
        </button>
      </div>

      {/* Daily Challenge View vs. Challenge Selector + Workspace */}
      {activeTab === 'daily' ? (
        renderChallengeCard(dailyChallenge)
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Challenge Sidebar */}
          <aside className="space-y-4 lg:col-span-4">
            {activeTab === 'programming' && (
              <div className="glass-panel rounded-2xl p-4 space-y-3">
                <div className="flex flex-wrap gap-1.5">
                  {(
                    [
                      { id: 'all', label: ch.filters.allTracks },
                      { id: 'python', label: ch.filters.python },
                      { id: 'javascript', label: ch.filters.javascript },
                      { id: 'html-css', label: ch.filters.htmlCss },
                    ] as const
                  ).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setTrackFilter(item.id)}
                      className={`min-h-[34px] rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                        trackFilter === item.id
                          ? 'border-blue-500/60 bg-blue-500/15 text-blue-200'
                          : 'border-slate-400/15 bg-slate-900/50 text-slate-300 hover:text-white'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap gap-1.5 border-t border-slate-400/15 pt-3">
                  {(
                    [
                      { id: 'all', label: ch.filters.allDiff },
                      { id: 'beginner', label: ch.filters.beginner },
                      { id: 'intermediate', label: ch.filters.intermediate },
                      { id: 'advanced', label: ch.filters.advanced },
                    ] as const
                  ).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setDiffFilter(item.id)}
                      className={`min-h-[32px] rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                        diffFilter === item.id
                          ? 'border-violet-500/60 bg-violet-500/15 text-violet-200'
                          : 'border-slate-400/15 bg-slate-900/50 text-slate-300 hover:text-white'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="glass-panel rounded-2xl p-3 sm:p-4 space-y-2 max-h-[580px] overflow-y-auto">
              {(activeTab === 'programming'
                ? filteredProgramming
                : NETWORKING_CHALLENGES
              ).length === 0 ? (
                <p className="p-4 text-center text-xs text-slate-400">{ch.emptyFilter}</p>
              ) : (
                (activeTab === 'programming'
                  ? filteredProgramming
                  : NETWORKING_CHALLENGES
                ).map((item) => {
                  const isSelected = activeChallenge.id === item.id;
                  const isSolved = progress.solvedIds.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() =>
                        activeTab === 'programming'
                          ? setSelectedProgId(item.id)
                          : setSelectedNetId(item.id)
                      }
                      className={`w-full rounded-xl border p-3.5 text-start transition-colors cursor-pointer ${
                        isSelected
                          ? 'border-blue-500/60 bg-blue-950/35 text-white'
                          : 'border-slate-400/15 bg-slate-900/40 text-slate-200 hover:border-slate-400/35'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 text-[11px] text-slate-400">
                        <span>
                          {trackLabel(item)} · {difficultyLabel(item.difficulty)}
                        </span>
                        {isSolved && (
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                        )}
                      </div>
                      <div className="mt-1 text-sm font-semibold text-white">
                        {item.title[lang]}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          {/* Active Challenge Workspace */}
          <div className="lg:col-span-8">
            {renderChallengeCard(activeChallenge)}
          </div>
        </div>
      )}
    </section>
  );
}
