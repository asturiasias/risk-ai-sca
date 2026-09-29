// Servicio de Almacenamiento Local (IndexedDB / localStorage) y Exportaciones XLSX, CSV, JSON
import * as XLSX from 'xlsx';
import { PatientRecord } from '../types/clinical';
import { CLINICAL_DICTIONARY, formatValueForDisplay } from './clinicalDictionary';
import { computeAllPatientScores } from './calculators';
import { SCIENTIFIC_CORPUS } from './evidenceCorpus';

const DB_NAME = 'RiskAiScaDatabase_v1';
const STORE_NAME = 'patients';
const LOCAL_STORAGE_BACKUP_KEY = 'RISK_AI_SCA_PATIENTS_BACKUP';

// Inicialización de IndexedDB
export async function openPatientDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB no soportado en este entorno'));
      return;
    }
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = event => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Guardar paciente (upsert)
export async function savePatientToStorage(patient: PatientRecord): Promise<void> {
  // 1. Guardar en IndexedDB
  try {
    const db = await openPatientDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(patient);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Fallo en IndexedDB, recurriendo a localStorage:', err);
  }

  // 2. Guardar siempre réplica en localStorage para redundancia
  try {
    const existing = getAllPatientsFromLocalStorage();
    const index = existing.findIndex(p => p.id === patient.id);
    if (index >= 0) {
      existing[index] = patient;
    } else {
      existing.push(patient);
    }
    localStorage.setItem(LOCAL_STORAGE_BACKUP_KEY, JSON.stringify(existing));
  } catch (e) {
    console.warn('Error al guardar copia en localStorage:', e);
  }
}

// Obtener todos los pacientes
export async function loadAllPatientsFromStorage(): Promise<PatientRecord[]> {
  try {
    const db = await openPatientDatabase();
    const patients = await new Promise<PatientRecord[]>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });

    if (patients && patients.length > 0) {
      return patients;
    }
  } catch (e) {
    console.warn('IndexedDB no accesible, usando localStorage:', e);
  }

  return getAllPatientsFromLocalStorage();
}

function getAllPatientsFromLocalStorage(): PatientRecord[] {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_BACKUP_KEY);
    if (data) {
      return JSON.parse(data) as PatientRecord[];
    }
  } catch (e) {
    console.error('Error al leer de localStorage:', e);
  }
  return [];
}

// Eliminar paciente
export async function deletePatientFromStorage(patientId: string): Promise<void> {
  try {
    const db = await openPatientDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(patientId);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.warn('Error al borrar de IndexedDB:', e);
  }

  try {
    const existing = getAllPatientsFromLocalStorage();
    const filtered = existing.filter(p => p.id !== patientId);
    localStorage.setItem(LOCAL_STORAGE_BACKUP_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error('Error al actualizar localStorage tras borrado:', e);
  }
}

// Exportación a XLSX con múltiples hojas (BD_SCA, Diccionario, Scores, Evidencias)
export function exportDatabaseToXLSX(patients: PatientRecord[]): void {
  const wb = XLSX.utils.book_new();

  // Hoja 1: BD_SCA (Un sujeto por fila, encabezados claros con unidades, . para faltantes)
  const headers = CLINICAL_DICTIONARY.map(d => d.header);
  const rows: any[][] = [];

  for (const patient of patients) {
    const row = CLINICAL_DICTIONARY.map(d => {
      const field = patient.data[d.key];
      const val = field?.value;
      if (val === null || val === undefined || val === '') return '.';
      return val;
    });
    rows.push(row);
  }

  const wsBd = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  XLSX.utils.book_append_sheet(wb, wsBd, 'BD_SCA');

  // Hoja 2: Diccionario
  const dictRows = CLINICAL_DICTIONARY.map(d => [
    d.key,
    d.shortLabel,
    d.header,
    d.category,
    d.unit || 'n/a',
    d.description
  ]);
  const wsDict = XLSX.utils.aoa_to_sheet([
    ['Clave', 'Etiqueta', 'Encabezado Autoexplicativo', 'Categoría', 'Unidad Canónica', 'Descripción'],
    ...dictRows
  ]);
  XLSX.utils.book_append_sheet(wb, wsDict, 'Diccionario');

  // Hoja 3: Scores calculados
  const scoreHeaders = [
    'ID Seudónimo',
    'CrCl Cockcroft-Gault (mL/min)',
    'GRACE Puntos',
    'GRACE Categoría',
    'TIMI UA/NSTEMI',
    'PRECISE-DAPT Puntos',
    'CRUSADE Puntos',
    'PARIS CTE',
    'PARIS MB',
    'DAPT Score Puntos',
    'ARC-HBR Clasificación',
    'CHA2DS2-VASc Puntos'
  ];
  const scoreRows = patients.map(p => {
    const s = computeAllPatientScores(p);
    return [
      p.id,
      s.cockcroftGault.crCl ?? '.',
      s.grace.points ?? '.',
      s.grace.riskCategory,
      s.timi.points ?? '.',
      s.preciseDapt.points ?? '.',
      s.crusade.points ?? '.',
      s.parisThrombotic.points ?? '.',
      s.parisBleeding.points ?? '.',
      s.daptScore.points ?? 'No aplicable',
      s.arcHbr.isHbr === true ? 'HBR Positivo' : s.arcHbr.isHbr === false ? 'No HBR' : 'Indeterminado',
      s.cha2ds2Vasc.points ?? '.'
    ];
  });
  const wsScores = XLSX.utils.aoa_to_sheet([scoreHeaders, ...scoreRows]);
  XLSX.utils.book_append_sheet(wb, wsScores, 'Scores');

  // Hoja 4: Evidencias
  const evRows = SCIENTIFIC_CORPUS.map(e => [
    e.id,
    e.societyOrJournal,
    e.year,
    e.title,
    e.section,
    e.classOfRecommendation || 'n/a',
    e.levelOfEvidence || 'n/a',
    e.doi
  ]);
  const wsEv = XLSX.utils.aoa_to_sheet([
    ['ID Evidencia', 'Sociedad/Revista', 'Año', 'Título', 'Sección', 'Clase', 'Nivel', 'DOI'],
    ...evRows
  ]);
  XLSX.utils.book_append_sheet(wb, wsEv, 'Evidencias');

  // Descarga con soporte directo y fallback Blob para iframes
  try {
    XLSX.writeFile(wb, `Risk_AI_SCA_Base_Acumulativa_${new Date().toISOString().slice(0, 10)}.xlsx`);
  } catch (err) {
    console.warn('XLSX.writeFile fallback via Blob:', err);
    try {
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Risk_AI_SCA_Base_Acumulativa_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (fallbackErr) {
      console.error('Error al descargar archivo XLSX:', fallbackErr);
      // Fallback final a CSV
      exportDatabaseToCSV(patients);
    }
  }
}

// Exportación a CSV
export function exportDatabaseToCSV(patients: PatientRecord[]): void {
  const headers = CLINICAL_DICTIONARY.map(d => `"${d.header.replace(/"/g, '""')}"`);
  const lines: string[] = [headers.join(',')];

  for (const patient of patients) {
    const values = CLINICAL_DICTIONARY.map(d => {
      const field = patient.data[d.key];
      const val = field?.value;
      const formatted = formatValueForDisplay(val);
      // Escape CSV y prevención de inyección de fórmulas (=, +, -, @)
      let escaped = formatted;
      if (typeof escaped === 'string' && /^[=+\-@]/.test(escaped)) {
        escaped = `'${escaped}`;
      }
      return `"${String(escaped).replace(/"/g, '""')}"`;
    });
    lines.push(values.join(','));
  }

  const csvContent = '\uFEFF' + lines.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Risk_AI_SCA_Base_Acumulativa_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

// Exportación de Copia de Seguridad JSON completa
export function exportBackupJSON(patients: PatientRecord[]): void {
  const backup = {
    schemaVersion: '1.0.0',
    exportTimestamp: new Date().toISOString(),
    totalPatients: patients.length,
    dictionaryVersion: '2026.1',
    corpusVersion: 'ESC-2023-ACC-2025',
    patients
  };

  const jsonString = JSON.stringify(backup, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Risk_AI_SCA_Copia_Seguridad_${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

// Restauración de Copia de Seguridad JSON con control de conflictos
export function parseAndValidateBackupJSON(jsonContent: string): {
  valid: boolean;
  patients: PatientRecord[];
  error?: string;
  summary?: string;
} {
  try {
    const parsed = JSON.parse(jsonContent);
    if (!parsed || !Array.isArray(parsed.patients)) {
      return { valid: false, patients: [], error: 'El archivo JSON no contiene un arreglo de pacientes válido.' };
    }

    const validPatients: PatientRecord[] = [];
    for (const p of parsed.patients) {
      if (p.id && p.data) {
        validPatients.push(p);
      }
    }

    return {
      valid: true,
      patients: validPatients,
      summary: `Se validaron ${validPatients.length} registros clínicos listos para restaurar.`
    };
  } catch (err: any) {
    return { valid: false, patients: [], error: `Error de sintaxis JSON: ${err.message}` };
  }
}
