import React, { useState } from 'react';
import { Search, BookOpen, ExternalLink, HardDrive, ShieldCheck, RefreshCw, FolderPlus, FileCheck } from 'lucide-react';
import { SCIENTIFIC_CORPUS, queryEvidenceCorpus } from '../services/evidenceCorpus';
import { EvidenceItem } from '../types/clinical';
import { EvidenceModal } from './EvidenceModal';

export const EvidenceLibraryView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceItem | null>(null);
  const [driveConnected, setDriveConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const results = queryEvidenceCorpus(searchQuery, 20);

  const handleSimulateDriveAuth = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      // Explica la limitación de conexión real si faltan variables OAuth
      alert(
        'Conector Google Drive (Seguridad y Privacidad):\n' +
        'En este entorno de demostración local se utiliza la biblioteca científica empaquetada verificada.\n' +
        'Para sincronizar con una carpeta corporativa en Google Drive en producción, se requiere configurar OAuth 2.0 client-side con ámbito estricto de solo lectura (drive.file/drive.readonly) y origen HTTPS autorizado.'
      );
    }, 600);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <EvidenceModal
        evidence={selectedEvidence}
        onClose={() => setSelectedEvidence(null)}
      />

      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-teal-600" />
          Biblioteca Científica y Recuperación Documental (RAG Local)
        </h1>
        <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
          Corpus científico verificado de guías internacionales (ESC 2023 SCA, ACC/AHA 2025, consensos ARC-HBR y ensayos clínicos clave).
          Aislamiento estricto: los documentos del paciente jamás se mezclan ni se indexan en este corpus.
        </p>

        {/* Google Drive Status & Connector Panel */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-slate-50 p-3 rounded">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">Conector Google Drive:</span>
            <span className="text-slate-500">
              {driveConnected ? 'Sincronizado' : 'Modo Biblioteca Local Integrada'}
            </span>
            <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">Solo lectura</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSimulateDriveAuth}
              disabled={isSyncing}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-2xs font-medium"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-teal-600' : ''}`} />
              {isSyncing ? 'Comprobando...' : 'Comprobar Sincronización'}
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar por fármaco, guía o término clínico (ej. 'prasugrel contraindicación', 'dapt 3 meses', 'shock cardiogénico')..."
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
          <span>Mostrando {results.length} evidencias verificadas</span>
          <span className="font-mono">Motor: Búsqueda léxica determinista con reranking local</span>
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {results.map(item => (
          <div
            key={item.id}
            className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col justify-between hover:border-slate-300 transition-colors shadow-2xs"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
                  {item.societyOrJournal} ({item.year})
                </span>
                <span className="text-[10px] text-slate-400 font-mono">ID: {item.id}</span>
              </div>

              <h2 className="text-sm font-bold text-slate-900 leading-snug mb-1">
                {item.title}
              </h2>
              <span className="text-xs font-semibold text-teal-700 block mb-2">
                {item.section}
              </span>

              <p className="text-xs text-slate-700 italic bg-slate-50 p-3 rounded border-l-2 border-teal-600 leading-relaxed font-serif line-clamp-4">
                "{item.recommendationQuote}"
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="text-[11px] text-slate-600 space-x-2">
                <span>Clase: <strong>{item.classOfRecommendation || 'n/a'}</strong></span>
                <span>·</span>
                <span>Nivel: <strong>{item.levelOfEvidence || 'n/a'}</strong></span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedEvidence(item)}
                  className="text-xs font-medium text-teal-700 hover:text-teal-900"
                >
                  Ver Cita Completa
                </button>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-slate-700 p-1"
                  title="Abrir DOI oficial"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
