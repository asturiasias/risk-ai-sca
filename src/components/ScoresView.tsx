import React, { useState } from 'react';
import { Calculator, ExternalLink, AlertTriangle, ChevronDown, ChevronUp, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { PatientRecord, ScoreResult } from '../types/clinical';
import { computeAllPatientScores } from '../services/calculators';

interface ScoresViewProps {
  patient: PatientRecord;
  onProceedToRecommendations: () => void;
}

export const ScoresView: React.FC<ScoresViewProps> = ({
  patient,
  onProceedToRecommendations
}) => {
  const scores = computeAllPatientScores(patient);
  const [expandedScore, setExpandedScore] = useState<string | null>('grace');

  const toggleExpand = (id: string) => {
    setExpandedScore(prev => (prev === id ? null : id));
  };

  const scoreList: ScoreResult[] = [
    scores.grace,
    scores.timi,
    scores.preciseDapt,
    scores.crusade,
    scores.parisThrombotic,
    scores.parisBleeding,
    scores.daptScore,
    scores.bleemacs,
    scores.hasBled,
    scores.arcHbr,
    scores.cha2ds2Vasc
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Calculator className="w-5 h-5 text-teal-600" />
              Calculadoras Deterministas de Riesgo Isquémico y Hemorrágico
            </h1>
            <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
              Algoritmos matemáticos puros implementados según sus publicaciones originales y calculadoras oficiales validadas.
              No se emplean aproximaciones lineales heurísticas ni se sustituyen valores faltantes por cero.
            </p>
          </div>
          <button
            onClick={onProceedToRecommendations}
            className="px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded transition-colors whitespace-nowrap shadow-sm"
          >
            Ver Plan y Recomendaciones →
          </button>
        </div>

        {/* Cockcroft-Gault Quick Bar */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs bg-slate-50 p-3 rounded">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">Aclaramiento Creatinina Cockcroft-Gault:</span>
            {scores.cockcroftGault.crCl !== null ? (
              <span className="font-mono font-bold text-teal-800 text-sm">
                {scores.cockcroftGault.crCl} mL/min
              </span>
            ) : (
              <span className="text-amber-700 font-medium">No calculable (faltan variables)</span>
            )}
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            {scores.cockcroftGault.formulaString}
          </span>
        </div>
      </div>

      {/* Scores Grid */}
      <div className="space-y-4">
        {scoreList.map(score => {
          const isExpanded = expandedScore === score.scoreId;
          const isIndeterminate = score.riskCategory === 'Indeterminado';
          const isNotApplicable = score.riskCategory === 'No aplicable';
          const isHighRisk = score.riskCategory === 'Alto' || score.riskCategory === 'Muy Alto';

          return (
            <div
              key={score.scoreId}
              className={`bg-white border rounded-lg transition-all shadow-sm ${
                isNotApplicable
                  ? 'border-slate-200 bg-slate-50/40'
                  : isIndeterminate
                  ? 'border-amber-300/80 bg-amber-50/20'
                  : isHighRisk
                  ? 'border-slate-200'
                  : 'border-slate-200'
              }`}
            >
              {/* Card Header / Summary */}
              <div
                onClick={() => toggleExpand(score.scoreId)}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer select-none"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-slate-900">{score.name}</h2>
                    <span className="text-[11px] text-slate-400">·</span>
                    <span className="text-[11px] text-slate-500">{score.version}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>Momento: <strong>{score.clinicalTiming}</strong></span>
                    <span aria-hidden="true">·</span>
                    <span>Desenlace: <strong>{score.clinicalOutcome}</strong></span>
                    <span aria-hidden="true">·</span>
                    <span>Horizonte: <strong>{score.horizon}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  {/* Points / Score Badge */}
                  <div className="text-right">
                    {score.points !== null ? (
                      <span className="text-lg font-mono font-bold text-slate-900 block leading-tight">
                        {score.points} <span className="text-xs font-normal text-slate-500">pts</span>
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-slate-400 font-mono block">
                        {isNotApplicable ? 'N/A' : 'Faltan datos'}
                      </span>
                    )}
                    {score.percentageRisk !== null && score.percentageRisk !== undefined && (
                      <span className="text-[11px] text-slate-500 font-mono">
                        ~{score.percentageRisk}%
                      </span>
                    )}
                  </div>

                  {/* Category Pill Alternative (Clean Typography Tag) */}
                  <div className="w-28 text-center">
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded inline-block w-full ${
                        isNotApplicable
                          ? 'bg-slate-100 text-slate-600'
                          : isIndeterminate
                          ? 'bg-amber-100 text-amber-800'
                          : isHighRisk
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {score.riskCategory}
                    </span>
                  </div>

                  <button className="text-slate-400 hover:text-slate-700 p-1">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Expanded Breakdown & Audit Details */}
              {isExpanded && (
                <div className="border-t border-slate-100 p-5 bg-slate-50/60 space-y-4 text-xs">
                  {/* Interpretation Box */}
                  <div className={`p-3 rounded border text-xs leading-relaxed ${
                    isNotApplicable
                      ? 'bg-slate-100/70 border-slate-200 text-slate-700'
                      : isIndeterminate
                      ? 'bg-amber-50 border-amber-200 text-amber-900'
                      : isHighRisk
                      ? 'bg-red-50/60 border-red-200 text-red-900'
                      : 'bg-white border-slate-200 text-slate-800'
                  }`}>
                    <strong>Interpretación clínica:</strong> {score.interpretation}
                  </div>

                  {/* Missing Variables Warning */}
                  {score.missingRequiredVariables.length > 0 && (
                    <div className="bg-amber-50/80 border border-amber-200 p-3 rounded text-amber-900 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Determinantes obligatorios faltantes:</strong>
                        <p className="mt-0.5">
                          {score.missingRequiredVariables.join(', ')}. Complete o revise estas variables para permitir el cálculo exacto.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Breakdown Table if available */}
                  {score.breakdown && score.breakdown.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-2">Desglose de Puntos por Variable:</h3>
                      <div className="bg-white border border-slate-200 rounded overflow-hidden">
                        <table className="w-full text-xs">
                          <tbody>
                            {score.breakdown.map((item, idx) => (
                              <tr key={idx} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                                <td className="py-1.5 px-3 font-medium text-slate-700">{item.label}</td>
                                <td className="py-1.5 px-3 text-slate-500 font-mono">{item.detail || ''}</td>
                                <td className="py-1.5 px-3 text-right font-mono font-bold text-slate-900 w-24">
                                  {typeof item.points === 'number' ? (item.points >= 0 ? `+${item.points}` : item.points) : item.points}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Citation & Verifiable DOI */}
                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-500 border-t border-slate-200">
                    <span className="italic">{score.citation}</span>
                    <a
                      href={score.citationDoi}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-teal-700 hover:text-teal-900 font-medium inline-flex items-center gap-1 shrink-0"
                    >
                      Ver Fuente en PubMed / DOI
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
