import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import App from '../App';
import { ToastProvider } from '../components/ToastContext';
import { AboutSection } from '../components/AboutSection';
import { ProjectsSection } from '../components/ProjectsSection';
import { AiAssistantSection } from '../components/AiAssistantSection';
import { ContactSection } from '../components/ContactSection';
import { Footer } from '../components/Footer';

function renderWithToast(ui: React.ReactElement) {
  return render(<ToastProvider>{ui}</ToastProvider>);
}

function createSseStream(chunks: string[]) {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(chunk));
      }
      controller.close();
    },
  });
}

beforeEach(() => {
  window.history.pushState({}, '', '/');
  document.documentElement.lang = 'en';
  document.documentElement.dir = 'ltr';

  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('/api/ai/status')) {
        return new Response(
          JSON.stringify({ liveAvailable: true, model: 'gemini-4-hydrogen' }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }
      if (url.includes('/api/ai/chat')) {
        return new Response(
          createSseStream([
            'event: chunk\ndata: {"text":"Hello from Gemini portfolio assistant."}\n\n',
            'event: done\ndata: {"model":"gemini-4-hydrogen"}\n\n',
          ]),
          { status: 200, headers: { 'Content-Type': 'text/event-stream' } }
        );
      }
      if (url.includes('/api/contact')) {
        return new Response(
          JSON.stringify({
            ok: true,
            referenceId: 'QD-TEST-1024',
            receivedAt: '2026-11-17T12:00:00.000Z',
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }
      return new Response('{}', { status: 404 });
    })
  );
});

describe('Portfolio Navigation, Bilingual Switching, and RTL/LTR Layout', () => {
  it('navigates across the 5 portfolio sections and handles unknown routes cleanly', async () => {
    render(<App />);

    expect(
      screen.getByRole('heading', { name: /Designing Practical Software/i })
    ).toBeInTheDocument();

    const primaryNav = screen.getByRole('navigation', { name: /Primary navigation/i });
    const navLinks = within(primaryNav).getAllByRole('button');
    expect(navLinks).toHaveLength(5);

    const navChecks: { buttonLabel: RegExp; expectedHeading: RegExp }[] = [
      { buttonLabel: /^About$/i, expectedHeading: /^About Me$/i },
      { buttonLabel: /^Projects$/i, expectedHeading: /^My Projects$/i },
      { buttonLabel: /^AI Assistant$/i, expectedHeading: /^AI Assistant$/i },
      { buttonLabel: /^Contact$/i, expectedHeading: /^Contact$/i },
      { buttonLabel: /^Home$/i, expectedHeading: /Designing Practical Software/i },
    ];

    for (const check of navChecks) {
      fireEvent.click(within(primaryNav).getByRole('button', { name: check.buttonLabel }));
      expect(
        await screen.findByRole('heading', { name: check.expectedHeading })
      ).toBeInTheDocument();
    }

    // Hero buttons navigate to Projects and Contact
    fireEvent.click(screen.getByRole('button', { name: /Explore My Projects/i }));
    expect(await screen.findByRole('heading', { name: /^My Projects$/i })).toBeInTheDocument();

    fireEvent.click(within(primaryNav).getByRole('button', { name: /^Home$/i }));
    fireEvent.click(screen.getByRole('button', { name: /^Contact Me$/i }));
    expect(await screen.findByRole('heading', { name: /^Contact$/i })).toBeInTheDocument();
  });

  it('switches between English (LTR) and Arabic (RTL) cleanly', () => {
    render(<App />);

    expect(document.documentElement.lang).toBe('en');
    expect(document.documentElement.dir).toBe('ltr');

    fireEvent.click(screen.getAllByRole('button', { name: 'العربية' })[0]);

    expect(document.documentElement.lang).toBe('ar');
    expect(document.documentElement.dir).toBe('rtl');
    expect(
      screen.getByRole('heading', { name: /تطوير برمجيات عملية/i })
    ).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole('button', { name: 'English' })[0]);

    expect(document.documentElement.lang).toBe('en');
    expect(document.documentElement.dir).toBe('ltr');
    expect(
      screen.getByRole('heading', { name: /Designing Practical Software/i })
    ).toBeInTheDocument();
  });
});

describe('About Me & My Projects Sections', () => {
  it('displays Computer Science developer background and all 10 required skills', () => {
    render(<AboutSection lang="en" />);

    expect(screen.getByText(/Computer Science student and software developer/i)).toBeInTheDocument();

    const expectedSkills = [
      'Flutter',
      'Dart',
      'Python',
      'JavaScript',
      'React',
      'PHP',
      'Laravel',
      'MySQL',
      'Firebase',
      'Networking',
    ];

    for (const skill of expectedSkills) {
      expect(screen.getByRole('heading', { name: skill })).toBeInTheDocument();
    }
  });

  it('displays all 4 portfolio projects and filters by category without invented external links', () => {
    render(<ProjectsSection lang="en" />);

    expect(screen.getByRole('heading', { name: 'MikroNet' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Well Manager' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Hajezaty' })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Smart Exam Identity System' })
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Networking' }));
    expect(screen.getByRole('heading', { name: 'MikroNet' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Hajezaty' })).not.toBeInTheDocument();
  });
});

describe('AI Assistant Chat', () => {
  it('streams server Gemini responses, maintains session chat history, and clears conversation', async () => {
    renderWithToast(<AiAssistantSection lang="en" />);

    const input = screen.getByLabelText(/Ask anything about programming/i);
    fireEvent.change(input, { target: { value: 'Explain Laravel migrations' } });
    fireEvent.click(screen.getByRole('button', { name: /^Send$/i }));

    expect(screen.getByText('Explain Laravel migrations')).toBeInTheDocument();
    expect(
      await screen.findByText(/Hello from Gemini portfolio assistant\./i)
    ).toBeInTheDocument();

    const clearBtn = screen.getByRole('button', { name: /Clear Conversation/i });
    expect(clearBtn).toBeEnabled();
    fireEvent.click(clearBtn);

    expect(screen.queryByText('Explain Laravel migrations')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Start a conversation/i })).toBeInTheDocument();
  });

  it('displays explicit error feedback when server AI endpoint returns an error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url.includes('/api/ai/status')) {
          return new Response(JSON.stringify({ liveAvailable: false, model: 'gemini-4-hydrogen' }), {
            status: 200,
          });
        }
        return new Response(
          JSON.stringify({
            errorCode: 'API_KEY_NOT_CONFIGURED',
            message: 'GEMINI_API_KEY is not configured on the server.',
          }),
          { status: 503, headers: { 'Content-Type': 'application/json' } }
        );
      })
    );

    renderWithToast(<AiAssistantSection lang="en" />);

    const input = screen.getByLabelText(/Ask anything about programming/i);
    fireEvent.change(input, { target: { value: 'Hello AI' } });
    fireEvent.click(screen.getByRole('button', { name: /^Send$/i }));

    const alerts = await screen.findAllByRole('alert');
    expect(alerts.some((el) => /GEMINI_API_KEY/i.test(el.textContent ?? ''))).toBe(true);
    expect(screen.getByRole('button', { name: /Retry/i })).toBeInTheDocument();
  });
});

describe('Contact Form and Direct Email / WhatsApp Links', () => {
  it('validates form inputs and submits valid inquiries to /api/contact', async () => {
    render(<ContactSection lang="en" />);

    fireEvent.click(screen.getByRole('button', { name: /Send Message/i }));
    expect(screen.getByRole('alert')).toHaveTextContent(/full name/i);

    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'Qusai Ali' } });
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'invalid-email' } });
    fireEvent.click(screen.getByRole('button', { name: /Send Message/i }));
    expect(screen.getByRole('alert')).toHaveTextContent(/valid email/i);

    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'qusai@example.com' } });
    fireEvent.change(screen.getByLabelText(/Subject/i), { target: { value: 'Project Inquiry' } });
    fireEvent.change(screen.getByLabelText(/Message/i), {
      target: { value: 'Interested in collaborating on a custom Flutter and Laravel platform.' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Send Message/i }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Message Sent/i })).toBeInTheDocument();
    });
    expect(screen.getByText('QD-TEST-1024')).toBeInTheDocument();
  });

  it('renders working Email Me and WhatsApp Me links in ContactSection and Footer in both English and Arabic', () => {
    const { rerender } = render(
      <>
        <ContactSection lang="en" />
        <Footer lang="en" onNavigate={vi.fn()} onToggleLanguage={vi.fn()} />
      </>
    );

    const enEmailLinks = screen.getAllByRole('link', { name: /Email Me/i });
    const enWhatsappLinks = screen.getAllByRole('link', { name: /WhatsApp Me/i });

    expect(enEmailLinks).toHaveLength(2);
    expect(enWhatsappLinks).toHaveLength(2);

    for (const link of enEmailLinks) {
      expect(link).toHaveAttribute('href', 'mailto:hackone465@gmail.com');
    }
    for (const link of enWhatsappLinks) {
      expect(link).toHaveAttribute('href', 'https://wa.me/967772350689');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    }

    expect(screen.getByText('+967772350689', { selector: 'div' })).toHaveAttribute('dir', 'ltr');

    rerender(
      <>
        <ContactSection lang="ar" />
        <Footer lang="ar" onNavigate={vi.fn()} onToggleLanguage={vi.fn()} />
      </>
    );

    const arEmailLinks = screen.getAllByRole('link', { name: /راسلني عبر البريد/i });
    const arWhatsappLinks = screen.getAllByRole('link', { name: /تواصل عبر واتساب/i });

    expect(arEmailLinks).toHaveLength(2);
    expect(arWhatsappLinks).toHaveLength(2);

    for (const link of arEmailLinks) {
      expect(link).toHaveAttribute('href', 'mailto:hackone465@gmail.com');
    }
    for (const link of arWhatsappLinks) {
      expect(link).toHaveAttribute('href', 'https://wa.me/967772350689');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    }
  });
});
