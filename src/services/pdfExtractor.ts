// Extractor y Normalizador Clínico de Documentos (PDF y Texto)
// Reglas estrictas:
// - "No mencionado" = null (no asume 0)
// - "Niega diabetes" = 0 | "Diabetes documentada" = 1
// - Conserva fragmento de apoyo, documento, página y método de obtención
// - Detección de incompatibilidad de identidades

import { DataField, PatientRecord } from '../types/clinical';
import { CLINICAL_DICTIONARY } from './clinicalDictionary';
import { calculateCockcroftGault } from './calculators/cockcroftGault';

export interface ExtractedDocument {
  name: string;
  type: string;
  date?: string;
  text: string;
}

export interface ExtractionResult {
  patientId: string;
  episodeId: string;
  isSynthetic: boolean;
  fields: Record<string, DataField>;
  conflicts: string[];
  warnings: string[];
  documentsProcessed: string[];
}

export function createEmptyPatientRecord(id = 'SCA-NUEVO-001', episodeId = 'EP-01'): PatientRecord {
  const fields: Record<string, DataField> = {};

  for (const def of CLINICAL_DICTIONARY) {
    fields[def.key] = {
      key: def.key,
      label: def.shortLabel,
      header: def.header,
      value: null,
      normalizedValue: null,
      originalRawValue: undefined,
      unit: def.unit,
      canonicalUnit: def.unit,
      reviewStatus: 'pendiente',
      method: 'documentado',
      supportQuote: undefined
    };
  }

  fields.id_pseudonimo.value = id;
  fields.id_pseudonimo.normalizedValue = id;
  fields.id_episodio_indice.value = episodeId;
  fields.id_episodio_indice.normalizedValue = episodeId;
  fields.es_sintetico.value = 0;
  fields.es_sintetico.normalizedValue = 0;

  return {
    id,
    episodeId,
    isSynthetic: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    evaluationPhase: 'ingreso',
    reviewStatus: 'pendiente',
    data: fields,
    recommendationsAccepted: {}
  };
}

export function extractClinicalDataFromText(
  documents: ExtractedDocument[],
  targetPatientId?: string
): ExtractionResult {
  const warnings: string[] = [];
  const conflicts: string[] = [];
  const fullText = documents.map(d => `--- DOCUMENTO: ${d.name} ---\n${d.text}`).join('\n\n');

  // Inicializar campos con diccionario
  const fields: Record<string, DataField> = {};
  for (const def of CLINICAL_DICTIONARY) {
    fields[def.key] = {
      key: def.key,
      label: def.shortLabel,
      header: def.header,
      value: null,
      normalizedValue: null,
      originalRawValue: undefined,
      unit: def.unit,
      canonicalUnit: def.unit,
      reviewStatus: 'pendiente',
      method: 'documentado',
      supportQuote: undefined
    };
  }

  // 1. Detección de Identificadores y comprobación de pacientes incompatibles
  const idMatches = Array.from(fullText.matchAll(/ID:\s*([A-Za-z0-9\-_]+)/gi)).map(m => m[1]);
  const uniqueIds = Array.from(new Set(idMatches));
  if (uniqueIds.length > 1) {
    conflicts.push(`Alerta de seguridad: Se detectaron identificadores incompatibles en los documentos cargados (${uniqueIds.join(', ')}). No se fusionan automáticamente; verifique que pertenecen al mismo paciente.`);
  }

  const patientId = uniqueIds[0] || targetPatientId || `SCA-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
  fields.id_pseudonimo.value = patientId;
  fields.id_pseudonimo.normalizedValue = patientId;
  fields.id_episodio_indice.value = 'EP-01';
  fields.id_episodio_indice.normalizedValue = 'EP-01';

  // Detección de paciente sintético
  if (/sint[eé]tico|demostraci[oó]n/i.test(fullText)) {
    fields.es_sintetico.value = 1;
    fields.es_sintetico.normalizedValue = 1;
  } else {
    fields.es_sintetico.value = 0;
    fields.es_sintetico.normalizedValue = 0;
  }

  // Helper para asignar con cita y trazabilidad
  function setField(
    key: string,
    value: any,
    rawValue: string,
    quote: string,
    docName: string
  ) {
    if (fields[key]) {
      fields[key].value = value;
      fields[key].normalizedValue = value;
      fields[key].originalRawValue = rawValue;
      fields[key].supportQuote = quote.trim();
      fields[key].documentName = docName;
    }
  }

  // 2. Extracción de Edad
  const ageMatch = fullText.match(/(?:edad|var[oó]n|mujer|paciente)?\s*(?:de\s*)?(\d{2})\s*(?:a[ñn]os|a\b)/i);
  if (ageMatch) {
    const ageNum = parseInt(ageMatch[1], 10);
    if (ageNum >= 18 && ageNum <= 110) {
      setField('edad', ageNum, ageMatch[0], ageMatch[0], 'Documento de ingreso');
    }
  }

  // 3. Extracción de Sexo (0=M, 1=F)
  if (/\b(?:var[oó]n|hombre|masculino)\b/i.test(fullText)) {
    setField('sexo', 0, 'varón', 'Identificación de sexo: varón', 'Documento de ingreso');
  } else if (/\b(?:mujer|femenino)\b/i.test(fullText)) {
    setField('sexo', 1, 'mujer', 'Identificación de sexo: mujer', 'Documento de ingreso');
  }

  // 4. Peso, Talla e IMC
  const pesoMatch = fullText.match(/peso[:\s]*(\d{2,3}(?:[.,]\d+)?)\s*kg/i);
  if (pesoMatch) {
    const p = parseFloat(pesoMatch[1].replace(',', '.'));
    setField('peso_kg', p, pesoMatch[0], pesoMatch[0], 'Constantes');
  }
  const tallaMatch = fullText.match(/talla[:\s]*(\d{2,3})\s*cm/i);
  if (tallaMatch) {
    const t = parseFloat(tallaMatch[1]);
    setField('talla_cm', t, tallaMatch[0], tallaMatch[0], 'Constantes');
  }
  const imcMatch = fullText.match(/imc[:\s]*(\d{2}(?:[.,]\d+)?)\s*(?:kg\/m[²2])?/i);
  if (imcMatch) {
    const imcVal = parseFloat(imcMatch[1].replace(',', '.'));
    setField('imc', imcVal, imcMatch[0], imcMatch[0], 'Constantes');
  } else if (fields.peso_kg.value && fields.talla_cm.value) {
    const calcImc = Math.round((fields.peso_kg.value / Math.pow(fields.talla_cm.value / 100, 2)) * 10) / 10;
    fields.imc.value = calcImc;
    fields.imc.normalizedValue = calcImc;
    fields.imc.method = 'calculado';
    fields.imc.supportQuote = `Calculado: peso ${fields.peso_kg.value} kg / (talla ${fields.talla_cm.value} cm)²`;
  }

  // 5. Constantes vitales al ingreso
  const fcMatch = fullText.match(/(?:fc|frecuencia cardiaca)[:\s]*(\d{2,3})\s*(?:lpm|ppm|bpm)?/i);
  if (fcMatch) {
    setField('fc_ingreso', parseInt(fcMatch[1], 10), fcMatch[0], fcMatch[0], 'Constantes');
  }
  const paMatch = fullText.match(/(?:pa|presi[oó]n arterial|ta)[:\s]*(\d{2,3})\s*\/\s*(\d{2,3})\s*mmHg/i);
  if (paMatch) {
    setField('pas_ingreso', parseInt(paMatch[1], 10), paMatch[0], paMatch[0], 'Constantes');
    setField('pad_ingreso', parseInt(paMatch[2], 10), paMatch[0], paMatch[0], 'Constantes');
  }

  // 6. Tipo de SCA (0=SCACEST, 1=SCASEST, 2=Angina Inestable)
  if (/\b(?:scacest|stemi|elevaci[oó]n del segmento st|infarto agudo con elevaci[oó]n)\b/i.test(fullText)) {
    setField('tipo_sca', 0, 'SCACEST', 'SCACEST documentado', 'Urgencias');
    setField('desviacion_st_ecg', 1, 'ST elevado', 'Elevación del ST documentada', 'ECG');
  } else if (/\b(?:scasest|iamsest|nstemi|infarto sin elevaci[oó]n|sin elevaci[oó]n del st)\b/i.test(fullText)) {
    setField('tipo_sca', 1, 'SCASEST-IAM', 'SCASEST documentado', 'Urgencias');
  } else if (/\bangina inestable\b/i.test(fullText)) {
    setField('tipo_sca', 2, 'Angina Inestable', 'Angina inestable documentada', 'Urgencias');
  }

  // 7. Desviación ST en ECG
  if (/(?:descenso|depresi[oó]n|elevaci[oó]n) (?:del )?segmento st/i.test(fullText)) {
    setField('desviacion_st_ecg', 1, 'Desviación ST', 'Cambios en el segmento ST descritos en ECG', 'ECG');
  } else if (/sin (?:elevaci[oó]n ni descenso|cambios|desviaci[oó]n) (?:del )?st/i.test(fullText)) {
    setField('desviacion_st_ecg', 0, 'Sin desviación ST', 'ECG sin desviación aguda del ST', 'ECG');
  }

  // 8. Killip al ingreso
  const killipMatch = fullText.match(/killip\s*([I|V|1-4]+)/i);
  if (killipMatch) {
    const kStr = killipMatch[1].toUpperCase();
    let kNum = 1;
    if (kStr === 'IV' || kStr === '4') kNum = 4;
    else if (kStr === 'III' || kStr === '3') kNum = 3;
    else if (kStr === 'II' || kStr === '2') kNum = 2;
    setField('killip_ingreso', kNum, killipMatch[0], killipMatch[0], 'Exploración');
  }

  // 9. Antecedentes médicos: Negación explícita vs Presencia vs Desconocido
  // Diabetes
  if (/niega (?:diabetes|dm2?)|no diab[eé]tico/i.test(fullText)) {
    setField('diabetes', 0, 'Niega diabetes', 'Consta explícitamente: niega diabetes', 'Antecedentes');
  } else if (/\b(?:diabetes|diab[eé]tico|dm2?)\b/i.test(fullText)) {
    setField('diabetes', 1, 'Diabetes', 'Antecedente de diabetes documentado', 'Antecedentes');
  }

  // Hipertensión
  if (/niega (?:hta|hipertensi[oó]n)|no hipertenso/i.test(fullText)) {
    setField('hta_previa', 0, 'No hipertenso', 'Consta explícitamente: no hipertenso', 'Antecedentes');
  } else if (/\b(?:hta|hipertensi[oó]n arterial|hipertenso)\b/i.test(fullText)) {
    setField('hta_previa', 1, 'Hipertensión', 'Antecedente de HTA documentado', 'Antecedentes');
  }

  // Tabaquismo
  if (/fumador (?:activo|de)|tabaquismo activo|fuma \d+/i.test(fullText)) {
    setField('tabaquismo_activo', 1, 'Fumador activo', 'Tabaquismo activo documentado', 'Antecedentes');
    setField('tabaquismo_previo', 0, 'Activo', 'Fumador activo', 'Antecedentes');
  } else if (/exfumador|tabaquismo previo|abandon[oó] el tabaco/i.test(fullText)) {
    setField('tabaquismo_activo', 0, 'Exfumador', 'Exfumador documentado', 'Antecedentes');
    setField('tabaquismo_previo', 1, 'Exfumador', 'Exfumador documentado', 'Antecedentes');
  } else if (/no fumador|niega tabaquismo/i.test(fullText)) {
    setField('tabaquismo_activo', 0, 'No fumador', 'No fumador', 'Antecedentes');
    setField('tabaquismo_previo', 0, 'No fumador', 'No fumador', 'Antecedentes');
  }

  // Fibrilación auricular
  if (/\b(?:fibrilaci[oó]n auricular|fa permanente|fa parox[ií]stica)\b/i.test(fullText)) {
    setField('fa_previa', 1, 'Fibrilación auricular', 'FA documentada', 'Antecedentes');
  }

  // Sangrado previo
  if (/\b(?:sangrado|hemorragia|melenas|hematemesis|transfusi[oó]n)\b/i.test(fullText) && !/niega (?:sangrado|hemorragia)/i.test(fullText)) {
    setField('sangrado_previo_espontaneo', 1, 'Sangrado previo', 'Episodio de sangrado documentado', 'Antecedentes');
  } else if (/niega (?:sangrado|hemorragia)/i.test(fullText)) {
    setField('sangrado_previo_espontaneo', 0, 'Niega sangrado', 'Niega sangrado', 'Antecedentes');
  }

  // Ictus o AIT
  if (/niega (?:ictus|acv|ait)/i.test(fullText)) {
    setField('ictus_isquemico_previo', 0, 'Niega ictus', 'Niega ictus', 'Antecedentes');
    setField('ait_previo', 0, 'Niega AIT', 'Niega AIT', 'Antecedentes');
  } else if (/\b(?:ictus isqu[eé]mico|acv isqu[eé]mico)\b/i.test(fullText)) {
    setField('ictus_isquemico_previo', 1, 'Ictus isquémico', 'Ictus documentado', 'Antecedentes');
  } else if (/\bait\b|accidente isqu[eé]mico transitorio/i.test(fullText)) {
    setField('ait_previo', 1, 'AIT', 'AIT documentado', 'Antecedentes');
  }

  // 10. Laboratorio: Hemoglobina, Creatinina, Troponina
  const hbMatch = fullText.match(/hemoglobina[:\s]*(\d{1,2}(?:[.,]\d+)?)\s*(?:g\/dL)?/i);
  if (hbMatch) {
    const hb = parseFloat(hbMatch[1].replace(',', '.'));
    setField('hemoglobina_ingreso', hb, hbMatch[0], hbMatch[0], 'Laboratorio');
  }
  const htoMatch = fullText.match(/hematocrito[:\s]*(\d{1,2}(?:[.,]\d+)?)\s*%/i);
  if (htoMatch) {
    const hto = parseFloat(htoMatch[1].replace(',', '.'));
    setField('hematocrito_ingreso', hto, htoMatch[0], htoMatch[0], 'Laboratorio');
  }
  const leucoMatch = fullText.match(/leucocitos[:\s]*(\d{1,2}(?:[.,]\d+)?)\s*(?:x\s*10\^9\/L|mil)?/i);
  if (leucoMatch) {
    const l = parseFloat(leucoMatch[1].replace(',', '.'));
    setField('leucocitos_ingreso', l, leucoMatch[0], leucoMatch[0], 'Laboratorio');
  }
  const plaqMatch = fullText.match(/plaquetas[:\s]*(\d{2,3}(?:[.,]\d+)?)\s*(?:x\s*10\^9\/L)?/i);
  if (plaqMatch) {
    const p = parseFloat(plaqMatch[1].replace(',', '.'));
    setField('plaquetas_ingreso', p, plaqMatch[0], plaqMatch[0], 'Laboratorio');
  }
  const crMatch = fullText.match(/creatinina(?:\s*s[eé]rica)?[:\s]*(\d{1,2}(?:[.,]\d+)?)\s*mg\/dL/i);
  if (crMatch) {
    const cr = parseFloat(crMatch[1].replace(',', '.'));
    setField('creatinina_ingreso', cr, crMatch[0], crMatch[0], 'Laboratorio');
  }

  // Troponina pico
  const tropMatches = Array.from(fullText.matchAll(/troponina\s*(?:[I|T])?\s*(?:ultrasensible)?[:\s]*(\d[\d,.]*)\s*(?:ng\/L|pg\/mL)?/gi));
  if (tropMatches.length > 0) {
    const values = tropMatches.map(m => parseFloat(m[1].replace(/\./g, '').replace(',', '.'))).filter(v => !isNaN(v));
    if (values.length > 0) {
      const peak = Math.max(...values);
      setField('troponina_pico_observado', peak, `Pico: ${peak} ng/L`, `Troponina pico observado: ${peak} ng/L`, 'Laboratorio');
      // Biomarcadores elevados
      if (peak > 14) {
        setField('biomarcadores_positivos_elevados', 1, 'Elevados', 'Troponina por encima del percentil 99', 'Laboratorio');
      } else {
        setField('biomarcadores_positivos_elevados', 0, 'Normales', 'Troponina negativa seriada', 'Laboratorio');
      }
    }
  }

  // FEVI
  const feviMatch = fullText.match(/(?:fevi|fracci[oó]n de eyecci[oó]n)[:\s]*(\d{2})\s*%/i);
  if (feviMatch) {
    const fe = parseInt(feviMatch[1], 10);
    setField('fevi_inicial', fe, feviMatch[0], feviMatch[0], 'Ecocardiograma');
  }

  // Perfil lipídico: c-LDL
  const ldlMatch = fullText.match(/(?:c-ldl|ldl(?:-c)?|colesterol ldl)[:\s]*(\d{2,3})\s*mg\/dL/i);
  if (ldlMatch) {
    const ldl = parseInt(ldlMatch[1], 10);
    setField('ldl_colesterol', ldl, ldlMatch[0], ldlMatch[0], 'Perfil Lipídico');
  }

  // 11. Farmacoterapia y antiagregación
  if (/\b(?:aas|aspirina|[aá]cido acetilsalic[ií]lico)\b/i.test(fullText)) {
    setField('aas_documentado', 1, 'AAS', 'AAS documentado', 'Farmacoterapia');
  }
  if (/\bticagrelor\b/i.test(fullText)) {
    setField('ticagrelor_documentado', 1, 'Ticagrelor', 'Ticagrelor documentado', 'Farmacoterapia');
  }
  if (/\bprasugrel\b/i.test(fullText)) {
    setField('prasugrel_documentado', 1, 'Prasugrel', 'Prasugrel documentado', 'Farmacoterapia');
  }
  if (/\bclopidogrel\b/i.test(fullText)) {
    setField('clopidogrel_documentado', 1, 'Clopidogrel', 'Clopidogrel documentado', 'Farmacoterapia');
  }
  if (/\b(?:apixab[aá]n|rivaroxab[aá]n|edoxab[aá]n|dabigatr[aá]n|sintrom|acenocumarol|warfarina)\b/i.test(fullText)) {
    setField('anticoagulante_oral_documentado', 1, 'Anticoagulante oral', 'Anticoagulante oral documentado', 'Farmacoterapia');
    setField('anticoagulacion_oral_cronica', 1, 'Anticoagulación', 'Anticoagulación oral documentada', 'Antecedentes');
  }

  // Estatinas y Alta Intensidad (atorva >= 40 o rosuva >= 20)
  if (/atorvastatina\s*(?:40|80)|rosuvastatina\s*(?:20|40)|atorva\s*4|rosuva\s*2/i.test(fullText)) {
    setField('estatinas_documentadas', 1, 'Estatina', 'Estatina documentada', 'Farmacoterapia');
    setField('estatina_alta_intensidad', 1, 'Alta intensidad', 'Atorvastatina ≥40 o Rosuvastatina ≥20', 'Farmacoterapia');
  } else if (/atorvastatina|rosuvastatina|simvastatina|pitavastatina/i.test(fullText)) {
    setField('estatinas_documentadas', 1, 'Estatina', 'Estatina documentada sin dosis precisada', 'Farmacoterapia');
    // Si no se puede precisar dosis, intensidad queda null (.) según instrucciones
    fields.estatina_alta_intensidad.value = null;
    fields.estatina_alta_intensidad.normalizedValue = null;
  }

  // IBP
  if (/pantoprazol|omeprazol|esomeprazol|lansoprazol|ibp/i.test(fullText)) {
    setField('ibp_documentado', 1, 'IBP', 'Inhibidor de bomba de protones documentado', 'Farmacoterapia');
  }

  // Rehabilitación cardiaca
  if (/rehabilitaci[oó]n cardiaca/i.test(fullText)) {
    setField('rehabilitacion_cardiaca_documentada', 1, 'Rehabilitación', 'Derivación a RHB documentada', 'Alta');
  }

  // 12. Cálculo automático de Cockcroft-Gault
  if (fields.edad.value && fields.peso_kg.value && fields.creatinina_ingreso.value && fields.sexo.value !== null) {
    const cg = calculateCockcroftGault(fields.edad.value, fields.peso_kg.value, fields.creatinina_ingreso.value, fields.sexo.value);
    if (cg.crCl) {
      fields.aclaramiento_creatinina_cg.value = cg.crCl;
      fields.aclaramiento_creatinina_cg.normalizedValue = cg.crCl;
      fields.aclaramiento_creatinina_cg.method = 'calculado';
      fields.aclaramiento_creatinina_cg.supportQuote = cg.formulaString;
    }
  }

  return {
    patientId,
    episodeId: 'EP-01',
    isSynthetic: fields.es_sintetico.value === 1,
    fields,
    conflicts,
    warnings,
    documentsProcessed: documents.map(d => d.name)
  };
}
