import React, { useState } from 'react';
import {
  Stethoscope,
  AlertTriangle,
  CheckCircle,
  XCircle,
  HelpCircle,
  BookOpen,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  FileCheck
} from 'lucide-react';
import { PatientRecord, ClinicalRecommendation, EvidenceItem } from '../types/clinical';
import { computeAllPatientScores } from '../services/calculators';
import { generateClinicalPlan } from '../services/recommendationEngine';
import { EvidenceModal } from './EvidenceModal';

interface RecommendationsViewProps {
  patient: PatientRecord;
  onUpdatePatient: (updated: PatientRecord) => void;
  onProceedToDatabase: () => void;
}

export const RecommendationsView: React.FC<RecommendationsViewProps> = ({
  patient,
  onUpdatePatient,
  onProceedToDatabase
}) => {
  const scores = computeAllPatientScores(patient);
  const recommendations = generateClinicalPlan(patient, scores);
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceItem | null>(null);

  const handleDecision = (recId: string, status: 'aceptado' | 'modificado' | 'rechazado') => {
    const currentDecisions = { ...(patient.recommendationsAccepted || {}) };
    currentDecisions[recId] = status;

    onUpdatePatient({
      ...patient,
      recommendationsAccepted: currentDecisions,
      updatedAt: new Date().toISOString()
    });
  };

  const domainLabels = {
    urgencias: '1. Urgencias y Manejo Inicial',
    invasivo: '2. Estrategia Invasiva y Revascularización',
    antitrombotico: '3. Terapia Antitrombótica y Gastroprotección',
    cardiorrenal: '4. Prevención Cardiorrenal, Lípidos y Disfunción VI',
    alta_seguimiento: '5. Alta, Rehabilitación Cardiaca y Seguimiento'
  };

  const grouped = recommendations.reduce((acc, rec) => {
    acc[rec.domain] = acc[rec.domain] || [];
    acc[rec.domain].push(rec);
    return acc;
  }, {} as Record<string, ClinicalRecommendation[]>);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Evidence Modal */}
      <EvidenceModal
        evidence={selectedEvidence}
        onClose={() => setSelectedEvidence(null)}
      />

      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-teal-600" />
              Plan Integral e Individualizado de Manejo del SCA
            </h1>
            <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
              Propuestas clínicas fundamentadas en las Guías ESC 2023 SCA, ACC/AHA 2025 y fichas técnicas oficiales.
              Cada recomendación se justifica con los datos concretos del paciente y referencias bibliográficas directas.
            </p>
          </div>
          <button
            onClick={onProceedToDatabase}
            className="px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded transition-colors whitespace-nowrap shadow-sm"
          >
            Ver Base Acumulativa →
          </button>
        </div>

        {/* Clinical Disclaimer Notice */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-500">
          <FileCheck className="w-4 h-4 text-teal-600 shrink-0" />
          <span>
            La aceptación de una recomendación en la plataforma es una validación de idoneidad por el médico evaluador,
            no sustituye la prescripción formal en la historia clínica del centro.
          </span>
        </div>
      </div>

      {/* Recommendations Grouped by Domain */}
      <div className="space-y-6">
        {(Object.keys(domainLabels) as (keyof typeof domainLabels)[]).map(domainKey => {
          const recs = grouped[domainKey] || [];
          if (recs.length === 0) return null;

          return (
            <div key={domainKey} className="space-y-3">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide px-1">
                {domainLabels[domainKey]}
              </h2>

              <div className="space-y-3">
                {recs.map(rec => {
                  const currentStatus = patient.recommendationsAccepted?.[rec.id] || 'pendiente';
                  const hasCriticalAlert = Boolean(rec.contraindicationAlert);

                  return (
                    <div
                      key={rec.id}
                      className={`bg-white border rounded-lg p-5 shadow-xs transition-all ${
                        hasCriticalAlert
                          ? 'border-red-300 bg-red-50/10'
                          : currentStatus === 'aceptado'
                          ? 'border-emerald-200'
                          : 'border-slate-200'
                      }`}
                    >
                      {/* Critical Contraindication Alert if present */}
                      {hasCriticalAlert && (
                        <div className="mb-3 bg-red-50 border border-red-200 p-3 rounded text-red-900 flex items-start gap-2 text-xs">
                          <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                          <div>
                            <strong className="font-semibold block text-red-800">
                              {rec.contraindicationAlert}
                            </strong>
                            <p className="mt-0.5 text-[11px] text-red-700">
                              Esta propuesta bloquea la selección de fármacos de riesgo y orienta hacia alternativas seguras autorizadas.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Card Header */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
                              {rec.phase}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono">ID: {rec.id}</span>
                          </div>
                          <h3 className="text-sm font-bold text-slate-900 mt-1">
                            {rec.action}
                          </h3>
                        </div>

                        {/* Decision Buttons */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => handleDecision(rec.id, 'aceptado')}
                            className={`px-2.5 py-1 text-xs font-medium rounded flex items-center gap-1 transition-colors ${
                              currentStatus === 'aceptado'
                                ? 'bg-emerald-600 text-white font-semibold'
                                : 'bg-slate-100 hover:bg-emerald-50 text-slate-700'
                            }`}
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            Aceptar
                          </button>
                          <button
                            onClick={() => handleDecision(rec.id, 'modificado')}
                            className={`px-2.5 py-1 text-xs font-medium rounded flex items-center gap-1 transition-colors ${
                              currentStatus === 'modificado'
                                ? 'bg-amber-600 text-white font-semibold'
                                : 'bg-slate-100 hover:bg-amber-50 text-slate-700'
                            }`}
                          >
                            <HelpCircle className="w-3.5 h-3.5" />
                            Modificar
                          </button>
                          <button
                            onClick={() => handleDecision(rec.id, 'rechazado')}
                            className={`px-2.5 py-1 text-xs font-medium rounded flex items-center gap-1 transition-colors ${
                              currentStatus === 'rechazado'
                                ? 'bg-red-600 text-white font-semibold'
                                : 'bg-slate-100 hover:bg-red-50 text-slate-700'
                            }`}
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Rechazar
                          </button>
                        </div>
                      </div>

                      {/* Patient Motivations & Clinical Justification */}
                      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-slate-50 p-3 rounded border border-slate-100">
                        <div>
                          <strong className="text-slate-700 block mb-1 text-[11px]">
                            Datos concretos del paciente que motivan la propuesta:
                          </strong>
                          <ul className="list-disc list-inside space-y-0.5 text-slate-600">
                            {rec.patientMotivations.map((m, i) => (
                              <li key={i}>{m}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <strong className="text-slate-700 block mb-1 text-[11px]">
                            Justificación clínica y balance beneficio/riesgo:
                          </strong>
                          <p className="text-slate-600 leading-relaxed">{rec.clinicalJustification}</p>
                          <p className="text-[11px] text-slate-500 mt-1 italic">{rec.benefitsRisks}</p>
                        </div>
                      </div>

                      {/* Safety & Contraindications checked */}
                      {rec.contraindicationsChecked.length > 0 && (
                        <div className="mt-2 text-[11px] text-slate-600 flex items-center gap-1.5">
                          <strong className="text-slate-700">Seguridad verificada:</strong>
                          <span>{rec.contraindicationsChecked.join(' · ')}</span>
                        </div>
                      )}

                      {/* Clickable Citations & Evidence Button */}
                      <div className="mt-3 pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-slate-400 text-[11px]">Evidencia de soporte:</span>
                          {rec.evidenceItems.map(ev => (
                            <button
                              key={ev.id}
                              onClick={() => setSelectedEvidence(ev)}
                              className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 hover:bg-teal-50 hover:text-teal-700 border border-slate-200 rounded text-[11px] text-slate-700 transition-colors"
                            >
                              <BookOpen className="w-3 h-3 text-teal-600" />
                              <span>{ev.guidelineOrStudy} ({ev.year})</span>
                              {ev.classOfRecommendation && (
                                <strong className="font-semibold text-slate-900 ml-1">{ev.classOfRecommendation}</strong>
                              )}
                            </button>
                          ))}
                        </div>

                        {rec.evidenceItems[0] && (
                          <button
                            onClick={() => setSelectedEvidence(rec.evidenceItems[0])}
                            className="text-teal-700 hover:text-teal-900 text-xs font-semibold inline-flex items-center gap-1"
                          >
                            Ver Evidencia y Cita Textual →
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
