import React, { useState } from 'react';
import { UploadCloud, FileText, AlertTriangle, ArrowRight, Sparkles, Check, Info } from 'lucide-react';
import { ExtractedDocument, extractClinicalDataFromText, createEmptyPatientRecord } from '../services/pdfExtractor';
import { PatientRecord } from '../types/clinical';
import { SYNTHETIC_PATIENTS } from '../services/syntheticPatients';

interface DocumentIntakeViewProps {
  onExtractionCompleted: (record: PatientRecord) => void;
  onLoadSyntheticCase: (syntheticId: string) => void;
}

export const DocumentIntakeView: React.FC<DocumentIntakeViewProps> = ({
  onExtractionCompleted,
  onLoadSyntheticCase
}) => {
  const [pastedText, setPastedText] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<ExtractedDocument[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [conflictError, setConflictError] = useState<string | null>(null);
  const [selectedPhase, setSelectedPhase] = useState<'urgencias' | 'ingreso' | 'cateterismo' | 'alta' | 'seguimiento_12m'>('ingreso');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newDocs: ExtractedDocument[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type === 'application/pdf') {
        try {
          // Lectura de texto de PDF con pdfjs si está disponible o lectura de texto crudo
          const text = await extractTextFromPdfOrFallback(file);
          newDocs.push({
            name: file.name,
            type: 'pdf',
            date: new Date(file.lastModified).toISOString().slice(0, 16).replace('T', ' '),
            text
          });
        } catch (err) {
          newDocs.push({
            name: file.name,
            type: 'pdf',
            date: new Date().toISOString().slice(0, 16),
            text: `[ADVERTENCIA: No se pudo extraer capa de texto automática de ${file.name}. Si el archivo está escaneado, pegue el texto o complete el formulario manual].`
          });
        }
      } else {
        // Archivos de texto (.txt, .md, etc.)
        const content = await file.text();
        newDocs.push({
          name: file.name,
          type: 'text',
          date: new Date(file.lastModified).toISOString().slice(0, 16).replace('T', ' '),
          text: content
        });
      }
    }

    setUploadedFiles(prev => [...prev, ...newDocs]);
  };

  const extractTextFromPdfOrFallback = async (file: File): Promise<string> => {
    // Intentar leer texto mediante FileReader
    const buffer = await file.arrayBuffer();
    // Búsqueda simple de streams de texto en el PDF binario para entornos sin worker
    const decoder = new TextDecoder('latin1');
    const raw = decoder.decode(buffer);
    const textChunks: string[] = [];
    
    // Extracción regex de streams /BT ... /ET o strings en paréntesis
    const streamMatches = raw.match(/\((?:[^()\\]|\\.)*\)/g);
    if (streamMatches && streamMatches.length > 10) {
      for (const m of streamMatches.slice(0, 500)) {
        const cleaned = m.slice(1, -1).replace(/\\([()\\])/g, '$1');
        if (cleaned.length > 2 && /[a-zA-Z0-9]/.test(cleaned)) {
          textChunks.push(cleaned);
        }
      }
    }

    if (textChunks.length > 15) {
      return textChunks.join(' ');
    }
    
    return `Informe clínico extraído de archivo: ${file.name}\n(Si el PDF no contiene texto incrustado, por favor pegue el texto en el cajetín inferior).`;
  };

  const handleProcessDocuments = () => {
    setConflictError(null);
    setIsProcessing(true);

    const documentsToProcess: ExtractedDocument[] = [...uploadedFiles];
    if (pastedText.trim().length > 0) {
      documentsToProcess.push({
        name: 'Texto Pegado por el Médico',
        type: 'text',
        date: new Date().toISOString().slice(0, 16),
        text: pastedText
      });
    }

    if (documentsToProcess.length === 0) {
      // Si no hay documentos, crea un paciente vacío para llenado manual
      const empty = createEmptyPatientRecord();
      empty.evaluationPhase = selectedPhase;
      setIsProcessing(false);
      onExtractionCompleted(empty);
      return;
    }

    const extraction = extractClinicalDataFromText(documentsToProcess);

    if (extraction.conflicts.length > 0) {
      setConflictError(extraction.conflicts.join('\n'));
      setIsProcessing(false);
      return;
    }

    const newRecord: PatientRecord = {
      id: extraction.patientId,
      episodeId: extraction.episodeId,
      isSynthetic: extraction.isSynthetic,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      evaluationPhase: selectedPhase,
      reviewStatus: 'pendiente',
      data: extraction.fields,
      recommendationsAccepted: {}
    };

    setIsProcessing(false);
    onExtractionCompleted(newRecord);
  };

  const loadPresetSynthetic = (synthId: string) => {
    onLoadSyntheticCase(synthId);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Intro Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          Carga de Documentos y Extracción de Datos Clínicos del Paciente
        </h1>
        <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
          Cargue múltiples archivos PDF o pegue informes clínicos (urgencias, analíticas, cateterismo, evolución) de un único paciente.
          El motor de extracción local identificará entidades estructuradas conservando las evidencias textuales exactas para su posterior revisión médica.
        </p>

        {/* Phase selector */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-700">Fase clínica de la evaluación:</span>
          <div className="inline-flex rounded-md shadow-sm border border-slate-200 p-0.5 bg-slate-50 text-xs">
            {(['urgencias', 'ingreso', 'cateterismo', 'alta', 'seguimiento_12m'] as const).map(phase => (
              <button
                key={phase}
                onClick={() => setSelectedPhase(phase)}
                className={`px-2.5 py-1 rounded capitalize font-medium transition-colors ${
                  selectedPhase === phase ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {phase === 'seguimiento_12m' ? '12m (DAPT)' : phase}
              </button>
            ))}
          </div>
          <span className="text-[11px] text-slate-500 ml-auto hidden sm:inline">
            * Evita fuga de información futura en evaluaciones precoces.
          </span>
        </div>
      </div>

      {/* Conflict / Incompatibility Alert */}
      {conflictError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-900 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <strong className="block text-sm font-semibold text-red-800">
              Bloqueo de Seguridad: Conflicto de Identidad Detectado
            </strong>
            <p className="mt-1 whitespace-pre-wrap">{conflictError}</p>
            <span className="block mt-2 font-medium">
              Por normativa de protección y seguridad asistencial, no se permite la fusión automática de pacientes distintos.
            </span>
          </div>
        </div>
      )}

      {/* Upload & Paste Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Dropzone PDF */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-teal-600" />
                Cargar Archivos PDF / Texto
              </h2>
              <span className="text-[11px] text-slate-400">PDF con capa de texto, TXT</span>
            </div>

            <label className="border-2 border-dashed border-slate-200 rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-teal-500 hover:bg-slate-50/50 transition-colors">
              <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
              <span className="text-xs font-medium text-slate-700">
                Arrastre o pulse para seleccionar PDFs del paciente
              </span>
              <span className="text-[11px] text-slate-400 mt-1">
                Puede seleccionar varios documentos simultáneamente
              </span>
              <input
                type="file"
                multiple
                accept=".pdf,.txt,.text"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {/* File List */}
            {uploadedFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                <span className="text-xs font-semibold text-slate-700">Documentos preparados ({uploadedFiles.length}):</span>
                <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                  {uploadedFiles.map((doc, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs bg-slate-50 border border-slate-200 p-2 rounded"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <span className="truncate font-medium text-slate-800">{doc.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0 font-mono">{doc.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-slate-500">
            <Info className="w-3.5 h-3.5 shrink-0 text-slate-400" />
            <span>Los archivos se procesan 100% en local en el navegador, sin envío a servidores externos.</span>
          </div>
        </div>

        {/* Large Text Area */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-600" />
                Cajetín Clínico de Texto
              </h2>
              <span className="text-[11px] text-slate-400">Pegado libre de informes</span>
            </div>
            <textarea
              value={pastedText}
              onChange={e => setPastedText(e.target.value)}
              placeholder="Pegue aquí el texto del informe de alta, analítica seriada, descripción del ECG o cateterismo...
Ejemplo:
Varón de 64 años, fumador activo, no hipertenso, niega diabetes.
Ingresa por SCACEST inferior. FC: 72 lpm, PA: 130/80 mmHg, Killip I.
Analítica: Hb 14.2 g/dL, Creatinina 0.95 mg/dL. Troponina ultrasensible pico 24,000 ng/L..."
              rows={8}
              className="w-full text-xs font-mono text-slate-800 border border-slate-200 rounded p-2.5 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          <div className="mt-3 flex justify-between items-center">
            <button
              type="button"
              onClick={() => setPastedText('')}
              className="text-xs text-slate-500 hover:text-slate-800"
            >
              Limpiar cajetín
            </button>
            <span className="text-[11px] text-slate-400">{pastedText.length} caracteres</span>
          </div>
        </div>
      </div>

      {/* Main Process Button */}
      <div className="flex justify-between items-center bg-white border border-slate-200 rounded-lg p-4">
        <div>
          <span className="text-xs font-semibold text-slate-900 block">
            Extracción Determinista Asistida y Normalización
          </span>
          <span className="text-[11px] text-slate-500">
            Aplica reglas clínicas verificadas, conserva citas de apoyo y prepara la revisión dato a dato por el médico.
          </span>
        </div>
        <button
          onClick={handleProcessDocuments}
          disabled={isProcessing}
          className="px-5 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded transition-colors flex items-center gap-2 shadow-sm"
        >
          {isProcessing ? 'Extrayendo...' : 'Extraer Datos y Pasar a Revisión'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Synthetic Profiles Quick Selector */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <h2 className="text-sm font-semibold text-slate-900">
              O bien cargue un Caso Clínico Sintético para Demostración Inmediata
            </h2>
          </div>
          <span className="text-[11px] font-medium text-amber-800 bg-amber-100/60 px-2 py-0.5 rounded">
            8 Casos Validados
          </span>
        </div>
        <p className="text-xs text-slate-600 mb-4">
          Seleccione cualquiera de los 8 perfiles con historia clínica y analíticas seriadas completas para probar los algoritmos:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {SYNTHETIC_PATIENTS.map(sp => (
            <button
              key={sp.id}
              onClick={() => loadPresetSynthetic(sp.id)}
              className="text-left bg-white border border-slate-200 hover:border-teal-500 hover:bg-teal-50/20 p-3 rounded transition-all text-xs group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-slate-900 group-hover:text-teal-700">
                  Caso {sp.number}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">{sp.id}</span>
              </div>
              <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                {sp.summary}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
