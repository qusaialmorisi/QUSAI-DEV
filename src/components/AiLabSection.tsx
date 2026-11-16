import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Bot,
  Send,
  Trash2,
  Copy,
  Check,
  AlertTriangle,
  Code2,
  Sparkles,
  Loader2,
  Plus,
  MessageSquare,
  RotateCw,
} from 'lucide-react';
import type { AiChatMessage, AiConversation, AiMode, Language } from '../types';
import { getTranslations } from '../i18n/translations';
import { useToast } from './ToastContext';

interface AiLabSectionProps {
  lang: Language;
}

const STORAGE_KEY = 'qusai_dev_ai_conversations_v1';

function createEmptyConversation(title: string, mode: AiMode = 'ask'): AiConversation {
  return {
    id: `conv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    title,
    mode,
    updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    messages: [],
  };
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

export function AiLabSection({ lang }: AiLabSectionProps) {
  const t = getTranslations(lang);
  const [liveAvailable, setLiveAvailable] = useState<boolean | null>(null);
  const [modelName, setModelName] = useState<string>('gemini-4-hydrogen');

  const [conversations, setConversations] = useState<AiConversation[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as AiConversation[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore storage errors
    }
    return [createEmptyConversation(t.aiLab.untitledChat)];
  });

  const [activeConvId, setActiveConvId] = useState<string>(() => conversations[0]?.id ?? '');
  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeConvId) ?? conversations[0],
    [conversations, activeConvId]
  );

  const [mode, setMode] = useState<AiMode>(() => activeConversation?.mode ?? 'ask');
  const [prompt, setPrompt] = useState('');
  const [codeContext, setCodeContext] = useState('');
  const [showCodeContext, setShowCodeContext] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [lastFailedPayload, setLastFailedPayload] = useState<{
    prompt: string;
    codeContext: string;
    mode: AiMode;
  } | null>(null);

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
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations.slice(0, 20)));
    } catch {
      // ignore storage quota errors
    }
  }, [conversations]);

  useEffect(() => {
    scrollEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [activeConversation?.messages.length]);

  const updateConversationMessages = (
    convId: string,
    updater: (prev: AiChatMessage[]) => AiChatMessage[],
    newTitle?: string
  ) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setConversations((prev) =>
      prev.map((c) =>
        c.id === convId
          ? {
              ...c,
              title: newTitle ?? c.title,
              mode,
              updatedAt: timestamp,
              messages: updater(c.messages),
            }
          : c
      )
    );
  };

  const handleNewChat = () => {
    if (isStreaming) return;
    const fresh = createEmptyConversation(t.aiLab.untitledChat, mode);
    setConversations((prev) => [fresh, ...prev]);
    setActiveConvId(fresh.id);
    setRequestError(null);
    setLastFailedPayload(null);
  };

  const handleDeleteChat = (id: string) => {
    if (isStreaming) return;
    setConversations((prev) => {
      const remaining = prev.filter((c) => c.id !== id);
      if (remaining.length === 0) {
        const fresh = createEmptyConversation(t.aiLab.untitledChat, mode);
        setActiveConvId(fresh.id);
        return [fresh];
      }
      if (activeConvId === id) {
        setActiveConvId(remaining[0].id);
      }
      return remaining;
    });
  };

  const handleSampleClick = (sample: (typeof t.aiLab.samples)[number]) => {
    setMode(sample.mode);
    setPrompt(sample.prompt);
    if (sample.code) {
      setCodeContext(sample.code);
      setShowCodeContext(true);
    } else {
      setCodeContext('');
    }
    setRequestError(null);
  };

  const sendPromptToBackend = async (
    trimmedPrompt: string,
    ctxText: string,
    activeMode: AiMode
  ) => {
    if (!activeConversation || isStreaming) return;
    const convId = activeConversation.id;
    const existingMessages = activeConversation.messages;

    setRequestError(null);
    setLastFailedPayload(null);

    const userMsg: AiChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: trimmedPrompt,
      mode: activeMode,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const assistantId = `a-${Date.now()}`;
    const placeholderMsg: AiChatMessage = {
      id: assistantId,
      role: 'assistant',
      text: '',
      mode: activeMode,
      modelLabel: modelName,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const derivedTitle =
      existingMessages.length === 0
        ? trimmedPrompt.slice(0, 42) + (trimmedPrompt.length > 42 ? '…' : '')
        : undefined;

    updateConversationMessages(
      convId,
      (prev) => [...prev, userMsg, placeholderMsg],
      derivedTitle
    );

    setIsStreaming(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmedPrompt,
          mode: activeMode,
          language: lang,
          codeContext: ctxText,
          history: existingMessages
            .filter((m) => !m.error && m.text.trim().length > 0)
            .slice(-8)
            .map((m) => ({ role: m.role, text: m.text })),
        }),
      });

      if (!response.ok) {
        const errBody = (await response.json().catch(() => ({}))) as { message?: string };
        const messageText = errBody.message || `HTTP ${response.status}`;
        setRequestError(messageText);
        setLastFailedPayload({ prompt: trimmedPrompt, codeContext: ctxText, mode: activeMode });
        updateConversationMessages(convId, (prev) =>
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
            updateConversationMessages(convId, (prev) =>
              prev.map((m) =>
                m.id === assistantId ? { ...m, text: m.text + parsed.text } : m
              )
            );
          } else if (eventType === 'error') {
            const msg = parsed.message || 'Upstream Gemini error.';
            setRequestError(msg);
            setLastFailedPayload({ prompt: trimmedPrompt, codeContext: ctxText, mode: activeMode });
            updateConversationMessages(convId, (prev) =>
              prev.map((m) => (m.id === assistantId ? { ...m, error: msg } : m))
            );
          }
        }
      }
    } catch (err: unknown) {
      const errText = err instanceof Error ? err.message : 'Network error.';
      setRequestError(errText);
      setLastFailedPayload({ prompt: trimmedPrompt, codeContext: ctxText, mode: activeMode });
      updateConversationMessages(convId, (prev) =>
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
    void sendPromptToBackend(trimmed, codeContext, mode);
  };

  const messages = activeConversation?.messages ?? [];

  return (
    <section className="mx-auto max-w-[1320px] px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="mb-6 border-b border-slate-400/15 pb-5 sm:mb-8 sm:pb-6">
        <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-4xl">
          {t.aiLab.heading}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-300 sm:text-base">
          {t.aiLab.subheading}
        </p>
      </div>

      {/* Live AI Backend Connection Banner (No simulated AI) */}
      <div
        className={`mb-6 flex items-start gap-3 rounded-xl border p-4 text-sm ${
          liveAvailable === false
            ? 'border-amber-500/35 bg-amber-950/25 text-amber-100'
            : 'border-blue-500/30 bg-blue-950/25 text-blue-100'
        }`}
      >
        {liveAvailable === false ? (
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
        ) : (
          <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-blue-400" />
        )}
        <div>
          <p className="font-semibold">
            {liveAvailable === false ? t.aiLab.liveMissing : t.aiLab.liveConnected}
            {liveAvailable !== false ? ` · ${modelName}` : ''}
          </p>
          <p className="mt-0.5 text-xs opacity-90">
            {liveAvailable === false ? t.aiLab.liveMissingDesc : t.aiLab.liveConnectedDesc}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Sidebar: Conversation History, Modes & Suggested Questions */}
        <aside className="space-y-5 lg:col-span-4">
          {/* Conversation History Panel */}
          <div className="glass-panel rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-white">{t.aiLab.historyTitle}</h2>
              <button
                type="button"
                onClick={handleNewChat}
                disabled={isStreaming}
                className="inline-flex min-h-[34px] items-center gap-1.5 rounded-lg border border-blue-500/40 bg-blue-500/15 px-3 py-1 text-xs font-semibold text-blue-200 hover:bg-blue-500/25 disabled:opacity-40 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>{t.aiLab.newChat}</span>
              </button>
            </div>

            <div className="mt-3 max-h-[190px] space-y-1.5 overflow-y-auto">
              {conversations.map((conv) => {
                const isSelected = conv.id === activeConversation?.id;
                return (
                  <div
                    key={conv.id}
                    className={`group flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-xs transition-colors ${
                      isSelected
                        ? 'border-blue-500/50 bg-blue-950/35 text-white'
                        : 'border-slate-400/10 bg-slate-900/40 text-slate-300 hover:border-slate-400/25'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setActiveConvId(conv.id);
                        setMode(conv.mode);
                        setRequestError(null);
                      }}
                      className="flex min-w-0 flex-1 items-center gap-2 text-start cursor-pointer"
                    >
                      <MessageSquare className="h-3.5 w-3.5 shrink-0 text-blue-400" />
                      <span className="truncate font-medium">{conv.title}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteChat(conv.id)}
                      aria-label={t.aiLab.deleteChat}
                      className="rounded p-1 text-slate-500 hover:text-rose-300 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Modes & Suggested Questions */}
          <div className="glass-panel rounded-2xl p-4 sm:p-5">
            <h2 className="text-sm font-semibold text-white">{t.aiLab.modeLabel}</h2>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {(['ask', 'explain', 'debug', 'architecture'] as AiMode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`min-h-[40px] rounded-lg border px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap truncate cursor-pointer ${
                    mode === m
                      ? 'border-blue-500/60 bg-blue-500/15 text-blue-200'
                      : 'border-slate-400/15 bg-slate-900/50 text-slate-300 hover:border-slate-400/30 hover:text-white'
                  }`}
                >
                  {t.aiLab.taskModes[m]}
                </button>
              ))}
            </div>

            <div className="mt-5 border-t border-slate-400/15 pt-5">
              <h2 className="text-sm font-semibold text-white">{t.aiLab.samplePromptsTitle}</h2>
              <div className="mt-3 space-y-2">
                {t.aiLab.samples.map((sample) => (
                  <button
                    key={sample.label}
                    type="button"
                    onClick={() => handleSampleClick(sample)}
                    className="w-full rounded-xl border border-slate-400/15 bg-slate-900/40 p-3 text-start transition-colors hover:border-blue-500/40 hover:bg-slate-900/80 cursor-pointer"
                  >
                    <div className="text-xs font-semibold text-blue-300">{sample.label}</div>
                    <div className="mt-1 line-clamp-2 text-xs text-slate-400">
                      {sample.prompt}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Main Conversation Viewport */}
        <div className="glass-panel flex min-h-[520px] flex-col justify-between rounded-2xl p-4 sm:p-5 lg:col-span-8">
          <div className="flex items-center justify-between gap-2 border-b border-slate-400/15 pb-3">
            <div className="flex items-center gap-2 text-xs text-slate-300 min-w-0">
              <Bot className="h-4 w-4 shrink-0 text-blue-400" />
              <span className="truncate font-medium">{activeConversation?.title}</span>
              <span aria-hidden="true">·</span>
              <span className="shrink-0 text-slate-400">{t.aiLab.taskModes[mode]}</span>
            </div>
            {messages.length > 0 && activeConversation && (
              <button
                type="button"
                disabled={isStreaming}
                onClick={() => {
                  updateConversationMessages(activeConversation.id, () => [], t.aiLab.untitledChat);
                  setRequestError(null);
                  setLastFailedPayload(null);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-rose-300 disabled:opacity-40 shrink-0 cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>{t.aiLab.clearThread}</span>
              </button>
            )}
          </div>

          <div className="my-4 flex-1 space-y-4 overflow-y-auto pe-1 max-h-[440px]">
            {messages.length === 0 ? (
              <div className="flex h-full min-h-[260px] flex-col items-center justify-center px-4 text-center">
                <Bot className="h-9 w-9 text-blue-400/80" />
                <h3 className="mt-3 font-display text-lg font-semibold text-white">
                  {t.aiLab.emptyTitle}
                </h3>
                <p className="mt-1 max-w-md text-sm text-slate-400">{t.aiLab.emptyDesc}</p>
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
                        ? t.creator
                        : `${t.aiLab.assistantLabel} · ${msg.modelLabel ?? modelName}`}
                    </span>
                    <span className="tabular-nums">{msg.createdAt}</span>
                  </div>

                  {msg.error ? (
                    <div className="flex items-start gap-2 rounded-lg border border-rose-500/30 bg-rose-950/30 p-3 text-xs text-rose-200">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
                      <div>
                        <span className="font-semibold">{t.aiLab.errorPrefix}: </span>
                        {msg.error}
                      </div>
                    </div>
                  ) : msg.text ? (
                    <MessageContent
                      text={msg.text}
                      copyLabel={t.aiLab.copyCode}
                      copiedLabel={t.aiLab.copied}
                    />
                  ) : (
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                      <span>{t.aiLab.sending}</span>
                    </div>
                  )}
                </div>
              ))
            )}
            <div ref={scrollEndRef} />
          </div>

          {requestError && (
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-rose-500/35 bg-rose-950/30 px-3 py-2 text-xs text-rose-200">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
                <span>{requestError}</span>
              </div>
              {lastFailedPayload && (
                <button
                  type="button"
                  onClick={() =>
                    void sendPromptToBackend(
                      lastFailedPayload.prompt,
                      lastFailedPayload.codeContext,
                      lastFailedPayload.mode
                    )
                  }
                  className="inline-flex items-center gap-1 rounded-md border border-rose-400/30 px-2.5 py-1 font-semibold text-rose-100 hover:bg-rose-500/20 cursor-pointer"
                >
                  <RotateCw className="h-3 w-3" />
                  <span>{t.aiLab.retry}</span>
                </button>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 border-t border-slate-400/15 pt-4">
            <div>
              <button
                type="button"
                onClick={() => setShowCodeContext((prev) => !prev)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-400 hover:text-blue-300 cursor-pointer"
              >
                <Code2 className="h-3.5 w-3.5" />
                <span>{t.aiLab.codeContextLabel}</span>
              </button>

              {showCodeContext && (
                <textarea
                  dir="ltr"
                  rows={4}
                  value={codeContext}
                  onChange={(e) => setCodeContext(e.target.value)}
                  placeholder={t.aiLab.codeContextPlaceholder}
                  className="mt-2 w-full rounded-xl border border-slate-400/20 bg-[#04060c] p-3 font-mono text-sm text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none sm:text-xs"
                />
              )}
            </div>

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
                placeholder={t.aiLab.promptPlaceholder}
                className="flex-1 rounded-xl border border-slate-400/20 bg-[#04060c] p-3 text-base text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none sm:text-sm"
              />
              <button
                type="submit"
                disabled={isStreaming || !prompt.trim()}
                className="neon-action-btn inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap shrink-0 sm:w-auto cursor-pointer"
              >
                {isStreaming ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                <span>{isStreaming ? t.aiLab.sending : t.aiLab.send}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
