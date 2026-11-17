import { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  Bot,
  Check,
  Copy,
  Loader2,
  RotateCw,
  Send,
  Sparkles,
  Trash2,
} from 'lucide-react';
import type { AiChatMessage, Language } from '../types';
import { getTranslations } from '../i18n/translations';
import { useToast } from './ToastContext';

interface AiAssistantSectionProps {
  lang: Language;
}

function MessageContent({
  text,
  copyLabel,
  copiedLabel,
}: {
  text: string;
  copyLabel: string;
  copiedLabel: string;
}) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const { showToast } = useToast();
  const parts = text.split(/(```[\s\S]*?```)/g);

  const handleCopy = async (code: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedIndex(idx);
      showToast(copiedLabel, 'success');
      setTimeout(() => setCopiedIndex(null), 1500);
    } catch {
      // ignore clipboard errors
    }
  };

  return (
    <div className="space-y-3 text-sm leading-relaxed text-slate-200">
      {parts.map((part, idx) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const inner = part.slice(3, -3);
          const firstNewline = inner.indexOf('\n');
          const langTag = firstNewline > -1 ? inner.slice(0, firstNewline).trim() : '';
          const code = firstNewline > -1 ? inner.slice(firstNewline + 1) : inner;

          return (
            <div
              key={idx}
              dir="ltr"
              className="overflow-hidden rounded-xl border border-slate-400/15 bg-[#04060c]"
            >
              <div className="flex items-center justify-between border-b border-slate-400/10 px-3 py-1.5 text-xs text-slate-400">
                <span className="font-mono">{langTag || 'code'}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(code, idx)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-slate-300 hover:text-blue-400 cursor-pointer"
                >
                  {copiedIndex === idx ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span>{copiedLabel}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>{copyLabel}</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="overflow-x-auto p-3 font-mono text-xs leading-6 text-slate-100">
                <code>{code}</code>
              </pre>
            </div>
          );
        }

        return (
          <div key={idx} className="whitespace-pre-wrap break-words">
            {part}
          </div>
        );
      })}
    </div>
  );
}

export function AiAssistantSection({ lang }: AiAssistantSectionProps) {
  const t = getTranslations(lang);
  const { showToast } = useToast();

  const [liveAvailable, setLiveAvailable] = useState<boolean | null>(null);
  const [modelName, setModelName] = useState<string>('gemini-4-hydrogen');
  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [prompt, setPrompt] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [lastFailedPrompt, setLastFailedPrompt] = useState<string | null>(null);

  const scrollEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let active = true;
    fetch('/api/ai/status')
      .then((res) => res.json())
      .then((data: { liveAvailable?: boolean; model?: string }) => {
        if (!active) return;
        setLiveAvailable(Boolean(data.liveAvailable));
        if (data.model) setModelName(data.model);
      })
      .catch(() => {
        if (!active) return;
        setLiveAvailable(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    scrollEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages.length]);

  const sendMessage = async (trimmedPrompt: string) => {
    if (!trimmedPrompt || isStreaming) return;

    setRequestError(null);
    setLastFailedPrompt(null);

    const historySnapshot = messages
      .filter((m) => !m.error && m.text.trim().length > 0)
      .slice(-8)
      .map((m) => ({ role: m.role, text: m.text }));

    const userMsg: AiChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: trimmedPrompt,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const assistantId = `a-${Date.now()}`;
    const placeholderMsg: AiChatMessage = {
      id: assistantId,
      role: 'assistant',
      text: '',
      modelLabel: modelName,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg, placeholderMsg]);
    setIsStreaming(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmedPrompt,
          mode: 'ask',
          language: lang,
          history: historySnapshot,
        }),
      });

      if (!response.ok) {
        const errBody = (await response.json().catch(() => ({}))) as { message?: string };
        const messageText = errBody.message || `HTTP ${response.status}`;
        setRequestError(messageText);
        setLastFailedPrompt(trimmedPrompt);
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, error: messageText, text: '' } : m))
        );
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Streaming response body unavailable.');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const frames = buffer.split('\n\n');
        buffer = frames.pop() ?? '';

        for (const frame of frames) {
          const lines = frame.split('\n');
          let eventType = 'message';
          let dataRaw = '';
          for (const line of lines) {
            if (line.startsWith('event:')) eventType = line.slice(6).trim();
            if (line.startsWith('data:')) dataRaw += line.slice(5).trim();
          }
          if (!dataRaw) continue;

          const parsed = JSON.parse(dataRaw) as { text?: string; message?: string };
          if (eventType === 'chunk' && parsed.text) {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId ? { ...m, text: m.text + parsed.text } : m
              )
            );
          } else if (eventType === 'error') {
            const msg = parsed.message || 'Upstream Gemini error.';
            setRequestError(msg);
            setLastFailedPrompt(trimmedPrompt);
            setMessages((prev) =>
              prev.map((m) => (m.id === assistantId ? { ...m, error: msg } : m))
            );
          }
        }
      }
    } catch (err: unknown) {
      const errText = err instanceof Error ? err.message : 'Network error.';
      setRequestError(errText);
      setLastFailedPrompt(trimmedPrompt);
      setMessages((prev) =>
        prev.map((m) => (m.id === assistantId ? { ...m, error: errText } : m))
      );
    } finally {
      setIsStreaming(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = prompt.trim();
    if (!trimmed || isStreaming) return;
    setPrompt('');
    void sendMessage(trimmed);
  };

  const handleClear = () => {
    if (isStreaming) return;
    setMessages([]);
    setRequestError(null);
    setLastFailedPrompt(null);
    showToast(t.toast.cleared, 'info');
  };

  return (
    <section className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 border-b border-slate-400/15 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {t.aiAssistant.heading}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-300 sm:text-base">
            {t.aiAssistant.subheading}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          {liveAvailable === false ? (
            <span className="inline-flex items-center gap-1.5 text-amber-300">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{t.aiAssistant.liveUnavailable}</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-blue-300">
              <Sparkles className="h-4 w-4 shrink-0" />
              <span>{t.aiAssistant.liveReady}</span>
            </span>
          )}
        </div>
      </div>

      {liveAvailable === false && (
        <div
          role="note"
          className="mb-6 flex items-start gap-3 rounded-xl border border-amber-500/35 bg-amber-950/25 p-4 text-xs text-amber-100"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
          <div>
            <p className="font-semibold">{t.aiAssistant.liveUnavailable}</p>
            <p className="mt-0.5 opacity-90">{t.aiAssistant.liveUnavailableHint}</p>
          </div>
        </div>
      )}

      {/* Conversational AI Interface */}
      <div className="glass-panel flex min-h-[540px] flex-col justify-between rounded-2xl p-4 sm:p-6">
        {/* Chat Header */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-400/15 pb-4">
          <div className="flex items-center gap-2.5 text-sm font-semibold text-white">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-500/30 bg-blue-500/15 text-blue-300">
              <Bot className="h-4 w-4" />
            </div>
            <span>{t.aiAssistant.assistantLabel}</span>
          </div>

          <button
            type="button"
            disabled={isStreaming || messages.length === 0}
            onClick={handleClear}
            className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-slate-400/20 bg-slate-900/60 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:border-rose-400/40 hover:text-rose-200 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>{t.aiAssistant.clearChat}</span>
          </button>
        </div>

        {/* Messages Thread */}
        <div className="my-5 flex-1 space-y-4 overflow-y-auto pe-1 max-h-[460px]">
          {messages.length === 0 ? (
            <div className="flex min-h-[280px] flex-col items-center justify-center px-2 py-6 text-center">
              <Bot className="h-10 w-10 text-blue-400/80" />
              <h2 className="mt-3 font-display text-lg font-semibold text-white">
                {t.aiAssistant.emptyTitle}
              </h2>
              <p className="mt-1.5 max-w-md text-sm text-slate-400">
                {t.aiAssistant.emptyDesc}
              </p>

              <div className="mt-6 w-full max-w-2xl">
                <p className="mb-3 text-xs font-semibold text-slate-400">
                  {t.aiAssistant.suggestionsTitle}
                </p>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {t.aiAssistant.suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => setPrompt(suggestion)}
                      className="rounded-xl border border-slate-400/15 bg-[#070a13] p-3.5 text-start text-xs leading-relaxed text-slate-300 transition-colors hover:border-blue-500/45 hover:text-white cursor-pointer"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`rounded-xl border p-4 ${
                  msg.role === 'user'
                    ? 'border-blue-500/25 bg-blue-950/20'
                    : 'border-slate-400/15 bg-[#070a13]'
                }`}
              >
                <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold text-slate-200">
                    {msg.role === 'user'
                      ? t.aiAssistant.userLabel
                      : t.aiAssistant.assistantLabel}
                  </span>
                  <span className="tabular-nums">{msg.createdAt}</span>
                </div>

                {msg.error ? (
                  <div
                    role="alert"
                    className="flex items-start gap-2 rounded-lg border border-rose-500/30 bg-rose-950/30 p-3 text-xs text-rose-200"
                  >
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
                    <div>
                      <span className="font-semibold">{t.aiAssistant.errorPrefix}: </span>
                      {msg.error}
                    </div>
                  </div>
                ) : msg.text ? (
                  <MessageContent
                    text={msg.text}
                    copyLabel={t.aiAssistant.copyCode}
                    copiedLabel={t.aiAssistant.copied}
                  />
                ) : (
                  <div role="status" className="flex items-center gap-2 text-xs text-slate-300">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                    <span>{t.aiAssistant.sending}</span>
                  </div>
                )}
              </div>
            ))
          )}
          <div ref={scrollEndRef} />
        </div>

        {/* Error & Retry Bar */}
        {requestError && (
          <div
            role="alert"
            className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-rose-500/35 bg-rose-950/30 px-3 py-2 text-xs text-rose-200"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{requestError}</span>
            </div>
            {lastFailedPrompt && (
              <button
                type="button"
                onClick={() => void sendMessage(lastFailedPrompt)}
                className="inline-flex items-center gap-1 rounded-md border border-rose-400/30 px-2.5 py-1 font-semibold text-rose-100 hover:bg-rose-500/20 cursor-pointer"
              >
                <RotateCw className="h-3 w-3" />
                <span>{t.aiAssistant.retry}</span>
              </button>
            )}
          </div>
        )}

        {/* Composer */}
        <form onSubmit={handleSubmit} className="border-t border-slate-400/15 pt-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <textarea
              rows={2}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              aria-label={t.aiAssistant.promptPlaceholder}
              placeholder={t.aiAssistant.promptPlaceholder}
              className="flex-1 rounded-xl border border-slate-400/20 bg-[#04060c] p-3 text-base text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none sm:text-sm"
            />
            <button
              type="submit"
              disabled={isStreaming || !prompt.trim()}
              className="neon-action-btn inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap shrink-0 sm:w-auto cursor-pointer"
            >
              {isStreaming ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span>{isStreaming ? t.aiAssistant.sending : t.aiAssistant.send}</span>
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
