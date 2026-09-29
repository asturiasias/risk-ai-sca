import React, { useState, useRef } from 'react';
import { Database, Download, Upload, Trash2, Search, FileSpreadsheet, RefreshCw, AlertCircle } from 'lucide-react';
import { PatientRecord } from '../types/clinical';
import { CLINICAL_DICTIONARY, formatValueForDisplay } from '../services/clinicalDictionary';
import { exportDatabaseToXLSX, exportDatabaseToCSV, exportBackupJSON, parseAndValidateBackupJSON } from '../services/storageService';

interface CumulativeDatabaseViewProps {
  patients: PatientRecord[];
  onSelectPatient: (patient: PatientRecord) => void;
  onDeletePatient: (patientId: string) => void;
  onRestoreBackup: (patients: PatientRecord[]) => void;
}

export const CumulativeDatabaseView: React.FC<CumulativeDatabaseViewProps> = ({
  patients,
  onSelectPatient,
  onDeletePatient,
  onRestoreBackup
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [restoreMessage, setRestoreMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredPatients = patients.filter(p => {
    const idMatches = p.id.toLowerCase().includes(searchTerm.toLowerCase());
    const episodeMatches = p.episodeId.toLowerCase().includes(searchTerm.toLowerCase());
    return idMatches || episodeMatches;
  });

  const handleFileRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const content = await file.text();
      const validation = parseAndValidateBackupJSON(content);
      if (!validation.valid) {
        alert(`Error al validar copia de seguridad: ${validation.error}`);
        return;
      }

      if (confirm(`¿Desea restaurar ${validation.patients.length} pacientes? Se integrarán en su base acumulativa.`)) {
        onRestoreBackup(validation.patients);
        setRestoreMessage(validation.summary || 'Restauración completada con éxito.');
        setTimeout(() => setRestoreMessage(null), 4000);
      }
    } catch (err: any) {
      alert(`Error al leer archivo: ${err.message}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Database className="w-5 h-5 text-teal-600" />
              Base Acumulativa SCA
            </h1>
            <p className="text-xs font-medium text-slate-700 mt-1">
              Base acumulativa SCA — codificación y unidades en encabezados; . = dato faltante
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Un sujeto por fila con identificador seudónimo estable. Total de registros en almacenamiento local: {patients.length}.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => exportDatabaseToXLSX(patients)}
              className="px-3.5 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-300 rounded hover:bg-emerald-100 transition-colors flex items-center gap-1.5 shadow-2xs"
              title="Descargar base de datos acumulada en formato Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
              Descargar en Excel (.xlsx)
            </button>
            <button
              onClick={() => exportDatabaseToCSV(patients)}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-teal-700" />
              Descargar CSV
            </button>
            <button
              onClick={() => exportBackupJSON(patients)}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              Copia JSON
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Upload className="w-3.5 h-3.5 text-slate-600" />
              Restaurar JSON
            </button>
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleFileRestore}
              className="hidden"
            />
          </div>
        </div>

        {/* Restore Alert Message */}
        {restoreMessage && (
          <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded flex items-center gap-2">
            <span>{restoreMessage}</span>
          </div>
        )}

        {/* Search */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="relative w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar por ID de paciente o episodio..."
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>
          <span className="text-[11px] text-slate-500">
            Mostrando {filteredPatients.length} de {patients.length} pacientes
          </span>
        </div>
      </div>

      {/* Main Table View */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto max-h-[560px]">
          <table className="w-full text-left text-xs border-collapse font-sans">
            <thead className="sticky top-0 bg-slate-100 z-10">
              <tr className="border-b border-slate-300 text-slate-700 font-semibold text-[11px] whitespace-nowrap">
                <th className="py-2.5 px-3 bg-slate-100 border-r border-slate-200 sticky left-0 z-20">Acción</th>
                {CLINICAL_DICTIONARY.map(def => (
                  <th key={def.key} className="py-2.5 px-3 border-r border-slate-200" title={def.description}>
                    {def.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={CLINICAL_DICTIONARY.length + 1} className="py-8 text-center text-slate-400 font-sans">
                    No se han registrado pacientes todavía en la base acumulativa.
                  </td>
                </tr>
              ) : (
                filteredPatients.map(patient => (
                  <tr key={patient.id} className="hover:bg-slate-50 transition-colors">
                    {/* Sticky Action Cell */}
                    <td className="py-2 px-3 bg-white sticky left-0 border-r border-slate-200 z-10 flex items-center gap-1.5 whitespace-nowrap">
                      <button
                        onClick={() => onSelectPatient(patient)}
                        className="px-2 py-0.5 text-[10px] font-sans font-semibold bg-teal-50 text-teal-700 border border-teal-200 rounded hover:bg-teal-100"
                      >
                        Abrir
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`¿Desea eliminar de la base local al paciente ${patient.id}?`)) {
                            onDeletePatient(patient.id);
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-red-600 rounded"
                        title="Eliminar paciente"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </td>

                    {/* Data Cells */}
                    {CLINICAL_DICTIONARY.map(def => {
                      const val = patient.data[def.key]?.value;
                      const formatted = formatValueForDisplay(val);
                      const isMissing = formatted === '.';

                      return (
                        <td
                          key={def.key}
                          className={`py-2 px-3 border-r border-slate-100 whitespace-nowrap tabular-nums ${
                            isMissing ? 'text-slate-300 font-bold' : 'text-slate-800'
                          }`}
                        >
                          {formatted}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
