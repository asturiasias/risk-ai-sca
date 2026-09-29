import React, { useState } from 'react';
import { Check, Edit3, AlertCircle, Info, RefreshCw, ArrowRight, ShieldAlert } from 'lucide-react';
import { PatientRecord, DataField, ReviewStatus } from '../types/clinical';
import { CLINICAL_DICTIONARY, formatValueForDisplay } from '../services/clinicalDictionary';
import { calculateCockcroftGault } from '../services/calculators/cockcroftGault';

interface PatientReviewViewProps {
  patient: PatientRecord;
  onUpdatePatient: (updated: PatientRecord) => void;
  onProceedToScores: () => void;
}

export const PatientReviewView: React.FC<PatientReviewViewProps> = ({
  patient,
  onUpdatePatient,
  onProceedToScores
}) => {
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('todos');

  const categories = [
    { id: 'todos', label: 'Todas las Variables' },
    { id: 'identificacion', label: 'Identificación y Contexto' },
    { id: 'antecedentes', label: 'Antecedentes y Riesgos' },
    { id: 'presentacion', label: 'Presentación y ECG' },
    { id: 'anatomia', label: 'Anatomía e ICP' },
    { id: 'laboratorio', label: 'Laboratorio y Riñón' },
    { id: 'ventricular_biomarcadores', label: 'FEVI y Troponinas' },
    { id: 'lipidos', label: 'Perfil Lipídico' },
    { id: 'farmacos_documentados', label: 'Fármacos Documentados' },
    { id: 'duraciones', label: 'Duraciones DAPT' }
  ];

  const handleStartEdit = (key: string, currentVal: any) => {
    setEditingKey(key);
    setEditValue(currentVal === null || currentVal === undefined ? '' : String(currentVal));
  };

  const handleSaveEdit = (key: string) => {
    const fieldDef = CLINICAL_DICTIONARY.find(d => d.key === key);
    let parsedValue: any = editValue.trim();

    if (parsedValue === '' || parsedValue === '.') {
      parsedValue = null;
    } else if (fieldDef?.type === 'numeric' || fieldDef?.type === 'binary') {
      const num = Number(parsedValue.replace(',', '.'));
      parsedValue = isNaN(num) ? null : num;
    }

    const updatedData = { ...patient.data };
    const currentField = updatedData[key];

    updatedData[key] = {
      ...currentField,
      value: parsedValue,
      normalizedValue: parsedValue,
      reviewStatus: 'modificado',
      method: 'medico'
    };

    // Recalcular Cockcroft-Gault automáticamente si se altera edad, peso, creatinina o sexo
    if (['edad', 'peso_kg', 'creatinina_ingreso', 'sexo'].includes(key)) {
      const e = updatedData.edad?.value;
      const p = updatedData.peso_kg?.value;
      const c = updatedData.creatinina_ingreso?.value;
      const s = updatedData.sexo?.value;
      const cg = calculateCockcroftGault(e, p, c, s);
      if (updatedData.aclaramiento_creatinina_cg) {
        updatedData.aclaramiento_creatinina_cg = {
          ...updatedData.aclaramiento_creatinina_cg,
          value: cg.crCl,
          normalizedValue: cg.crCl,
          method: 'calculado',
          supportQuote: cg.formulaString,
          reviewStatus: 'revisado'
        };
      }
    }

    const updatedPatient: PatientRecord = {
      ...patient,
      data: updatedData,
      updatedAt: new Date().toISOString(),
      // Al editar un dato, se invalida el estado general previo
      reviewStatus: 'modificado'
    };

    onUpdatePatient(updatedPatient);
    setEditingKey(null);
  };

  const handleToggleValidation = (key: string) => {
    const updatedData = { ...patient.data };
    const current = updatedData[key];
    const newStatus: ReviewStatus = current.reviewStatus === 'revisado' ? 'pendiente' : 'revisado';

    updatedData[key] = {
      ...current,
      reviewStatus: newStatus
    };

    onUpdatePatient({
      ...patient,
      data: updatedData,
      updatedAt: new Date().toISOString()
    });
  };

  const handleAcceptAll = () => {
    const updatedData = { ...patient.data };
    for (const key of Object.keys(updatedData)) {
      if (updatedData[key].reviewStatus === 'pendiente') {
        updatedData[key].reviewStatus = 'revisado';
      }
    }

    onUpdatePatient({
      ...patient,
      data: updatedData,
      reviewStatus: 'revisado',
      updatedAt: new Date().toISOString()
    });
  };

  const filteredDefs = CLINICAL_DICTIONARY.filter(def => {
    if (activeCategory === 'todos') return true;
    return def.category === activeCategory;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Overview Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Revisión Médica y Trazabilidad de Variables Clínicas
              </h1>
              <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                patient.reviewStatus === 'revisado' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                {patient.reviewStatus === 'revisado' ? 'Conjunto Validado por Médico' : 'Revisión Pendiente'}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl">
              Verifique el valor normalizado, origen documental y fragmento de apoyo para cada variable. Puede editar cualquier dato;
              la modificación recalcula de inmediato los scores dependientes.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleAcceptAll}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              Validar Todo el Conjunto
            </button>
            <button
              onClick={onProceedToScores}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded transition-colors flex items-center gap-1.5 shadow-sm"
            >
              Calcular Scores
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Categories Tab Bar */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              className={`px-3 py-1.5 rounded whitespace-nowrap transition-colors ${
                activeCategory === c.id
                  ? 'bg-slate-900 text-white font-medium'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Variables Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <div className="px-5 py-3 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-700">
            Mostrando {filteredDefs.length} variables ({activeCategory})
          </span>
          <span className="text-[11px] text-slate-500">
            Valores faltantes codificados con punto literal <code className="font-mono font-bold">.</code>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold uppercase text-[11px]">
                <th className="py-2.5 px-4 w-1/4">Variable y Encabezado Oficial</th>
                <th className="py-2.5 px-4 w-1/6">Valor Normalizado</th>
                <th className="py-2.5 px-4 w-1/12">Método</th>
                <th className="py-2.5 px-4">Evidencia Textual de Apoyo (Trazabilidad)</th>
                <th className="py-2.5 px-4 w-28 text-right">Acción / Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDefs.map(def => {
                const field: DataField | undefined = patient.data[def.key];
                const isEditing = editingKey === def.key;
                const displayVal = formatValueForDisplay(field?.value);
                const isMissing = field?.value === null || field?.value === undefined;

                return (
                  <tr key={def.key} className="hover:bg-slate-50/60 transition-colors">
                    {/* Columna 1: Variable y Definición */}
                    <td className="py-2.5 px-4 align-top">
                      <span className="font-medium text-slate-900 block">{def.shortLabel}</span>
                      <span className="text-[10px] text-slate-400 font-mono block mt-0.5" title={def.header}>
                        {def.header}
                      </span>
                    </td>

                    {/* Columna 2: Valor */}
                    <td className="py-2.5 px-4 align-top">
                      {isEditing ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={editValue}
                            onChange={e => setEditValue(e.target.value)}
                            className="w-24 px-2 py-1 text-xs border border-teal-500 rounded font-mono focus:outline-none"
                            autoFocus
                            onKeyDown={e => {
                              if (e.key === 'Enter') handleSaveEdit(def.key);
                              if (e.key === 'Escape') setEditingKey(null);
                            }}
                          />
                          <button
                            onClick={() => handleSaveEdit(def.key)}
                            className="px-2 py-1 text-[11px] bg-teal-600 text-white rounded hover:bg-teal-700"
                          >
                            OK
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-mono text-xs px-2 py-0.5 rounded font-semibold ${
                              isMissing
                                ? 'text-slate-400 bg-slate-100'
                                : 'text-slate-900 bg-slate-50 border border-slate-200'
                            }`}
                          >
                            {displayVal} {def.unit && !isMissing ? <span className="text-[10px] font-normal text-slate-500">{def.unit}</span> : null}
                          </span>
                          <button
                            onClick={() => handleStartEdit(def.key, field?.value)}
                            className="text-slate-400 hover:text-teal-700 p-0.5"
                            title="Modificar manualmente este dato"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </td>

                    {/* Columna 3: Método */}
                    <td className="py-2.5 px-4 align-top">
                      <span className="text-[11px] capitalize text-slate-600 font-medium">
                        {field?.method || 'documentado'}
                      </span>
                    </td>

                    {/* Columna 4: Fragmento de apoyo */}
                    <td className="py-2.5 px-4 align-top text-slate-600">
                      {field?.supportQuote ? (
                        <div className="text-[11px] leading-relaxed bg-slate-50 p-1.5 rounded border border-slate-200 font-mono text-slate-700">
                          "{field.supportQuote}"
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px] italic">No documentado en los informes cargados</span>
                      )}
                    </td>

                    {/* Columna 5: Estado y Botón de Validación */}
                    <td className="py-2.5 px-4 align-top text-right">
                      <button
                        onClick={() => handleToggleValidation(def.key)}
                        className={`text-[11px] font-medium px-2 py-1 rounded inline-flex items-center gap-1 transition-colors ${
                          field?.reviewStatus === 'revisado'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        {field?.reviewStatus === 'revisado' ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            Validado
                          </>
                        ) : (
                          'Pendiente'
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
