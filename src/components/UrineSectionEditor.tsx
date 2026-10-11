import React, { useState } from 'react';
import {
  Plus,
  ArrowUp,
  ArrowDown,
  SlidersHorizontal,
  Trash2,
} from 'lucide-react';
import {
  TestParameter,
  UrineSubSection,
  UrineTestSection,
} from '../types/lab';
import { ParameterEditorRow } from './ParameterEditorRow';

interface UrineSectionEditorProps {
  urine: UrineTestSection;
  onChange: (updated: UrineTestSection) => void;
  settingsMode?: boolean;
}

export const UrineSectionEditor: React.FC<UrineSectionEditorProps> = ({
  urine,
  onChange,
  settingsMode = false,
}) => {
  const [editingHeader, setEditingHeader] = useState(false);
  const [editingSubTitles, setEditingSubTitles] = useState<
    Record<string, boolean>
  >({});

  const handleSelectAllUrine = (selected: boolean) => {
    onChange({
      ...urine,
      enabled: selected ? true : urine.enabled,
      subSections: urine.subSections.map((sub) => ({
        ...sub,
        enabled: selected,
        items: sub.items.map((p) => ({ ...p, included: selected })),
      })),
    });
  };

  const handleFillNormalUrine = () => {
    onChange({
      ...urine,
      enabled: true,
      subSections: urine.subSections.map((sub) => ({
        ...sub,
        items: sub.items.map((p) => {
          if (!p.included) return p;
          const defaultNormal = p.quickOptions[0] || 'Nil';
          return { ...p, result: defaultNormal, flag: 'normal' as const };
        }),
      })),
    });
  };

  const updateSubSection = (subIdx: number, updatedSub: UrineSubSection) => {
    const next = [...urine.subSections];
    next[subIdx] = updatedSub;
    onChange({ ...urine, subSections: next });
  };

  const moveSubSection = (subIdx: number, dir: -1 | 1) => {
    const target = subIdx + dir;
    if (target < 0 || target >= urine.subSections.length) return;
    const next = [...urine.subSections];
    const [moved] = next.splice(subIdx, 1);
    next.splice(target, 0, moved);
    onChange({ ...urine, subSections: next });
  };

  const deleteSubSection = (subIdx: number) => {
    const next = urine.subSections.filter((_, i) => i !== subIdx);
    onChange({ ...urine, subSections: next });
  };

  const addNewSubSection = () => {
    const newSub: UrineSubSection = {
      id: `urine-sub-${Date.now()}`,
      title: 'ADDITIONAL URINE EXAMINATION SECTION',
      enabled: true,
      items: [
        {
          id: `urine-param-${Date.now()}`,
          code: 'PARAM',
          name: 'New Urine Parameter',
          included: true,
          result: '',
          unit: '',
          referenceRange: 'Normal / Nil',
          method: 'Standard',
          flag: 'normal',
          quickOptions: ['Nil', 'Normal', 'Present (+)'],
        },
      ],
    };
    onChange({
      ...urine,
      enabled: true,
      subSections: [...urine.subSections, newSub],
    });
  };

  const addParamToSub = (subIdx: number) => {
    const sub = urine.subSections[subIdx];
    const isMicro = sub.title.toLowerCase().includes('micro');
    const newParam: TestParameter = {
      id: `urine-param-${Date.now()}`,
      code: 'URINE',
      name: 'New Urine Parameter',
      included: true,
      result: '',
      unit: isMicro ? '/ hpf' : '',
      referenceRange: 'Nil / Normal',
      method: isMicro ? 'Microscopy' : 'Standard',
      flag: 'normal',
      quickOptions: ['Nil', 'Normal', 'Trace', 'Present (+)'],
    };
    updateSubSection(subIdx, {
      ...sub,
      enabled: true,
      items: [...sub.items, newParam],
    });
  };

  const moveParamInSub = (subIdx: number, pIdx: number, dir: -1 | 1) => {
    const sub = urine.subSections[subIdx];
    const target = pIdx + dir;
    if (target < 0 || target >= sub.items.length) return;
    const nextItems = [...sub.items];
    const [moved] = nextItems.splice(pIdx, 1);
    nextItems.splice(target, 0, moved);
    updateSubSection(subIdx, { ...sub, items: nextItems });
  };

  return (
    <div className="border border-slate-200 bg-white">
      {/* Section Header Bar */}
      <div className="px-4 py-3 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={urine.enabled}
            onChange={(e) => onChange({ ...urine, enabled: e.target.checked })}
            className="w-4 h-4 accent-blue-500 rounded cursor-pointer"
          />
          <span className="text-sm font-bold tracking-wide uppercase">
            {urine.sectionTitle}
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
            onClick={() => handleSelectAllUrine(true)}
            className="px-2.5 py-1 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded transition-colors whitespace-nowrap shrink-0"
          >
            Check All Urine
          </button>
          <button
            type="button"
            onClick={() => handleSelectAllUrine(false)}
            className="px-2.5 py-1 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded transition-colors whitespace-nowrap shrink-0"
          >
            Uncheck All
          </button>
          {!settingsMode && (
            <button
              type="button"
              onClick={handleFillNormalUrine}
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
              value={urine.sectionTitle}
              onChange={(e) =>
                onChange({ ...urine, sectionTitle: e.target.value })
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
              value={urine.departmentTag}
              onChange={(e) =>
                onChange({ ...urine, departmentTag: e.target.value })
              }
              className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-slate-300 rounded"
            />
          </div>
        </div>
      )}

      {!urine.enabled && !settingsMode ? (
        <div className="p-6 text-center bg-slate-50 text-slate-500 text-xs">
          Urine Test section is currently excluded from the printed report. Check the box above to include Urine Examination.
        </div>
      ) : (
        <div className="p-4 space-y-5">
          {urine.subSections.map((sub, subIdx) => {
            const isEditingSub =
              !!editingSubTitles[sub.id] || settingsMode;
            return (
              <div
                key={sub.id}
                className="border border-slate-200 p-3.5 bg-slate-50/40"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="flex items-center gap-0.5 shrink-0">
                      <button
                        type="button"
                        disabled={subIdx === 0}
                        onClick={() => moveSubSection(subIdx, -1)}
                        title="Move sub-section up"
                        className="p-1 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-30"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={subIdx === urine.subSections.length - 1}
                        onClick={() => moveSubSection(subIdx, 1)}
                        title="Move sub-section down"
                        className="p-1 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-30"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <input
                      type="checkbox"
                      checked={sub.enabled}
                      onChange={(e) =>
                        updateSubSection(subIdx, {
                          ...sub,
                          enabled: e.target.checked,
                        })
                      }
                      className="w-4 h-4 accent-blue-600 rounded shrink-0"
                    />

                    {isEditingSub ? (
                      <input
                        type="text"
                        value={sub.title}
                        onChange={(e) =>
                          updateSubSection(subIdx, {
                            ...sub,
                            title: e.target.value,
                          })
                        }
                        className="text-xs font-bold uppercase tracking-wider text-slate-900 bg-white border border-slate-300 px-2.5 py-1 rounded w-full"
                      />
                    ) : (
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-900 truncate">
                        {sub.title}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {!settingsMode && (
                      <button
                        type="button"
                        onClick={() =>
                          setEditingSubTitles((prev) => ({
                            ...prev,
                            [sub.id]: !prev[sub.id],
                          }))
                        }
                        className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 px-2 py-1 border border-slate-200 bg-white rounded"
                      >
                        <SlidersHorizontal className="w-3 h-3" />
                        <span>{isEditingSub ? 'Done' : 'Rename'}</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => addParamToSub(subIdx)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Parameter
                    </button>

                    {urine.subSections.length > 1 && (
                      <button
                        type="button"
                        onClick={() => deleteSubSection(subIdx)}
                        title="Delete sub-section"
                        className="p-1.5 text-rose-600 hover:bg-rose-50 bg-white border border-rose-200 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {(sub.enabled || settingsMode) && (
                  <div className="space-y-2.5">
                    {sub.items.map((param, pIdx) => (
                      <ParameterEditorRow
                        key={param.id}
                        param={param}
                        settingsMode={settingsMode}
                        canMoveUp={pIdx > 0}
                        canMoveDown={pIdx < sub.items.length - 1}
                        onMoveUp={() => moveParamInSub(subIdx, pIdx, -1)}
                        onMoveDown={() => moveParamInSub(subIdx, pIdx, 1)}
                        onChange={(updatedParam) => {
                          const nextItems = [...sub.items];
                          nextItems[pIdx] = updatedParam;
                          updateSubSection(subIdx, {
                            ...sub,
                            items: nextItems,
                          });
                        }}
                        onDelete={() => {
                          const nextItems = sub.items.filter(
                            (_, i) => i !== pIdx
                          );
                          updateSubSection(subIdx, {
                            ...sub,
                            items: nextItems,
                          });
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          <div className="pt-1">
            <button
              type="button"
              onClick={addNewSubSection}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add New Urine Sub-Section
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
