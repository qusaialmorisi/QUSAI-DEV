import type { IncomingMessage, ServerResponse } from 'node:http';
import { GoogleGenAI, type GenerateContentResponse } from '@google/genai';

export const MODEL_NAME = 'gemini-4-hydrogen';

export type AiMode = 'ask' | 'explain' | 'debug' | 'architecture';
export type Language = 'en' | 'ar';

interface ChatHistoryTurn {
  role: 'user' | 'assistant';
  text: string;
}

interface AiChatBody {
  message?: string;
  mode?: AiMode;
  language?: Language;
  codeContext?: string;
  history?: ChatHistoryTurn[];
}

interface ContactBody {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

interface ContactEntry {
  referenceId: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  receivedAt: string;
}

const recentInquiries: ContactEntry[] = [];
const MAX_BODY_BYTES = 1024 * 1024;

export function hasConfiguredApiKey(): boolean {
  const key = process.env.GEMINI_API_KEY?.trim();
  return Boolean(key && key !== 'MY_GEMINI_API_KEY');
}

export function buildSystemInstruction(mode: AiMode, language: Language): string {
  const langRule =
    language === 'ar'
      ? 'Respond in clear, natural, professional Arabic while keeping code snippets, technical identifiers, and terminal commands in standard English.'
      : 'Respond in clear, concise, natural English.';

  const modeDirectives: Record<AiMode, string> = {
    ask: 'You are the AI Assistant on QUSAI.DEV, the personal developer portfolio of Qusai Omar Mohammed Ali (an Engineer and Software Developer working with Flutter, Dart, Python, JavaScript, React, PHP, Laravel, MySQL, Firebase, and Networking). Help visitors with programming questions, software architecture, debugging, or learning about Qusai’s skills and featured projects (MikroNet, Well Manager, Hajezaty, and Smart Exam Identity System).',
    explain:
      'You are the AI Assistant on QUSAI.DEV. Break down technical concepts or code snippets clearly step by step with practical examples.',
    debug:
      'You are the AI Assistant on QUSAI.DEV. Identify root causes clearly and provide minimal, accurate fixes.',
    architecture:
      'You are the AI Assistant on QUSAI.DEV. Provide structured guidance on software design, databases, APIs, and networking.',
  };

  return `${modeDirectives[mode]} ${langRule} Never invent external links, metrics, or claims about unimplemented features.`;
}

function createGeminiClient(): GoogleGenAI {
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

export function sendJson(res: ServerResponse, statusCode: number, payload: unknown): void {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

export function sendMethodNotAllowed(res: ServerResponse, allowedMethod: string): void {
  res.setHeader('Allow', allowedMethod);
  sendJson(res, 405, {
    ok: false,
    errorCode: 'METHOD_NOT_ALLOWED',
    message: `Method not allowed. Use ${allowedMethod}.`,
  });
}

export async function readJsonBody<T extends Record<string, unknown>>(
  req: IncomingMessage & { body?: unknown }
): Promise<T> {
  if (req.body && typeof req.body === 'object') {
    return req.body as T;
  }
  if (typeof req.body === 'string' && req.body.trim()) {
    return JSON.parse(req.body) as T;
  }

  return await new Promise<T>((resolve, reject) => {
    let raw = '';
    let bytes = 0;

    req.on('data', (chunk: Buffer | string) => {
      const piece = typeof chunk === 'string' ? chunk : chunk.toString('utf8');
      bytes += Buffer.byteLength(piece, 'utf8');
      if (bytes > MAX_BODY_BYTES) {
        reject(new Error('PAYLOAD_TOO_LARGE'));
        req.destroy();
        return;
      }
      raw += piece;
    });

    req.on('end', () => {
      if (!raw.trim()) {
        resolve({} as T);
        return;
      }
      try {
        resolve(JSON.parse(raw) as T);
      } catch {
        reject(new Error('INVALID_JSON'));
      }
    });

    req.on('error', (err) => reject(err));
  });
}

export function handleHealthRequest(res: ServerResponse): void {
  sendJson(res, 200, { ok: true, service: 'qusai-dev-platform' });
}

export function handleAiStatusRequest(res: ServerResponse): void {
  sendJson(res, 200, {
    liveAvailable: hasConfiguredApiKey(),
    model: MODEL_NAME,
  });
}

export async function handleAiChatRequest(
  req: IncomingMessage & { body?: unknown },
  res: ServerResponse
): Promise<void> {
  let body: AiChatBody;
  try {
    body = await readJsonBody<AiChatBody & Record<string, unknown>>(req);
  } catch (err) {
    const code = err instanceof Error ? err.message : 'INVALID_JSON';
    sendJson(res, code === 'PAYLOAD_TOO_LARGE' ? 413 : 400, {
      errorCode: code,
      message:
        code === 'PAYLOAD_TOO_LARGE'
          ? 'Request body exceeds the 1 MB limit.'
          : 'Request body must be valid JSON.',
    });
    return;
  }

  const message = typeof body.message === 'string' ? body.message.trim() : '';
  const mode: AiMode =
    body.mode === 'explain' || body.mode === 'debug' || body.mode === 'architecture'
      ? body.mode
      : 'ask';
  const language: Language = body.language === 'ar' ? 'ar' : 'en';
  const codeContext =
    typeof body.codeContext === 'string' ? body.codeContext.trim().slice(0, 12000) : '';
  const history = Array.isArray(body.history) ? body.history.slice(-8) : [];

  if (!message) {
    sendJson(res, 400, {
      errorCode: 'INVALID_INPUT',
      message: 'A prompt message is required.',
    });
    return;
  }

  if (!hasConfiguredApiKey()) {
    sendJson(res, 503, {
      errorCode: 'API_KEY_NOT_CONFIGURED',
      message:
        'Live Gemini AI is currently unavailable because GEMINI_API_KEY is not configured on the server. Please configure GEMINI_API_KEY in server environment variables.',
    });
    return;
  }

  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');

  const sendEvent = (event: string, payload: unknown) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`);
  };

  try {
    const ai = createGeminiClient();
    const contents = [
      ...history
        .filter((item) => item && typeof item.text === 'string' && item.text.trim().length > 0)
        .map((item) => ({
          role: item.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: item.text.trim() }],
        })),
      {
        role: 'user',
        parts: [
          {
            text: codeContext
              ? `${message}\n\n--- Code / Technical Context ---\n\`\`\`\n${codeContext}\n\`\`\``
              : message,
          },
        ],
      },
    ];

    const stream = await ai.models.generateContentStream({
      model: MODEL_NAME,
      contents,
      config: {
        systemInstruction: buildSystemInstruction(mode, language),
      },
    });

    for await (const chunk of stream) {
      const part = chunk as GenerateContentResponse;
      if (part.text) {
        sendEvent('chunk', { text: part.text });
      }
    }

    sendEvent('done', { model: MODEL_NAME });
    res.end();
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Unexpected upstream AI error.';
    let errorCode = 'AI_REQUEST_FAILED';
    if (errMsg.includes('403') || errMsg.includes('PERMISSION_DENIED')) {
      errorCode = 'PERMISSION_DENIED';
    } else if (errMsg.includes('400') || errMsg.includes('API_KEY_INVALID')) {
      errorCode = 'API_KEY_INVALID';
    } else if (errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED')) {
      errorCode = 'RESOURCE_EXHAUSTED';
    } else if (errMsg.includes('404') || errMsg.includes('NOT_FOUND')) {
      errorCode = 'MODEL_NOT_FOUND';
    }

    sendEvent('error', {
      errorCode,
      message: errMsg,
    });
    res.end();
  }
}

export async function handleContactRequest(
  req: IncomingMessage & { body?: unknown },
  res: ServerResponse
): Promise<void> {
  let body: ContactBody;
  try {
    body = await readJsonBody<ContactBody & Record<string, unknown>>(req);
  } catch {
    sendJson(res, 400, { ok: false, message: 'Request body must be valid JSON.' });
    return;
  }

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const subject = typeof body.subject === 'string' ? body.subject.trim() : '';
  const message = typeof body.message === 'string' ? body.message.trim() : '';

  if (name.length < 2 || name.length > 100) {
    sendJson(res, 400, { ok: false, field: 'name', message: 'Please enter a valid name.' });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email) || email.length > 160) {
    sendJson(res, 400, {
      ok: false,
      field: 'email',
      message: 'Please enter a valid email address.',
    });
    return;
  }

  if (subject.length < 2 || subject.length > 140) {
    sendJson(res, 400, {
      ok: false,
      field: 'subject',
      message: 'Please provide a brief subject.',
    });
    return;
  }

  if (message.length < 10 || message.length > 3000) {
    sendJson(res, 400, {
      ok: false,
      field: 'message',
      message: 'Message must be between 10 and 3000 characters.',
    });
    return;
  }

  const referenceId = `QD-${Date.now().toString(36).toUpperCase()}`;
  const receivedAt = new Date().toISOString();

  recentInquiries.unshift({
    referenceId,
    name,
    email,
    subject,
    message,
    receivedAt,
  });
  if (recentInquiries.length > 50) {
    recentInquiries.pop();
  }

  sendJson(res, 201, {
    ok: true,
    referenceId,
    receivedAt,
  });
}
