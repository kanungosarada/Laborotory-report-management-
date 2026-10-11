import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { StandalonePhysicalSection, TestParameter } from '../types/lab';
import { ParameterEditorRow } from './ParameterEditorRow';

interface PhysicalExamEditorProps {
  physicalExam: StandalonePhysicalSection;
  onChange: (updated: StandalonePhysicalSection) => void;
  settingsMode?: boolean;
}

export const PhysicalExamEditor: React.FC<PhysicalExamEditorProps> = ({
  physicalExam,
  onChange,
  settingsMode = false,
}) => {
  const [editingHeader, setEditingHeader] = useState(false);

  const handleAddParam = () => {
    const newParam: TestParameter = {
      id: `phys-custom-${Date.now()}`,
      code: 'PHYS',
      name: 'New Physical / Clinical Parameter',
      included: true,
      result: '',
      unit: '',
      referenceRange: 'Normal',
      method: 'Clinical Examination',
      flag: 'normal',
      quickOptions: ['Normal', 'Absent', 'Present'],
    };
    onChange({
      ...physicalExam,
      enabled: true,
      parameters: [...physicalExam.parameters, newParam],
    });
  };

  const moveParam = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= physicalExam.parameters.length) return;
    const next = [...physicalExam.parameters];
    const [moved] = next.splice(index, 1);
    next.splice(target, 0, moved);
    onChange({ ...physicalExam, parameters: next });
  };

  return (
    <div className="border border-slate-200 bg-white">
      <div className="px-4 py-3 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={physicalExam.enabled}
            onChange={(e) =>
              onChange({ ...physicalExam, enabled: e.target.checked })
            }
            className="w-4 h-4 accent-blue-500 rounded cursor-pointer"
          />
          <span className="text-sm font-bold tracking-wide uppercase">
            {physicalExam.sectionTitle}
          </span>
        </label>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setEditingHeader(!editingHeader)}
            className="px-2.5 py-1 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded transition-colors whitespace-nowrap shrink-0"
          >
            {editingHeader ? 'Done Heading' : 'Edit Section Title'}
          </button>

          <button
            type="button"
            onClick={handleAddParam}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5" /> Add Parameter
          </button>
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
              value={physicalExam.sectionTitle}
              onChange={(e) =>
                onChange({ ...physicalExam, sectionTitle: e.target.value })
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
              value={physicalExam.departmentTag}
              onChange={(e) =>
                onChange({ ...physicalExam, departmentTag: e.target.value })
              }
              className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-slate-300 rounded"
            />
          </div>
        </div>
      )}

      {!physicalExam.enabled && !settingsMode ? (
        <div className="p-5 text-center bg-slate-50 text-slate-500 text-xs">
          General Physical Vitals section is excluded from the report. Check the box above to include it.
        </div>
      ) : (
        <div className="p-4 space-y-2.5">
          {physicalExam.parameters.map((param, idx) => (
            <ParameterEditorRow
              key={param.id}
              param={param}
              settingsMode={settingsMode}
              canMoveUp={idx > 0}
              canMoveDown={idx < physicalExam.parameters.length - 1}
              onMoveUp={() => moveParam(idx, -1)}
              onMoveDown={() => moveParam(idx, 1)}
              onChange={(updated) => {
                const next = [...physicalExam.parameters];
                next[idx] = updated;
                onChange({ ...physicalExam, parameters: next });
              }}
              onDelete={() => {
                const next = physicalExam.parameters.filter(
                  (_, i) => i !== idx
                );
                onChange({ ...physicalExam, parameters: next });
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
