export type DeviceType = 'router' | 'switch' | 'computer' | 'server';

export interface SimDevice {
  id: string;
  name: string;
  type: DeviceType;
  ip: string;
  x: number; // 0..800 normalized SVG canvas coordinates
  y: number; // 0..420 normalized SVG canvas coordinates
}

export interface SimLink {
  id: string;
  fromId: string;
  toId: string;
  up: boolean;
}

/**
 * Computes the shortest sequence of device IDs from sourceId to targetId
 * over active (up === true) links using Breadth-First Search (BFS).
 * Returns null if no connected path exists.
 */
export function findShortestNetworkPath(
  devices: SimDevice[],
  links: SimLink[],
  sourceId: string,
  targetId: string
): string[] | null {
  if (sourceId === targetId) return [sourceId];
  const deviceIds = new Set(devices.map((d) => d.id));
  if (!deviceIds.has(sourceId) || !deviceIds.has(targetId)) return null;

  const adj = new Map<string, string[]>();
  for (const id of deviceIds) adj.set(id, []);
  for (const link of links) {
    if (!link.up) continue;
    if (deviceIds.has(link.fromId) && deviceIds.has(link.toId)) {
      adj.get(link.fromId)!.push(link.toId);
      adj.get(link.toId)!.push(link.fromId);
    }
  }

  const visited = new Set<string>([sourceId]);
  const parent = new Map<string, string>();
  const queue: string[] = [sourceId];

  while (queue.length > 0) {
    const curr = queue.shift()!;
    if (curr === targetId) {
      const path: string[] = [];
      let node: string | undefined = targetId;
      while (node) {
        path.unshift(node);
        node = parent.get(node);
      }
      return path;
    }
    for (const neighbor of adj.get(curr) ?? []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        parent.set(neighbor, curr);
        queue.push(neighbor);
      }
    }
  }

  return null;
}

export type SortAlgorithm = 'bubble' | 'selection' | 'insertion';

export interface SortStep {
  array: number[];
  comparing: number[];
  swapping: number[];
  sorted: number[];
  comparisons: number;
  swaps: number;
  noteEn: string;
  noteAr: string;
}

export function generateRandomSortArray(size: number): number[] {
  const clamped = Math.max(5, Math.min(28, size));
  const out: number[] = [];
  for (let i = 0; i < clamped; i++) {
    out.push(Math.floor(Math.random() * 85) + 12);
  }
  return out;
}

export function generateSortSteps(initial: number[], algo: SortAlgorithm): SortStep[] {
  const arr = [...initial];
  const n = arr.length;
  const steps: SortStep[] = [];
  let comparisons = 0;
  let swaps = 0;

  const pushStep = (
    comparing: number[],
    swapping: number[],
    sorted: number[],
    noteEn: string,
    noteAr: string
  ) => {
    steps.push({
      array: [...arr],
      comparing: [...comparing],
      swapping: [...swapping],
      sorted: [...sorted],
      comparisons,
      swaps,
      noteEn,
      noteAr,
    });
  };

  pushStep(
    [],
    [],
    [],
    'Initial unsorted array ready.',
    'المصفوفة الأولية غير المرتبة جاهزة للبدء.'
  );

  if (algo === 'bubble') {
    const sorted: number[] = [];
    for (let i = 0; i < n - 1; i++) {
      let swappedInPass = false;
      for (let j = 0; j < n - 1 - i; j++) {
        comparisons++;
        pushStep(
          [j, j + 1],
          [],
          sorted,
          `Compare index ${j} (${arr[j]}) and index ${j + 1} (${arr[j + 1]}).`,
          `مقارنة الفهرس ${j} (${arr[j]}) مع الفهرس ${j + 1} (${arr[j + 1]}).`
        );
        if (arr[j] > arr[j + 1]) {
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          swaps++;
          swappedInPass = true;
          pushStep(
            [],
            [j, j + 1],
            sorted,
            `Swap ${arr[j + 1]} and ${arr[j]} because ${arr[j + 1]} > ${arr[j]}.`,
            `تبديل ${arr[j + 1]} و ${arr[j]} لأن ${arr[j + 1]} أكبر من ${arr[j]}.`
          );
        }
      }
      sorted.push(n - 1 - i);
      if (!swappedInPass) {
        for (let k = n - 2 - i; k >= 0; k--) {
          if (!sorted.includes(k)) sorted.push(k);
        }
        break;
      }
    }
    if (!sorted.includes(0)) sorted.push(0);
    pushStep(
      [],
      [],
      Array.from({ length: n }, (_, idx) => idx),
      `Bubble Sort complete in ${comparisons} comparisons and ${swaps} swaps.`,
      `اكتمل الفرز الفقاعي بعد ${comparisons} مقارنة و ${swaps} تبديلاً.`
    );
    return steps;
  }

  if (algo === 'selection') {
    const sorted: number[] = [];
    for (let i = 0; i < n - 1; i++) {
      let minIdx = i;
      for (let j = i + 1; j < n; j++) {
        comparisons++;
        pushStep(
          [minIdx, j],
          [],
          sorted,
          `Scan index ${j} (${arr[j]}) against current minimum index ${minIdx} (${arr[minIdx]}).`,
          `فحص الفهرس ${j} (${arr[j]}) مقابل أصغر قيمة حالية عند ${minIdx} (${arr[minIdx]}).`
        );
        if (arr[j] < arr[minIdx]) {
          minIdx = j;
        }
      }
      if (minIdx !== i) {
        [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
        swaps++;
        pushStep(
          [],
          [i, minIdx],
          sorted,
          `Place minimum value ${arr[i]} into sorted position ${i}.`,
          `نقل القيمة الصغرى ${arr[i]} إلى موقعها المرتب ${i}.`
        );
      }
      sorted.push(i);
    }
    sorted.push(n - 1);
    pushStep(
      [],
      [],
      Array.from({ length: n }, (_, idx) => idx),
      `Selection Sort complete in ${comparisons} comparisons and ${swaps} swaps.`,
      `اكتمل فرز الاختيار بعد ${comparisons} مقارنة و ${swaps} تبديلاً.`
    );
    return steps;
  }

  // Insertion Sort
  for (let i = 1; i < n; i++) {
    let j = i;
    while (j > 0) {
      comparisons++;
      pushStep(
        [j - 1, j],
        [],
        [],
        `Compare key ${arr[j]} (index ${j}) with ${arr[j - 1]} (index ${j - 1}).`,
        `مقارنة العنصر ${arr[j]} (فهرس ${j}) مع ${arr[j - 1]} (فهرس ${j - 1}).`
      );
      if (arr[j - 1] > arr[j]) {
        [arr[j - 1], arr[j]] = [arr[j], arr[j - 1]];
        swaps++;
        pushStep(
          [],
          [j - 1, j],
          [],
          `Shift ${arr[j]} right and move ${arr[j - 1]} left.`,
          `إزاحة ${arr[j]} لليمين ونقل ${arr[j - 1]} لليسار.`
        );
        j--;
      } else {
        break;
      }
    }
  }

  pushStep(
    [],
    [],
    Array.from({ length: n }, (_, idx) => idx),
    `Insertion Sort complete in ${comparisons} comparisons and ${swaps} shifts/swaps.`,
    `اكتمل فرز الإدراج بعد ${comparisons} مقارنة و ${swaps} عملية نقل.`
  );
  return steps;
}

export type LogicGateType = 'AND' | 'OR' | 'NOT' | 'XOR';

export interface TruthTableRow {
  a: 0 | 1;
  b: 0 | 1 | null;
  out: 0 | 1;
}

export function evaluateLogicGate(gate: LogicGateType, a: boolean, b: boolean): boolean {
  switch (gate) {
    case 'AND':
      return a && b;
    case 'OR':
      return a || b;
    case 'NOT':
      return !a;
    case 'XOR':
      return a !== b;
  }
}

export function getGateTruthTable(gate: LogicGateType): TruthTableRow[] {
  if (gate === 'NOT') {
    return [
      { a: 0, b: null, out: 1 },
      { a: 1, b: null, out: 0 },
    ];
  }
  const pairs: [0 | 1, 0 | 1][] = [
    [0, 0],
    [0, 1],
    [1, 0],
    [1, 1],
  ];
  return pairs.map(([a, b]) => ({
    a,
    b,
    out: evaluateLogicGate(gate, a === 1, b === 1) ? 1 : 0,
  }));
}
