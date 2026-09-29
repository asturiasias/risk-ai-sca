import React, { useState } from 'react';
import { FlaskConical, Play, FileText, Download, CheckCircle, RefreshCw, AlertTriangle, ArrowRight, FileSpreadsheet } from 'lucide-react';
import { SYNTHETIC_PATIENTS } from '../services/syntheticPatients';
import { SyntheticPatientProfile, PatientRecord } from '../types/clinical';
import { extractClinicalDataFromText } from '../services/pdfExtractor';
import { generateCleanStandaloneHtml, generatePatientClinicalHtmlReport } from '../services/standaloneBundle';
import { exportDatabaseToXLSX } from '../services/storageService';

interface SyntheticDemoViewProps {
  onLoadSyntheticToSession: (record: PatientRecord) => void;
}

export const SyntheticDemoView: React.FC<SyntheticDemoViewProps> = ({
  onLoadSyntheticToSession
}) => {
  const [selectedCaseId, setSelectedCaseId] = useState<string>(SYNTHETIC_PATIENTS[0].id);
  const [activeDocIndex, setActiveDocIndex] = useState<number>(0);
  const [seedVariation, setSeedVariation] = useState<number>(1);

  const selectedCase = SYNTHETIC_PATIENTS.find(c => c.id === selectedCaseId) || SYNTHETIC_PATIENTS[0];

  const handleRunThroughPipeline = () => {
    // Los documentos sintéticos recorren exactamente el mismo extractor sin atajos
    const docs = selectedCase.documents.map(d => ({
      name: d.title,
      type: 'text',
      date: d.date,
      text: d.content
    }));

    const extraction = extractClinicalDataFromText(docs, selectedCase.id);

    const record: PatientRecord = {
      id: selectedCase.id,
      episodeId: 'EP-01',
      isSynthetic: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      evaluationPhase: selectedCase.number === 8 ? 'seguimiento_12m' : 'ingreso',
      reviewStatus: 'pendiente',
      data: extraction.fields,
      recommendationsAccepted: {}
    };

    onLoadSyntheticToSession(record);
  };

  const handleDownloadStandaloneHtml = () => {
    const html = generateCleanStandaloneHtml();
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Risk AI-SCA.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadExcelDatabase = () => {
    const demoRecords: PatientRecord[] = SYNTHETIC_PATIENTS.map(sp => {
      const docs = sp.documents.map(d => ({
        name: d.title,
        type: 'text',
        date: d.date,
        text: d.content
      }));
      const ext = extractClinicalDataFromText(docs, sp.id);
      return {
        id: sp.id,
        episodeId: 'EP-01',
        isSynthetic: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        evaluationPhase: sp.number === 8 ? 'seguimiento_12m' : 'ingreso',
        reviewStatus: 'revisado',
        data: ext.fields,
        recommendationsAccepted: {}
      };
    });
    exportDatabaseToXLSX(demoRecords);
  };

  const handleDownloadCaseReport = () => {
    const docs = selectedCase.documents.map(d => ({
      name: d.title,
      type: 'text',
      date: d.date,
      text: d.content
    }));
    const extraction = extractClinicalDataFromText(docs, selectedCase.id);
    const record: PatientRecord = {
      id: selectedCase.id,
      episodeId: 'EP-01',
      isSynthetic: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      evaluationPhase: selectedCase.number === 8 ? 'seguimiento_12m' : 'ingreso',
      reviewStatus: 'revisado',
      data: extraction.fields,
      recommendationsAccepted: {}
    };
    const htmlReport = generatePatientClinicalHtmlReport(record);
    const blob = new Blob([htmlReport], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Informe_${selectedCase.id}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadGroundTruth = () => {
    const jsonStr = JSON.stringify(selectedCase, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedCase.id}_Verdad_Estructurada.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadDocuments = () => {
    const combinedText = selectedCase.documents
      .map(d => `========================================\n${d.title} (${d.date})\n========================================\n${d.content}\n\n`)
      .join('\n');
    const blob = new Blob([combinedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedCase.id}_Documentos_Clinicos.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-amber-600" />
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Entorno de Validación con Pacientes Sintéticos
              </h1>
            </div>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Ocho perfiles clínicos completos diseñados para verificar y auditar los algoritmos deterministas, la normalización
              de variables, el manejo de datos faltantes y las recomendaciones guiadas por evidencia.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleDownloadExcelDatabase}
              className="px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-300 hover:bg-emerald-100 rounded transition-colors flex items-center gap-1.5 shadow-2xs whitespace-nowrap"
              title="Descargar base de datos acumulada en formato Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
              Descargar Base en Excel (.xlsx)
            </button>
            <button
              onClick={handleDownloadStandaloneHtml}
              className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded transition-colors flex items-center gap-1.5 shadow-2xs whitespace-nowrap"
              title="Descargar archivo autónomo Risk AI-SCA.html con los 8 casos y todos los módulos"
            >
              <Download className="w-4 h-4 text-teal-700" />
              Descargar Risk AI-SCA.html
            </button>
            <button
              onClick={handleRunThroughPipeline}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded transition-colors flex items-center gap-1.5 shadow-sm whitespace-nowrap"
            >
              <Play className="w-4 h-4 fill-white" />
              Cargar Caso en Sesión Activa
            </button>
          </div>
        </div>

        {/* Synthetic Safety Banner */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-amber-800 bg-amber-50 p-2.5 rounded border border-amber-200">
          <div className="flex items-center gap-2 font-medium">
            <span className="font-bold">PACIENTE SINTÉTICO — DEMOSTRACIÓN:</span>
            <span>Casos diseñados para docencia y prueba algorítmica. No proceden de pacientes reales.</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadCaseReport}
              className="text-[11px] font-semibold text-teal-700 hover:text-teal-900 underline"
              title="Descargar informe clínico estructurado de este caso en HTML"
            >
              Descargar Informe Caso (HTML)
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={handleDownloadGroundTruth}
              className="text-[11px] font-semibold text-slate-700 hover:text-slate-900 underline"
            >
              Descargar Ground Truth JSON
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={handleDownloadDocuments}
              className="text-[11px] font-semibold text-slate-700 hover:text-slate-900 underline"
            >
              Descargar Documentos TXT
            </button>
          </div>
        </div>
      </div>

      {/* Case Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {SYNTHETIC_PATIENTS.map(sp => {
          const isSelected = sp.id === selectedCaseId;
          return (
            <button
              key={sp.id}
              onClick={() => {
                setSelectedCaseId(sp.id);
                setActiveDocIndex(0);
              }}
              className={`p-2.5 rounded text-left border transition-all text-xs flex flex-col justify-between h-20 ${
                isSelected
                  ? 'border-teal-600 bg-teal-50/40 font-semibold text-teal-900 ring-1 ring-teal-500'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-bold">Caso {sp.number}</span>
                <span className="text-[10px] text-slate-400 font-mono">{sp.id.slice(-2)}</span>
              </div>
              <span className="text-[10px] line-clamp-2 text-slate-500 leading-tight">
                {sp.summary}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Case Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Documents Preview (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-lg p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900">{selectedCase.name}</h2>
                <p className="text-xs text-slate-500 mt-0.5">{selectedCase.clinicalScenario}</p>
              </div>
            </div>

            {/* Document Subtabs */}
            <div className="flex items-center gap-1 border-b border-slate-200 pb-2 mb-3 overflow-x-auto text-xs">
              {selectedCase.documents.map((doc, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveDocIndex(idx)}
                  className={`px-3 py-1 rounded text-xs whitespace-nowrap transition-colors ${
                    activeDocIndex === idx
                      ? 'bg-slate-900 text-white font-medium'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {doc.title}
                </button>
              ))}
            </div>

            {/* Document Content View */}
            <div className="bg-slate-50 border border-slate-200 rounded p-4 font-mono text-xs text-slate-800 leading-relaxed max-h-[360px] overflow-y-auto whitespace-pre-wrap">
              {selectedCase.documents[activeDocIndex]?.content}
            </div>
          </div>

          <div className="pt-2 flex justify-between items-center text-xs text-slate-500 border-t border-slate-100">
            <span>Fecha clínica: {selectedCase.documents[activeDocIndex]?.date}</span>
            <button
              onClick={handleRunThroughPipeline}
              className="px-3.5 py-1.5 bg-teal-700 text-white rounded font-medium hover:bg-teal-800 transition-colors flex items-center gap-1 shadow-2xs"
            >
              Procesar Caso y Abrir Revisión
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Column: Ground Truth & Expected Benchmarks (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-lg p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Verdad de Referencia y Diana Algorítmica
            </h3>
            <p className="text-xs text-slate-500">
              Puntuaciones y categorías esperadas para contrastar la exactitud de los scores deterministas:
            </p>
          </div>

          {/* Expected Scores */}
          <div className="space-y-2">
            {Object.entries(selectedCase.expectedScores).map(([scoreKey, exp]) => (
              <div
                key={scoreKey}
                className="flex items-center justify-between p-2.5 bg-slate-50 rounded border border-slate-200 text-xs"
              >
                <div>
                  <strong className="text-slate-800 capitalize block">{scoreKey} Score</strong>
                  <span className="text-[11px] text-slate-500">
                    Diana: {exp.category}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-slate-900 block">
                    {exp.points !== null ? `${exp.points} pts` : 'Indeterminado'}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
                    Referencia OK
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Key Clinical Features */}
          <div className="pt-2 border-t border-slate-100">
            <h4 className="text-xs font-semibold text-slate-700 mb-2">Desafíos Clínicos del Caso:</h4>
            <div className="flex flex-wrap gap-1.5">
              {selectedCase.keyFeatures.map((kf, i) => (
                <span
                  key={i}
                  className="text-[11px] px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200"
                >
                  {kf}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
