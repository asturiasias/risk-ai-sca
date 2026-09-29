import React from 'react';
import { X, Printer, Download, FileText, CheckCircle2 } from 'lucide-react';
import { PatientRecord } from '../types/clinical';
import { computeAllPatientScores } from '../services/calculators';
import { generateClinicalPlan } from '../services/recommendationEngine';
import { CLINICAL_DICTIONARY, formatValueForDisplay } from '../services/clinicalDictionary';
import { generatePatientClinicalHtmlReport } from '../services/standaloneBundle';

interface MedicalReportModalProps {
  patient: PatientRecord | null;
  onClose: () => void;
}

export const MedicalReportModal: React.FC<MedicalReportModalProps> = ({ patient, onClose }) => {
  if (!patient) return null;

  const scores = computeAllPatientScores(patient);
  const recommendations = generateClinicalPlan(patient, scores);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadHtml = () => {
    const html = generatePatientClinicalHtmlReport(patient);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Informe_${patient.id}_${new Date().toISOString().slice(0, 10)}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl">
        {/* Modal Top Control Bar (Hidden in print) */}
        <div className="print:hidden p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-600" />
            <h2 className="text-sm font-bold text-slate-900">
              Informe Clínico Estructurado — Risk AI-SCA
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadHtml}
              className="px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
              title="Descargar informe estructurado en archivo HTML"
            >
              <Download className="w-3.5 h-3.5 text-teal-700" />
              Descargar Informe HTML
            </button>
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimir / Guardar en PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 overflow-y-auto space-y-6 text-xs text-slate-800 font-sans leading-relaxed print:p-0">
          {/* Official Document Header */}
          <div className="border-b-2 border-slate-800 pb-4 flex justify-between items-start">
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                INFORME DE ESTRATIFICACIÓN Y APOYO AL MANEJO DEL SÍNDROME CORONARIO AGUDO
              </h1>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Plataforma Risk AI-SCA · Motor Determinista + Recuperación Documental de Guías ESC/ACC
              </p>
            </div>
            <div className="text-right text-[11px]">
              <span className="font-mono font-bold block text-slate-900">ID: {patient.id}</span>
              <span className="text-slate-500 block">Episodio: {patient.episodeId}</span>
              <span className="text-slate-500 block">Fecha: {new Date().toLocaleDateString('es-ES')}</span>
            </div>
          </div>

          {/* Demographic & Clinical Summary Box */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded border border-slate-200">
            <div>
              <span className="text-slate-500 block text-[10px]">Edad / Sexo:</span>
              <strong className="text-slate-900">
                {patient.data.edad?.value ? `${patient.data.edad.value} años` : 'Sin dato'} / {patient.data.sexo?.value === 1 ? 'Mujer' : patient.data.sexo?.value === 0 ? 'Varón' : 'No especificado'}
              </strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Diagnóstico SCA:</span>
              <strong className="text-slate-900">
                {patient.data.tipo_sca?.value === 0 ? 'SCACEST' : patient.data.tipo_sca?.value === 1 ? 'SCASEST-IAM' : patient.data.tipo_sca?.value === 2 ? 'Angina Inestable' : 'Pendiente'}
              </strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Fase Evaluación:</span>
              <strong className="text-slate-900 capitalize">
                {patient.evaluationPhase}
              </strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">CrCl Cockcroft-Gault:</span>
              <strong className="text-slate-900 font-mono">
                {scores.cockcroftGault.crCl ? `${scores.cockcroftGault.crCl} mL/min` : 'No calculable'}
              </strong>
            </div>
          </div>

          {/* Scores Table */}
          <div>
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-1 mb-2">
              1. Estratificación Determinista de Riesgo Isquémico y Hemorrágico
            </h2>
            <table className="w-full text-left border border-slate-200 rounded overflow-hidden">
              <thead className="bg-slate-100 text-slate-700 text-[11px] font-semibold">
                <tr>
                  <th className="py-1.5 px-3">Escala / Score</th>
                  <th className="py-1.5 px-3">Puntuación</th>
                  <th className="py-1.5 px-3">Categoría de Riesgo</th>
                  <th className="py-1.5 px-3">Desenlace Clínico Evaluado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                <tr>
                  <td className="py-1.5 px-3 font-medium">GRACE Score</td>
                  <td className="py-1.5 px-3 font-mono">{scores.grace.points !== null ? `${scores.grace.points} pts` : '.'}</td>
                  <td className="py-1.5 px-3 font-semibold">{scores.grace.riskCategory}</td>
                  <td className="py-1.5 px-3 text-slate-600">{scores.grace.clinicalOutcome}</td>
                </tr>
                <tr>
                  <td className="py-1.5 px-3 font-medium">TIMI UA/NSTEMI</td>
                  <td className="py-1.5 px-3 font-mono">{scores.timi.points !== null ? `${scores.timi.points} pts` : '.'}</td>
                  <td className="py-1.5 px-3 font-semibold">{scores.timi.riskCategory}</td>
                  <td className="py-1.5 px-3 text-slate-600">{scores.timi.clinicalOutcome}</td>
                </tr>
                <tr>
                  <td className="py-1.5 px-3 font-medium">PRECISE-DAPT (5 var)</td>
                  <td className="py-1.5 px-3 font-mono">{scores.preciseDapt.points !== null ? `${scores.preciseDapt.points} pts` : '.'}</td>
                  <td className="py-1.5 px-3 font-semibold">{scores.preciseDapt.riskCategory}</td>
                  <td className="py-1.5 px-3 text-slate-600">{scores.preciseDapt.clinicalOutcome}</td>
                </tr>
                <tr>
                  <td className="py-1.5 px-3 font-medium">CRUSADE Bleeding</td>
                  <td className="py-1.5 px-3 font-mono">{scores.crusade.points !== null ? `${scores.crusade.points} pts` : '.'}</td>
                  <td className="py-1.5 px-3 font-semibold">{scores.crusade.riskCategory}</td>
                  <td className="py-1.5 px-3 text-slate-600">{scores.crusade.clinicalOutcome}</td>
                </tr>
                <tr>
                  <td className="py-1.5 px-3 font-medium">ARC-HBR Consenso</td>
                  <td className="py-1.5 px-3 font-mono">{scores.arcHbr.majorCriteriaMet.length} Mayores / {scores.arcHbr.minorCriteriaMet.length} Menores</td>
                  <td className="py-1.5 px-3 font-semibold">{scores.arcHbr.isHbr === true ? 'HBR Positivo' : scores.arcHbr.isHbr === false ? 'No HBR' : 'Indeterminado'}</td>
                  <td className="py-1.5 px-3 text-slate-600">Sangrado mayor BARC 3 o 5</td>
                </tr>
                <tr>
                  <td className="py-1.5 px-3 font-medium">DAPT Score (Yeh et al.)</td>
                  <td className="py-1.5 px-3 font-mono">{scores.daptScore.points !== null ? `${scores.daptScore.points} pts` : 'No aplicable'}</td>
                  <td className="py-1.5 px-3 font-semibold">{scores.daptScore.riskCategory}</td>
                  <td className="py-1.5 px-3 text-slate-600">{scores.daptScore.applicabilityReason || scores.daptScore.clinicalOutcome}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Recommendations Table */}
          <div>
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-1 mb-2">
              2. Propuestas de Manejo Clínico y Validación Médica
            </h2>
            <div className="space-y-3">
              {recommendations.map(rec => {
                const status = patient.recommendationsAccepted?.[rec.id] || 'pendiente';
                return (
                  <div key={rec.id} className="p-3 bg-slate-50 border border-slate-200 rounded text-xs space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-900">{rec.action}</span>
                      <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                        status === 'aceptado' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                      }`}>
                        Médico: {status}
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px] leading-relaxed">{rec.clinicalJustification}</p>
                    <div className="text-[10px] text-slate-400 italic">
                      Fuente: {rec.evidenceItems.map(e => `${e.guidelineOrStudy} (${e.year}) [${e.classOfRecommendation || ''}]`).join(', ')}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Ethical Disclaimer */}
          <div className="border-t border-slate-200 pt-4 text-[10px] text-slate-500 leading-normal">
            <p>
              <strong>AVISO DE RESPONSABILIDAD PROFESIONAL:</strong> Este documento es una propuesta de apoyo a la decisión clínica
              generada por algoritmos de comprobación matemática determinista y directrices de práctica clínica de la ESC y ACC/AHA.
              No constituye por sí mismo una prescripción médica firmada ni dispensa de la evaluación presencial del paciente por el médico especialista responsable.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
