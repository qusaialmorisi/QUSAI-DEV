import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import App from '../App';
import { ToastProvider } from '../components/ToastContext';
import { CodePlaygroundSection } from '../components/CodePlaygroundSection';
import { ChallengesSection } from '../components/ChallengesSection';
import { ContactSection } from '../components/ContactSection';
import { NetworkLabSection } from '../components/NetworkLabSection';
import { DevToolsSection } from '../components/DevToolsSection';

function renderWithToast(ui: React.ReactElement) {
  return render(<ToastProvider>{ui}</ToastProvider>);
}

beforeEach(() => {
  localStorage.clear();
  window.history.pushState({}, '', '/');
  document.documentElement.lang = 'en';
  document.documentElement.dir = 'ltr';

  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('/api/ai/status')) {
        return new Response(
          JSON.stringify({ configured: false, model: 'gemini-4-hydrogen' }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }
      if (url.includes('/api/contact')) {
        return new Response(
          JSON.stringify({
            ok: true,
            referenceId: 'QD-TEST-1024',
            receivedAt: '2026-11-16T12:00:00.000Z',
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }
      return new Response('{}', { status: 404 });
    })
  );
});

describe('Navigation, Bilingual Switching, and RTL/LTR Layout', () => {
  it('navigates across sections via Navbar and supports unknown routes as 404', async () => {
    render(<App />);

    expect(
      screen.getByRole('heading', { name: /I Don't Just Write Code/i })
    ).toBeInTheDocument();

    const primaryNav = screen.getByRole('navigation', { name: /Primary navigation/i });

    const navChecks: { buttonLabel: RegExp; expectedHeading: RegExp }[] = [
      { buttonLabel: /^AI Lab$/i, expectedHeading: /01\. AI Engineering Lab/i },
      { buttonLabel: /^Terminal$/i, expectedHeading: /02\. Interactive Developer Terminal/i },
      { buttonLabel: /^Playground$/i, expectedHeading: /03\. Advanced Code Playground/i },
      { buttonLabel: /^Dev Tools$/i, expectedHeading: /04\. Developer Tools/i },
      { buttonLabel: /^Network Lab$/i, expectedHeading: /05\. Advanced Network Lab/i },
      { buttonLabel: /^Live Experiments$/i, expectedHeading: /Live Experiments/i },
      { buttonLabel: /^Challenges$/i, expectedHeading: /Developer Challenges/i },
      { buttonLabel: /^Knowledge$/i, expectedHeading: /06\. Developer Knowledge Center/i },
      { buttonLabel: /^Projects$/i, expectedHeading: /07\. Project Showcase/i },
      { buttonLabel: /^About$/i, expectedHeading: /08\. About The Developer/i },
      { buttonLabel: /^Contact$/i, expectedHeading: /09\. Contact & Channels/i },
    ];

    for (const check of navChecks) {
      fireEvent.click(within(primaryNav).getByRole('button', { name: check.buttonLabel }));
      expect(
        await screen.findByRole('heading', { name: check.expectedHeading })
      ).toBeInTheDocument();
    }

    // 404 route and recovery
    fireEvent.click(screen.getByRole('button', { name: /404 Page/i }));
    expect(screen.getByRole('heading', { name: /Route Not Found/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Return Home/i }));
    expect(
      screen.getByRole('heading', { name: /I Don't Just Write Code/i })
    ).toBeInTheDocument();
  });

  it('switches between English (LTR) and Arabic (RTL) and updates documentElement attributes', () => {
    render(<App />);

    expect(document.documentElement.lang).toBe('en');
    expect(document.documentElement.dir).toBe('ltr');

    fireEvent.click(screen.getAllByRole('button', { name: 'العربية' })[0]);

    expect(document.documentElement.lang).toBe('ar');
    expect(document.documentElement.dir).toBe('rtl');
    expect(
      screen.getByRole('heading', { name: /لا أكتب الكود فحسب/i })
    ).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole('button', { name: 'English' })[0]);

    expect(document.documentElement.lang).toBe('en');
    expect(document.documentElement.dir).toBe('ltr');
    expect(
      screen.getByRole('heading', { name: /I Don't Just Write Code/i })
    ).toBeInTheDocument();
  });
});

describe('Code Playground Execution and Runtime Error Capture', () => {
  it('executes code into isolated sandbox srcDoc, flags empty runs, and renders runtime errors', async () => {
    renderWithToast(<CodePlaygroundSection lang="en" />);

    const iframe = screen.getByTitle('QUSAI.DEV Isolated Code Sandbox') as HTMLIFrameElement;
    expect(iframe).toHaveAttribute('sandbox', 'allow-scripts');
    expect(iframe.getAttribute('srcdoc')).toContain('QUSAI.DEV Sandbox');

    // Update JS editor & click Run
    const jsTabBtn = screen.getByRole('button', { name: 'js' });
    fireEvent.click(jsTabBtn);
    const jsEditor = screen.getByLabelText('JS editor');
    fireEvent.change(jsEditor, { target: { value: 'console.log("Vitest Run");' } });
    fireEvent.click(screen.getByRole('button', { name: /^Run$/i }));

    const updatedIframe = screen.getByTitle('QUSAI.DEV Isolated Code Sandbox') as HTMLIFrameElement;
    expect(updatedIframe.getAttribute('srcdoc')).toContain('Vitest Run');

    // Simulate runtime error posted back from sandbox iframe
    fireEvent(
      window,
      new MessageEvent('message', {
        data: {
          source: 'qusai-dev-sandbox',
          level: 'error',
          args: ['ReferenceError: missingVar is not defined'],
        },
      })
    );

    const alertBox = await screen.findByRole('alert');
    expect(alertBox).toHaveTextContent('ReferenceError: missingVar is not defined');

    // Clear all editors then click Run -> explicit empty warning
    fireEvent.click(screen.getByRole('button', { name: /^Clear$/i }));
    fireEvent.click(screen.getByRole('button', { name: /^Run$/i }));
    expect(screen.getByRole('alert')).toHaveTextContent(
      /All editors are empty/i
    );
  });
});

describe('Challenge Submission, Feedback, and Local Progress Persistence', () => {
  it('validates incorrect/empty submissions, executes real tests, persists progress to localStorage, and resets cleanly', async () => {
    const firstRender = renderWithToast(<ChallengesSection lang="en" />);

    // Switch to Programming Challenges tab
    fireEvent.click(screen.getByRole('tab', { name: /Programming Challenges/i }));

    // First challenge is Python Sum of Even Numbers; starter stub returns 0 (failing most tests)
    fireEvent.click(screen.getByRole('button', { name: /Run Tests & Evaluate/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/Some test cases failed/i);
    expect(screen.getAllByText('Failed').length).toBeGreaterThan(0);

    // Clear editor and submit -> empty input warning + runtime error
    const codeEditor = screen.getByLabelText(/Your Solution Code/i);
    fireEvent.change(codeEditor, { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: /Run Tests & Evaluate/i }));
    const alerts = await screen.findAllByRole('alert');
    expect(alerts.some((el) => /empty/i.test(el.textContent ?? ''))).toBe(true);

    // Enter valid Python solution and evaluate
    fireEvent.change(codeEditor, {
      target: {
        value: 'def sum_even(nums):\n    return sum([x for x in nums if x % 2 == 0])\n',
      },
    });
    fireEvent.click(screen.getByRole('button', { name: /Run Tests & Evaluate/i }));

    expect(await screen.findByRole('status')).toHaveTextContent(/All test cases passed!/i);
    expect(screen.getByText(/Solved: 1 \//i)).toBeInTheDocument();

    const stored = JSON.parse(localStorage.getItem('qusai_dev_challenges_progress_v1') || '{}');
    expect(stored.solvedIds).toContain('py-sum-even');

    // Remount and verify persistence from localStorage
    firstRender.unmount();
    renderWithToast(<ChallengesSection lang="en" />);
    expect(screen.getByText(/Solved: 1 \//i)).toBeInTheDocument();

    // Reset local progress
    fireEvent.click(screen.getByRole('button', { name: /Reset Local Progress/i }));
    expect(screen.getByText(/Solved: 0 \//i)).toBeInTheDocument();
  });
});

describe('Form Validation and Tool Error Handling', () => {
  it('validates ContactSection empty, invalid email, and short message inputs before submitting to API', async () => {
    render(<ContactSection lang="en" />);

    fireEvent.click(screen.getByRole('button', { name: /Submit Inquiry/i }));
    expect(screen.getByRole('alert')).toHaveTextContent(/full name/i);

    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'Qusai Ali' } });
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'invalid-email' } });
    fireEvent.click(screen.getByRole('button', { name: /Submit Inquiry/i }));
    expect(screen.getByRole('alert')).toHaveTextContent(/valid email/i);

    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'qusai@example.com' } });
    fireEvent.change(screen.getByLabelText(/Subject/i), { target: { value: 'Network Tooling' } });
    fireEvent.change(screen.getByLabelText(/Message/i), { target: { value: 'short' } });
    fireEvent.click(screen.getByRole('button', { name: /Submit Inquiry/i }));
    expect(screen.getByRole('alert')).toHaveTextContent(/10 characters/i);

    // Valid submission reaches /api/contact and renders receipt
    fireEvent.change(screen.getByLabelText(/Message/i), {
      target: { value: 'Need help designing a resilient MikroTik automation service.' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Submit Inquiry/i }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Inquiry Recorded/i })).toBeInTheDocument();
    });
    expect(screen.getByText('QD-TEST-1024')).toBeInTheDocument();
  });

  it('displays clear validation errors in NetworkLabSection for empty IP, invalid IP, and invalid CIDR', () => {
    render(<NetworkLabSection lang="en" />);

    const ipInput = screen.getByLabelText(/IP Address/i);
    fireEvent.change(ipInput, { target: { value: '' } });
    expect(screen.getByRole('alert')).toHaveTextContent(/cannot be empty/i);

    fireEvent.change(ipInput, { target: { value: '999.10.0.1' } });
    expect(screen.getByRole('alert')).toHaveTextContent(/Invalid IPv4 address/i);

    fireEvent.change(ipInput, { target: { value: '192.168.1.10' } });
    const cidrInput = screen.getByLabelText(/CIDR Value/i);
    fireEvent.change(cidrInput, { target: { value: '33' } });
    expect(screen.getByRole('alert')).toHaveTextContent(/Invalid CIDR prefix/i);
  });

  it('displays explicit error messages for empty and malformed JSON in DevToolsSection', () => {
    renderWithToast(<DevToolsSection lang="en" />);

    const jsonInput = screen.getByLabelText(/Raw JSON Input/i);
    fireEvent.change(jsonInput, { target: { value: '   ' } });
    fireEvent.click(screen.getByRole('button', { name: /Format & Validate/i }));
    expect(screen.getByRole('alert')).toHaveTextContent(/cannot be empty/i);

    fireEvent.change(jsonInput, { target: { value: '{ badJson: true' } });
    fireEvent.click(screen.getByRole('button', { name: /Format & Validate/i }));
    expect(screen.getByRole('alert')).toHaveTextContent(/Invalid JSON/i);
  });
});
