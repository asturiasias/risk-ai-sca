import React from 'react';
import { Download, FileText, ShieldCheck, Database, HardDrive, CheckCircle2, FileSpreadsheet } from 'lucide-react';
import { PatientRecord } from '../types/clinical';
import { generateCleanStandaloneHtml } from '../services/standaloneBundle';

interface HeaderProps {
  currentPatient: PatientRecord | null;
  onExportReport: () => void;
  onNewPatient: () => void;
  onSavePatient: () => void;
  onExportExcel?: () => void;
  isSaving?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentPatient,
  onExportReport,
  onNewPatient,
  onSavePatient,
  onExportExcel,
  isSaving
}) => {
  const downloadStandaloneHtml = () => {
    const htmlContent = generateCleanStandaloneHtml();
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Risk AI-SCA.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <header className="border-b border-slate-200 bg-white px-6 py-3 shrink-0 flex items-center justify-between">
      {/* Zone 1: Wordmark */}
      <div className="flex items-center gap-4">
        <a href="#inicio" className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <span className="w-2.5 h-6 bg-teal-600 rounded-sm inline-block"></span>
          Risk AI-SCA
        </a>
        <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500 border-l border-slate-200 pl-4">
          <span className="flex items-center gap-1 font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Recuperación documental + reglas locales
          </span>
          <span aria-hidden="true">·</span>
          <span className="flex items-center gap-1 text-slate-600">
            <Database className="w-3.5 h-3.5" />
            IndexedDB Activa
          </span>
        </div>
      </div>

      {/* Zone 2: Contextual Patient Badge */}
      {currentPatient && (
        <div className="hidden md:flex items-center gap-3 text-xs text-slate-700 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-md">
          <span className="font-semibold text-slate-900 font-mono">{currentPatient.id}</span>
          <span aria-hidden="true" className="text-slate-300">|</span>
          <span>Episodio: <strong className="font-mono">{currentPatient.episodeId}</strong></span>
          <span aria-hidden="true" className="text-slate-300">|</span>
          <span>Fase: <strong className="capitalize">{currentPatient.evaluationPhase}</strong></span>
          <span aria-hidden="true" className="text-slate-300">|</span>
          <span className={currentPatient.isSynthetic ? 'text-amber-700 font-medium' : 'text-slate-700'}>
            {currentPatient.isSynthetic ? 'Sintético (Demo)' : 'Caso Registrado'}
          </span>
        </div>
      )}

      {/* Zone 3: Primary Actions */}
      <div className="flex items-center gap-2">
        {onExportExcel && (
          <button
            onClick={onExportExcel}
            className="px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-300 rounded hover:bg-emerald-100 transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-2xs"
            title="Descargar base de datos acumulada en formato Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
            Descargar Excel (BD)
          </button>
        )}
        {currentPatient && (
          <button
            onClick={onSavePatient}
            disabled={isSaving}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors flex items-center gap-1.5 whitespace-nowrap"
            title="Guardar paciente en base acumulativa local"
          >
            <HardDrive className="w-3.5 h-3.5" />
            {isSaving ? 'Guardando...' : 'Guardar Paciente'}
          </button>
        )}
        <button
          onClick={onExportReport}
          className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors flex items-center gap-1.5 whitespace-nowrap"
          title="Generar e imprimir informe clínico estructurado"
        >
          <FileText className="w-3.5 h-3.5" />
          Informe Médico
        </button>
        <button
          onClick={downloadStandaloneHtml}
          className="px-3.5 py-1.5 text-xs font-medium text-white bg-teal-700 hover:bg-teal-800 rounded transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-sm"
          title="Descargar archivo autónomo Risk AI-SCA.html para uso local sin servidor"
        >
          <Download className="w-3.5 h-3.5" />
          Descargar Risk AI-SCA.html
        </button>
      </div>
    </header>
  );
};
