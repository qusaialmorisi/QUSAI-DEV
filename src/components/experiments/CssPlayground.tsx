import { useMemo, useState } from 'react';
import { Copy, RotateCcw } from 'lucide-react';
import type { Language } from '../../types';
import { getTranslations } from '../../i18n/translations';
import { useToast } from '../ToastContext';

interface CssPlaygroundProps {
  lang: Language;
}

type BgMode = 'linear' | 'radial' | 'solid';
type AnimKind = 'none' | 'float' | 'glow' | 'shift';

interface CssConfig {
  bgMode: BgMode;
  angle: number;
  color1: string;
  color2: string;
  radius: number;
  borderWidth: number;
  borderColor: string;
  animation: AnimKind;
  duration: number;
}

const DEFAULT_HTML = `<article class="experiment-card">
  <h2>QUSAI.DEV Surface</h2>
  <p>Edit the visual controls or CSS rules to experiment live.</p>
  <button class="cta">Inspect Style</button>
</article>`;

const DEFAULT_CONFIG: CssConfig = {
  bgMode: 'linear',
  angle: 135,
  color1: '#1d4ed8',
  color2: '#7c3aed',
  radius: 18,
  borderWidth: 2,
  borderColor: '#60a5fa',
  animation: 'float',
  duration: 3.2,
};

function buildCssFromConfig(cfg: CssConfig): string {
  const backgroundRule =
    cfg.bgMode === 'solid'
      ? cfg.color1
      : cfg.bgMode === 'radial'
      ? `radial-gradient(circle at top left, ${cfg.color1}, ${cfg.color2})`
      : `linear-gradient(${cfg.angle}deg, ${cfg.color1}, ${cfg.color2})`;

  const bgSize = cfg.animation === 'shift' ? '\n  background-size: 200% 200%;' : '';

  const animRule =
    cfg.animation === 'none'
      ? 'none'
      : cfg.animation === 'float'
      ? `floatBox ${cfg.duration}s ease-in-out infinite`
      : cfg.animation === 'glow'
      ? `glowPulse ${cfg.duration}s ease-in-out infinite`
      : `gradientShift ${cfg.duration}s ease infinite`;

  return `body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: #05070e;
  color: #f8fafc;
  font-family: system-ui, sans-serif;
}

.experiment-card {
  width: min(320px, 86vw);
  padding: 24px;
  border-radius: ${cfg.radius}px;
  border: ${cfg.borderWidth}px solid ${cfg.borderColor};
  background: ${backgroundRule};${bgSize}
  box-shadow: 0 20px 45px rgba(2, 6, 23, 0.65);
  animation: ${animRule};
}

.experiment-card h2 {
  margin: 0 0 8px;
  font-size: 1.2rem;
}

.experiment-card p {
  margin: 0 0 16px;
  font-size: 0.9rem;
  color: rgba(248, 250, 252, 0.88);
}

.cta {
  padding: 9px 16px;
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: 10px;
  background: rgba(5, 7, 14, 0.55);
  color: #ffffff;
  font-weight: 600;
}

@keyframes floatBox {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
}

@keyframes glowPulse {
  0%, 100% { box-shadow: 0 0 12px ${cfg.borderColor}55; }
  50% { box-shadow: 0 0 32px ${cfg.borderColor}; }
}

@keyframes gradientShift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}`;
}

export function CssPlayground({ lang }: CssPlaygroundProps) {
  const t = getTranslations(lang);
  const cp = t.experiments.css;
  const { showToast } = useToast();

  const [config, setConfig] = useState<CssConfig>(DEFAULT_CONFIG);
  const [htmlCode, setHtmlCode] = useState<string>(DEFAULT_HTML);
  const [cssCode, setCssCode] = useState<string>(() => buildCssFromConfig(DEFAULT_CONFIG));

  const updateControl = <K extends keyof CssConfig>(key: K, value: CssConfig[K]) => {
    const next = { ...config, [key]: value };
    setConfig(next);
    setCssCode(buildCssFromConfig(next));
  };

  const applyPreset = (preset: 'neonCard' | 'glassPanel' | 'pulseFrame') => {
    let next: CssConfig = DEFAULT_CONFIG;
    if (preset === 'glassPanel') {
      next = {
        bgMode: 'radial',
        angle: 120,
        color1: '#1e293b',
        color2: '#0f172a',
        radius: 22,
        borderWidth: 1,
        borderColor: '#94a3b8',
        animation: 'none',
        duration: 3.0,
      };
    } else if (preset === 'pulseFrame') {
      next = {
        bgMode: 'linear',
        angle: 145,
        color1: '#0f172a',
        color2: '#4c1d95',
        radius: 16,
        borderWidth: 3,
        borderColor: '#38bdf8',
        animation: 'glow',
        duration: 2.2,
      };
    }
    setConfig(next);
    setCssCode(buildCssFromConfig(next));
  };

  const handleReset = () => {
    setConfig(DEFAULT_CONFIG);
    setHtmlCode(DEFAULT_HTML);
    setCssCode(buildCssFromConfig(DEFAULT_CONFIG));
  };

  const previewDocument = useMemo(() => {
    return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>${cssCode}</style>
  </head>
  <body>${htmlCode}</body>
</html>`;
  }, [htmlCode, cssCode]);

  const handleCopy = async () => {
    const bundle = `<!-- HTML -->\n${htmlCode}\n\n/* CSS */\n${cssCode}`;
    try {
      await navigator.clipboard.writeText(bundle);
      showToast(t.toast.copied, 'success');
    } catch {
      showToast(t.toast.copyFailed, 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Presets & Actions */}
      <div className="glass-panel flex flex-col gap-4 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 me-1">
            {cp.presetsLabel}:
          </span>
          {(['neonCard', 'glassPanel', 'pulseFrame'] as const).map((presetKey) => (
            <button
              key={presetKey}
              type="button"
              onClick={() => applyPreset(presetKey)}
              className="min-h-[38px] rounded-lg border border-slate-400/20 bg-slate-900/75 px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-blue-500/50 hover:text-white cursor-pointer"
            >
              {cp.presets[presetKey]}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="neon-action-btn inline-flex min-h-[40px] items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold text-white cursor-pointer"
          >
            <Copy className="h-3.5 w-3.5" />
            <span>{cp.copyBtn}</span>
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-slate-400/20 bg-slate-900/75 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:border-blue-500/50 cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>{cp.resetBtn}</span>
          </button>
        </div>
      </div>

      {/* Controls + Live Preview */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Visual Property Controls */}
        <div className="glass-panel rounded-2xl p-4 sm:p-5 lg:col-span-5 space-y-4">
          <h3 className="font-display text-sm font-semibold text-white">
            {cp.controlsTitle}
          </h3>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label
                htmlFor="css-bg-mode"
                className="mb-1.5 block text-xs font-medium text-slate-300"
              >
                {cp.bgModeLabel}
              </label>
              <select
                id="css-bg-mode"
                value={config.bgMode}
                onChange={(e) => updateControl('bgMode', e.target.value as BgMode)}
                className="w-full rounded-lg border border-slate-400/20 bg-[#04060c] px-3 py-2 text-xs text-slate-100"
              >
                <option value="linear">{cp.bgModes.linear}</option>
                <option value="radial">{cp.bgModes.radial}</option>
                <option value="solid">{cp.bgModes.solid}</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="css-anim-select"
                className="mb-1.5 block text-xs font-medium text-slate-300"
              >
                {cp.animationLabel}
              </label>
              <select
                id="css-anim-select"
                value={config.animation}
                onChange={(e) => updateControl('animation', e.target.value as AnimKind)}
                className="w-full rounded-lg border border-slate-400/20 bg-[#04060c] px-3 py-2 text-xs text-slate-100"
              >
                <option value="none">{cp.animations.none}</option>
                <option value="float">{cp.animations.float}</option>
                <option value="glow">{cp.animations.glow}</option>
                <option value="shift">{cp.animations.shift}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <label className="block text-xs text-slate-300">
              <span className="mb-1 block">{cp.color1Label}</span>
              <input
                type="color"
                value={config.color1}
                onChange={(e) => updateControl('color1', e.target.value)}
                className="h-9 w-full rounded-lg border border-slate-400/20 bg-[#04060c] p-1 cursor-pointer"
              />
            </label>
            <label className="block text-xs text-slate-300">
              <span className="mb-1 block">{cp.color2Label}</span>
              <input
                type="color"
                value={config.color2}
                disabled={config.bgMode === 'solid'}
                onChange={(e) => updateControl('color2', e.target.value)}
                className="h-9 w-full rounded-lg border border-slate-400/20 bg-[#04060c] p-1 disabled:opacity-40 cursor-pointer"
              />
            </label>
            <label className="block text-xs text-slate-300">
              <span className="mb-1 block">{cp.borderColorLabel}</span>
              <input
                type="color"
                value={config.borderColor}
                onChange={(e) => updateControl('borderColor', e.target.value)}
                className="h-9 w-full rounded-lg border border-slate-400/20 bg-[#04060c] p-1 cursor-pointer"
              />
            </label>
          </div>

          <div className="space-y-3 pt-1">
            <div>
              <div className="mb-1 flex justify-between text-xs">
                <label htmlFor="css-angle" className="text-slate-300">
                  {cp.angleLabel}
                </label>
                <span className="font-mono text-blue-300 tabular-nums">{config.angle}°</span>
              </div>
              <input
                id="css-angle"
                type="range"
                min={0}
                max={360}
                disabled={config.bgMode !== 'linear'}
                value={config.angle}
                onChange={(e) => updateControl('angle', Number(e.target.value))}
                className="w-full accent-blue-500 disabled:opacity-40 cursor-pointer"
              />
            </div>

            <div>
              <div className="mb-1 flex justify-between text-xs">
                <label htmlFor="css-radius" className="text-slate-300">
                  {cp.radiusLabel}
                </label>
                <span className="font-mono text-blue-300 tabular-nums">{config.radius}px</span>
              </div>
              <input
                id="css-radius"
                type="range"
                min={0}
                max={40}
                value={config.radius}
                onChange={(e) => updateControl('radius', Number(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="mb-1 flex justify-between text-xs">
                <label htmlFor="css-border-width" className="text-slate-300">
                  {cp.borderWidthLabel}
                </label>
                <span className="font-mono text-blue-300 tabular-nums">
                  {config.borderWidth}px
                </span>
              </div>
              <input
                id="css-border-width"
                type="range"
                min={0}
                max={8}
                value={config.borderWidth}
                onChange={(e) => updateControl('borderWidth', Number(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="mb-1 flex justify-between text-xs">
                <label htmlFor="css-duration" className="text-slate-300">
                  {cp.durationLabel}
                </label>
                <span className="font-mono text-violet-300 tabular-nums">
                  {config.duration.toFixed(1)}s
                </span>
              </div>
              <input
                id="css-duration"
                type="range"
                min={0.8}
                max={6}
                step={0.2}
                disabled={config.animation === 'none'}
                value={config.duration}
                onChange={(e) => updateControl('duration', Number(e.target.value))}
                className="w-full accent-violet-500 disabled:opacity-40 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Instant Visual Preview */}
        <div className="glass-panel flex flex-col rounded-2xl p-4 sm:p-5 lg:col-span-7">
          <div className="mb-3 flex items-center justify-between text-xs font-semibold text-slate-300">
            <span>{cp.previewLabel}</span>
            <span dir="ltr" className="font-mono text-[11px] text-slate-400">
              sandbox=&quot;&quot;
            </span>
          </div>
          <div className="flex-1 overflow-hidden rounded-xl border border-slate-400/20 bg-[#05070e]">
            <iframe
              title={cp.previewLabel}
              sandbox=""
              srcDoc={previewDocument}
              className="h-[320px] w-full border-0 sm:h-[360px]"
            />
          </div>
        </div>
      </div>

      {/* Direct HTML & CSS Editors */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="glass-panel rounded-2xl p-4 sm:p-5">
          <label
            htmlFor="css-exp-html"
            className="mb-2 block text-xs font-semibold text-slate-300"
          >
            {cp.htmlEditorLabel}
          </label>
          <textarea
            id="css-exp-html"
            dir="ltr"
            rows={10}
            value={htmlCode}
            onChange={(e) => setHtmlCode(e.target.value)}
            spellCheck={false}
            className="w-full rounded-xl border border-slate-400/20 bg-[#04060c] p-3.5 font-mono text-xs leading-6 text-slate-100 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="glass-panel rounded-2xl p-4 sm:p-5">
          <label
            htmlFor="css-exp-css"
            className="mb-2 block text-xs font-semibold text-slate-300"
          >
            {cp.cssEditorLabel}
          </label>
          <textarea
            id="css-exp-css"
            dir="ltr"
            rows={10}
            value={cssCode}
            onChange={(e) => setCssCode(e.target.value)}
            spellCheck={false}
            className="w-full rounded-xl border border-slate-400/20 bg-[#04060c] p-3.5 font-mono text-xs leading-6 text-slate-100 focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
}
