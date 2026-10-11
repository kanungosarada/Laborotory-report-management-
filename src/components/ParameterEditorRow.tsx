import React, { useState } from 'react';
import {
  SlidersHorizontal,
  Trash2,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { TestFlag, TestParameter } from '../types/lab';

interface ParameterEditorRowProps {
  param: TestParameter;
  onChange: (updated: TestParameter) => void;
  onDelete?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  defaultExpanded?: boolean;
  settingsMode?: boolean;
}

export const ParameterEditorRow: React.FC<ParameterEditorRowProps> = ({
  param,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp = false,
  canMoveDown = false,
  defaultExpanded = false,
  settingsMode = false,
}) => {
  const [showMeta, setShowMeta] = useState(defaultExpanded);
  const [quickOptionsInput, setQuickOptionsInput] = useState(
    param.quickOptions.join(', ')
  );

  const handleFlagCycle = () => {
    const order: TestFlag[] = ['normal', 'abnormal', 'critical'];
    const next = order[(order.indexOf(param.flag) + 1) % order.length];
    onChange({ ...param, flag: next });
  };

  const handleQuickOptionsBlur = () => {
    const parsed = quickOptionsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    onChange({ ...param, quickOptions: parsed });
  };

  return (
    <div
      className={`border transition-colors p-3 ${
        param.included
          ? 'bg-white border-slate-200'
          : 'bg-slate-50/70 border-slate-200/60 opacity-65'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 justify-between">
        {/* Left: Reorder Arrows + Checkbox + Parameter Name */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {(onMoveUp || onMoveDown) && (
            <div className="flex items-center gap-0.5 shrink-0">
              <button
                type="button"
                disabled={!canMoveUp}
                onClick={onMoveUp}
                title="Move test up"
                className="p-1 rounded border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                disabled={!canMoveDown}
                onClick={onMoveDown}
                title="Move test down"
                className="p-1 rounded border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <input
            type="checkbox"
            checked={param.included}
            onChange={(e) => onChange({ ...param, included: e.target.checked })}
            className="w-4 h-4 accent-blue-600 rounded cursor-pointer shrink-0"
            aria-label={`Include ${param.name} in report`}
          />

          {showMeta || settingsMode ? (
            <input
              type="text"
              value={param.name}
              onChange={(e) => onChange({ ...param, name: e.target.value })}
              placeholder="Test Parameter Name..."
              className="text-sm font-semibold text-slate-900 bg-slate-50 border border-slate-300 px-2.5 py-1 rounded w-full focus:outline-none focus:border-blue-600"
            />
          ) : (
            <label
              onClick={() => onChange({ ...param, included: !param.included })}
              className="text-sm font-semibold text-slate-900 cursor-pointer select-none truncate"
            >
              {param.name}
            </label>
          )}
        </div>

        {/* Right: Result Input (if not pure settings mode) + Flag Toggle + Edit Full Element + Delete */}
        <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
          {!settingsMode && (
            <>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={param.result}
                  disabled={!param.included}
                  onChange={(e) =>
                    onChange({ ...param, result: e.target.value })
                  }
                  placeholder="Enter result..."
                  className={`w-40 sm:w-48 px-2.5 py-1.5 text-sm font-mono tabular-nums border rounded focus:outline-none transition-colors ${
                    !param.included
                      ? 'bg-slate-100 text-slate-400 border-slate-200'
                      : param.flag === 'critical'
                      ? 'bg-rose-50/50 border-rose-500 text-rose-950 font-bold'
                      : param.flag === 'abnormal'
                      ? 'bg-amber-50/50 border-amber-500 text-slate-950 font-bold'
                      : 'bg-white border-slate-300 text-slate-900 focus:border-blue-600'
                  }`}
                />
                {param.unit && (
                  <span className="ml-1.5 text-xs font-mono text-slate-500 whitespace-nowrap">
                    {param.unit}
                  </span>
                )}
              </div>

              <button
                type="button"
                disabled={!param.included}
                onClick={handleFlagCycle}
                title="Click to toggle Normal / Abnormal / Critical flag on report"
                className={`px-2 py-1.5 text-xs font-mono font-medium rounded border transition-colors whitespace-nowrap shrink-0 ${
                  param.flag === 'critical'
                    ? 'bg-rose-600 text-white border-rose-600'
                    : param.flag === 'abnormal'
                    ? 'bg-amber-600 text-white border-amber-600'
                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                }`}
              >
                {param.flag === 'critical'
                  ? '✖ Critical'
                  : param.flag === 'abnormal'
                  ? '▲ Abnormal'
                  : 'Normal'}
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => {
              setQuickOptionsInput(param.quickOptions.join(', '));
              setShowMeta(!showMeta);
            }}
            title="Edit Full Element (Name, Unit, Reference Range, Method, Quick-Fill Options)"
            className={`inline-flex items-center gap-1 px-2 py-1.5 text-xs font-medium rounded border transition-colors whitespace-nowrap shrink-0 ${
              showMeta
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{showMeta ? 'Done' : 'Edit Element'}</span>
          </button>

          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              title="Delete this test parameter"
              className="p-1.5 rounded border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Quick-Fill Suggestions for Laboratorian */}
      {!settingsMode && param.included && param.quickOptions.length > 0 && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-slate-100">
          <span className="text-[11px] text-slate-400 mr-1">Quick fill:</span>
          {param.quickOptions.map((opt) => {
            const isSelected = param.result === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  const lower = opt.toLowerCase();
                  const looksAbnormal =
                    lower.includes('positive') ||
                    lower.includes('vivax') ||
                    lower.includes('falciparum') ||
                    lower.includes('turbid') ||
                    lower.includes('trace') ||
                    lower.includes('present') ||
                    lower.includes('plenty') ||
                    lower.includes('oxalate') ||
                    lower.includes('cast');
                  onChange({
                    ...param,
                    result: opt,
                    flag: looksAbnormal ? 'abnormal' : 'normal',
                  });
                }}
                className={`px-2 py-0.5 text-xs font-mono rounded transition-colors whitespace-nowrap shrink-0 ${
                  isSelected
                    ? 'bg-blue-600 text-white font-medium'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {opt}
              </button>
            );
          })}
          {param.result !== '' && (
            <button
              type="button"
              onClick={() => onChange({ ...param, result: '', flag: 'normal' })}
              className="px-2 py-0.5 text-xs text-rose-600 hover:bg-rose-50 rounded transition-colors ml-auto whitespace-nowrap shrink-0"
            >
              Clear
            </button>
          )}
        </div>
      )}

      {/* Reference range summary */}
      <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500">
        <span>
          Unit:{' '}
          <span className="font-mono text-slate-700">{param.unit || '—'}</span>{' '}
          · Reference:{' '}
          <span className="font-mono text-slate-700">
            {param.referenceRange || '—'}
          </span>
          {param.method ? ` · Method: ${param.method}` : ''}
        </span>
      </div>

      {/* Full Element Editor Drawer */}
      {showMeta && (
        <div className="mt-3 pt-3 border-t border-slate-200 bg-slate-50 p-3 rounded space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Test Parameter Name (Printed on Report)
              </label>
              <input
                type="text"
                value={param.name}
                onChange={(e) => onChange({ ...param, name: e.target.value })}
                placeholder="Test Name"
                className="w-full px-2.5 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Short Code
              </label>
              <input
                type="text"
                value={param.code}
                onChange={(e) => onChange({ ...param, code: e.target.value })}
                placeholder="e.g. MP, CRP"
                className="w-full px-2.5 py-1.5 text-xs font-mono bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Unit
              </label>
              <input
                type="text"
                value={param.unit}
                onChange={(e) => onChange({ ...param, unit: e.target.value })}
                placeholder="e.g. mg/L, / hpf"
                className="w-full px-2.5 py-1.5 text-xs font-mono bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Biological Reference Interval (Normal Value)
              </label>
              <input
                type="text"
                value={param.referenceRange}
                onChange={(e) =>
                  onChange({ ...param, referenceRange: e.target.value })
                }
                placeholder="e.g. < 6.0 mg/L (Negative)"
                className="w-full px-2.5 py-1.5 text-xs font-mono bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Test Method / Instrument
              </label>
              <input
                type="text"
                value={param.method || ''}
                onChange={(e) => onChange({ ...param, method: e.target.value })}
                placeholder="e.g. Latex Agglutination, Westergren"
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Quick-Fill Suggestion Buttons (Comma-separated values)
            </label>
            <input
              type="text"
              value={quickOptionsInput}
              onChange={(e) => setQuickOptionsInput(e.target.value)}
              onBlur={handleQuickOptionsBlur}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleQuickOptionsBlur();
                }
              }}
              placeholder="e.g. Negative, Positive (+), 1:80, 1:160"
              className="w-full px-2.5 py-1.5 text-xs font-mono bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-600"
            />
          </div>
        </div>
      )}
    </div>
  );
};
