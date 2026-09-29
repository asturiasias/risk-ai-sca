import React, { useState } from 'react';
import { Users, Search, Trash2, ArrowRight, UserPlus, HardDrive, Calendar } from 'lucide-react';
import { PatientRecord } from '../types/clinical';
import { computeAllPatientScores } from '../services/calculators';

interface SavedPatientsViewProps {
  patients: PatientRecord[];
  onSelectPatient: (patient: PatientRecord) => void;
  onDeletePatient: (patientId: string) => void;
  onNewPatient: () => void;
}

export const SavedPatientsView: React.FC<SavedPatientsViewProps> = ({
  patients,
  onSelectPatient,
  onDeletePatient,
  onNewPatient
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = patients.filter(p =>
    p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.episodeId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-600" />
            Pacientes Registrados en Almacenamiento Local
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Historial de sujetos evaluados en este navegador mediante IndexedDB. Total: {patients.length} registros.
          </p>
        </div>
        <button
          onClick={onNewPatient}
          className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded text-xs font-semibold flex items-center gap-2 shadow-sm transition-colors whitespace-nowrap"
        >
          <UserPlus className="w-4 h-4" />
          Registrar Nuevo Paciente
        </button>
      </div>

      {/* Search */}
      <div className="bg-white border border-slate-200 rounded-lg p-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar por ID de paciente o episodio..."
            className="w-full pl-9 pr-4 py-1.5 text-xs border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </div>
      </div>

      {/* Grid of Patients */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-12 text-center text-xs text-slate-500 space-y-3">
          <HardDrive className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="font-medium text-slate-700">No hay pacientes guardados en la base local todavía.</p>
          <p className="text-[11px] text-slate-400">
            Cargue documentos desde la pestaña "Nuevo", cargue un caso sintético de prueba o pulse "Registrar Nuevo Paciente".
          </p>
          <button
            onClick={onNewPatient}
            className="px-3.5 py-1.5 bg-teal-700 text-white rounded text-xs font-medium inline-flex items-center gap-1.5 shadow-2xs"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Iniciar Registro
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(patient => {
            const scores = computeAllPatientScores(patient);
            const edad = patient.data.edad?.value;
            const sexo = patient.data.sexo?.value === 1 ? 'Mujer' : patient.data.sexo?.value === 0 ? 'Varón' : 'Sin dato';
            const tipoSca = patient.data.tipo_sca?.value === 0 ? 'SCACEST' : patient.data.tipo_sca?.value === 1 ? 'SCASEST' : patient.data.tipo_sca?.value === 2 ? 'Angina Inestable' : 'SCA';

            return (
              <div
                key={patient.id}
                className="bg-white border border-slate-200 hover:border-slate-300 rounded-lg p-5 flex flex-col justify-between shadow-2xs transition-all space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono font-bold text-sm text-slate-900">{patient.id}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                      patient.isSynthetic ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {patient.isSynthetic ? 'Sintético' : 'Registro Real'}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-slate-600">
                    <p className="font-semibold text-slate-800">
                      {tipoSca} · {edad ? `${edad}a` : 'Edad no consta'} ({sexo})
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Episodio: <span className="font-mono font-medium">{patient.episodeId}</span> · Fase: <span className="capitalize">{patient.evaluationPhase}</span>
                    </p>
                    <div className="pt-2 flex items-center justify-between text-[11px] border-t border-slate-100 mt-2 font-mono">
                      <span>GRACE: <strong>{scores.grace.points ?? '.'} pts</strong></span>
                      <span>PRECISE-DAPT: <strong>{scores.preciseDapt.points ?? '.'} pts</strong></span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <button
                    onClick={() => {
                      if (confirm(`¿Eliminar al paciente ${patient.id}?`)) {
                        onDeletePatient(patient.id);
                      }
                    }}
                    className="text-slate-400 hover:text-red-600 p-1 rounded"
                    title="Eliminar registro"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onSelectPatient(patient)}
                    className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    Abrir Caso
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
