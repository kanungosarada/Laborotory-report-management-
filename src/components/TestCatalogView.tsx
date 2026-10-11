import React from 'react';
import { ArrowUpRight } from 'lucide-react';

export type PresetProfileType =
  | 'complete'
  | 'blood-only'
  | 'urine-only'
  | 'urine-physical-only'
  | 'urine-chemical-only'
  | 'urine-microscopic-only'
  | 'fever-profile'
  | 'rheumatology-profile'
  | 'blood-group-only';

interface TestCatalogViewProps {
  onStartPresetReport: (preset: PresetProfileType) => void;
}

export const TestCatalogView: React.FC<TestCatalogViewProps> = ({
  onStartPresetReport,
}) => {
  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Babar Patho Lab — Diagnostic Test Directory & Reference Standards
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Standardized laboratory investigations, biological reference intervals, and one-click report templates.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onStartPresetReport('complete')}
          className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors whitespace-nowrap shrink-0"
        >
          Start Full Report
        </button>
      </div>

      {/* Quick Report Templates */}
      <div>
        <h2 className="text-base font-bold text-slate-900 mb-3">
          One-Click Report Section Templates
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="border border-slate-200 bg-white p-4 flex flex-col justify-between">
            <div>
              <div className="text-xs font-mono text-slate-500">
                CLINICAL PATHOLOGY
              </div>
              <h3 className="text-sm font-bold text-slate-900 mt-1">
                Urine Routine & Microscopy Only
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Includes only Physical (Colour, Transparency), Chemical (Glucose, Protein), and Microscopic (Pus, RBC, Crystal, Epithelial, Cast).
              </p>
            </div>
            <button
              type="button"
              onClick={() => onStartPresetReport('urine-only')}
              className="mt-4 inline-flex items-center justify-center gap-1.5 w-full px-3 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors"
            >
              Launch Urine-Only Report
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="border border-slate-200 bg-white p-4 flex flex-col justify-between">
            <div>
              <div className="text-xs font-mono text-slate-500">
                HAEMATOLOGY & SEROLOGY
              </div>
              <h3 className="text-sm font-bold text-slate-900 mt-1">
                Complete Blood Panel Only
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Includes Malaria Parasite, Widal (O, H, AH, BH), Blood Group, CRP, ASO, RA Factor, and ESR. Excludes Urine section.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onStartPresetReport('blood-only')}
              className="mt-4 inline-flex items-center justify-center gap-1.5 w-full px-3 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors"
            >
              Launch Blood-Only Report
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="border border-slate-200 bg-white p-4 flex flex-col justify-between">
            <div>
              <div className="text-xs font-mono text-slate-500">
                FEVER INVESTIGATION
              </div>
              <h3 className="text-sm font-bold text-slate-900 mt-1">
                Fever Profile (MP + Widal + CRP + ESR)
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Pre-selects Malaria Parasite, Widal (O, H, AH, BH), CRP, and ESR for acute febrile illness workup.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onStartPresetReport('fever-profile')}
              className="mt-4 inline-flex items-center justify-center gap-1.5 w-full px-3 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors"
            >
              Launch Fever Profile
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="border border-slate-200 bg-white p-4 flex flex-col justify-between">
            <div>
              <div className="text-xs font-mono text-slate-500">
                ARTHRITIS & INFLAMMATION
              </div>
              <h3 className="text-sm font-bold text-slate-900 mt-1">
                Rheumatology Panel (CRP + ASO + RA + ESR)
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Pre-selects C-Reactive Protein, ASO Titre, RA Factor, and ESR for joint and inflammatory evaluation.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onStartPresetReport('rheumatology-profile')}
              className="mt-4 inline-flex items-center justify-center gap-1.5 w-full px-3 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors"
            >
              Launch Rheumatology Panel
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Detailed Catalog Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Blood Test Reference Table */}
        <div className="border border-slate-200 bg-white">
          <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider">
              01. Blood Test Catalog (7 Core Investigations)
            </span>
            <span className="text-xs font-mono text-slate-300">
              Whole Blood / Serum
            </span>
          </div>
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                <th className="py-2.5 px-3 font-semibold">#</th>
                <th className="py-2.5 px-3 font-semibold">Investigation</th>
                <th className="py-2.5 px-3 font-semibold">Sub-Parameters</th>
                <th className="py-2.5 px-3 font-semibold">Reference Interval</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td className="py-2.5 px-3 font-mono">01</td>
                <td className="py-2.5 px-3 font-semibold text-slate-900">
                  Malaria Parasite (MP)
                </td>
                <td className="py-2.5 px-3 text-slate-600">
                  P. Vivax / P. Falciparum
                </td>
                <td className="py-2.5 px-3 font-mono text-slate-700">
                  Not Detected
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-mono">02</td>
                <td className="py-2.5 px-3 font-semibold text-slate-900">
                  Widal Test
                </td>
                <td className="py-2.5 px-3 font-mono text-slate-700">
                  S. Typhi O, H · S. Paratyphi AH, BH
                </td>
                <td className="py-2.5 px-3 font-mono text-slate-700">
                  &lt; 1:80 (Non-Reactive)
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-mono">03</td>
                <td className="py-2.5 px-3 font-semibold text-slate-900">
                  Blood Group
                </td>
                <td className="py-2.5 px-3 text-slate-600">
                  ABO Grouping &amp; Rh (D) Factor
                </td>
                <td className="py-2.5 px-3 font-mono text-slate-700">
                  A / B / AB / O · Rh +ve / -ve
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-mono">04</td>
                <td className="py-2.5 px-3 font-semibold text-slate-900">
                  CRP (C-Reactive Protein)
                </td>
                <td className="py-2.5 px-3 text-slate-600">
                  Latex / Turbidimetry
                </td>
                <td className="py-2.5 px-3 font-mono text-slate-700">
                  &lt; 6.0 mg/L (Negative)
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-mono">05</td>
                <td className="py-2.5 px-3 font-semibold text-slate-900">
                  ASO (Anti-Streptolysin O)
                </td>
                <td className="py-2.5 px-3 text-slate-600">Serum ASO Titre</td>
                <td className="py-2.5 px-3 font-mono text-slate-700">
                  &lt; 200 IU/mL (Negative)
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-mono">06</td>
                <td className="py-2.5 px-3 font-semibold text-slate-900">
                  RA Factor (Rheumatoid)
                </td>
                <td className="py-2.5 px-3 text-slate-600">Serum RF Titre</td>
                <td className="py-2.5 px-3 font-mono text-slate-700">
                  &lt; 20 IU/mL (Negative)
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-mono">07</td>
                <td className="py-2.5 px-3 font-semibold text-slate-900">
                  ESR (Westergren)
                </td>
                <td className="py-2.5 px-3 text-slate-600">1st Hour Reading</td>
                <td className="py-2.5 px-3 font-mono text-slate-700">
                  M: 0–15 · F: 0–20 mm/1st Hr
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Urine Test Reference Table */}
        <div className="border border-slate-200 bg-white">
          <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider">
              02. Urine Examination Catalog (3 Sub-Sections)
            </span>
            <span className="text-xs font-mono text-slate-300">
              Physical · Chemical · Microscopic
            </span>
          </div>
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                <th className="py-2.5 px-3 font-semibold">Sub-Section</th>
                <th className="py-2.5 px-3 font-semibold">Parameter Name</th>
                <th className="py-2.5 px-3 font-semibold">Normal Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td className="py-2 px-3 font-bold text-slate-800">
                  I. Physical Test
                </td>
                <td className="py-2 px-3 font-semibold text-slate-900">
                  1. Colour
                </td>
                <td className="py-2 px-3 font-mono text-slate-700">
                  Pale Yellow / Straw
                </td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-bold text-slate-800">
                  I. Physical Test
                </td>
                <td className="py-2 px-3 font-semibold text-slate-900">
                  2. Transparency
                </td>
                <td className="py-2 px-3 font-mono text-slate-700">Clear</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-bold text-slate-800">
                  II. Chemical Test
                </td>
                <td className="py-2 px-3 font-semibold text-slate-900">
                  1. Glucose (Sugar)
                </td>
                <td className="py-2 px-3 font-mono text-slate-700">
                  Nil (Absent)
                </td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-bold text-slate-800">
                  II. Chemical Test
                </td>
                <td className="py-2 px-3 font-semibold text-slate-900">
                  2. Protein (Albumin)
                </td>
                <td className="py-2 px-3 font-mono text-slate-700">
                  Nil (Absent)
                </td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-bold text-slate-800">
                  III. Microscopic Test
                </td>
                <td className="py-2 px-3 font-semibold text-slate-900">
                  1. Pus Cells (Leukocytes)
                </td>
                <td className="py-2 px-3 font-mono text-slate-700">
                  0 – 5 / hpf
                </td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-bold text-slate-800">
                  III. Microscopic Test
                </td>
                <td className="py-2 px-3 font-semibold text-slate-900">
                  2. RBC (Red Blood Cells)
                </td>
                <td className="py-2 px-3 font-mono text-slate-700">
                  Nil (0 – 2 / hpf)
                </td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-bold text-slate-800">
                  III. Microscopic Test
                </td>
                <td className="py-2 px-3 font-semibold text-slate-900">
                  3. Crystal
                </td>
                <td className="py-2 px-3 font-mono text-slate-700">
                  Nil (Absent)
                </td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-bold text-slate-800">
                  III. Microscopic Test
                </td>
                <td className="py-2 px-3 font-semibold text-slate-900">
                  4. Epithelial Cells
                </td>
                <td className="py-2 px-3 font-mono text-slate-700">
                  Few (1 – 4 / hpf)
                </td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-bold text-slate-800">
                  III. Microscopic Test
                </td>
                <td className="py-2 px-3 font-semibold text-slate-900">
                  5. Cast
                </td>
                <td className="py-2 px-3 font-mono text-slate-700">
                  Nil (Absent)
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
