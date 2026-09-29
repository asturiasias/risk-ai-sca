import React from 'react';
import { X, ExternalLink, BookOpen, ShieldCheck } from 'lucide-react';
import { EvidenceItem } from '../types/clinical';

interface EvidenceModalProps {
  evidence: EvidenceItem | null;
  onClose: () => void;
}

export const EvidenceModal: React.FC<EvidenceModalProps> = ({ evidence, onClose }) => {
  if (!evidence) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-lg max-w-2xl w-full p-6 shadow-xl space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-teal-600" />
            <div>
              <h2 className="text-sm font-bold text-slate-900">{evidence.guidelineOrStudy} ({evidence.year})</h2>
              <span className="text-xs text-slate-500">{evidence.societyOrJournal}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Title & Section */}
        <div>
          <h3 className="text-sm font-semibold text-slate-900 mb-1">{evidence.title}</h3>
          <span className="text-xs font-medium text-teal-700 block">{evidence.section}</span>
        </div>

        {/* Quoted Text */}
        <div className="bg-slate-50 border-l-4 border-teal-600 p-4 rounded-r text-xs leading-relaxed text-slate-800">
          <p className="font-serif italic text-slate-900 text-[13px] leading-relaxed">
            "{evidence.recommendationQuote}"
          </p>
        </div>

        {/* Metadata */}
        <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded border border-slate-100">
          <div>
            <span className="text-slate-500 block text-[11px]">Clase de Recomendación:</span>
            <strong className="text-slate-800">{evidence.classOfRecommendation || 'No especificada'}</strong>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">Nivel de Evidencia:</span>
            <strong className="text-slate-800">{evidence.levelOfEvidence || 'No especificado'}</strong>
          </div>
        </div>

        {/* Footer & Link */}
        <div className="pt-2 flex justify-between items-center text-xs">
          <span className="text-[11px] text-slate-400 font-mono">ID: {evidence.id}</span>
          <a
            href={evidence.url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded font-medium flex items-center gap-1.5 transition-colors shadow-sm"
          >
            Abrir Artículo Original (DOI)
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
