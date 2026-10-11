import React, { useState } from 'react';
import {
  Plus,
  ArrowUp,
  ArrowDown,
  SlidersHorizontal,
  Trash2,
} from 'lucide-react';
import {
  BloodGroupItem,
  BloodTestItem,
  BloodTestSection,
  BloodWidalItem,
  WidalDilutionRow,
} from '../types/lab';
import { ParameterEditorRow } from './ParameterEditorRow';

interface BloodSectionEditorProps {
  blood: BloodTestSection;
  onChange: (updated: BloodTestSection) => void;
  settingsMode?: boolean;
}

const WIDAL_QUICK_TITRES = [
  {
    label: 'Negative (< 1:20)',
    flag: 'normal' as const,
    dilutions: { d1_20: '-', d1_40: '-', d1_80: '-', d1_160: '-', d1_320: '-' },
  },
  {
    label: '1:20',
    flag: 'normal' as const,
    dilutions: { d1_20: '+', d1_40: '-', d1_80: '-', d1_160: '-', d1_320: '-' },
  },
  {
    label: '1:40',
    flag: 'normal' as const,
    dilutions: { d1_20: '+', d1_40: '+', d1_80: '-', d1_160: '-', d1_320: '-' },
  },
  {
    label: '1:80 (Reactive)',
    flag: 'abnormal' as const,
    dilutions: { d1_20: '+', d1_40: '+', d1_80: '+', d1_160: '-', d1_320: '-' },
  },
  {
    label: '1:160 (Reactive)',
    flag: 'abnormal' as const,
    dilutions: { d1_20: '+', d1_40: '+', d1_80: '+', d1_160: '+', d1_320: '-' },
  },
  {
    label: '1:320 (Reactive)',
    flag: 'critical' as const,
    dilutions: { d1_20: '+', d1_40: '+', d1_80: '+', d1_160: '+', d1_320: '+' },
  },
];

export const BloodSectionEditor: React.FC<BloodSectionEditorProps> = ({
  blood,
  onChange,
  settingsMode = false,
}) => {
  const [editingHeader, setEditingHeader] = useState(false);
  const [expandedBlocks, setExpandedBlocks] = useState<Record<string, boolean>>(
    {}
  );

  const toggleBlockMeta = (id: string) => {
    setExpandedBlocks((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const moveItem = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= blood.items.length) return;
    const next = [...blood.items];
    const [moved] = next.splice(index, 1);
    next.splice(target, 0, moved);
    onChange({ ...blood, items: next });
  };

  const updateItemAt = (index: number, updated: BloodTestItem) => {
    const next = [...blood.items];
    next[index] = updated;
    onChange({ ...blood, items: next });
  };

  const deleteItemAt = (index: number) => {
    const next = blood.items.filter((_, i) => i !== index);
    onChange({ ...blood, items: next });
  };

  const handleSelectAllBlood = (selected: boolean) => {
    const nextItems = blood.items.map((item) => {
      if (item.type === 'standard') {
        return { ...item, param: { ...item.param, included: selected } };
      }
      if (item.type === 'widal') {
        return {
          ...item,
          included: selected,
          rows: item.rows.map((r) => ({ ...r, included: selected })),
        };
      }
      return { ...item, included: selected };
    });
    onChange({
      ...blood,
      enabled: selected ? true : blood.enabled,
      items: nextItems,
    });
  };

  const handleFillNormalBlood = () => {
    const nextItems = blood.items.map((item) => {
      if (item.type === 'standard') {
        if (!item.param.included) return item;
        const defaultNormal =
          item.param.quickOptions[0] ||
          (item.param.code === 'ESR' ? '10' : 'Negative');
        return {
          ...item,
          param: { ...item.param, result: defaultNormal, flag: 'normal' as const },
        };
      }
      if (item.type === 'widal') {
        if (!item.included) return item;
        return {
          ...item,
          rows: item.rows.map((r) => ({
            ...r,
            resultTitre: r.included ? 'Negative (< 1:20)' : r.resultTitre,
            flag: 'normal' as const,
            dilutions: {
              d1_20: '-',
              d1_40: '-',
              d1_80: '-',
              d1_160: '-',
              d1_320: '-',
            },
          })),
        };
      }
      return item;
    });
    onChange({ ...blood, enabled: true, items: nextItems });
  };

  const handleAddStandardBloodTest = () => {
    const newId = `blood-std-${Date.now()}`;
    const newItem: BloodTestItem = {
      id: newId,
      type: 'standard',
      param: {
        id: `param-${Date.now()}`,
        code: 'TEST',
        name: 'New Blood Investigation',
        included: true,
        result: '',
        unit: '',
        referenceRange: 'Normal',
        method: 'Standard Method',
        flag: 'normal',
        quickOptions: ['Normal', 'Negative', 'Positive'],
      },
    };
    onChange({
      ...blood,
      enabled: true,
      items: [...blood.items, newItem],
    });
  };

  const renderWidalItem = (item: BloodWidalItem, index: number) => {
    const isMetaOpen = !!expandedBlocks[item.id] || settingsMode;

    const updateWidalRow = (rowIdx: number, updatedRow: WidalDilutionRow) => {
      const nextRows = [...item.rows];
      nextRows[rowIdx] = updatedRow;
      updateItemAt(index, { ...item, rows: nextRows });
    };

    const moveWidalRow = (rowIdx: number, dir: -1 | 1) => {
      const target = rowIdx + dir;
      if (target < 0 || target >= item.rows.length) return;
      const nextRows = [...item.rows];
      const [moved] = nextRows.splice(rowIdx, 1);
      nextRows.splice(target, 0, moved);
      updateItemAt(index, { ...item, rows: nextRows });
    };

    const addWidalAntigenRow = () => {
      const newRow: WidalDilutionRow = {
        id: `widal-row-${Date.now()}`,
        antigen: 'AG',
        label: 'New Widal Antigen',
        included: true,
        resultTitre: '',
        referenceRange: '< 1:80 (Non-Reactive)',
        flag: 'normal',
        dilutions: {
          d1_20: '-',
          d1_40: '-',
          d1_80: '-',
          d1_160: '-',
          d1_320: '-',
        },
      };
      updateItemAt(index, { ...item, rows: [...item.rows, newRow] });
    };

    return (
      <div
        key={item.id}
        className="border border-slate-200 p-3.5 bg-slate-50/50 space-y-3"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-200">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="flex items-center gap-0.5 shrink-0">
              <button
                type="button"
                disabled={index === 0}
                onClick={() => moveItem(index, -1)}
                title="Move Widal block up"
                className="p-1 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-30"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                disabled={index === blood.items.length - 1}
                onClick={() => moveItem(index, 1)}
                title="Move Widal block down"
                className="p-1 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-30"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
            </div>

            <input
              type="checkbox"
              checked={item.included}
              onChange={(e) =>
                updateItemAt(index, { ...item, included: e.target.checked })
              }
              className="w-4 h-4 accent-blue-600 rounded cursor-pointer shrink-0"
            />

            {isMetaOpen ? (
              <input
                type="text"
                value={item.name}
                onChange={(e) =>
                  updateItemAt(index, { ...item, name: e.target.value })
                }
                className="text-sm font-bold text-slate-900 bg-white border border-slate-300 px-2.5 py-1 rounded w-full focus:outline-none focus:border-blue-600"
              />
            ) : (
              <span className="text-sm font-bold text-slate-900 truncate">
                {item.name}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {item.included && (
              <div className="flex items-center gap-1 bg-slate-200/80 p-1 rounded">
                <button
                  type="button"
                  onClick={() =>
                    updateItemAt(index, { ...item, displayMode: 'titre' })
                  }
                  className={`px-2 py-0.5 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
                    item.displayMode === 'titre'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Titre List
                </button>
                <button
                  type="button"
                  onClick={() =>
                    updateItemAt(index, { ...item, displayMode: 'grid' })
                  }
                  className={`px-2 py-0.5 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
                    item.displayMode === 'grid'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Dilution Grid
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => toggleBlockMeta(item.id)}
              className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded border transition-colors ${
                isMetaOpen
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{isMetaOpen ? 'Done' : 'Edit Block'}</span>
            </button>

            <button
              type="button"
              onClick={() => deleteItemAt(index)}
              title="Delete Widal block"
              className="p-1.5 rounded border border-rose-200 bg-white text-rose-600 hover:bg-rose-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {isMetaOpen && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-white p-2.5 border border-slate-200 rounded">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Widal Block Heading
              </label>
              <input
                type="text"
                value={item.name}
                onChange={(e) =>
                  updateItemAt(index, { ...item, name: e.target.value })
                }
                className="w-full px-2.5 py-1 text-xs bg-slate-50 border border-slate-300 rounded"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Widal Method
              </label>
              <input
                type="text"
                value={item.method}
                onChange={(e) =>
                  updateItemAt(index, { ...item, method: e.target.value })
                }
                className="w-full px-2.5 py-1 text-xs bg-slate-50 border border-slate-300 rounded"
              />
            </div>
          </div>
        )}

        {item.included && (
          <div className="space-y-2">
            {item.rows.map((row, rIdx) => (
              <div
                key={row.id}
                className={`border p-2.5 bg-white ${
                  row.included ? 'border-slate-200' : 'border-slate-200 opacity-60'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="flex items-center gap-0.5 shrink-0">
                      <button
                        type="button"
                        disabled={rIdx === 0}
                        onClick={() => moveWidalRow(rIdx, -1)}
                        className="p-0.5 rounded border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-30"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        disabled={rIdx === item.rows.length - 1}
                        onClick={() => moveWidalRow(rIdx, 1)}
                        className="p-0.5 rounded border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-30"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                    </div>

                    <input
                      type="checkbox"
                      checked={row.included}
                      onChange={(e) =>
                        updateWidalRow(rIdx, {
                          ...row,
                          included: e.target.checked,
                        })
                      }
                      className="w-4 h-4 accent-blue-600 rounded shrink-0"
                    />

                    {isMetaOpen ? (
                      <div className="flex items-center gap-1.5 flex-1">
                        <input
                          type="text"
                          value={row.antigen}
                          onChange={(e) =>
                            updateWidalRow(rIdx, {
                              ...row,
                              antigen: e.target.value,
                            })
                          }
                          placeholder="Code"
                          className="w-14 px-1.5 py-0.5 text-xs font-mono font-bold bg-slate-50 border border-slate-300 rounded"
                        />
                        <input
                          type="text"
                          value={row.label}
                          onChange={(e) =>
                            updateWidalRow(rIdx, {
                              ...row,
                              label: e.target.value,
                            })
                          }
                          placeholder="Antigen Label"
                          className="flex-1 px-2 py-0.5 text-xs font-semibold bg-slate-50 border border-slate-300 rounded"
                        />
                        <input
                          type="text"
                          value={row.referenceRange}
                          onChange={(e) =>
                            updateWidalRow(rIdx, {
                              ...row,
                              referenceRange: e.target.value,
                            })
                          }
                          placeholder="Reference Range"
                          className="w-36 px-2 py-0.5 text-xs font-mono bg-slate-50 border border-slate-300 rounded"
                        />
                      </div>
                    ) : (
                      <>
                        <span className="text-xs font-bold font-mono px-1.5 py-0.5 bg-slate-100 text-slate-800 rounded shrink-0">
                          {row.antigen}
                        </span>
                        <span className="text-sm font-semibold text-slate-900 truncate">
                          {row.label}
                        </span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {!settingsMode && (
                      <>
                        <input
                          type="text"
                          disabled={!row.included}
                          value={row.resultTitre}
                          onChange={(e) =>
                            updateWidalRow(rIdx, {
                              ...row,
                              resultTitre: e.target.value,
                            })
                          }
                          placeholder="Enter titre (e.g. 1:80, Negative)..."
                          className={`w-48 px-2.5 py-1 text-sm font-mono tabular-nums border rounded focus:outline-none ${
                            row.flag !== 'normal'
                              ? 'bg-amber-50/60 border-amber-500 font-bold text-slate-950'
                              : 'bg-white border-slate-300 text-slate-900 focus:border-blue-600'
                          }`}
                        />

                        <button
                          type="button"
                          disabled={!row.included}
                          onClick={() =>
                            updateWidalRow(rIdx, {
                              ...row,
                              flag:
                                row.flag === 'normal' ? 'abnormal' : 'normal',
                            })
                          }
                          className={`px-2 py-1 text-xs font-mono rounded border whitespace-nowrap shrink-0 ${
                            row.flag !== 'normal'
                              ? 'bg-amber-600 text-white border-amber-600'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {row.flag !== 'normal' ? '▲ Reactive' : 'Normal'}
                        </button>
                      </>
                    )}

                    {item.rows.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const nextRows = item.rows.filter(
                            (_, i) => i !== rIdx
                          );
                          updateItemAt(index, { ...item, rows: nextRows });
                        }}
                        title="Remove antigen row"
                        className="p-1 text-rose-600 hover:bg-rose-50 rounded border border-rose-200"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                {!settingsMode && row.included && (
                  <div className="mt-2 pt-1.5 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] text-slate-400 mr-1">
                      Quick titre:
                    </span>
                    {WIDAL_QUICK_TITRES.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() =>
                          updateWidalRow(rIdx, {
                            ...row,
                            resultTitre: preset.label,
                            flag: preset.flag,
                            dilutions: { ...preset.dilutions },
                          })
                        }
                        className={`px-2 py-0.5 text-xs font-mono rounded transition-colors whitespace-nowrap shrink-0 ${
                          row.resultTitre === preset.label
                            ? 'bg-blue-600 text-white font-medium'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                    {row.resultTitre !== '' && (
                      <button
                        type="button"
                        onClick={() =>
                          updateWidalRow(rIdx, {
                            ...row,
                            resultTitre: '',
                            flag: 'normal',
                            dilutions: {
                              d1_20: '-',
                              d1_40: '-',
                              d1_80: '-',
                              d1_160: '-',
                              d1_320: '-',
                            },
                          })
                        }
                        className="px-2 py-0.5 text-xs text-rose-600 hover:bg-rose-50 rounded ml-auto"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                )}

                {!settingsMode &&
                  row.included &&
                  item.displayMode === 'grid' && (
                    <div className="mt-2 pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2.5 text-xs font-mono">
                      <span className="text-slate-500 font-sans">
                        Tube Dilutions (+ / -):
                      </span>
                      {(
                        [
                          ['d1_20', '1:20'],
                          ['d1_40', '1:40'],
                          ['d1_80', '1:80'],
                          ['d1_160', '1:160'],
                          ['d1_320', '1:320'],
                        ] as const
                      ).map(([dKey, label]) => (
                        <button
                          key={dKey}
                          type="button"
                          onClick={() => {
                            const current = row.dilutions[dKey];
                            const next = current === '+' ? '-' : '+';
                            updateWidalRow(rIdx, {
                              ...row,
                              dilutions: { ...row.dilutions, [dKey]: next },
                            });
                          }}
                          className={`px-2 py-1 rounded border font-bold ${
                            row.dilutions[dKey] === '+'
                              ? 'bg-amber-600 text-white border-amber-600'
                              : 'bg-slate-50 text-slate-700 border-slate-300'
                          }`}
                        >
                          {label}: {row.dilutions[dKey]}
                        </button>
                      ))}
                    </div>
                  )}
              </div>
            ))}

            <button
              type="button"
              onClick={addWidalAntigenRow}
              className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 hover:text-blue-900 pt-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Widal Antigen Row
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderBloodGroupItem = (item: BloodGroupItem, index: number) => {
    const isMetaOpen = !!expandedBlocks[item.id] || settingsMode;

    return (
      <div
        key={item.id}
        className="border border-slate-200 p-3.5 bg-white space-y-3"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="flex items-center gap-0.5 shrink-0">
              <button
                type="button"
                disabled={index === 0}
                onClick={() => moveItem(index, -1)}
                title="Move Blood Group up"
                className="p-1 rounded border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                disabled={index === blood.items.length - 1}
                onClick={() => moveItem(index, 1)}
                title="Move Blood Group down"
                className="p-1 rounded border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
            </div>

            <input
              type="checkbox"
              checked={item.included}
              onChange={(e) =>
                updateItemAt(index, { ...item, included: e.target.checked })
              }
              className="w-4 h-4 accent-blue-600 rounded cursor-pointer shrink-0"
            />

            {isMetaOpen ? (
              <input
                type="text"
                value={item.name}
                onChange={(e) =>
                  updateItemAt(index, { ...item, name: e.target.value })
                }
                className="text-sm font-bold text-slate-900 bg-slate-50 border border-slate-300 px-2.5 py-1 rounded w-full"
              />
            ) : (
              <span className="text-sm font-bold text-slate-900 truncate">
                {item.name}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => toggleBlockMeta(item.id)}
              className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded border transition-colors ${
                isMetaOpen
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{isMetaOpen ? 'Done' : 'Edit Element'}</span>
            </button>

            <button
              type="button"
              onClick={() => deleteItemAt(index)}
              title="Delete Blood Group block"
              className="p-1.5 rounded border border-rose-200 text-rose-600 hover:bg-rose-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {isMetaOpen && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 bg-slate-50 p-2.5 border border-slate-200 rounded">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Field 1 Label (ABO)
              </label>
              <input
                type="text"
                value={item.aboLabel}
                onChange={(e) =>
                  updateItemAt(index, { ...item, aboLabel: e.target.value })
                }
                className="w-full px-2 py-1 text-xs bg-white border border-slate-300 rounded"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Field 2 Label (Rh)
              </label>
              <input
                type="text"
                value={item.rhLabel}
                onChange={(e) =>
                  updateItemAt(index, { ...item, rhLabel: e.target.value })
                }
                className="w-full px-2 py-1 text-xs bg-white border border-slate-300 rounded"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Reference Interval
              </label>
              <input
                type="text"
                value={item.referenceRange}
                onChange={(e) =>
                  updateItemAt(index, {
                    ...item,
                    referenceRange: e.target.value,
                  })
                }
                className="w-full px-2 py-1 text-xs bg-white border border-slate-300 rounded"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Method
              </label>
              <input
                type="text"
                value={item.method}
                onChange={(e) =>
                  updateItemAt(index, { ...item, method: e.target.value })
                }
                className="w-full px-2 py-1 text-xs bg-white border border-slate-300 rounded"
              />
            </div>
          </div>
        )}

        {!settingsMode && item.included && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {item.aboLabel}
              </label>
              <input
                type="text"
                value={item.aboGroup}
                onChange={(e) =>
                  updateItemAt(index, { ...item, aboGroup: e.target.value })
                }
                placeholder="Enter ABO Group (e.g. 'A', 'B', 'AB', 'O')..."
                className="w-full px-3 py-1.5 text-sm font-mono font-bold border border-slate-300 rounded focus:outline-none focus:border-blue-600"
              />
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-slate-400 mr-1">
                  Quick select:
                </span>
                {item.aboQuickOptions.map((grp) => (
                  <button
                    key={grp}
                    type="button"
                    onClick={() =>
                      updateItemAt(index, { ...item, aboGroup: grp })
                    }
                    className={`px-2.5 py-0.5 text-xs font-mono font-bold rounded transition-colors ${
                      item.aboGroup === grp
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                    }`}
                  >
                    Group {grp}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {item.rhLabel}
              </label>
              <input
                type="text"
                value={item.rhFactor}
                onChange={(e) =>
                  updateItemAt(index, { ...item, rhFactor: e.target.value })
                }
                placeholder="Enter Rh Factor (Positive / Negative)..."
                className="w-full px-3 py-1.5 text-sm font-mono font-bold border border-slate-300 rounded focus:outline-none focus:border-blue-600"
              />
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-slate-400 mr-1">
                  Quick select:
                </span>
                {item.rhQuickOptions.map((rh) => (
                  <button
                    key={rh}
                    type="button"
                    onClick={() =>
                      updateItemAt(index, { ...item, rhFactor: rh })
                    }
                    className={`px-2.5 py-0.5 text-xs font-mono font-semibold rounded transition-colors ${
                      item.rhFactor === rh
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                    }`}
                  >
                    {rh}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="border border-slate-200 bg-white">
      {/* Section Header Bar */}
      <div className="px-4 py-3 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={blood.enabled}
            onChange={(e) => onChange({ ...blood, enabled: e.target.checked })}
            className="w-4 h-4 accent-blue-500 rounded cursor-pointer"
          />
          <span className="text-sm font-bold tracking-wide uppercase">
            {blood.sectionTitle}
          </span>
        </label>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setEditingHeader(!editingHeader)}
            className="px-2.5 py-1 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded transition-colors whitespace-nowrap shrink-0"
          >
            {editingHeader ? 'Done Heading' : 'Edit Section Title'}
          </button>
          <button
            type="button"
            onClick={() => handleSelectAllBlood(true)}
            className="px-2.5 py-1 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded transition-colors whitespace-nowrap shrink-0"
          >
            Check All
          </button>
          <button
            type="button"
            onClick={() => handleSelectAllBlood(false)}
            className="px-2.5 py-1 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded transition-colors whitespace-nowrap shrink-0"
          >
            Uncheck All
          </button>
          {!settingsMode && (
            <button
              type="button"
              onClick={handleFillNormalBlood}
              className="px-2.5 py-1 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors whitespace-nowrap shrink-0"
            >
              Auto-Fill Normal
            </button>
          )}
        </div>
      </div>

      {editingHeader && (
        <div className="p-3 bg-slate-100 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Printed Section Banner Title
            </label>
            <input
              type="text"
              value={blood.sectionTitle}
              onChange={(e) =>
                onChange({ ...blood, sectionTitle: e.target.value })
              }
              className="w-full px-3 py-1.5 text-xs font-bold bg-white border border-slate-300 rounded"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Department Right Tag
            </label>
            <input
              type="text"
              value={blood.departmentTag}
              onChange={(e) =>
                onChange({ ...blood, departmentTag: e.target.value })
              }
              className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-slate-300 rounded"
            />
          </div>
        </div>
      )}

      {!blood.enabled && !settingsMode ? (
        <div className="p-6 text-center bg-slate-50 text-slate-500 text-xs">
          Blood Test section is currently excluded from the printed report. Check the box above to include Blood Tests.
        </div>
      ) : (
        <div className="p-4 space-y-3">
          {blood.items.map((item, idx) => {
            if (item.type === 'standard') {
              return (
                <ParameterEditorRow
                  key={item.id}
                  param={item.param}
                  settingsMode={settingsMode}
                  canMoveUp={idx > 0}
                  canMoveDown={idx < blood.items.length - 1}
                  onMoveUp={() => moveItem(idx, -1)}
                  onMoveDown={() => moveItem(idx, 1)}
                  onChange={(updatedParam) =>
                    updateItemAt(idx, { ...item, param: updatedParam })
                  }
                  onDelete={() => deleteItemAt(idx)}
                />
              );
            }
            if (item.type === 'widal') {
              return renderWidalItem(item, idx);
            }
            return renderBloodGroupItem(item, idx);
          })}

          <div className="pt-2 flex flex-wrap items-center gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleAddStandardBloodTest}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add New Blood Test Parameter
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
