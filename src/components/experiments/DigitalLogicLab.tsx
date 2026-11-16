import { useMemo, useState } from 'react';
import type { Language } from '../../types';
import { getTranslations } from '../../i18n/translations';
import {
  evaluateLogicGate,
  getGateTruthTable,
  type LogicGateType,
} from '../../utils/experimentsLogic';

interface DigitalLogicLabProps {
  lang: Language;
}

export function DigitalLogicLab({ lang }: DigitalLogicLabProps) {
  const t = getTranslations(lang);
  const dl = t.experiments.logic;

  const [gate, setGate] = useState<LogicGateType>('AND');
  const [inputA, setInputA] = useState<boolean>(true);
  const [inputB, setInputB] = useState<boolean>(false);

  const output = evaluateLogicGate(gate, inputA, inputB);
  const truthTable = useMemo(() => getGateTruthTable(gate), [gate]);
  const gateInfo = dl.gates[gate];

  const isUnary = gate === 'NOT';

  return (
    <div className="space-y-6">
      {/* Gate Selector */}
      <div className="glass-panel flex flex-col gap-4 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div>
          <p className="text-xs font-semibold text-slate-300">{dl.gateLabel}</p>
          <p className="mt-1 text-xs text-slate-400">{gateInfo.desc}</p>
        </div>

        <div
          role="tablist"
          aria-label={dl.gateLabel}
          className="inline-flex flex-wrap gap-1 rounded-xl border border-slate-400/20 bg-[#04060c] p-1"
        >
          {(['AND', 'OR', 'NOT', 'XOR'] as LogicGateType[]).map((g) => (
            <button
              key={g}
              type="button"
              role="tab"
              aria-selected={gate === g}
              onClick={() => setGate(g)}
              className={`min-h-[40px] rounded-lg px-4 py-2 font-mono text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                gate === g
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Main Schematic + Inputs + Truth Table */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Interactive Switches + Live SVG Gate Schematic */}
        <div className="glass-panel rounded-2xl p-4 sm:p-6 lg:col-span-7 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-display text-base font-semibold text-white">
              {dl.schematicTitle}
            </h3>
            <span dir="ltr" className="font-mono text-xs font-semibold text-blue-300">
              {gateInfo.formula}
            </span>
          </div>

          {/* Interactive Schematic Diagram */}
          <div dir="ltr" className="rounded-xl border border-slate-400/15 bg-[#04060c] p-3 sm:p-4">
            <svg
              viewBox="0 0 560 220"
              className="h-[190px] w-full sm:h-[220px]"
              role="img"
              aria-label={`${gateInfo.name}: ${gateInfo.formula}`}
            >
              {/* Input A Wire */}
              <line
                x1={95}
                y1={isUnary ? 110 : 75}
                x2={215}
                y2={isUnary ? 110 : 75}
                stroke={inputA ? '#38bdf8' : '#475569'}
                strokeWidth={3.5}
              />
              {/* Input A Pin */}
              <rect
                x={20}
                y={(isUnary ? 110 : 75) - 20}
                width={76}
                height={40}
                rx={10}
                fill={inputA ? '#0c2745' : '#0f172a'}
                stroke={inputA ? '#38bdf8' : '#475569'}
                strokeWidth={2}
              />
              <text
                x={58}
                y={(isUnary ? 110 : 75) + 4}
                textAnchor="middle"
                fill="#f8fafc"
                fontSize="13"
                fontWeight="700"
                fontFamily="JetBrains Mono, monospace"
              >
                A = {inputA ? 1 : 0}
              </text>

              {/* Input B Wire (binary gates) */}
              {!isUnary && (
                <>
                  <line
                    x1={95}
                    y1={145}
                    x2={215}
                    y2={145}
                    stroke={inputB ? '#38bdf8' : '#475569'}
                    strokeWidth={3.5}
                  />
                  <rect
                    x={20}
                    y={125}
                    width={76}
                    height={40}
                    rx={10}
                    fill={inputB ? '#0c2745' : '#0f172a'}
                    stroke={inputB ? '#38bdf8' : '#475569'}
                    strokeWidth={2}
                  />
                  <text
                    x={58}
                    y={149}
                    textAnchor="middle"
                    fill="#f8fafc"
                    fontSize="13"
                    fontWeight="700"
                    fontFamily="JetBrains Mono, monospace"
                  >
                    B = {inputB ? 1 : 0}
                  </text>
                </>
              )}

              {/* IEEE Logic Gate Symbol */}
              {gate === 'AND' && (
                <path
                  d="M 215 50 L 275 50 A 60 60 0 0 1 275 170 L 215 170 Z"
                  fill="#0b1222"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                />
              )}
              {gate === 'OR' && (
                <path
                  d="M 205 50 Q 235 110 205 170 L 265 170 Q 320 165 340 110 Q 320 55 265 50 Z"
                  fill="#0b1222"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                />
              )}
              {gate === 'XOR' && (
                <>
                  <path
                    d="M 192 50 Q 222 110 192 170"
                    fill="none"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                  />
                  <path
                    d="M 208 50 Q 238 110 208 170 L 268 170 Q 323 165 343 110 Q 323 55 268 50 Z"
                    fill="#0b1222"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                  />
                </>
              )}
              {gate === 'NOT' && (
                <>
                  <polygon
                    points="215,55 215,165 322,110"
                    fill="#0b1222"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                  />
                  <circle
                    cx={332}
                    cy={110}
                    r={10}
                    fill="#0b1222"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                  />
                </>
              )}

              <text
                x={gate === 'NOT' ? 255 : 272}
                y={115}
                textAnchor="middle"
                fill="#e2e8f0"
                fontSize="14"
                fontWeight="700"
                fontFamily="JetBrains Mono, monospace"
              >
                {gate}
              </text>

              {/* Output Wire */}
              <line
                x1={342}
                y1={110}
                x2={430}
                y2={110}
                stroke={output ? '#10b981' : '#475569'}
                strokeWidth={3.5}
              />

              {/* Output Node */}
              <rect
                x={430}
                y={85}
                width={108}
                height={50}
                rx={12}
                fill={output ? '#063326' : '#0f172a'}
                stroke={output ? '#10b981' : '#475569'}
                strokeWidth={2.5}
              />
              <text
                x={484}
                y={115}
                textAnchor="middle"
                fill={output ? '#6ee7b7' : '#cbd5e1'}
                fontSize="14"
                fontWeight="700"
                fontFamily="JetBrains Mono, monospace"
              >
                Q = {output ? 1 : 0}
              </text>
            </svg>
          </div>

          {/* Interactive Switch Controls */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-400/15 bg-[#04060c] p-3.5">
              <div className="mb-2 text-xs font-medium text-slate-300">{dl.inputA}</div>
              <button
                type="button"
                role="switch"
                aria-checked={inputA}
                onClick={() => setInputA((prev) => !prev)}
                className={`min-h-[42px] w-full rounded-lg border px-3 py-2 font-mono text-xs font-bold transition-colors cursor-pointer ${
                  inputA
                    ? 'border-sky-400/60 bg-sky-500/20 text-sky-200'
                    : 'border-slate-400/20 bg-slate-900/70 text-slate-300'
                }`}
              >
                {inputA ? dl.high : dl.low}
              </button>
            </div>

            <div className="rounded-xl border border-slate-400/15 bg-[#04060c] p-3.5">
              <div className="mb-2 text-xs font-medium text-slate-300">{dl.inputB}</div>
              <button
                type="button"
                role="switch"
                disabled={isUnary}
                aria-checked={!isUnary && inputB}
                onClick={() => setInputB((prev) => !prev)}
                className={`min-h-[42px] w-full rounded-lg border px-3 py-2 font-mono text-xs font-bold transition-colors disabled:opacity-40 cursor-pointer ${
                  !isUnary && inputB
                    ? 'border-sky-400/60 bg-sky-500/20 text-sky-200'
                    : 'border-slate-400/20 bg-slate-900/70 text-slate-300'
                }`}
              >
                {isUnary ? dl.notUsed : inputB ? dl.high : dl.low}
              </button>
            </div>

            <div className="rounded-xl border border-slate-400/15 bg-[#04060c] p-3.5">
              <div className="mb-2 text-xs font-medium text-slate-300">{dl.outputLabel}</div>
              <div
                className={`flex min-h-[42px] items-center justify-center rounded-lg border px-3 py-2 font-mono text-xs font-bold ${
                  output
                    ? 'border-emerald-400/60 bg-emerald-500/20 text-emerald-200'
                    : 'border-slate-400/20 bg-slate-900/70 text-slate-400'
                }`}
              >
                {output ? dl.high : dl.low}
              </div>
            </div>
          </div>
        </div>

        {/* Truth Table & Formula */}
        <aside className="glass-panel rounded-2xl p-4 sm:p-6 lg:col-span-5 space-y-5">
          <div>
            <h3 className="font-display text-base font-semibold text-white">
              {dl.truthTableTitle}
            </h3>
            <p className="mt-1 text-xs text-slate-400">{dl.activeRowHint}</p>
          </div>

          <div className="overflow-x-auto">
            <table
              dir="ltr"
              className="w-full border-collapse text-center font-mono text-xs tabular-nums"
            >
              <thead>
                <tr className="border-b border-slate-400/20 text-slate-400">
                  <th className="py-2.5 px-3 font-semibold">A</th>
                  {!isUnary && <th className="py-2.5 px-3 font-semibold">B</th>}
                  <th className="py-2.5 px-3 font-semibold text-blue-300">Q ({gate})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-400/10">
                {truthTable.map((row, idx) => {
                  const aVal = inputA ? 1 : 0;
                  const bVal = inputB ? 1 : 0;
                  const isActiveRow =
                    row.a === aVal && (isUnary || row.b === bVal);
                  return (
                    <tr
                      key={idx}
                      className={
                        isActiveRow
                          ? 'bg-blue-600/20 font-bold text-white'
                          : 'text-slate-300'
                      }
                    >
                      <td className="py-3 px-3">{row.a}</td>
                      {!isUnary && <td className="py-3 px-3">{row.b}</td>}
                      <td
                        className={`py-3 px-3 ${
                          row.out === 1 ? 'text-emerald-300' : 'text-slate-400'
                        }`}
                      >
                        {row.out}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="rounded-xl border border-slate-400/15 bg-[#04060c] p-4 space-y-1.5">
            <div className="text-[11px] text-slate-400">{dl.formulaLabel}</div>
            <div dir="ltr" className="font-mono text-sm font-bold text-violet-300">
              {gateInfo.formula}
            </div>
            <p className="pt-1 text-xs leading-relaxed text-slate-300">{gateInfo.desc}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
