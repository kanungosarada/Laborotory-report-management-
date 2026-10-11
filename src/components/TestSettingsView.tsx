import React, { useState } from 'react';
import {
  ArrowUp,
  ArrowDown,
  Plus,
  RotateCcw,
  Check,
  Layers,
} from 'lucide-react';
import {
  MasterTestTemplate,
  SectionKey,
  TestParameter,
} from '../types/lab';
import { DEFAULT_MASTER_TEST_TEMPLATE } from '../data/defaultCatalog';
import { BloodSectionEditor } from './BloodSectionEditor';
import { UrineSectionEditor } from './UrineSectionEditor';
import { PhysicalExamEditor } from './PhysicalExamEditor';

interface TestSettingsViewProps {
  masterTemplate: MasterTestTemplate;
  onChange: (updated: MasterTestTemplate) => void;
}

const SECTION_LABELS: Record<SectionKey, { title: string; desc: string }> = {
  blood: {
    title: 'Blood Test Section',
    desc: 'Haematology, Serology, Widal, Blood Group, CRP, ASO, RA, ESR & Custom Blood Tests',
  },
  urine: {
    title: 'Urine Examination Section',
    desc: 'Physical Test (Colour, Transparency), Chemical Test (Glucose, Protein) & Microscopic Test',
  },
  physical: {
    title: 'General Physical Examination Section',
    desc: 'Clinical Vitals (BP, Pulse, Temperature, Weight) & Physical Parameters',
  },
};

export const TestSettingsView: React.FC<TestSettingsViewProps> = ({
  masterTemplate,
  onChange,
}) => {
  const [savedBanner, setSavedBanner] = useState(false);

  // Quick Add New Test Form State
  const [targetDestination, setTargetDestination] = useState<string>('blood');
  const [newName, setNewName] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newUnit, setNewUnit] = useState('');
  const [newRef, setNewRef] = useState('');
  const [newMethod, setNewMethod] = useState('');
  const [newQuick, setNewQuick] = useState('Normal, Negative, Positive');

  const notifyAndSave = (updated: MasterTestTemplate) => {
    onChange(updated);
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 1800);
  };

  const moveSectionOrder = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= masterTemplate.sectionOrder.length) return;
    const nextOrder = [...masterTemplate.sectionOrder];
    const [moved] = nextOrder.splice(idx, 1);
    nextOrder.splice(target, 0, moved);
    notifyAndSave({ ...masterTemplate, sectionOrder: nextOrder });
  };

  const handleQuickCreateTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const createdParam: TestParameter = {
      id: `custom-param-${Date.now()}`,
      code:
        newCode.trim().toUpperCase() ||
        newName.trim().substring(0, 5).toUpperCase(),
      name: newName.trim(),
      included: true,
      result: '',
      unit: newUnit.trim(),
      referenceRange: newRef.trim() || 'Normal',
      method: newMethod.trim() || 'Standard',
      flag: 'normal',
      quickOptions: newQuick
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    };

    const next = structuredClone(masterTemplate);

    if (targetDestination === 'blood') {
      next.blood.items.push({
        id: `blood-item-${Date.now()}`,
        type: 'standard',
        param: createdParam,
      });
    } else if (targetDestination.startsWith('urine:')) {
      const subId = targetDestination.replace('urine:', '');
      const sub =
        next.urine.subSections.find((s) => s.id === subId) ||
        next.urine.subSections[0];
      if (sub) {
        sub.items.push(createdParam);
      }
    } else if (targetDestination === 'physical') {
      next.physicalExam.parameters.push(createdParam);
    }

    notifyAndSave(next);
    setNewName('');
    setNewCode('');
    setNewUnit('');
    setNewRef('');
    setNewMethod('');
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Test Settings &amp; Report Structure Builder
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Add new diagnostic tests, rearrange test print order (↑ / ↓), and edit every element (names, units, normal ranges, methods, and quick-fill buttons).
          </p>
        </div>

        <div className="flex items-center gap-3">
          {savedBanner && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
              <Check className="w-4 h-4" /> Synced to Report Workbench
            </span>
          )}
          <button
            type="button"
            onClick={() =>
              notifyAndSave(structuredClone(DEFAULT_MASTER_TEST_TEMPLATE))
            }
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded transition-colors whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Default Tests
          </button>
        </div>
      </div>

      {/* Top Grid: 1. Rearrange Main Report Sections + 2. Quick Add New Test Builder */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Section Print Order */}
        <div className="lg:col-span-5 border border-slate-200 bg-white p-5 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
            <Layers className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              01. Rearrange Main Section Order
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Use the Up / Down arrows to control the sequence in which main departments appear on the printed A4 report.
          </p>

          <div className="space-y-2 pt-1">
            {masterTemplate.sectionOrder.map((secKey, idx) => {
              const info = SECTION_LABELS[secKey];
              return (
                <div
                  key={secKey}
                  className="border border-slate-200 bg-slate-50 p-3 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 h-6 bg-slate-900 text-white font-mono text-xs font-bold flex items-center justify-center rounded shrink-0">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate">
                        {info.title}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {info.desc}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveSectionOrder(idx, -1)}
                      title="Move section up"
                      className="p-1.5 bg-white border border-slate-300 rounded text-slate-700 hover:bg-slate-100 disabled:opacity-30"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === masterTemplate.sectionOrder.length - 1}
                      onClick={() => moveSectionOrder(idx, 1)}
                      title="Move section down"
                      className="p-1.5 bg-white border border-slate-300 rounded text-slate-700 hover:bg-slate-100 disabled:opacity-30"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Quick Add New Test Form */}
        <form
          onSubmit={handleQuickCreateTest}
          className="lg:col-span-7 border border-slate-200 bg-white p-5 space-y-3.5"
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              02. Add New Test Parameter to Any Section
            </h2>
            <span className="text-xs text-slate-500">
              Saves permanently to Test Catalog &amp; Active Report
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-5">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Report Section
              </label>
              <select
                value={targetDestination}
                onChange={(e) => setTargetDestination(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-600"
              >
                <option value="blood">Blood Test Section</option>
                {masterTemplate.urine.subSections.map((sub) => (
                  <option key={sub.id} value={`urine:${sub.id}`}>
                    Urine: {sub.title}
                  </option>
                ))}
                <option value="physical">
                  General Physical Examination Section
                </option>
              </select>
            </div>

            <div className="sm:col-span-5">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                New Test Name *
              </label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Hemoglobin (Hb), Dengue NS1, Bile Salts..."
                className="w-full px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Short Code
              </label>
              <input
                type="text"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                placeholder="e.g. HB"
                className="w-full px-2.5 py-1.5 text-xs font-mono bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Measurement Unit
              </label>
              <input
                type="text"
                value={newUnit}
                onChange={(e) => setNewUnit(e.target.value)}
                placeholder="e.g. g/dL, mg/dL, /hpf"
                className="w-full px-2.5 py-1.5 text-xs font-mono bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="sm:col-span-5">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Biological Reference Range (Normal Value)
              </label>
              <input
                type="text"
                value={newRef}
                onChange={(e) => setNewRef(e.target.value)}
                placeholder="e.g. 13.0 – 17.0 g/dL or Negative"
                className="w-full px-2.5 py-1.5 text-xs font-mono bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="sm:col-span-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Method / Instrument
              </label>
              <input
                type="text"
                value={newMethod}
                onChange={(e) => setNewMethod(e.target.value)}
                placeholder="e.g. Cyanmethemoglobin, Rapid Card"
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Quick-Fill Result Buttons (Comma-separated)
              </label>
              <input
                type="text"
                value={newQuick}
                onChange={(e) => setNewQuick(e.target.value)}
                placeholder="e.g. Negative, Positive (+), 12.5, 14.0"
                className="w-full px-2.5 py-1.5 text-xs font-mono bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-600"
              />
            </div>

            <button
              type="submit"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Test to Section
            </button>
          </div>
        </form>
      </div>

      {/* Full Element & Order Editors for Each Section */}
      <div className="space-y-6">
        {masterTemplate.sectionOrder.map((secKey) => {
          if (secKey === 'blood') {
            return (
              <BloodSectionEditor
                key="blood"
                blood={masterTemplate.blood}
                settingsMode
                onChange={(updatedBlood) =>
                  notifyAndSave({ ...masterTemplate, blood: updatedBlood })
                }
              />
            );
          }
          if (secKey === 'urine') {
            return (
              <UrineSectionEditor
                key="urine"
                urine={masterTemplate.urine}
                settingsMode
                onChange={(updatedUrine) =>
                  notifyAndSave({ ...masterTemplate, urine: updatedUrine })
                }
              />
            );
          }
          return (
            <PhysicalExamEditor
              key="physical"
              physicalExam={masterTemplate.physicalExam}
              settingsMode
              onChange={(updatedPhys) =>
                notifyAndSave({ ...masterTemplate, physicalExam: updatedPhys })
              }
            />
          );
        })}
      </div>
    </div>
  );
};
