import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Play,
  RotateCcw,
  Trash2,
  Copy,
  Maximize2,
  Minimize2,
  AlertCircle,
  Columns3,
  LayoutPanelTop,
} from 'lucide-react';
import type { Language } from '../types';
import { getTranslations } from '../i18n/translations';
import { useToast } from './ToastContext';

interface CodePlaygroundSectionProps {
  lang: Language;
}

interface ConsoleEntry {
  id: number;
  level: 'log' | 'warn' | 'error';
  message: string;
}

type TemplateKey = 'card' | 'counter' | 'grid';
type EditorLang = 'html' | 'css' | 'js';

const PLAYGROUND_TEMPLATES: Record<TemplateKey, { html: string; css: string; js: string }> = {
  card: {
    html: `<main class="card">
  <h1>QUSAI.DEV Sandbox</h1>
  <p>Edit HTML, CSS, and JavaScript to test live output safely.</p>
  <button id="pulseBtn">Trigger Event</button>
  <div id="status" class="status">Ready</div>
</main>`,
    css: `body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: #070a13;
  color: #f1f5f9;
  font-family: system-ui, sans-serif;
}
.card {
  width: min(360px, 90vw);
  padding: 24px;
  border-radius: 16px;
  background: linear-gradient(160deg, rgba(37, 99, 235, 0.16), rgba(124, 58, 237, 0.16));
  border: 1px solid rgba(148, 163, 184, 0.25);
}
h1 { margin: 0 0 8px; font-size: 1.25rem; }
p { margin: 0 0 16px; font-size: 0.9rem; color: #cbd5e1; }
button {
  padding: 10px 16px;
  border: 0;
  border-radius: 10px;
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  color: #fff;
  font-weight: 600;
  cursor: pointer;
}
.status { margin-top: 12px; font-size: 0.85rem; color: #93c5fd; }`,
    js: `const btn = document.getElementById('pulseBtn');
const status = document.getElementById('status');
let clicks = 0;

btn.addEventListener('click', () => {
  clicks += 1;
  status.textContent = \`Executed \${clicks} time(s)\`;
  console.log('Sandbox click event:', { clicks });
});`,
  },
  counter: {
    html: `<section class="box">
  <h2>State Counter</h2>
  <p id="value" class="num">0</p>
  <div class="row">
    <button id="dec">-1</button>
    <button id="reset">Reset</button>
    <button id="inc">+1</button>
  </div>
</section>`,
    css: `body {
  margin: 0; min-height: 100vh; display: grid; place-items: center;
  background: #05070e; color: #f8fafc; font-family: system-ui, sans-serif;
}
.box {
  text-align: center; padding: 24px 32px; border-radius: 16px;
  border: 1px solid rgba(96, 165, 250, 0.25); background: #0c1120;
}
.num { font-size: 2.5rem; font-weight: 700; margin: 12px 0; font-variant-numeric: tabular-nums; }
.row { display: flex; gap: 8px; justify-content: center; }
button {
  padding: 8px 16px; border-radius: 8px; border: 1px solid rgba(148,163,184,0.25);
  background: #172036; color: #fff; cursor: pointer; font-weight: 600;
}`,
    js: `let count = 0;
const el = document.getElementById('value');
const render = () => { el.textContent = String(count); };
document.getElementById('inc').onclick = () => { count++; render(); console.log('Increment ->', count); };
document.getElementById('dec').onclick = () => { count--; render(); console.log('Decrement ->', count); };
document.getElementById('reset').onclick = () => { count = 0; render(); console.log('Counter reset'); };`,
  },
  grid: {
    html: `<div class="grid">
  <div class="tile">Node A</div>
  <div class="tile">Node B</div>
  <div class="tile">Node C</div>
  <div class="tile">Node D</div>
</div>`,
    css: `body {
  margin: 0; min-height: 100vh; display: grid; place-items: center;
  background: #060911; color: #e2e8f0; font-family: system-ui, sans-serif;
}
.grid {
  display: grid; grid-template-columns: repeat(2, 130px); gap: 12px;
}
.tile {
  padding: 24px 16px; text-align: center; border-radius: 12px;
  background: #0f172a; border: 1px solid rgba(139, 92, 246, 0.35); font-weight: 600;
}`,
    js: `console.log('CSS Grid template rendered with 4 tiles.');`,
  },
};

function tokenizeCode(code: string, lang: EditorLang): { text: string; className: string }[] {
  const patterns: Record<EditorLang, RegExp> = {
    html: /(<!--[\s\S]*?-->|<\/?[a-zA-Z0-9-]+|"[^"]*"|'[^']*'|[a-zA-Z-]+(?==)|>)/g,
    css: /(\/\*[\s\S]*?\*\/|"[^"]*"|'[^']*'|[.#]?[a-zA-Z_-][a-zA-Z0-9_-]*(?=\s*\{)|[a-zA-Z-]+(?=\s*:)|#[0-9a-fA-F]{3,8}\b|\b\d+(?:\.\d+)?(?:px|rem|em|vh|vw|%|s|ms)?\b)/g,
    js: /(\/\/.*|\/\*[\s\S]*?\*\/|`[^`]*`|"[^"]*"|'[^']*'|\b(?:const|let|var|function|return|if|else|for|while|try|catch|new|async|await|true|false|null|undefined|document|window|console)\b|\b\d+(?:\.\d+)?\b)/g,
  };

  const regex = patterns[lang];
  const tokens: { text: string; className: string }[] = [];
  let lastIdx = 0;

  for (const match of code.matchAll(regex)) {
    const idx = match.index ?? 0;
    if (idx > lastIdx) {
      tokens.push({ text: code.slice(lastIdx, idx), className: 'text-slate-100' });
    }
    const token = match[0];
    let cls = 'text-slate-100';

    if (token.startsWith('//') || token.startsWith('/*') || token.startsWith('<!--')) {
      cls = 'text-slate-500';
    } else if (
      token.startsWith('"') ||
      token.startsWith("'") ||
      token.startsWith('`')
    ) {
      cls = 'text-emerald-300';
    } else if (lang === 'html' && (token.startsWith('<') || token === '>')) {
      cls = 'text-blue-400';
    } else if (lang === 'html') {
      cls = 'text-violet-300';
    } else if (lang === 'css' && token.startsWith('#')) {
      cls = 'text-amber-300';
    } else if (lang === 'css' && /^\d/.test(token)) {
      cls = 'text-amber-300';
    } else if (lang === 'css' && (token.startsWith('.') || token.includes('-'))) {
      cls = 'text-sky-300';
    } else if (lang === 'js' && /^\d/.test(token)) {
      cls = 'text-amber-300';
    } else if (
      lang === 'js' &&
      ['document', 'window', 'console'].includes(token)
    ) {
      cls = 'text-sky-300';
    } else {
      cls = 'text-violet-300';
    }

    tokens.push({ text: token, className: cls });
    lastIdx = idx + token.length;
  }

  if (lastIdx < code.length) {
    tokens.push({ text: code.slice(lastIdx), className: 'text-slate-100' });
  }
  return tokens;
}

function HighlightedEditor({
  label,
  code,
  lang,
  heightClass,
  onChange,
  onCopy,
  copyLabel,
}: {
  label: string;
  code: string;
  lang: EditorLang;
  heightClass: string;
  onChange: (val: string) => void;
  onCopy: () => void;
  copyLabel: string;
}) {
  const preRef = useRef<HTMLPreElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const tokens = useMemo(() => tokenizeCode(code, lang), [code, lang]);

  const syncScroll = () => {
    if (preRef.current && textareaRef.current) {
      preRef.current.scrollTop = textareaRef.current.scrollTop;
      preRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-slate-400/20 bg-[#04060c]">
      <div className="flex items-center justify-between border-b border-slate-400/15 bg-[#080b14] px-3 py-2 text-xs">
        <span className="font-mono font-semibold uppercase text-blue-300">{label}</span>
        <button
          type="button"
          onClick={onCopy}
          className="inline-flex items-center gap-1 text-xs text-slate-300 hover:text-blue-400 cursor-pointer"
        >
          <Copy className="h-3 w-3" />
          <span>{copyLabel}</span>
        </button>
      </div>

      <div dir="ltr" className={`relative w-full overflow-hidden ${heightClass}`}>
        <pre
          ref={preRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 m-0 overflow-auto whitespace-pre p-3.5 font-mono text-[13px] leading-6"
        >
          {tokens.map((tok, i) => (
            <span key={i} className={tok.className}>
              {tok.text}
            </span>
          ))}
          {'\n'}
        </pre>

        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => onChange(e.target.value)}
          onScroll={syncScroll}
          wrap="off"
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          aria-label={`${label} editor`}
          className="relative z-10 h-full w-full resize-none overflow-auto whitespace-pre bg-transparent p-3.5 font-mono text-[13px] leading-6 text-transparent caret-blue-400 selection:bg-blue-500/30 focus:outline-none"
        />
      </div>
    </div>
  );
}

export function CodePlaygroundSection({ lang }: CodePlaygroundSectionProps) {
  const t = getTranslations(lang);
  const { showToast } = useToast();
  const [activeTemplate, setActiveTemplate] = useState<TemplateKey>('card');
  const [editorTab, setEditorTab] = useState<EditorLang>('html');
  const [splitLayout, setSplitLayout] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  const [html, setHtml] = useState(PLAYGROUND_TEMPLATES.card.html);
  const [css, setCss] = useState(PLAYGROUND_TEMPLATES.card.css);
  const [js, setJs] = useState(PLAYGROUND_TEMPLATES.card.js);
  const [autoRun, setAutoRun] = useState(true);
  const [runSeed, setRunSeed] = useState(1);
  const [committed, setCommitted] = useState(PLAYGROUND_TEMPLATES.card);
  const [consoleLogs, setConsoleLogs] = useState<ConsoleEntry[]>([]);
  const [emptyRunError, setEmptyRunError] = useState(false);

  useEffect(() => {
    if (!autoRun) return;
    const timer = setTimeout(() => {
      setConsoleLogs([]);
      setEmptyRunError(false);
      setCommitted({ html, css, js });
      setRunSeed((s) => s + 1);
    }, 350);
    return () => clearTimeout(timer);
  }, [html, css, js, autoRun]);

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      const data = event.data as { source?: string; level?: string; args?: string[] } | null;
      if (!data || data.source !== 'qusai-dev-sandbox') return;
      const level = data.level === 'error' || data.level === 'warn' ? data.level : 'log';
      const message = Array.isArray(data.args) ? data.args.join(' ') : '';
      setConsoleLogs((prev) => [
        ...prev.slice(-49),
        { id: Date.now() + Math.random(), level, message },
      ]);
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFullscreen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [fullscreen]);

  const handleRun = () => {
    if (!html.trim() && !css.trim() && !js.trim()) {
      setEmptyRunError(true);
      setConsoleLogs([]);
      setCommitted({ html: '', css: '', js: '' });
      setRunSeed((s) => s + 1);
      return;
    }
    setEmptyRunError(false);
    setConsoleLogs([]);
    setCommitted({ html, css, js });
    setRunSeed((s) => s + 1);
  };

  const handleReset = () => {
    const tpl = PLAYGROUND_TEMPLATES[activeTemplate];
    setHtml(tpl.html);
    setCss(tpl.css);
    setJs(tpl.js);
    setEmptyRunError(false);
    setConsoleLogs([]);
    setCommitted(tpl);
    setRunSeed((s) => s + 1);
    showToast(t.toast.playgroundReset, 'info');
  };

  const handleClear = () => {
    setHtml('');
    setCss('');
    setJs('');
    setEmptyRunError(false);
    setConsoleLogs([]);
    setCommitted({ html: '', css: '', js: '' });
    setRunSeed((s) => s + 1);
    showToast(t.toast.playgroundCleared, 'info');
  };

  const copyText = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      showToast(t.toast.copied, 'success');
    } catch {
      showToast(t.toast.copyFailed, 'error');
    }
  };

  const buildCombinedDocument = () => {
    const safeJs = js.replace(/<\/script>/gi, '<\\/script>');
    return `<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8" />\n<style>\n${css}\n</style>\n</head>\n<body>\n${html}\n<script>\n${safeJs}\n</script>\n</body>\n</html>`;
  };

  const isBlank = !committed.html.trim() && !committed.css.trim() && !committed.js.trim();

  const sandboxSrcDoc = useMemo(() => {
    if (isBlank) {
      return `<!doctype html><html><body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#05070e;color:#94a3b8;font-family:system-ui,sans-serif;padding:24px;text-align:center;font-size:13px;">${t.playground.emptyPreviewNote}</body></html>`;
    }
    const safeJs = committed.js.replace(/<\/script>/gi, '<\\/script>');
    return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<style>${committed.css}</style>
</head>
<body>
${committed.html}
<script>
(function() {
  const emit = (level, args) => {
    try {
      const serialized = args.map((item) => {
        if (typeof item === 'string') return item;
        try { return JSON.stringify(item); } catch { return String(item); }
      });
      parent.postMessage({ source: 'qusai-dev-sandbox', level, args: serialized }, '*');
    } catch {}
  };
  const origLog = console.log;
  const origWarn = console.warn;
  const origError = console.error;
  console.log = (...a) => { emit('log', a); origLog.apply(console, a); };
  console.warn = (...a) => { emit('warn', a); origWarn.apply(console, a); };
  console.error = (...a) => { emit('error', a); origError.apply(console, a); };
  window.onerror = (msg, _src, line, col) => {
    emit('error', [msg + ' (line ' + line + ':' + col + ')']);
  };
  window.addEventListener('unhandledrejection', (ev) => {
    const reason = ev && ev.reason ? (ev.reason.message || String(ev.reason)) : 'Unhandled promise rejection';
    emit('error', [reason]);
  });
})();
</script>
<script>
try {
${safeJs}
} catch (err) {
  console.error(err && err.message ? err.message : String(err));
}
</script>
</body>
</html>`;
  }, [committed, isBlank, t.playground.emptyPreviewNote]);

  const runtimeErrors = useMemo(
    () => consoleLogs.filter((l) => l.level === 'error'),
    [consoleLogs]
  );

  return (
    <section className="mx-auto max-w-[1320px] px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="mb-6 border-b border-slate-400/15 pb-5 sm:mb-8 sm:pb-6">
        <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-4xl">
          {t.playground.heading}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-300 sm:text-base">
          {t.playground.subheading}
        </p>
      </div>

      <div className="glass-panel rounded-2xl p-4 sm:p-6 space-y-5">
        {/* Toolbar */}
        <div className="flex flex-col gap-4 border-b border-slate-400/15 pb-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-400">
              {t.playground.templatesLabel}:
            </span>
            {(['card', 'counter', 'grid'] as TemplateKey[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  const tpl = PLAYGROUND_TEMPLATES[key];
                  setActiveTemplate(key);
                  setHtml(tpl.html);
                  setCss(tpl.css);
                  setJs(tpl.js);
                  setConsoleLogs([]);
                  setCommitted(tpl);
                  setRunSeed((s) => s + 1);
                }}
                className={`min-h-[36px] rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activeTemplate === key
                    ? 'border-blue-500/50 bg-blue-500/15 text-blue-200'
                    : 'border-slate-400/20 bg-slate-900/60 text-slate-200 hover:border-blue-500/40'
                }`}
              >
                {t.playground.templates[key]}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="me-1 inline-flex min-h-[38px] items-center gap-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={autoRun}
                onChange={(e) => setAutoRun(e.target.checked)}
                className="h-4 w-4 rounded border-slate-500 accent-blue-500"
              />
              <span>{t.playground.autoRun}</span>
            </label>

            <button
              type="button"
              onClick={() => setSplitLayout((prev) => !prev)}
              className="hidden lg:inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-slate-400/20 bg-slate-900/70 px-3 py-2 text-xs font-medium text-slate-200 hover:border-blue-500/40 whitespace-nowrap shrink-0 cursor-pointer"
            >
              {splitLayout ? (
                <LayoutPanelTop className="h-3.5 w-3.5" />
              ) : (
                <Columns3 className="h-3.5 w-3.5" />
              )}
              <span>{splitLayout ? t.playground.tabViewBtn : t.playground.splitViewBtn}</span>
            </button>

            <button
              type="button"
              onClick={handleRun}
              className="neon-action-btn inline-flex min-h-[40px] items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold text-white whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Play className="h-3.5 w-3.5" />
              <span>{t.playground.runBtn}</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-slate-400/20 bg-slate-900/70 px-3.5 py-2 text-xs font-medium text-slate-200 hover:border-blue-500/40 hover:text-white whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>{t.playground.resetBtn}</span>
            </button>

            <button
              type="button"
              onClick={handleClear}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-slate-400/20 px-3.5 py-2 text-xs font-medium text-slate-300 hover:border-rose-500/40 hover:text-rose-300 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>{t.playground.clearBtn}</span>
            </button>

            <button
              type="button"
              onClick={() => void copyText(buildCombinedDocument())}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-slate-400/20 px-3.5 py-2 text-xs font-medium text-slate-200 hover:border-blue-500/40 hover:text-white whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Copy className="h-3.5 w-3.5" />
              <span>{t.playground.copyBundleBtn}</span>
            </button>
          </div>
        </div>

        {/* Desktop 3-Pane Split Editors */}
        {splitLayout && (
          <div className="hidden lg:grid lg:grid-cols-3 lg:gap-4">
            <HighlightedEditor
              label="HTML"
              lang="html"
              code={html}
              heightClass="h-[260px]"
              onChange={setHtml}
              onCopy={() => void copyText(html)}
              copyLabel={t.playground.copyActiveBtn}
            />
            <HighlightedEditor
              label="CSS"
              lang="css"
              code={css}
              heightClass="h-[260px]"
              onChange={setCss}
              onCopy={() => void copyText(css)}
              copyLabel={t.playground.copyActiveBtn}
            />
            <HighlightedEditor
              label="JavaScript"
              lang="js"
              code={js}
              heightClass="h-[260px]"
              onChange={setJs}
              onCopy={() => void copyText(js)}
              copyLabel={t.playground.copyActiveBtn}
            />
          </div>
        )}

        {/* Main Editor + Preview Layout */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          {!splitLayout && (
            <div className="flex flex-col lg:col-span-6">
              <div className="mb-2 flex items-center gap-1 rounded-lg border border-slate-400/15 bg-[#04060c] p-1 w-fit">
                {(['html', 'css', 'js'] as EditorLang[]).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setEditorTab(tab)}
                    className={`min-h-[36px] rounded-md px-4 py-1 text-xs font-semibold uppercase transition-colors cursor-pointer ${
                      editorTab === tab
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <HighlightedEditor
                label={editorTab.toUpperCase()}
                lang={editorTab}
                code={editorTab === 'html' ? html : editorTab === 'css' ? css : js}
                heightClass="h-[320px] sm:h-[360px]"
                onChange={(val) => {
                  if (editorTab === 'html') setHtml(val);
                  else if (editorTab === 'css') setCss(val);
                  else setJs(val);
                }}
                onCopy={() =>
                  void copyText(
                    editorTab === 'html' ? html : editorTab === 'css' ? css : js
                  )
                }
                copyLabel={t.playground.copyActiveBtn}
              />
            </div>
          )}

          {/* Mobile fallback editors when desktop splitLayout is toggled on */}
          {splitLayout && (
            <div className="flex flex-col lg:hidden">
              <div className="mb-2 flex items-center gap-1 rounded-lg border border-slate-400/15 bg-[#04060c] p-1 w-fit">
                {(['html', 'css', 'js'] as EditorLang[]).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setEditorTab(tab)}
                    className={`min-h-[36px] rounded-md px-4 py-1 text-xs font-semibold uppercase transition-colors cursor-pointer ${
                      editorTab === tab
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <HighlightedEditor
                label={editorTab.toUpperCase()}
                lang={editorTab}
                code={editorTab === 'html' ? html : editorTab === 'css' ? css : js}
                heightClass="h-[300px]"
                onChange={(val) => {
                  if (editorTab === 'html') setHtml(val);
                  else if (editorTab === 'css') setCss(val);
                  else setJs(val);
                }}
                onCopy={() =>
                  void copyText(
                    editorTab === 'html' ? html : editorTab === 'css' ? css : js
                  )
                }
                copyLabel={t.playground.copyActiveBtn}
              />
            </div>
          )}

          {/* Live Preview & Console / Error Display */}
          <div
            className={`flex flex-col gap-4 ${
              splitLayout ? 'lg:col-span-12' : 'lg:col-span-6'
            }`}
          >
            <div>
              <div className="mb-2 flex items-center justify-between text-xs text-slate-300">
                <span className="font-semibold">{t.playground.previewLabel}</span>
                <button
                  type="button"
                  onClick={() => setFullscreen(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-400 hover:text-blue-300 cursor-pointer"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                  <span>{t.playground.fullscreenBtn}</span>
                </button>
              </div>
              <iframe
                key={runSeed}
                title="QUSAI.DEV Isolated Code Sandbox"
                sandbox="allow-scripts"
                srcDoc={sandboxSrcDoc}
                className="h-[260px] w-full rounded-xl border border-slate-400/20 bg-[#070a13] sm:h-[280px]"
              />
              <p className="mt-1.5 text-[11px] text-slate-400">
                {t.playground.sandboxNote}
              </p>
            </div>

            {emptyRunError && (
              <div role="alert" className="rounded-xl border border-amber-500/35 bg-amber-950/30 p-3 text-xs text-amber-200 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-amber-400" />
                <span>{t.playground.emptyRunError}</span>
              </div>
            )}

            {runtimeErrors.length > 0 && (
              <div role="alert" className="rounded-xl border border-rose-500/35 bg-rose-950/30 p-3 text-xs text-rose-200">
                <div className="mb-1 flex items-center gap-1.5 font-semibold text-rose-300">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{t.playground.errorsLabel}</span>
                </div>
                <div dir="ltr" className="space-y-1 font-mono">
                  {runtimeErrors.map((err) => (
                    <div key={err.id}>{err.message}</div>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-xl border border-slate-400/20 bg-[#04060c] p-3">
              <div className="mb-2 flex items-center justify-between border-b border-slate-400/10 pb-2 text-xs">
                <span className="font-semibold text-slate-300">
                  {t.playground.consoleLabel}
                </span>
                <button
                  type="button"
                  onClick={() => setConsoleLogs([])}
                  className="inline-flex items-center gap-1 text-slate-400 hover:text-white cursor-pointer"
                >
                  <Trash2 className="h-3 w-3" />
                  <span>{t.playground.clearConsole}</span>
                </button>
              </div>
              <div dir="ltr" className="max-h-[120px] space-y-1 overflow-y-auto font-mono text-xs">
                {consoleLogs.length === 0 ? (
                  <p className="text-slate-500">{t.playground.noLogs}</p>
                ) : (
                  consoleLogs.map((entry) => (
                    <div
                      key={entry.id}
                      className={
                        entry.level === 'error'
                          ? 'text-rose-300'
                          : entry.level === 'warn'
                            ? 'text-amber-300'
                            : 'text-sky-300'
                      }
                    >
                      [{entry.level}] {entry.message}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Sandbox Preview Modal */}
      {fullscreen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t.playground.previewLabel}
          className="fixed inset-0 z-50 flex flex-col bg-[#050508]"
        >
          <div className="flex items-center justify-between border-b border-slate-400/20 bg-[#080b14] px-4 py-3 sm:px-6">
            <span className="text-sm font-semibold text-white">
              {t.playground.previewLabel}
            </span>
            <button
              type="button"
              onClick={() => setFullscreen(false)}
              className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-slate-400/25 bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-slate-100 hover:border-blue-500/50 cursor-pointer"
            >
              <Minimize2 className="h-4 w-4" />
              <span>{t.playground.exitFullscreenBtn}</span>
            </button>
          </div>
          <iframe
            key={`fs-${runSeed}`}
            title="QUSAI.DEV Fullscreen Isolated Sandbox"
            sandbox="allow-scripts"
            srcDoc={sandboxSrcDoc}
            className="flex-1 w-full bg-[#070a13]"
          />
        </div>
      )}
    </section>
  );
}
