import { useEffect, useMemo, useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Shuffle,
  SkipForward,
} from 'lucide-react';
import type { Language } from '../../types';
import { getTranslations } from '../../i18n/translations';
import {
  generateRandomSortArray,
  generateSortSteps,
  type SortAlgorithm,
} from '../../utils/experimentsLogic';

interface AlgorithmVisualizerProps {
  lang: Language;
}

const DEFAULT_SEED_ARRAY = [64, 25, 82, 18, 49, 91, 33, 55, 14, 72, 41, 60];

export function AlgorithmVisualizer({ lang }: AlgorithmVisualizerProps) {
  const t = getTranslations(lang);
  const alg = t.experiments.algorithms;

  const [algorithm, setAlgorithm] = useState<SortAlgorithm>('bubble');
  const [arraySize, setArraySize] = useState<number>(DEFAULT_SEED_ARRAY.length);
  const [baseArray, setBaseArray] = useState<number[]>(DEFAULT_SEED_ARRAY);
  const [speedLevel, setSpeedLevel] = useState<number>(6); // 1 (slow) .. 10 (fast)
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const steps = useMemo(
    () => generateSortSteps(baseArray, algorithm),
    [baseArray, algorithm]
  );

  const currentStep = steps[Math.min(stepIndex, steps.length - 1)];
  const maxVal = useMemo(() => Math.max(...baseArray, 100), [baseArray]);

  const statusKey: keyof typeof alg.states =
    stepIndex >= steps.length - 1
      ? 'completed'
      : isPlaying
      ? 'running'
      : stepIndex > 0
      ? 'paused'
      : 'idle';

  useEffect(() => {
    if (!isPlaying) return;
    if (stepIndex >= steps.length - 1) {
      setIsPlaying(false);
      return;
    }

    const delayMs = Math.max(40, 560 - speedLevel * 50);
    const timer = setTimeout(() => {
      setStepIndex((prev) => {
        const next = prev + 1;
        if (next >= steps.length - 1) {
          setIsPlaying(false);
        }
        return Math.min(steps.length - 1, next);
      });
    }, delayMs);

    return () => clearTimeout(timer);
  }, [isPlaying, stepIndex, steps.length, speedLevel]);

  const handleSelectAlgorithm = (nextAlgo: SortAlgorithm) => {
    setIsPlaying(false);
    setStepIndex(0);
    setAlgorithm(nextAlgo);
  };

  const handleSizeChange = (newSize: number) => {
    setIsPlaying(false);
    setArraySize(newSize);
    setBaseArray(generateRandomSortArray(newSize));
    setStepIndex(0);
  };

  const handleShuffle = () => {
    setIsPlaying(false);
    setBaseArray(generateRandomSortArray(arraySize));
    setStepIndex(0);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setStepIndex(0);
  };

  const info = alg.info[algorithm];

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 space-y-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Algorithm Switcher */}
          <div>
            <p className="mb-2 text-xs font-semibold text-slate-300">{alg.algoLabel}</p>
            <div
              role="tablist"
              aria-label={alg.algoLabel}
              className="inline-flex flex-wrap gap-1 rounded-xl border border-slate-400/20 bg-[#04060c] p-1"
            >
              {(['bubble', 'selection', 'insertion'] as SortAlgorithm[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={algorithm === key}
                  onClick={() => handleSelectAlgorithm(key)}
                  className={`min-h-[38px] rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    algorithm === key
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {alg.info[key].title}
                </button>
              ))}
            </div>
          </div>

          {/* Playback Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {!isPlaying ? (
              <button
                type="button"
                onClick={() => {
                  if (stepIndex >= steps.length - 1) setStepIndex(0);
                  setIsPlaying(true);
                }}
                className="neon-action-btn inline-flex min-h-[40px] items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold text-white cursor-pointer"
              >
                <Play className="h-3.5 w-3.5" />
                <span>
                  {stepIndex > 0 && stepIndex < steps.length - 1
                    ? alg.resumeBtn
                    : alg.startBtn}
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsPlaying(false)}
                className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-amber-400/50 bg-amber-500/20 px-4 py-2 text-xs font-semibold text-amber-100 cursor-pointer"
              >
                <Pause className="h-3.5 w-3.5" />
                <span>{alg.pauseBtn}</span>
              </button>
            )}

            <button
              type="button"
              disabled={isPlaying || stepIndex >= steps.length - 1}
              onClick={() => setStepIndex((prev) => Math.min(steps.length - 1, prev + 1))}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-slate-400/20 bg-slate-900/75 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:border-blue-500/50 disabled:opacity-40 cursor-pointer"
            >
              <SkipForward className="h-3.5 w-3.5" />
              <span>{alg.stepBtn}</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-slate-400/20 bg-slate-900/75 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:border-blue-500/50 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>{alg.resetBtn}</span>
            </button>

            <button
              type="button"
              onClick={handleShuffle}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-slate-400/20 bg-slate-900/75 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:border-violet-500/50 cursor-pointer"
            >
              <Shuffle className="h-3.5 w-3.5 text-violet-400" />
              <span>{alg.shuffleBtn}</span>
            </button>
          </div>
        </div>

        {/* Sliders */}
        <div className="grid grid-cols-1 gap-4 border-t border-slate-400/15 pt-4 sm:grid-cols-2">
          <div>
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <label htmlFor="sort-size-slider" className="font-medium text-slate-300">
                {alg.sizeLabel}
              </label>
              <span className="font-mono font-semibold text-blue-300 tabular-nums">
                {arraySize}
              </span>
            </div>
            <input
              id="sort-size-slider"
              type="range"
              min={6}
              max={24}
              value={arraySize}
              onChange={(e) => handleSizeChange(Number(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <label htmlFor="sort-speed-slider" className="font-medium text-slate-300">
                {alg.speedLabel}
              </label>
              <span className="font-mono font-semibold text-violet-300 tabular-nums">
                {speedLevel}x
              </span>
            </div>
            <input
              id="sort-speed-slider"
              type="range"
              min={1}
              max={10}
              value={speedLevel}
              onChange={(e) => setSpeedLevel(Number(e.target.value))}
              className="w-full accent-violet-500 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Stage & Metrics */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="glass-panel rounded-2xl p-4 sm:p-6 lg:col-span-8 space-y-5">
          {/* Live Telemetry Row */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-slate-400/15 bg-[#04060c] p-3">
              <div className="text-[11px] text-slate-400">{alg.comparisonsLabel}</div>
              <div className="mt-1 font-mono text-lg font-bold text-blue-300 tabular-nums">
                {currentStep.comparisons}
              </div>
            </div>
            <div className="rounded-xl border border-slate-400/15 bg-[#04060c] p-3">
              <div className="text-[11px] text-slate-400">{alg.swapsLabel}</div>
              <div className="mt-1 font-mono text-lg font-bold text-violet-300 tabular-nums">
                {currentStep.swaps}
              </div>
            </div>
            <div className="rounded-xl border border-slate-400/15 bg-[#04060c] p-3">
              <div className="text-[11px] text-slate-400">{alg.stepCounterLabel}</div>
              <div className="mt-1 font-mono text-lg font-bold text-slate-100 tabular-nums">
                {stepIndex} / {steps.length - 1}
              </div>
            </div>
            <div className="rounded-xl border border-slate-400/15 bg-[#04060c] p-3">
              <div className="text-[11px] text-slate-400">{alg.statusLabel}</div>
              <div className="mt-1 text-sm font-semibold text-emerald-300">
                {alg.states[statusKey]}
              </div>
            </div>
          </div>

          {/* Bar Chart Viewport */}
          <div
            dir="ltr"
            className="flex h-[240px] items-end justify-center gap-1.5 rounded-xl border border-slate-400/15 bg-[#04060c] px-3 pt-6 pb-3 sm:h-[280px] sm:gap-2 sm:px-5"
          >
            {currentStep.array.map((val, idx) => {
              const isSwapping = currentStep.swapping.includes(idx);
              const isComparing = currentStep.comparing.includes(idx);
              const isSorted = currentStep.sorted.includes(idx);

              const barColor = isSwapping
                ? 'from-rose-500 to-amber-500 border-amber-300'
                : isComparing
                ? 'from-blue-500 to-sky-400 border-sky-200'
                : isSorted
                ? 'from-emerald-500 to-teal-400 border-emerald-300'
                : 'from-slate-600 to-slate-500 border-slate-400/40';

              const heightPercent = Math.max(12, Math.round((val / maxVal) * 100));

              return (
                <div
                  key={idx}
                  className="flex h-full flex-1 flex-col items-center justify-end gap-1"
                >
                  <span className="font-mono text-[10px] text-slate-300 tabular-nums">
                    {val}
                  </span>
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full max-w-[34px] rounded-t-md border-t bg-gradient-to-t transition-all duration-150 ${barColor}`}
                  />
                </div>
              );
            })}
          </div>

          {/* Legend & Current Step Narration */}
          <div className="flex flex-col gap-3 border-t border-slate-400/15 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-xs bg-slate-500" aria-hidden="true" />
                {alg.legend.idle}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-xs bg-sky-400" aria-hidden="true" />
                {alg.legend.comparing}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-xs bg-amber-400" aria-hidden="true" />
                {alg.legend.swapping}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-xs bg-emerald-400" aria-hidden="true" />
                {alg.legend.sorted}
              </span>
            </div>

            <p className="text-xs font-medium text-blue-200">
              {lang === 'ar' ? currentStep.noteAr : currentStep.noteEn}
            </p>
          </div>
        </div>

        {/* Algorithm Explanation Panel */}
        <aside className="glass-panel rounded-2xl p-4 sm:p-5 lg:col-span-4 space-y-4">
          <h3 className="font-display text-base font-semibold text-white">
            {alg.explainTitle}
          </h3>

          <div className="rounded-xl border border-slate-400/15 bg-[#04060c] p-4 space-y-3">
            <h4 className="font-display text-sm font-bold text-blue-300">{info.title}</h4>
            <p className="text-xs leading-relaxed text-slate-300">{info.desc}</p>
          </div>

          <div className="space-y-2.5">
            <div className="rounded-xl border border-slate-400/15 bg-[#04060c] p-3.5">
              <div className="text-[11px] text-slate-400">{alg.complexityLabel}</div>
              <div dir="ltr" className="mt-1 font-mono text-xs font-semibold text-white tabular-nums">
                {info.time}
              </div>
            </div>
            <div className="rounded-xl border border-slate-400/15 bg-[#04060c] p-3.5">
              <div className="text-[11px] text-slate-400">{alg.spaceLabel}</div>
              <div dir="ltr" className="mt-1 font-mono text-xs font-semibold text-emerald-300 tabular-nums">
                {info.space}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
