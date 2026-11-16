import { useEffect, useMemo, useState } from 'react';
import {
  Braces,
  Binary,
  Link2,
  Type as TypeIcon,
  Copy,
  Check,
  ArrowLeftRight,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import type { Language } from '../types';
import { getTranslations } from '../i18n/translations';
import { useToast } from './ToastContext';
import {
  computeTextStats,
  decodeBase64Safe,
  decodeUrlSafe,
  encodeBase64Safe,
  encodeUrlSafe,
  formatJsonInput,
  parseUrlBreakdown,
  transformText,
  utf8ToBase64,
  type TextTransformKind,
} from '../utils/devToolsUtils';

interface DevToolsSectionProps {
  lang: Language;
}

type DevToolTab = 'json' | 'base64' | 'url' | 'text';

const SAMPLE_JSON = `{
  "platform": "QUSAI.DEV",
  "creator": "Qusai Omar Mohammed Ali",
  "capabilities": ["AI Lab", "Code Playground", "Developer Tools", "Network Lab"],
  "bilingual": {
    "english": "LTR",
    "arabic": "RTL"
  },
  "active": true
}`;

const SAMPLE_URL = 'https://qusai.dev/network-lab?tool=cidr&ip=192.168.10.0&prefix=24&lang=ar#results';

export function DevToolsSection({ lang }: DevToolsSectionProps) {
  const t = getTranslations(lang);
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<DevToolTab>('json');

  // JSON state
  const [jsonInput, setJsonInput] = useState(SAMPLE_JSON);
  const [jsonIndent, setJsonIndent] = useState<'2' | '4' | 'tab'>('2');
  const [jsonSortKeys, setJsonSortKeys] = useState(false);
  const [jsonOutput, setJsonOutput] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [jsonStats, setJsonStats] = useState<{ keys: number; depth: number; bytes: number } | null>(null);
  const [jsonCopied, setJsonCopied] = useState(false);

  // Base64 state
  const [plainText, setPlainText] = useState('QUSAI.DEV — مرحباً بالعالم');
  const [base64Text, setBase64Text] = useState('');
  const [urlSafe, setUrlSafe] = useState(false);
  const [base64Error, setBase64Error] = useState<string | null>(null);
  const [copiedB64, setCopiedB64] = useState<'plain' | 'encoded' | null>(null);

  // URL Encoder / Decoder state
  const [urlDecoded, setUrlDecoded] = useState(SAMPLE_URL);
  const [urlEncoded, setUrlEncoded] = useState('');
  const [urlMode, setUrlMode] = useState<'component' | 'uri'>('component');
  const [urlError, setUrlError] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<'decoded' | 'encoded' | null>(null);

  // Text Converter state
  const [textInput, setTextInput] = useState(
    'QUSAI.DEV Developer Platform\nNetwork Systems & AI Integration\nNetwork Systems & AI Integration'
  );
  const [textOutput, setTextOutput] = useState('');
  const [textError, setTextError] = useState<string | null>(null);
  const [textCopied, setTextCopied] = useState(false);

  useEffect(() => {
    runJsonTransform(false);
    try {
      setBase64Text(utf8ToBase64(plainText, false));
      setUrlEncoded(encodeURIComponent(SAMPLE_URL));
    } catch {
      // ignore initial conversion
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runJsonTransform = (minify: boolean) => {
    const result = formatJsonInput(jsonInput, {
      indent: jsonIndent,
      sortKeys: jsonSortKeys,
      minify,
    });
    if (result.ok) {
      setJsonOutput(result.formatted);
      setJsonStats(result.stats);
      setJsonError(null);
    } else {
      setJsonError(
        result.errorType === 'empty' ? t.devTools.json.emptyError : result.message
      );
      setJsonOutput('');
      setJsonStats(null);
    }
  };

  const parsedUrl = useMemo(() => parseUrlBreakdown(urlDecoded), [urlDecoded]);

  const textStats = useMemo(() => computeTextStats(textInput), [textInput]);

  const applyTextTransform = (kind: TextTransformKind) => {
    const res = transformText(textInput, kind);
    if (!res.ok) {
      setTextError(t.devTools.text.emptyError);
      setTextOutput('');
      return;
    }
    setTextError(null);
    setTextOutput(res.value);
  };

  const tabItems: { id: DevToolTab; label: string; Icon: typeof Braces }[] = [
    { id: 'json', label: t.devTools.tabs.json, Icon: Braces },
    { id: 'base64', label: t.devTools.tabs.base64, Icon: Binary },
    { id: 'url', label: t.devTools.tabs.url, Icon: Link2 },
    { id: 'text', label: t.devTools.tabs.text, Icon: TypeIcon },
  ];

  return (
    <section className="mx-auto max-w-[1320px] px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 border-b border-slate-400/15 pb-5 sm:mb-8 sm:pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-4xl">
            {t.devTools.heading}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-300 sm:text-base">
            {t.devTools.subheading}
          </p>
        </div>

        <div
          role="tablist"
          aria-label={t.devTools.heading}
          className="grid grid-cols-2 gap-1 rounded-xl border border-slate-400/20 bg-[#0b0e17] p-1 sm:flex sm:flex-wrap"
        >
          {tabItems.map(({ id, label, Icon }) => (
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

      {/* 1. JSON Formatter & Validator */}
      {activeTab === 'json' && (
        <div className="glass-panel rounded-2xl p-4 sm:p-6 space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 text-xs text-slate-300">
                <span>{t.devTools.json.indentLabel}:</span>
                <select
                  value={jsonIndent}
                  onChange={(e) => setJsonIndent(e.target.value as '2' | '4' | 'tab')}
                  className="rounded-lg border border-slate-400/20 bg-[#04060c] px-2.5 py-1.5 text-xs text-slate-100"
                >
                  <option value="2">{t.devTools.json.spaces2}</option>
                  <option value="4">{t.devTools.json.spaces4}</option>
                  <option value="tab">{t.devTools.json.tabs}</option>
                </select>
              </label>

              <label className="inline-flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={jsonSortKeys}
                  onChange={(e) => setJsonSortKeys(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-500 accent-blue-500"
                />
                <span>{t.devTools.json.sortKeys}</span>
              </label>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => runJsonTransform(false)}
                className="neon-action-btn min-h-[40px] rounded-lg px-4 py-2 text-xs font-semibold text-white whitespace-nowrap shrink-0 cursor-pointer"
              >
                {t.devTools.json.formatBtn}
              </button>
              <button
                type="button"
                onClick={() => runJsonTransform(true)}
                className="min-h-[40px] rounded-lg border border-slate-400/20 bg-slate-900/70 px-4 py-2 text-xs font-semibold text-slate-100 hover:border-blue-500/40 whitespace-nowrap shrink-0 cursor-pointer"
              >
                {t.devTools.json.minifyBtn}
              </button>
              <button
                type="button"
                onClick={() => {
                  setJsonInput(SAMPLE_JSON);
                  setJsonError(null);
                }}
                className="min-h-[40px] rounded-lg border border-slate-400/20 px-3 py-2 text-xs text-slate-300 hover:text-white whitespace-nowrap shrink-0 cursor-pointer"
              >
                {t.devTools.json.sampleBtn}
              </button>
              <button
                type="button"
                onClick={() => {
                  setJsonInput('');
                  setJsonOutput('');
                  setJsonError(null);
                  setJsonStats(null);
                }}
                className="min-h-[40px] rounded-lg border border-slate-400/20 px-3 py-2 text-xs text-slate-300 hover:text-rose-300 whitespace-nowrap shrink-0 cursor-pointer"
              >
                {t.devTools.json.clearBtn}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <div>
              <label htmlFor="devtools-json-input" className="mb-2 block text-xs font-semibold text-slate-300">
                {t.devTools.json.inputLabel}
              </label>
              <textarea
                id="devtools-json-input"
                dir="ltr"
                rows={12}
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                className="w-full rounded-xl border border-slate-400/20 bg-[#04060c] p-4 font-mono text-sm leading-6 text-slate-100 focus:border-blue-500 focus:outline-none sm:text-xs"
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">
                  {t.devTools.json.outputLabel}
                </span>
                <button
                  type="button"
                  disabled={!jsonOutput}
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(jsonOutput);
                      setJsonCopied(true);
                      showToast(t.toast.copied, 'success');
                      setTimeout(() => setJsonCopied(false), 1500);
                    } catch {
                      showToast(t.toast.copyFailed, 'error');
                    }
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-400 hover:text-blue-300 disabled:opacity-40 cursor-pointer"
                >
                  {jsonCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{jsonCopied ? t.devTools.json.copied : t.devTools.json.copyBtn}</span>
                </button>
              </div>
              <pre
                dir="ltr"
                className="h-[300px] overflow-auto rounded-xl border border-slate-400/20 bg-[#04060c] p-4 font-mono text-xs leading-6 text-slate-100 sm:h-[314px]"
              >
                <code>{jsonOutput}</code>
              </pre>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-400/15 pt-4 text-xs">
            {jsonError ? (
              <div role="alert" className="flex items-center gap-2 text-rose-300">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                <span>
                  {t.devTools.json.invalidStatus}: {jsonError}
                </span>
              </div>
            ) : jsonStats ? (
              <div className="flex items-center gap-2 text-emerald-300">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                <span>{t.devTools.json.validStatus}</span>
              </div>
            ) : (
              <span className="text-slate-500">—</span>
            )}

            {jsonStats && (
              <div className="flex flex-wrap items-center gap-3 text-slate-300 tabular-nums font-mono">
                <span>
                  {t.devTools.json.statsKeys}: {jsonStats.keys}
                </span>
                <span aria-hidden="true">·</span>
                <span>
                  {t.devTools.json.statsDepth}: {jsonStats.depth}
                </span>
                <span aria-hidden="true">·</span>
                <span>
                  {t.devTools.json.statsBytes}: {jsonStats.bytes}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. Base64 Encoder & Decoder */}
      {activeTab === 'base64' && (
        <div className="glass-panel rounded-2xl p-4 sm:p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <label className="inline-flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={urlSafe}
                onChange={(e) => setUrlSafe(e.target.checked)}
                className="h-4 w-4 rounded border-slate-500 accent-blue-500"
              />
              <span>{t.devTools.base64.urlSafe}</span>
            </label>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const res = encodeBase64Safe(plainText, urlSafe);
                  if (res.ok) {
                    setBase64Text(res.value);
                    setBase64Error(null);
                  } else {
                    setBase64Error(
                      res.errorType === 'empty'
                        ? t.devTools.base64.emptyPlainError
                        : t.devTools.base64.invalidError
                    );
                  }
                }}
                className="neon-action-btn min-h-[40px] rounded-lg px-4 py-2 text-xs font-semibold text-white whitespace-nowrap shrink-0 cursor-pointer"
              >
                {t.devTools.base64.encodeBtn}
              </button>
              <button
                type="button"
                onClick={() => {
                  const res = decodeBase64Safe(base64Text);
                  if (res.ok) {
                    setPlainText(res.value);
                    setBase64Error(null);
                  } else {
                    setBase64Error(
                      res.errorType === 'empty'
                        ? t.devTools.base64.emptyEncodedError
                        : t.devTools.base64.invalidError
                    );
                  }
                }}
                className="min-h-[40px] rounded-lg border border-slate-400/20 bg-slate-900/70 px-4 py-2 text-xs font-semibold text-slate-100 hover:border-blue-500/40 whitespace-nowrap shrink-0 cursor-pointer"
              >
                {t.devTools.base64.decodeBtn}
              </button>
              <button
                type="button"
                onClick={() => {
                  const prevPlain = plainText;
                  setPlainText(base64Text);
                  setBase64Text(prevPlain);
                  setBase64Error(null);
                }}
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-slate-400/20 px-3 py-2 text-xs text-slate-300 hover:text-white whitespace-nowrap shrink-0 cursor-pointer"
              >
                <ArrowLeftRight className="h-3.5 w-3.5" />
                <span>{t.devTools.base64.swapBtn}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setPlainText('');
                  setBase64Text('');
                  setBase64Error(null);
                }}
                className="min-h-[40px] rounded-lg border border-slate-400/20 px-3 py-2 text-xs text-slate-300 hover:text-rose-300 whitespace-nowrap shrink-0 cursor-pointer"
              >
                {t.devTools.base64.clearBtn}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label htmlFor="devtools-b64-plain" className="text-xs font-semibold text-slate-300">
                  {t.devTools.base64.plainLabel}
                </label>
                <button
                  type="button"
                  disabled={!plainText}
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(plainText);
                      setCopiedB64('plain');
                      showToast(t.toast.copied, 'success');
                      setTimeout(() => setCopiedB64(null), 1500);
                    } catch {
                      showToast(t.toast.copyFailed, 'error');
                    }
                  }}
                  className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 disabled:opacity-40 cursor-pointer"
                >
                  {copiedB64 === 'plain' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{t.devTools.base64.copyPlain}</span>
                </button>
              </div>
              <textarea
                id="devtools-b64-plain"
                rows={9}
                value={plainText}
                onChange={(e) => setPlainText(e.target.value)}
                className="w-full rounded-xl border border-slate-400/20 bg-[#04060c] p-4 font-mono text-sm leading-6 text-slate-100 focus:border-blue-500 focus:outline-none sm:text-xs"
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label htmlFor="devtools-b64-encoded" className="text-xs font-semibold text-slate-300">
                  {t.devTools.base64.encodedLabel}
                </label>
                <button
                  type="button"
                  disabled={!base64Text}
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(base64Text);
                      setCopiedB64('encoded');
                      showToast(t.toast.copied, 'success');
                      setTimeout(() => setCopiedB64(null), 1500);
                    } catch {
                      showToast(t.toast.copyFailed, 'error');
                    }
                  }}
                  className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 disabled:opacity-40 cursor-pointer"
                >
                  {copiedB64 === 'encoded' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{t.devTools.base64.copyEncoded}</span>
                </button>
              </div>
              <textarea
                id="devtools-b64-encoded"
                dir="ltr"
                rows={9}
                value={base64Text}
                onChange={(e) => setBase64Text(e.target.value)}
                className="w-full rounded-xl border border-slate-400/20 bg-[#04060c] p-4 font-mono text-sm leading-6 text-slate-100 focus:border-blue-500 focus:outline-none sm:text-xs"
              />
            </div>
          </div>

          {base64Error && (
            <div role="alert" className="flex items-center gap-2 rounded-xl border border-rose-500/35 bg-rose-950/30 px-4 py-3 text-xs text-rose-200">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{base64Error}</span>
            </div>
          )}
        </div>
      )}

      {/* 3. URL Encoder & Decoder + Query Parser */}
      {activeTab === 'url' && (
        <div className="space-y-6">
          <div className="glass-panel rounded-2xl p-4 sm:p-6 space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-1 rounded-lg border border-slate-400/20 bg-[#04060c] p-1 w-fit">
                <button
                  type="button"
                  onClick={() => setUrlMode('component')}
                  className={`min-h-[34px] rounded-md px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
                    urlMode === 'component'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {t.devTools.url.modeComponent}
                </button>
                <button
                  type="button"
                  onClick={() => setUrlMode('uri')}
                  className={`min-h-[34px] rounded-md px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
                    urlMode === 'uri'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {t.devTools.url.modeFullUri}
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const res = encodeUrlSafe(urlDecoded, urlMode);
                    if (res.ok) {
                      setUrlEncoded(res.value);
                      setUrlError(null);
                    } else {
                      setUrlError(
                        res.errorType === 'empty'
                          ? t.devTools.url.emptyError
                          : t.devTools.url.invalidError
                      );
                    }
                  }}
                  className="neon-action-btn min-h-[40px] rounded-lg px-4 py-2 text-xs font-semibold text-white whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {t.devTools.url.encodeBtn}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const res = decodeUrlSafe(urlEncoded, urlMode);
                    if (res.ok) {
                      setUrlDecoded(res.value);
                      setUrlError(null);
                    } else {
                      setUrlError(
                        res.errorType === 'empty'
                          ? t.devTools.url.emptyError
                          : t.devTools.url.invalidError
                      );
                    }
                  }}
                  className="min-h-[40px] rounded-lg border border-slate-400/20 bg-slate-900/70 px-4 py-2 text-xs font-semibold text-slate-100 hover:border-blue-500/40 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {t.devTools.url.decodeBtn}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const prev = urlDecoded;
                    setUrlDecoded(urlEncoded);
                    setUrlEncoded(prev);
                    setUrlError(null);
                  }}
                  className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-slate-400/20 px-3 py-2 text-xs text-slate-300 hover:text-white whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <ArrowLeftRight className="h-3.5 w-3.5" />
                  <span>{t.devTools.url.swapBtn}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUrlDecoded(SAMPLE_URL);
                    setUrlEncoded(encodeURIComponent(SAMPLE_URL));
                    setUrlError(null);
                  }}
                  className="min-h-[40px] rounded-lg border border-slate-400/20 px-3 py-2 text-xs text-slate-300 hover:text-white whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {t.devTools.url.sampleBtn}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUrlDecoded('');
                    setUrlEncoded('');
                    setUrlError(null);
                  }}
                  className="min-h-[40px] rounded-lg border border-slate-400/20 px-3 py-2 text-xs text-slate-300 hover:text-rose-300 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {t.devTools.url.clearBtn}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">
                    {t.devTools.url.decodedLabel}
                  </span>
                  <button
                    type="button"
                    disabled={!urlDecoded}
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(urlDecoded);
                        setCopiedUrl('decoded');
                        showToast(t.toast.copied, 'success');
                        setTimeout(() => setCopiedUrl(null), 1500);
                      } catch {
                        showToast(t.toast.copyFailed, 'error');
                      }
                    }}
                    className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 disabled:opacity-40 cursor-pointer"
                  >
                    {copiedUrl === 'decoded' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{t.devTools.url.copyDecoded}</span>
                  </button>
                </div>
                <textarea
                  dir="ltr"
                  rows={6}
                  value={urlDecoded}
                  onChange={(e) => setUrlDecoded(e.target.value)}
                  className="w-full rounded-xl border border-slate-400/20 bg-[#04060c] p-4 font-mono text-sm leading-6 text-slate-100 focus:border-blue-500 focus:outline-none sm:text-xs"
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">
                    {t.devTools.url.encodedLabel}
                  </span>
                  <button
                    type="button"
                    disabled={!urlEncoded}
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(urlEncoded);
                        setCopiedUrl('encoded');
                        showToast(t.toast.copied, 'success');
                        setTimeout(() => setCopiedUrl(null), 1500);
                      } catch {
                        showToast(t.toast.copyFailed, 'error');
                      }
                    }}
                    className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 disabled:opacity-40 cursor-pointer"
                  >
                    {copiedUrl === 'encoded' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{t.devTools.url.copyEncoded}</span>
                  </button>
                </div>
                <textarea
                  dir="ltr"
                  rows={6}
                  value={urlEncoded}
                  onChange={(e) => setUrlEncoded(e.target.value)}
                  className="w-full rounded-xl border border-slate-400/20 bg-[#04060c] p-4 font-mono text-sm leading-6 text-slate-100 focus:border-blue-500 focus:outline-none sm:text-xs"
                />
              </div>
            </div>

            {urlError && (
              <div role="alert" className="flex items-center gap-2 rounded-xl border border-rose-500/35 bg-rose-950/30 px-4 py-3 text-xs text-rose-200">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                <span>{urlError}</span>
              </div>
            )}
          </div>

          {/* Parsed URL Component Breakdown */}
          <div className="glass-panel rounded-2xl p-4 sm:p-6">
            <h2 className="font-display text-base font-semibold text-white">
              {t.devTools.url.parsedTitle}
            </h2>
            {parsedUrl ? (
              <div className="mt-4 space-y-5">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    { label: t.devTools.url.protocol, value: parsedUrl.protocol },
                    { label: t.devTools.url.host, value: parsedUrl.host },
                    { label: t.devTools.url.pathname, value: parsedUrl.pathname },
                    { label: t.devTools.url.hash, value: parsedUrl.hash },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-xl border border-slate-400/15 bg-[#04060c] p-3.5"
                    >
                      <div className="text-xs text-slate-400">{item.label}</div>
                      <div dir="ltr" className="mt-1 font-mono text-xs font-semibold text-blue-200 break-all">
                        {item.value}
                      </div>
                    </div>
                  ))}
                </div>

                {parsedUrl.params.length > 0 && (
                  <div>
                    <h3 className="mb-2 text-xs font-semibold text-slate-300">
                      {t.devTools.url.paramsTitle}
                    </h3>
                    <div className="overflow-x-auto">
                      <table dir="ltr" className="w-full min-w-[360px] border-collapse text-left font-mono text-xs">
                        <thead>
                          <tr className="border-b border-slate-400/15 text-slate-400">
                            <th className="py-2 pr-4 font-medium">Key</th>
                            <th className="py-2 font-medium">Value</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-400/10 text-slate-200">
                          {parsedUrl.params.map((p, idx) => (
                            <tr key={`${p.key}-${idx}`}>
                              <td className="py-2 pr-4 font-semibold text-blue-300">{p.key}</td>
                              <td className="py-2 break-all">{p.value}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="mt-2 text-xs text-slate-400">{t.devTools.url.noParams}</p>
            )}
          </div>
        </div>
      )}

      {/* 4. Text Converter */}
      {activeTab === 'text' && (
        <div className="glass-panel rounded-2xl p-4 sm:p-6 space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            {(Object.keys(t.devTools.text.transforms) as (keyof typeof t.devTools.text.transforms)[]).map(
              (key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => applyTextTransform(key)}
                  className="min-h-[38px] rounded-lg border border-slate-400/20 bg-slate-900/70 px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:border-blue-500/50 hover:text-white whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {t.devTools.text.transforms[key]}
                </button>
              )
            )}
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">
                  {t.devTools.text.inputLabel}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setTextInput('');
                    setTextOutput('');
                    setTextError(null);
                  }}
                  className="text-xs text-slate-400 hover:text-rose-300 cursor-pointer"
                >
                  {t.devTools.text.clearBtn}
                </button>
              </div>
              <textarea
                aria-label={t.devTools.text.inputLabel}
                rows={9}
                value={textInput}
                onChange={(e) => {
                  setTextInput(e.target.value);
                  if (textError && e.target.value.trim()) setTextError(null);
                }}
                className="w-full rounded-xl border border-slate-400/20 bg-[#04060c] p-4 font-mono text-sm leading-6 text-slate-100 focus:border-blue-500 focus:outline-none sm:text-xs"
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">
                  {t.devTools.text.outputLabel}
                </span>
                <button
                  type="button"
                  disabled={!textOutput}
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(textOutput);
                      setTextCopied(true);
                      showToast(t.toast.copied, 'success');
                      setTimeout(() => setTextCopied(false), 1500);
                    } catch {
                      showToast(t.toast.copyFailed, 'error');
                    }
                  }}
                  className="inline-flex items-center gap-1 text-xs font-medium text-blue-400 hover:text-blue-300 disabled:opacity-40 cursor-pointer"
                >
                  {textCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{t.devTools.text.copyBtn}</span>
                </button>
              </div>
              <textarea
                aria-label={t.devTools.text.outputLabel}
                readOnly
                rows={9}
                value={textOutput}
                className="w-full rounded-xl border border-slate-400/20 bg-[#04060c] p-4 font-mono text-sm leading-6 text-slate-100 focus:outline-none sm:text-xs"
              />
            </div>
          </div>

          {textError && (
            <div role="alert" className="flex items-center gap-2 rounded-xl border border-rose-500/35 bg-rose-950/30 px-4 py-3 text-xs text-rose-200">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{textError}</span>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 border-t border-slate-400/15 pt-4 text-xs text-slate-300 tabular-nums font-mono">
            <span>
              {t.devTools.text.chars}: {textStats.chars}
            </span>
            <span aria-hidden="true">·</span>
            <span>
              {t.devTools.text.words}: {textStats.words}
            </span>
            <span aria-hidden="true">·</span>
            <span>
              {t.devTools.text.lines}: {textStats.lines}
            </span>
            <span aria-hidden="true">·</span>
            <span>
              {t.devTools.text.bytes}: {textStats.bytes}
            </span>
          </div>
        </div>
      )}
    </section>
  );
}
