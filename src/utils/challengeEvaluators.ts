import type {
  ChallengeEvaluationResult,
  ChallengeTestCaseResult,
  Language,
} from '../types';
import type {
  HtmlCssAssertion,
  JsTestCase,
  NetworkingChallenge,
} from '../data/challenges';
import { isValidIPv4, ipv4ToUint32, uint32ToIpv4 } from './networkMath';
import { evaluatePythonChallenge, type PythonTestCase } from './pythonEvaluator';

function deepEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (typeof a !== typeof b || a === null || b === null) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((item, idx) => deepEqual(item, b[idx]));
  }
  if (typeof a === 'object' && typeof b === 'object' && !Array.isArray(a) && !Array.isArray(b)) {
    const ka = Object.keys(a as Record<string, unknown>);
    const kb = Object.keys(b as Record<string, unknown>);
    if (ka.length !== kb.length) return false;
    return ka.every(
      (k) =>
        Object.prototype.hasOwnProperty.call(b, k) &&
        deepEqual((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k])
    );
  }
  return false;
}

export function runPythonChallengeTests(
  code: string,
  functionName: string,
  tests: PythonTestCase[]
): ChallengeEvaluationResult {
  const { runtimeError, results } = evaluatePythonChallenge(code, functionName, tests);
  return {
    passedAll: !runtimeError && results.length > 0 && results.every((r) => r.passed),
    tests: results,
    runtimeError,
  };
}

/**
 * Evaluates JavaScript challenges safely in an isolated Blob Web Worker with a 2000ms
 * infinite-loop guard. Falls back cleanly to a strict-mode isolated runner if Worker
 * construction is unavailable in a non-browser test environment.
 */
export async function runJavaScriptChallengeTests(
  code: string,
  functionName: string,
  tests: JsTestCase[]
): Promise<ChallengeEvaluationResult> {
  if (typeof Worker !== 'undefined' && typeof Blob !== 'undefined' && typeof URL !== 'undefined') {
    try {
      const workerScript = `
        self.onmessage = function(ev) {
          var payload = ev.data;
          var code = payload.code;
          var fnName = payload.functionName;
          var tests = payload.tests;

          function deepEqual(a, b) {
            if (Object.is(a, b)) return true;
            if (typeof a !== typeof b || a === null || b === null) return false;
            if (Array.isArray(a) && Array.isArray(b)) {
              return a.length === b.length && a.every(function(item, idx) { return deepEqual(item, b[idx]); });
            }
            if (typeof a === 'object' && typeof b === 'object' && !Array.isArray(a) && !Array.isArray(b)) {
              var ka = Object.keys(a);
              var kb = Object.keys(b);
              if (ka.length !== kb.length) return false;
              return ka.every(function(k) { return Object.prototype.hasOwnProperty.call(b, k) && deepEqual(a[k], b[k]); });
            }
            return false;
          }

          try {
            var factory = new Function('"use strict";\\n' + code + '\\nreturn typeof ' + fnName + ' === "function" ? ' + fnName + ' : null;');
            var userFn = factory();
            if (typeof userFn !== 'function') {
              self.postMessage({
                runtimeError: 'Function ' + fnName + ' is not defined.',
                results: tests.map(function(tc) {
                  return {
                    id: tc.id,
                    label: tc.label,
                    passed: false,
                    inputDisplay: tc.args.map(function(x) { return JSON.stringify(x); }).join(', '),
                    expectedDisplay: JSON.stringify(tc.expected),
                    actualDisplay: 'Not executed',
                    error: 'Function ' + fnName + ' is not defined.'
                  };
                })
              });
              return;
            }
            var results = tests.map(function(tc) {
              var inputDisplay = tc.args.map(function(x) { return JSON.stringify(x); }).join(', ');
              var expectedDisplay = JSON.stringify(tc.expected);
              try {
                var clonedArgs = JSON.parse(JSON.stringify(tc.args));
                var actual = userFn.apply(null, clonedArgs);
                var passed = deepEqual(actual, tc.expected);
                return {
                  id: tc.id,
                  label: tc.label,
                  passed: passed,
                  inputDisplay: inputDisplay,
                  expectedDisplay: expectedDisplay,
                  actualDisplay: actual === undefined ? 'undefined' : JSON.stringify(actual)
                };
              } catch (err) {
                return {
                  id: tc.id,
                  label: tc.label,
                  passed: false,
                  inputDisplay: inputDisplay,
                  expectedDisplay: expectedDisplay,
                  actualDisplay: 'Error',
                  error: err && err.message ? err.message : String(err)
                };
              }
            });
            self.postMessage({ results: results });
          } catch (err) {
            var msg = err && err.message ? err.message : String(err);
            self.postMessage({
              runtimeError: msg,
              results: tests.map(function(tc) {
                return {
                  id: tc.id,
                  label: tc.label,
                  passed: false,
                  inputDisplay: tc.args.map(function(x) { return JSON.stringify(x); }).join(', '),
                  expectedDisplay: JSON.stringify(tc.expected),
                  actualDisplay: 'Not executed',
                  error: msg
                };
              })
            });
          }
        };
      `;

      const blob = new Blob([workerScript], { type: 'application/javascript' });
      const url = URL.createObjectURL(blob);

      return await new Promise<ChallengeEvaluationResult>((resolve) => {
        const worker = new Worker(url);
        const timer = setTimeout(() => {
          worker.terminate();
          URL.revokeObjectURL(url);
          const timeoutMsg = 'Execution timed out after 2000ms (possible infinite loop).';
          resolve({
            passedAll: false,
            runtimeError: timeoutMsg,
            tests: tests.map((tc) => ({
              id: tc.id,
              label: tc.label,
              passed: false,
              inputDisplay: tc.args.map((a) => JSON.stringify(a)).join(', '),
              expectedDisplay: JSON.stringify(tc.expected),
              actualDisplay: 'Timeout',
              error: timeoutMsg,
            })),
          });
        }, 2000);

        worker.onmessage = (ev) => {
          clearTimeout(timer);
          worker.terminate();
          URL.revokeObjectURL(url);
          const data = ev.data as {
            runtimeError?: string;
            results: ChallengeTestCaseResult[];
          };
          resolve({
            passedAll:
              !data.runtimeError &&
              data.results.length > 0 &&
              data.results.every((r) => r.passed),
            tests: data.results,
            runtimeError: data.runtimeError,
          });
        };

        worker.onerror = (err) => {
          clearTimeout(timer);
          worker.terminate();
          URL.revokeObjectURL(url);
          const msg = err.message || 'Worker execution error.';
          resolve({
            passedAll: false,
            runtimeError: msg,
            tests: tests.map((tc) => ({
              id: tc.id,
              label: tc.label,
              passed: false,
              inputDisplay: tc.args.map((a) => JSON.stringify(a)).join(', '),
              expectedDisplay: JSON.stringify(tc.expected),
              actualDisplay: 'Error',
              error: msg,
            })),
          });
        };

        worker.postMessage({ code, functionName, tests });
      });
    } catch {
      // Fallback below if Blob Worker cannot spawn
    }
  }

  // Fallback for Node/tsx verification or restricted worker environments
  try {
    const factory = new Function(
      `"use strict";\n${code}\nreturn typeof ${functionName} === 'function' ? ${functionName} : null;`
    ) as () => ((...args: unknown[]) => unknown) | null;
    const userFn = factory();
    if (typeof userFn !== 'function') {
      const msg = `Function ${functionName} is not defined.`;
      return {
        passedAll: false,
        runtimeError: msg,
        tests: tests.map((tc) => ({
          id: tc.id,
          label: tc.label,
          passed: false,
          inputDisplay: tc.args.map((a) => JSON.stringify(a)).join(', '),
          expectedDisplay: JSON.stringify(tc.expected),
          actualDisplay: 'Not executed',
          error: msg,
        })),
      };
    }

    const results: ChallengeTestCaseResult[] = tests.map((tc) => {
      const inputDisplay = tc.args.map((a) => JSON.stringify(a)).join(', ');
      const expectedDisplay = JSON.stringify(tc.expected);
      try {
        const clonedArgs = JSON.parse(JSON.stringify(tc.args)) as unknown[];
        const actual = userFn(...clonedArgs);
        return {
          id: tc.id,
          label: tc.label,
          passed: deepEqual(actual, tc.expected),
          inputDisplay,
          expectedDisplay,
          actualDisplay: actual === undefined ? 'undefined' : JSON.stringify(actual),
        };
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return {
          id: tc.id,
          label: tc.label,
          passed: false,
          inputDisplay,
          expectedDisplay,
          actualDisplay: 'Error',
          error: msg,
        };
      }
    });

    return {
      passedAll: results.length > 0 && results.every((r) => r.passed),
      tests: results,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      passedAll: false,
      runtimeError: msg,
      tests: tests.map((tc) => ({
        id: tc.id,
        label: tc.label,
        passed: false,
        inputDisplay: tc.args.map((a) => JSON.stringify(a)).join(', '),
        expectedDisplay: JSON.stringify(tc.expected),
        actualDisplay: 'Not executed',
        error: msg,
      })),
    };
  }
}

/**
 * Evaluates HTML + CSS challenges using an isolated iframe with sandbox="allow-same-origin"
 * (NO allow-scripts, so user JS cannot execute) and runs real DOM + getComputedStyle assertions.
 */
export async function runHtmlCssChallengeTests(
  html: string,
  css: string,
  assertions: HtmlCssAssertion[],
  lang: Language
): Promise<ChallengeEvaluationResult> {
  if (typeof document === 'undefined') {
    return {
      passedAll: false,
      runtimeError: 'DOM environment unavailable.',
      tests: [],
    };
  }

  const iframe = document.createElement('iframe');
  iframe.setAttribute('sandbox', 'allow-same-origin');
  iframe.style.position = 'fixed';
  iframe.style.left = '-9999px';
  iframe.style.width = '800px';
  iframe.style.height = '400px';
  document.body.appendChild(iframe);

  try {
    const doc = iframe.contentDocument;
    if (!doc) {
      return {
        passedAll: false,
        runtimeError: 'Sandbox iframe document unavailable.',
        tests: [],
      };
    }

    doc.open();
    doc.write(`<!doctype html><html><head><style>${css}</style></head><body>${html}</body></html>`);
    doc.close();

    // Allow layout & computed styles to flush
    await new Promise((r) => setTimeout(r, 30));

    const win = iframe.contentWindow;
    const tests: ChallengeTestCaseResult[] = assertions.map((a) => {
      const label = lang === 'ar' ? a.labelAr : a.labelEn;
      const matches = doc.querySelectorAll(a.selector);
      const first = matches[0] as HTMLElement | undefined;

      if (a.check === 'exists') {
        const passed = matches.length > 0;
        return {
          id: a.id,
          label,
          passed,
          inputDisplay: a.selector,
          expectedDisplay: '>= 1',
          actualDisplay: String(matches.length),
        };
      }

      if (a.check === 'minCount') {
        const min = Number(a.expected ?? 1);
        const passed = matches.length >= min;
        return {
          id: a.id,
          label,
          passed,
          inputDisplay: a.selector,
          expectedDisplay: `>= ${min}`,
          actualDisplay: String(matches.length),
        };
      }

      if (!first || !win) {
        return {
          id: a.id,
          label,
          passed: false,
          inputDisplay: a.selector,
          expectedDisplay: String(a.expected ?? a.prop ?? ''),
          actualDisplay: 'Element not found',
        };
      }

      if (a.check === 'hasAttr' && a.prop) {
        const attrVal = first.getAttribute(a.prop)?.trim() ?? '';
        return {
          id: a.id,
          label,
          passed: attrVal.length > 0,
          inputDisplay: `${a.selector}[${a.prop}]`,
          expectedDisplay: 'Non-empty attribute',
          actualDisplay: attrVal || '(missing)',
        };
      }

      const computed = win.getComputedStyle(first);
      const rawStyle = a.prop
        ? String((computed as unknown as Record<string, string>)[a.prop] ?? '')
        : '';

      if (a.check === 'styleEquals') {
        const expected = String(a.expected ?? '');
        const passed = rawStyle.toLowerCase() === expected.toLowerCase();
        return {
          id: a.id,
          label,
          passed,
          inputDisplay: `${a.selector} { ${a.prop} }`,
          expectedDisplay: expected,
          actualDisplay: rawStyle || '(empty)',
        };
      }

      if (a.check === 'styleIncludes') {
        const expected = String(a.expected ?? '');
        const passed = rawStyle.toLowerCase().includes(expected.toLowerCase());
        return {
          id: a.id,
          label,
          passed,
          inputDisplay: `${a.selector} { ${a.prop} }`,
          expectedDisplay: `contains "${expected}"`,
          actualDisplay: rawStyle || '(none)',
        };
      }

      if (a.check === 'minPx') {
        const min = Number(a.expected ?? 0);
        const parsed = parseFloat(rawStyle);
        const passed = Number.isFinite(parsed) && parsed >= min;
        return {
          id: a.id,
          label,
          passed,
          inputDisplay: `${a.selector} { ${a.prop} }`,
          expectedDisplay: `>= ${min}px`,
          actualDisplay: Number.isFinite(parsed) ? `${parsed}px` : rawStyle || '0px',
        };
      }

      return {
        id: a.id,
        label,
        passed: false,
        inputDisplay: a.selector,
        expectedDisplay: String(a.expected ?? ''),
        actualDisplay: rawStyle,
      };
    });

    return {
      passedAll: tests.length > 0 && tests.every((t) => t.passed),
      tests,
    };
  } finally {
    document.body.removeChild(iframe);
  }
}

export function evaluateNetworkingChallenge(
  challenge: NetworkingChallenge,
  answers: Record<string, string>,
  lang: Language
): ChallengeEvaluationResult {
  const tests: ChallengeTestCaseResult[] = challenge.fields.map((field) => {
    const raw = (answers[field.id] ?? '').trim();
    const label = field.label[lang];

    if (field.type === 'ipv4') {
      const normalized = isValidIPv4(raw) ? uint32ToIpv4(ipv4ToUint32(raw)) : raw;
      const passed = isValidIPv4(raw) && normalized === field.expected;
      return {
        id: field.id,
        label,
        passed,
        inputDisplay: raw || '(empty)',
        expectedDisplay: field.expected,
        actualDisplay: normalized || '(empty)',
      };
    }

    if (field.type === 'cidr') {
      const cleaned = raw.startsWith('/') ? raw.slice(1).trim() : raw;
      const passed = /^\d+$/.test(cleaned) && Number(cleaned) === Number(field.expected);
      return {
        id: field.id,
        label,
        passed,
        inputDisplay: raw || '(empty)',
        expectedDisplay: `/${field.expected}`,
        actualDisplay: cleaned ? `/${cleaned}` : '(empty)',
      };
    }

    if (field.type === 'integer') {
      const passed = /^\d+$/.test(raw) && Number(raw) === Number(field.expected);
      return {
        id: field.id,
        label,
        passed,
        inputDisplay: raw || '(empty)',
        expectedDisplay: field.expected,
        actualDisplay: raw || '(empty)',
      };
    }

    if (field.type === 'binary32') {
      const compactInput = raw.replace(/\s+/g, '');
      const passed = compactInput === field.expected;
      return {
        id: field.id,
        label,
        passed,
        inputDisplay: raw || '(empty)',
        expectedDisplay: field.expected,
        actualDisplay: compactInput || '(empty)',
      };
    }

    // Choice field
    const choiceMatch = field.choices?.find((c) => c.value === raw);
    const expectedChoice = field.choices?.find((c) => c.value === field.expected);
    return {
      id: field.id,
      label,
      passed: raw === field.expected,
      inputDisplay: choiceMatch ? choiceMatch.label[lang] : '(unselected)',
      expectedDisplay: expectedChoice ? expectedChoice.label[lang] : field.expected,
      actualDisplay: choiceMatch ? choiceMatch.label[lang] : '(unselected)',
    };
  });

  return {
    passedAll: tests.length > 0 && tests.every((t) => t.passed),
    tests,
  };
}
