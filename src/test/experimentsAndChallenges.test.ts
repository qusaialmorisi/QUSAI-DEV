import { describe, it, expect } from 'vitest';
import {
  evaluateLogicGate,
  findShortestNetworkPath,
  generateSortSteps,
  getGateTruthTable,
  type SimDevice,
  type SimLink,
} from '../utils/experimentsLogic';
import {
  NETWORKING_CHALLENGES,
  PROGRAMMING_CHALLENGES,
  getDailyChallenge,
} from '../data/challenges';
import {
  evaluateNetworkingChallenge,
  runJavaScriptChallengeTests,
  runPythonChallengeTests,
} from '../utils/challengeEvaluators';

describe('Digital Logic Gates (AND, OR, NOT, XOR)', () => {
  it('evaluates AND, OR, NOT, and XOR truth values accurately', () => {
    expect(evaluateLogicGate('AND', false, false)).toBe(false);
    expect(evaluateLogicGate('AND', true, false)).toBe(false);
    expect(evaluateLogicGate('AND', true, true)).toBe(true);

    expect(evaluateLogicGate('OR', false, false)).toBe(false);
    expect(evaluateLogicGate('OR', false, true)).toBe(true);
    expect(evaluateLogicGate('OR', true, true)).toBe(true);

    expect(evaluateLogicGate('NOT', false, true)).toBe(true);
    expect(evaluateLogicGate('NOT', true, false)).toBe(false);

    expect(evaluateLogicGate('XOR', false, false)).toBe(false);
    expect(evaluateLogicGate('XOR', true, false)).toBe(true);
    expect(evaluateLogicGate('XOR', false, true)).toBe(true);
    expect(evaluateLogicGate('XOR', true, true)).toBe(false);
  });

  it('builds complete truth tables for each gate', () => {
    expect(getGateTruthTable('NOT')).toEqual([
      { a: 0, b: null, out: 1 },
      { a: 1, b: null, out: 0 },
    ]);
    expect(getGateTruthTable('XOR').map((r) => r.out)).toEqual([0, 1, 1, 0]);
    expect(getGateTruthTable('AND').map((r) => r.out)).toEqual([0, 0, 0, 1]);
    expect(getGateTruthTable('OR').map((r) => r.out)).toEqual([0, 1, 1, 1]);
  });
});

describe('Sorting Algorithms & Network Pathfinding', () => {
  it.each(['bubble', 'selection', 'insertion'] as const)(
    'sorts unsorted arrays with duplicates using %s sort and tracks counts',
    (algo) => {
      const input = [42, 7, 19, 7, 99, 1, 25];
      const steps = generateSortSteps(input, algo);
      expect(steps.length).toBeGreaterThan(2);

      const finalStep = steps[steps.length - 1];
      expect(finalStep.array).toEqual([1, 7, 7, 19, 25, 42, 99]);
      expect(finalStep.sorted).toEqual([0, 1, 2, 3, 4, 5, 6]);
      expect(finalStep.comparisons).toBeGreaterThan(0);
      expect(finalStep.swaps).toBeGreaterThan(0);
    }
  );

  it('performs zero swaps on already sorted input across all sorting algorithms', () => {
    const sorted = [10, 20, 30, 40, 50];
    for (const algo of ['bubble', 'selection', 'insertion'] as const) {
      const steps = generateSortSteps(sorted, algo);
      const finalStep = steps[steps.length - 1];
      expect(finalStep.array).toEqual(sorted);
      expect(finalStep.swaps).toBe(0);
    }
  });

  it('computes shortest active network paths and skips downed links', () => {
    const devices: SimDevice[] = [
      { id: 'pc1', name: 'PC1', type: 'computer', ip: '10.0.0.2', x: 0, y: 0 },
      { id: 'sw1', name: 'SW1', type: 'switch', ip: '10.0.0.3', x: 100, y: 0 },
      { id: 'r1', name: 'R1', type: 'router', ip: '10.0.0.1', x: 200, y: 0 },
      { id: 'srv1', name: 'SRV1', type: 'server', ip: '10.0.0.10', x: 300, y: 0 },
    ];
    const links: SimLink[] = [
      { id: 'l1', fromId: 'pc1', toId: 'sw1', up: true },
      { id: 'l2', fromId: 'sw1', toId: 'r1', up: true },
      { id: 'l3', fromId: 'r1', toId: 'srv1', up: true },
    ];

    expect(findShortestNetworkPath(devices, links, 'pc1', 'srv1')).toEqual([
      'pc1',
      'sw1',
      'r1',
      'srv1',
    ]);
    const brokenLinks = links.map((l) => (l.id === 'l2' ? { ...l, up: false } : l));
    expect(findShortestNetworkPath(devices, brokenLinks, 'pc1', 'srv1')).toBeNull();
  });
});

describe('Programming & Networking Challenge Validators', () => {
  it('passes every Python challenge with its verified reference solution and fails broken/empty code', () => {
    const pythonChallenges = PROGRAMMING_CHALLENGES.filter((c) => c.language === 'python');
    expect(pythonChallenges.length).toBeGreaterThan(0);

    for (const ch of pythonChallenges) {
      const passRes = runPythonChallengeTests(
        ch.solutionCode ?? '',
        ch.functionName ?? '',
        ch.pythonTests ?? []
      );
      expect(passRes.passedAll, `Expected Python challenge ${ch.id} solution to pass`).toBe(true);
      expect(passRes.tests.every((t) => t.passed)).toBe(true);

      const failRes = runPythonChallengeTests('', ch.functionName ?? '', ch.pythonTests ?? []);
      expect(failRes.passedAll).toBe(false);
      expect(failRes.runtimeError).toBeTruthy();
    }
  });

  it('passes every JavaScript challenge with its verified solution and catches runtime/wrong answers', async () => {
    const jsChallenges = PROGRAMMING_CHALLENGES.filter((c) => c.language === 'javascript');
    expect(jsChallenges.length).toBeGreaterThan(0);

    for (const ch of jsChallenges) {
      const passRes = await runJavaScriptChallengeTests(
        ch.solutionCode ?? '',
        ch.functionName ?? '',
        ch.jsTests ?? []
      );
      expect(passRes.passedAll, `Expected JS challenge ${ch.id} solution to pass`).toBe(true);

      const wrongRes = await runJavaScriptChallengeTests(
        `function ${ch.functionName}() { return "__wrong__"; }`,
        ch.functionName ?? '',
        ch.jsTests ?? []
      );
      expect(wrongRes.passedAll).toBe(false);

      const emptyRes = await runJavaScriptChallengeTests('', ch.functionName ?? '', ch.jsTests ?? []);
      expect(emptyRes.passedAll).toBe(false);
      expect(emptyRes.runtimeError).toBeTruthy();
    }
  });

  it('evaluates every Networking challenge accurately for expected vs incorrect/empty answers', () => {
    expect(NETWORKING_CHALLENGES.length).toBeGreaterThan(0);

    for (const ch of NETWORKING_CHALLENGES) {
      const expectedAnswers = Object.fromEntries(ch.fields.map((f) => [f.id, f.expected]));
      const passRes = evaluateNetworkingChallenge(ch, expectedAnswers, 'en');
      expect(passRes.passedAll, `Expected Networking challenge ${ch.id} to pass`).toBe(true);

      const emptyRes = evaluateNetworkingChallenge(ch, {}, 'en');
      expect(emptyRes.passedAll).toBe(false);
      expect(emptyRes.tests.every((t) => !t.passed)).toBe(true);
    }
  });

  it('rotates daily challenge deterministically for a given date', () => {
    const d1 = getDailyChallenge(new Date('2026-06-15T12:00:00Z'));
    const d1Again = getDailyChallenge(new Date('2026-06-15T23:59:00Z'));
    const d2 = getDailyChallenge(new Date('2026-06-16T12:00:00Z'));
    expect(d1.id).toBe(d1Again.id);
    expect(d2.id).not.toBe(d1.id);
  });
});
