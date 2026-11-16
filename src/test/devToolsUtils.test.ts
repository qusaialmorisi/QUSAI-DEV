import { describe, it, expect } from 'vitest';
import {
  computeTextStats,
  decodeBase64Safe,
  decodeUrlSafe,
  encodeBase64Safe,
  encodeUrlSafe,
  formatJsonInput,
  parseUrlBreakdown,
  transformText,
} from '../utils/devToolsUtils';

describe('JSON formatter and validator', () => {
  it('formats, minifies, sorts keys, and measures JSON structure', () => {
    const res = formatJsonInput('{"b":1,"a":{"z":true,"m":2}}', {
      indent: '2',
      sortKeys: true,
      minify: false,
    });
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.formatted).toBe('{\n  "a": {\n    "m": 2,\n    "z": true\n  },\n  "b": 1\n}');
      expect(res.stats.keys).toBe(4);
      expect(res.stats.depth).toBe(3);
      expect(res.stats.bytes).toBeGreaterThan(0);
    }

    const min = formatJsonInput('{ "x" : [1, 2] }', {
      indent: '4',
      sortKeys: false,
      minify: true,
    });
    expect(min.ok).toBe(true);
    if (min.ok) {
      expect(min.formatted).toBe('{"x":[1,2]}');
    }
  });

  it('returns explicit error types for empty and invalid JSON inputs', () => {
    const emptyRes = formatJsonInput('   \n ', { indent: '2', sortKeys: false, minify: false });
    expect(emptyRes.ok).toBe(false);
    if (!emptyRes.ok) expect(emptyRes.errorType).toBe('empty');

    const badRes = formatJsonInput('{"unclosed": [1, 2}', {
      indent: '2',
      sortKeys: false,
      minify: false,
    });
    expect(badRes.ok).toBe(false);
    if (!badRes.ok) {
      expect(badRes.errorType).toBe('invalid');
      expect(badRes.message.length).toBeGreaterThan(0);
    }
  });
});

describe('Base64 UTF-8 encoder and decoder', () => {
  it('encodes and decodes ASCII and Arabic UTF-8 strings accurately', () => {
    const sample = 'QUSAI.DEV — مرحباً بالعالم';
    const encoded = encodeBase64Safe(sample, false);
    expect(encoded.ok).toBe(true);
    if (encoded.ok) {
      const decoded = decodeBase64Safe(encoded.value);
      expect(decoded).toEqual({ ok: true, value: sample });
    }
  });

  it('supports URL-safe Base64 encoding and decoding without padding', () => {
    const sample = 'subjects?_d=1&v=>><<';
    const urlSafe = encodeBase64Safe(sample, true);
    expect(urlSafe.ok).toBe(true);
    if (urlSafe.ok) {
      expect(urlSafe.value).not.toMatch(/[+/=]/);
      expect(decodeBase64Safe(urlSafe.value)).toEqual({ ok: true, value: sample });
    }
  });

  it('rejects empty and malformed Base64 strings', () => {
    expect(encodeBase64Safe('   ', false)).toEqual({ ok: false, errorType: 'empty' });
    expect(decodeBase64Safe('')).toEqual({ ok: false, errorType: 'empty' });
    expect(decodeBase64Safe('not!valid*base64###')).toEqual({ ok: false, errorType: 'invalid' });
  });
});

describe('URL encoder, decoder, and parser', () => {
  it('encodes and decodes component and full URI modes', () => {
    const raw = 'https://qusai.dev/search?q=mikrotik router&lang=ar';
    const comp = encodeUrlSafe(raw, 'component');
    expect(comp.ok).toBe(true);
    if (comp.ok) {
      expect(comp.value).toContain('%3A%2F%2F');
      expect(decodeUrlSafe(comp.value, 'component')).toEqual({ ok: true, value: raw });
    }

    const fullUri = encodeUrlSafe(raw, 'uri');
    expect(fullUri.ok).toBe(true);
    if (fullUri.ok) {
      expect(fullUri.value).toContain('https://qusai.dev/search?q=mikrotik%20router');
      expect(decodeUrlSafe(fullUri.value, 'uri')).toEqual({ ok: true, value: raw });
    }
  });

  it('parses URL components and rejects empty or malformed percent sequences', () => {
    const parsed = parseUrlBreakdown(
      'https://qusai.dev/network-lab?tool=cidr&prefix=24#results'
    );
    expect(parsed).toEqual({
      valid: true,
      protocol: 'https:',
      host: 'qusai.dev',
      pathname: '/network-lab',
      hash: '#results',
      params: [
        { key: 'tool', value: 'cidr' },
        { key: 'prefix', value: '24' },
      ],
    });

    expect(parseUrlBreakdown('not-a-url')).toBeNull();
    expect(encodeUrlSafe('', 'component')).toEqual({ ok: false, errorType: 'empty' });
    expect(decodeUrlSafe('%E0%A4%A', 'component')).toEqual({ ok: false, errorType: 'invalid' });
  });
});

describe('Text conversion utilities and UTF-8 statistics', () => {
  it('applies all case, casing-style, line, and reverse transformations', () => {
    expect(transformText('Hello World', 'upper')).toEqual({ ok: true, value: 'HELLO WORLD' });
    expect(transformText('Hello World', 'lower')).toEqual({ ok: true, value: 'hello world' });
    expect(transformText('hello world', 'title')).toEqual({ ok: true, value: 'Hello World' });
    expect(transformText('hello world_dev', 'camel')).toEqual({ ok: true, value: 'helloWorldDev' });
    expect(transformText('helloWorld test', 'snake')).toEqual({ ok: true, value: 'hello_world_test' });
    expect(transformText('helloWorld_test', 'kebab')).toEqual({ ok: true, value: 'hello-world-test' });
    expect(transformText('QUSAI', 'reverse')).toEqual({ ok: true, value: 'IASUQ' });
    expect(transformText('  alpha  \n\n  beta ', 'trimLines')).toEqual({
      ok: true,
      value: 'alpha\nbeta',
    });
    expect(transformText('a\nb\na\nc', 'dedupe')).toEqual({ ok: true, value: 'a\nb\nc' });
    expect(transformText('zeta\nalpha\nbeta', 'sortAsc')).toEqual({
      ok: true,
      value: 'alpha\nbeta\nzeta',
    });
  });

  it('rejects empty text transformations and computes accurate UTF-8 stats', () => {
    expect(transformText('   ', 'upper')).toEqual({ ok: false, errorType: 'empty' });
    expect(computeTextStats('')).toEqual({ chars: 0, words: 0, lines: 0, bytes: 0 });
    expect(computeTextStats('مرحبا\nhi')).toEqual({
      chars: 8,
      words: 2,
      lines: 2,
      bytes: 13,
    });
  });
});
