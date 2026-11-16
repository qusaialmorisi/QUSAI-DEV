import { useEffect, useRef, useState } from 'react';
import { Terminal as TerminalIcon, CornerDownLeft } from 'lucide-react';
import type { Language, SectionId } from '../types';
import { getTranslations } from '../i18n/translations';
import { PROJECTS } from '../data/projects';

interface TerminalSectionProps {
  lang: Language;
  onNavigate: (section: SectionId) => void;
  onSetLanguage: (lang: Language) => void;
}

interface TerminalEntry {
  id: number;
  command?: string;
  lines: string[];
  tone?: 'normal' | 'accent' | 'error';
  actionLink?: { label: string; section: SectionId };
}

const VALID_COMMANDS = ['help', 'about', 'projects', 'skills', 'contact', 'clear', 'lang', 'goto'];

export function TerminalSection({ lang, onNavigate, onSetLanguage }: TerminalSectionProps) {
  const t = getTranslations(lang);
  const [input, setInput] = useState('');
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [entries, setEntries] = useState<TerminalEntry[]>(() => [
    {
      id: 1,
      tone: 'accent',
      lines: [
        'QUSAI.DEV — Interactive Developer Terminal (Safe Simulated Shell)',
        'Creator: Qusai Omar Mohammed Ali',
        'Tagline: I Don\'t Just Write Code. I Build The Future.',
        'Type "help" to list available commands.',
      ],
    },
  ]);

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  }, [entries]);

  const executeCommand = (rawCmd: string) => {
    const trimmed = rawCmd.trim();
    if (!trimmed) return;

    setCmdHistory((prev) => [trimmed, ...prev.slice(0, 49)]);
    setHistoryIndex(-1);

    const parts = trimmed.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const arg = parts[1]?.toLowerCase() ?? '';

    const pushEntry = (entry: Omit<TerminalEntry, 'id'>) => {
      setEntries((prev) => [...prev, { id: Date.now() + Math.random(), ...entry }]);
    };

    if (cmd === 'clear') {
      setEntries([]);
      return;
    }

    if (cmd === 'help') {
      pushEntry({
        command: trimmed,
        tone: 'accent',
        lines: [
          'Available Commands:',
          '  help                 Show available terminal commands',
          '  about                Display developer profile & engineering focus',
          '  projects             List featured systems in QUSAI.DEV portfolio',
          '  skills               Display technical stack by domain',
          '  contact              Show direct contact channels & inquiry route',
          '  goto <section>       Navigate (ai-lab, playground, dev-tools, network-lab, knowledge, projects)',
          '  lang <en|ar>         Switch interface language (LTR / RTL)',
          '  clear                Clear terminal output buffer',
        ],
      });
      return;
    }

    if (cmd === 'about') {
      pushEntry({
        command: trimmed,
        lines: [
          `Developer: ${t.about.name}`,
          `Role: ${t.about.role}`,
          t.about.bio,
        ],
        actionLink: { label: t.nav.about, section: 'about' },
      });
      return;
    }

    if (cmd === 'projects') {
      pushEntry({
        command: trimmed,
        lines: PROJECTS.map(
          (p, i) => `${i + 1}. ${p.title.en} — ${p.subtitle.en} [${p.stack.join(', ')}]`
        ),
        actionLink: { label: t.nav.projects, section: 'projects' },
      });
      return;
    }

    if (cmd === 'skills') {
      pushEntry({
        command: trimmed,
        lines: t.about.skillGroups.map(
          (g) => `${g.group}: ${g.items.join(' · ')}`
        ),
      });
      return;
    }

    if (cmd === 'contact') {
      pushEntry({
        command: trimmed,
        lines: [
          'Contact Channels:',
          '  Email: contact@qusai.dev',
          '  Platform: QUSAI.DEV Contact Inquiry Form',
        ],
        actionLink: { label: t.nav.contact, section: 'contact' },
      });
      return;
    }

    if (cmd === 'lang') {
      if (arg === 'ar' || arg === 'en') {
        onSetLanguage(arg);
        pushEntry({
          command: trimmed,
          tone: 'accent',
          lines: [`Language switched to ${arg === 'ar' ? 'Arabic (RTL)' : 'English (LTR)'}.`],
        });
      } else {
        pushEntry({
          command: trimmed,
          tone: 'error',
          lines: ['Usage: lang en | lang ar'],
        });
      }
      return;
    }

    if (cmd === 'goto') {
      const targetMap: Record<string, SectionId> = {
        home: 'home',
        'ai-lab': 'ai-lab',
        ai: 'ai-lab',
        playground: 'playground',
        'dev-tools': 'dev-tools',
        tools: 'dev-tools',
        'network-lab': 'network-lab',
        network: 'network-lab',
        experiments: 'experiments',
        'live-experiments': 'experiments',
        challenges: 'challenges',
        'developer-challenges': 'challenges',
        knowledge: 'knowledge',
        projects: 'projects',
        about: 'about',
        contact: 'contact',
      };
      const target = targetMap[arg];
      if (target) {
        onNavigate(target);
      } else {
        pushEntry({
          command: trimmed,
          tone: 'error',
          lines: ['Unknown section. Try: goto ai-lab | playground | dev-tools | network-lab | experiments | challenges | knowledge | projects'],
        });
      }
      return;
    }

    pushEntry({
      command: trimmed,
      tone: 'error',
      lines: [`Command not found: "${cmd}". Type "help" to view supported commands.`],
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = input;
    setInput('');
    executeCommand(val);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (cmdHistory.length === 0) return;
      const next = Math.min(cmdHistory.length - 1, historyIndex + 1);
      setHistoryIndex(next);
      setInput(cmdHistory[next]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex <= 0) {
        setHistoryIndex(-1);
        setInput('');
      } else {
        const next = historyIndex - 1;
        setHistoryIndex(next);
        setInput(cmdHistory[next]);
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const lower = input.trim().toLowerCase();
      if (!lower) return;
      const match = VALID_COMMANDS.find((c) => c.startsWith(lower));
      if (match) setInput(match);
    }
  };

  const quickCommands = ['help', 'about', 'projects', 'skills', 'contact', 'clear'];

  return (
    <section className="mx-auto max-w-[1320px] px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="mb-6 border-b border-slate-400/15 pb-5 sm:mb-8 sm:pb-6">
        <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-4xl">
          {t.terminal.heading}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-300 sm:text-base">
          {t.terminal.subheading}
        </p>
      </div>

      <div className="glass-panel overflow-hidden rounded-2xl">
        {/* Terminal Window Title Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-400/15 bg-[#080b14] px-4 py-3">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <TerminalIcon className="h-4 w-4 text-blue-400" />
            <span className="font-mono font-semibold text-white">qusai@qusai.dev:~</span>
          </div>
          <span className="text-xs text-slate-400">{t.terminal.safetyNote}</span>
        </div>

        {/* Quick Command Buttons */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-400/10 bg-[#06080f] px-4 py-2.5">
          <span className="text-xs text-slate-400">{t.terminal.quickCommandsLabel}:</span>
          {quickCommands.map((cmd) => (
            <button
              key={cmd}
              type="button"
              onClick={() => executeCommand(cmd)}
              dir="ltr"
              className="min-h-[32px] rounded-lg border border-slate-400/20 bg-slate-900/70 px-3 py-1 font-mono text-xs text-blue-300 transition-colors hover:border-blue-500/50 hover:text-white cursor-pointer"
            >
              {cmd}
            </button>
          ))}
        </div>

        {/* Output Buffer */}
        <div
          dir="ltr"
          ref={viewportRef}
          onClick={() => inputRef.current?.focus()}
          className="h-[360px] cursor-text overflow-y-auto bg-[#04060b] p-4 font-mono text-xs leading-6 sm:h-[420px] sm:p-5 sm:text-sm sm:leading-7"
        >
          {entries.map((entry) => (
            <div key={entry.id} className="mb-4 last:mb-0">
              {entry.command && (
                <div className="flex items-center gap-2 text-blue-300">
                  <span className="text-violet-400">qusai@dev:~$</span>
                  <span>{entry.command}</span>
                </div>
              )}
              <div
                className={`mt-1 whitespace-pre-wrap break-words ${
                  entry.tone === 'error'
                    ? 'text-rose-300'
                    : entry.tone === 'accent'
                      ? 'text-slate-100'
                      : 'text-slate-300'
                }`}
              >
                {entry.lines.join('\n')}
              </div>
              {entry.actionLink && (
                <button
                  type="button"
                  onClick={() => onNavigate(entry.actionLink!.section)}
                  className="mt-2 inline-flex items-center rounded-md border border-blue-500/35 bg-blue-500/10 px-2.5 py-1 text-xs font-semibold text-blue-300 hover:bg-blue-500/20 cursor-pointer"
                >
                  Open {entry.actionLink.label}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Interactive Prompt Input with Animated Cursor */}
        <form
          dir="ltr"
          onSubmit={handleSubmit}
          className="flex items-center gap-2 border-t border-slate-400/15 bg-[#06080f] px-4 py-3"
        >
          <span className="font-mono text-xs font-semibold text-violet-400 shrink-0 sm:text-sm">
            qusai@dev:~$
          </span>
          <div className="relative flex flex-1 items-center">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t.terminal.placeholder}
              aria-label="Developer terminal command input"
              className="w-full bg-transparent font-mono text-sm text-white placeholder:text-slate-500 focus:outline-none"
            />
            {!input && (
              <span
                aria-hidden="true"
                className="pointer-events-none ms-1 inline-block h-4 w-2 animate-pulse bg-blue-400"
              />
            )}
          </div>
          <button
            type="submit"
            className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-blue-500/40 bg-blue-600/20 px-3 py-1.5 font-mono text-xs font-semibold text-blue-200 hover:bg-blue-600/35 shrink-0 cursor-pointer"
          >
            <CornerDownLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t.terminal.runBtn}</span>
          </button>
        </form>
      </div>

      <p className="mt-3 text-xs text-slate-400">{t.terminal.hint}</p>
    </section>
  );
}
