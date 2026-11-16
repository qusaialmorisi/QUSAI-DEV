import { useState } from 'react';
import { Send, CheckCircle2, AlertCircle, Mail, Github, Linkedin, Loader2 } from 'lucide-react';
import type { Language } from '../types';
import { getTranslations } from '../i18n/translations';

interface ContactSectionProps {
  lang: Language;
}

export function ContactSection({ lang }: ContactSectionProps) {
  const t = getTranslations(lang);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<{ referenceId: string; receivedAt: string } | null>(
    null
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setError(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedSubject = subject.trim();
    const trimmedMessage = message.trim();

    if (trimmedName.length < 2) {
      setError(t.contact.form.errors.nameRequired);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError(t.contact.form.errors.emailInvalid);
      return;
    }
    if (trimmedSubject.length < 2) {
      setError(t.contact.form.errors.subjectRequired);
      return;
    }
    if (trimmedMessage.length < 10) {
      setError(t.contact.form.errors.messageMinLength);
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          subject: trimmedSubject,
          message: trimmedMessage,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        referenceId?: string;
        receivedAt?: string;
        message?: string;
      };

      if (!response.ok || !data.ok) {
        setError(data.message || 'Unable to submit inquiry. Please verify your inputs.');
        return;
      }

      setReceipt({
        referenceId: data.referenceId || 'QD-LOGGED',
        receivedAt: data.receivedAt || new Date().toISOString(),
      });
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch {
      setError('Network error while submitting form. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mx-auto max-w-[1320px] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 border-b border-slate-400/15 pb-6">
        <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {t.contact.heading}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-300 sm:text-base">
          {t.contact.subheading}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Contact Form */}
        <div className="glass-panel rounded-2xl p-6 sm:p-8 lg:col-span-7">
          {receipt ? (
            <div className="space-y-4 py-6">
              <div className="flex items-center gap-3 text-emerald-300">
                <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-400" />
                <h2 className="font-display text-xl font-bold text-white">
                  {t.contact.form.successTitle}
                </h2>
              </div>
              <p className="text-sm leading-relaxed text-slate-300">
                {t.contact.form.successNote}{' '}
                <span dir="ltr" className="font-mono font-semibold text-blue-300">
                  {receipt.referenceId}
                </span>
              </p>
              <button
                type="button"
                onClick={() => setReceipt(null)}
                className="neon-action-btn min-h-[44px] rounded-xl px-5 py-2.5 text-xs font-semibold text-white cursor-pointer"
              >
                {t.contact.form.sendAnother}
              </button>
            </div>
          ) : (
            <form noValidate onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="contact-name" className="mb-1.5 block text-xs font-semibold text-slate-300">
                    {t.contact.form.nameLabel}
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    minLength={2}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t.contact.form.namePlaceholder}
                    className="w-full rounded-xl border border-slate-400/20 bg-[#04060c] px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="contact-email" className="mb-1.5 block text-xs font-semibold text-slate-300">
                    {t.contact.form.emailLabel}
                  </label>
                  <input
                    id="contact-email"
                    dir="ltr"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.contact.form.emailPlaceholder}
                    className="w-full rounded-xl border border-slate-400/20 bg-[#04060c] px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="contact-subject" className="mb-1.5 block text-xs font-semibold text-slate-300">
                  {t.contact.form.subjectLabel}
                </label>
                <input
                  id="contact-subject"
                  type="text"
                  required
                  minLength={2}
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder={t.contact.form.subjectPlaceholder}
                  className="w-full rounded-xl border border-slate-400/20 bg-[#04060c] px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="contact-message" className="mb-1.5 block text-xs font-semibold text-slate-300">
                  {t.contact.form.messageLabel}
                </label>
                <textarea
                  id="contact-message"
                  rows={5}
                  required
                  minLength={10}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t.contact.form.messagePlaceholder}
                  className="w-full rounded-xl border border-slate-400/20 bg-[#04060c] p-4 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
                />
              </div>

              {error && (
                <div role="alert" className="flex items-center gap-2 rounded-xl border border-rose-500/35 bg-rose-950/30 px-4 py-3 text-xs text-rose-200">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="neon-action-btn inline-flex min-h-[44px] items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white disabled:opacity-50 cursor-pointer"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                <span>{submitting ? t.contact.form.submittingBtn : t.contact.form.submitBtn}</span>
              </button>
            </form>
          )}
        </div>

        {/* Direct Channels & Social Links */}
        <aside className="glass-panel flex flex-col justify-between rounded-2xl p-6 sm:p-8 lg:col-span-5">
          <div>
            <h2 className="font-display text-xl font-bold text-white">
              {t.contact.directTitle}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              {t.contact.directNote}
            </p>

            <div className="mt-6 space-y-4 border-t border-slate-400/15 pt-6">
              {t.contact.channels.map((ch) => (
                <div key={ch.label}>
                  <div className="text-xs text-slate-400">{ch.label}</div>
                  <div className="mt-0.5 text-sm font-semibold text-slate-100">{ch.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 border-t border-slate-400/15 pt-6">
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-[40px] items-center gap-2 rounded-xl border border-slate-400/20 bg-slate-900/70 px-4 py-2 text-xs font-semibold text-slate-200 transition-colors hover:border-blue-500/40 hover:text-white"
              >
                <Github className="h-4 w-4" />
                <span>GitHub</span>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-[40px] items-center gap-2 rounded-xl border border-slate-400/20 bg-slate-900/70 px-4 py-2 text-xs font-semibold text-slate-200 transition-colors hover:border-blue-500/40 hover:text-white"
              >
                <Linkedin className="h-4 w-4" />
                <span>LinkedIn</span>
              </a>
              <a
                href="mailto:contact@qusai.dev"
                className="inline-flex min-h-[40px] items-center gap-2 rounded-xl border border-slate-400/20 bg-slate-900/70 px-4 py-2 text-xs font-semibold text-slate-200 transition-colors hover:border-blue-500/40 hover:text-white"
              >
                <Mail className="h-4 w-4" />
                <span>contact@qusai.dev</span>
              </a>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
