export type TextTransformKind =
  | 'upper'
  | 'lower'
  | 'title'
  | 'camel'
  | 'snake'
  | 'kebab'
  | 'reverse'
  | 'trimLines'
  | 'dedupe'
  | 'sortAsc';

export interface JsonStats {
  keys: number;
  depth: number;
  bytes: number;
}

export type JsonFormatResult =
  | { ok: true; formatted: string; stats: JsonStats }
  | { ok: false; errorType: 'empty' | 'invalid'; message: string };

export function sortObjectDeep(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortObjectDeep);
  }
  if (value !== null && typeof value === 'object') {
    const sorted: Record<string, unknown> = {};
    for (const key of Object.keys(value as Record<string, unknown>).sort()) {
      sorted[key] = sortObjectDeep((value as Record<string, unknown>)[key]);
    }
    return sorted;
  }
  return value;
}

export function measureJsonStats(value: unknown): { keys: number; depth: number } {
  let keys = 0;
  function walk(node: unknown, currentDepth: number): number {
    if (Array.isArray(node)) {
      let max = currentDepth;
      for (const item of node) {
        max = Math.max(max, walk(item, currentDepth + 1));
      }
      return max;
    }
    if (node !== null && typeof node === 'object') {
      const entries = Object.entries(node as Record<string, unknown>);
      keys += entries.length;
      let max = currentDepth;
      for (const [, v] of entries) {
        max = Math.max(max, walk(v, currentDepth + 1));
      }
      return max;
    }
    return currentDepth;
  }
  const depth = walk(value, 1);
  return { keys, depth };
}

export function formatJsonInput(
  raw: string,
  options: { indent: '2' | '4' | 'tab'; sortKeys: boolean; minify: boolean }
): JsonFormatResult {
  if (!raw.trim()) {
    return {
      ok: false,
      errorType: 'empty',
      message: 'Input is empty.',
    };
  }
  try {
    const parsed = JSON.parse(raw);
    const data = options.sortKeys ? sortObjectDeep(parsed) : parsed;
    const indent = options.minify ? 0 : options.indent === 'tab' ? '\t' : Number(options.indent);
    const formatted = JSON.stringify(data, null, indent);
    const stats = measureJsonStats(data);
    const bytes = new TextEncoder().encode(formatted).length;
    return {
      ok: true,
      formatted,
      stats: { ...stats, bytes },
    };
  } catch (err: unknown) {
    return {
      ok: false,
      errorType: 'invalid',
      message: err instanceof Error ? err.message : 'Invalid JSON syntax.',
    };
  }
}

export function utf8ToBase64(str: string, urlSafe: boolean): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const b64 = btoa(binary);
  return urlSafe ? b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '') : b64;
}

export function base64ToUtf8(input: string): string {
  const compact = input.trim().replace(/\s+/g, '');
  if (!compact || !/^[A-Za-z0-9+/_-]*={0,2}$/.test(compact)) {
    throw new Error('Invalid Base64 characters');
  }
  let normalized = compact.replace(/-/g, '+').replace(/_/g, '/');
  while (normalized.length % 4 !== 0) {
    normalized += '=';
  }
  const binary = atob(normalized);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
}

export function encodeBase64Safe(
  raw: string,
  urlSafe: boolean
): { ok: true; value: string } | { ok: false; errorType: 'empty' | 'invalid' } {
  if (!raw.trim()) {
    return { ok: false, errorType: 'empty' };
  }
  try {
    return { ok: true, value: utf8ToBase64(raw, urlSafe) };
  } catch {
    return { ok: false, errorType: 'invalid' };
  }
}

export function decodeBase64Safe(
  raw: string
): { ok: true; value: string } | { ok: false; errorType: 'empty' | 'invalid' } {
  if (!raw.trim()) {
    return { ok: false, errorType: 'empty' };
  }
  try {
    return { ok: true, value: base64ToUtf8(raw) };
  } catch {
    return { ok: false, errorType: 'invalid' };
  }
}

export function encodeUrlSafe(
  raw: string,
  mode: 'component' | 'uri'
): { ok: true; value: string } | { ok: false; errorType: 'empty' | 'invalid' } {
  if (!raw.trim()) {
    return { ok: false, errorType: 'empty' };
  }
  try {
    return {
      ok: true,
      value: mode === 'component' ? encodeURIComponent(raw) : encodeURI(raw),
    };
  } catch {
    return { ok: false, errorType: 'invalid' };
  }
}

export function decodeUrlSafe(
  raw: string,
  mode: 'component' | 'uri'
): { ok: true; value: string } | { ok: false; errorType: 'empty' | 'invalid' } {
  if (!raw.trim()) {
    return { ok: false, errorType: 'empty' };
  }
  try {
    return {
      ok: true,
      value: mode === 'component' ? decodeURIComponent(raw) : decodeURI(raw),
    };
  } catch {
    return { ok: false, errorType: 'invalid' };
  }
}

export interface ParsedUrlInfo {
  valid: true;
  protocol: string;
  host: string;
  pathname: string;
  hash: string;
  params: { key: string; value: string }[];
}

export function parseUrlBreakdown(raw: string): ParsedUrlInfo | null {
  try {
    const u = new URL(raw.trim());
    const params: { key: string; value: string }[] = [];
    u.searchParams.forEach((value, key) => {
      params.push({ key, value });
    });
    return {
      valid: true,
      protocol: u.protocol,
      host: u.host,
      pathname: u.pathname,
      hash: u.hash || '—',
      params,
    };
  } catch {
    return null;
  }
}

export function computeTextStats(raw: string): {
  chars: number;
  words: number;
  lines: number;
  bytes: number;
} {
  const chars = raw.length;
  const words = raw.trim() ? raw.trim().split(/\s+/).length : 0;
  const lines = raw ? raw.split(/\r?\n/).length : 0;
  const bytes = new TextEncoder().encode(raw).length;
  return { chars, words, lines, bytes };
}

export function transformText(
  raw: string,
  kind: TextTransformKind
): { ok: true; value: string } | { ok: false; errorType: 'empty' } {
  if (!raw.trim()) {
    return { ok: false, errorType: 'empty' };
  }
  let out = raw;
  switch (kind) {
    case 'upper':
      out = raw.toUpperCase();
      break;
    case 'lower':
      out = raw.toLowerCase();
      break;
    case 'title':
      out = raw.replace(/\b\w+/g, (w) => w[0].toUpperCase() + w.slice(1).toLowerCase());
      break;
    case 'camel':
      out = raw
        .trim()
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]+(.)/g, (_m, chr: string) => chr.toUpperCase());
      break;
    case 'snake':
      out = raw
        .trim()
        .replace(/([a-z])([A-Z])/g, '$1_$2')
        .replace(/[\s-]+/g, '_')
        .toLowerCase();
      break;
    case 'kebab':
      out = raw
        .trim()
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .replace(/[\s_]+/g, '-')
        .toLowerCase();
      break;
    case 'reverse':
      out = Array.from(raw).reverse().join('');
      break;
    case 'trimLines':
      out = raw
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean)
        .join('\n');
      break;
    case 'dedupe': {
      const seen = new Set<string>();
      out = raw
        .split(/\r?\n/)
        .filter((l) => {
          if (seen.has(l)) return false;
          seen.add(l);
          return true;
        })
        .join('\n');
      break;
    }
    case 'sortAsc':
      out = raw
        .split(/\r?\n/)
        .sort((a, b) => a.localeCompare(b))
        .join('\n');
      break;
  }
  return { ok: true, value: out };
}
