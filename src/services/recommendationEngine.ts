// Motor de Recomendaciones Clínicas Trazables: "Recuperación Documental + Reglas Locales"
// Fundamentado en Guías ESC 2023 SCA, ACC/AHA 2025, consensos ARC-HBR y fichas técnicas oficiales.

import { PatientRecord, ClinicalRecommendation, EvidenceItem } from '../types/clinical';
import { PatientCalculatedScores } from './calculators';
import { SCIENTIFIC_CORPUS } from './evidenceCorpus';

export function generateClinicalPlan(
  patient: PatientRecord,
  scores: PatientCalculatedScores
): ClinicalRecommendation[] {
  const d = patient.data;
  const recs: ClinicalRecommendation[] = [];

  const tipoSca = d.tipo_sca?.value; // 0=SCACEST, 1=SCASEST-IAM, 2=Angina Inestable
  const edad = d.edad?.value;
  const peso = d.peso_kg?.value;
  const sexo = d.sexo?.value;
  const crcl = scores.cockcroftGault.crCl ?? d.aclaramiento_creatinina_cg?.value;
  const fevi = d.fevi_inicial?.value;
  const killip = d.killip_ingreso?.value ?? 1;
  const tieneFa = d.fa_previa?.value === 1 || d.anticoagulacion_oral_cronica?.value === 1;
  const ictusPrevio = d.ictus_isquemico_previo?.value === 1 || d.ait_previo?.value === 1;
  const hicPrevia = d.hemorragia_intracraneal_previa?.value === 1;
  const diabetes = d.diabetes?.value === 1;
  const isHbr = scores.arcHbr.isHbr === true || (scores.preciseDapt.points !== null && scores.preciseDapt.points >= 25);
  const esMultivaso = d.numero_vasos_enfermos?.value !== null && d.numero_vasos_enfermos?.value > 1;
  const revascCompleta = d.revascularizacion_completa?.value;

  // -------------------------------------------------------------
  // FASE 1: Urgencias y Estrategia Invasiva
  // -------------------------------------------------------------
  if (tipoSca === 0) {
    // SCACEST
    recs.push({
      id: 'REC-INVASIVO-SCACEST',
      domain: 'urgencias',
      phase: 'Urgencias / Reperfusión',
      action: 'Estrategia de reperfusión inmediata mediante ICP primaria por acceso radial',
      patientMotivations: [
        'Diagnóstico documentado de SCACEST (elevación persistente del segmento ST)',
        'Tiempo es miocardio: objetivo demora puerta-guía < 60-90 minutos'
      ],
      clinicalJustification: 'La intervención coronaria percutánea (ICP) primaria inmediata es el tratamiento de reperfusión de elección estándar si se realiza en < 120 min desde el diagnóstico de SCACEST.',
      benefitsRisks: 'Reduce la mortalidad global, el reinfarto y la hemorragia intracraneal frente a fibrinolisis. El acceso radial reduce el sangrado del sitio de punción y la mortalidad.',
      alternative: 'Fibrinolisis inmediata (< 10 min) solo si el retraso anticipado a la ICP primaria supera los 120 minutos y no hay contraindicaciones.',
      contraindicationsChecked: ['Acceso femoral si ausencia de pulsos radiales o test de Allen patológico'],
      evidenceItems: SCIENTIFIC_CORPUS.filter(e => e.id === 'ESC-2023-ACS-INVASIVE-IMMEDIATE'),
      defaultStatus: patient.recommendationsAccepted?.['REC-INVASIVO-SCACEST'] ?? 'pendiente'
    });
  } else {
    // SCASEST o Angina Inestable
    const graceScore = scores.grace.points;
    const esMuyAltoRiesgo = killip >= 3 || d.parada_cardiaca_ingreso?.value === 1;
    const esAltoRiesgo = (graceScore !== null && graceScore > 140) || d.desviacion_st_ecg?.value === 1 || d.biomarcadores_positivos_elevados?.value === 1;

    if (esMuyAltoRiesgo) {
      recs.push({
        id: 'REC-INVASIVO-SCASEST-INMEDIATA',
        domain: 'urgencias',
        phase: 'Urgencias / Cateterismo',
        action: 'Estrategia invasiva INMEDIATA (< 2 horas desde el ingreso)',
        patientMotivations: [
          killip >= 3 ? `Insuficiencia cardiaca aguda / edema pulmonar / Killip ${killip}` : 'Criterio de inestabilidad hemodinámica/eléctrica al ingreso'
        ],
        clinicalJustification: 'Presencia de criterios de muy alto riesgo en SCASEST con inestabilidad hemodinámica o fallo cardiaco agudo.',
        benefitsRisks: 'Permite descompresión isquémica precoz y estabilización circulatoria.',
        contraindicationsChecked: ['Ausencia de sangrado incontrolable activo'],
        evidenceItems: SCIENTIFIC_CORPUS.filter(e => e.id === 'ESC-2023-ACS-INVASIVE-IMMEDIATE'),
        defaultStatus: patient.recommendationsAccepted?.['REC-INVASIVO-SCASEST-INMEDIATA'] ?? 'pendiente'
      });
    } else if (esAltoRiesgo) {
      recs.push({
        id: 'REC-INVASIVO-SCASEST-PRECOZ',
        domain: 'invasivo',
        phase: 'Ingreso (< 24 horas)',
        action: 'Estrategia invasiva PRECOZ (< 24 horas)',
        patientMotivations: [
          graceScore !== null && graceScore > 140 ? `Puntuación de riesgo GRACE elevada (${graceScore} > 140 puntos)` : 'Cambios dinámicos de ST y/o elevación confirmada de troponina'
        ],
        clinicalJustification: 'Pacientes con SCASEST de alto riesgo se benefician de coronariografía en las primeras 24 horas con vistas a revascularización guiada por la anatomía.',
        benefitsRisks: 'Reduce la estancia hospitalaria, rehospitalizaciones y recurrencia de isquemia miocárdica refractaria.',
        contraindicationsChecked: ['Revisión previa de función renal (creatinina/CrCl) para prevenir nefropatía por contraste'],
        evidenceItems: SCIENTIFIC_CORPUS.filter(e => e.id === 'ESC-2023-ACS-INVASIVE-EARLY'),
        defaultStatus: patient.recommendationsAccepted?.['REC-INVASIVO-SCASEST-PRECOZ'] ?? 'pendiente'
      });
    }
  }

  // Multivaso y revascularización completa
  if (esMultivaso && revascCompleta === 0) {
    recs.push({
      id: 'REC-REVASC-COMPLETA',
      domain: 'invasivo',
      phase: 'Ingreso / Procedimiento diferido',
      action: 'Planificar revascularización completa de lesiones coronarias no culpables con estenosis significativa',
      patientMotivations: [
        `Enfermedad multivaso documentada (${d.numero_vasos_enfermos?.value} vasos afectados)`,
        'Revascularización incompleta inicial en procedimiento de urgencia'
      ],
      clinicalJustification: 'El ensayo COMPLETE y las Guías ACC/AHA 2025 / ESC 2023 recomiendan la revascularización completa de vasos no culpables (durante el ingreso o en <45 días) frente a tratar únicamente la lesión culpable.',
      benefitsRisks: 'Disminución del 26-32% en el objetivo combinado de muerte cardiovascular o nuevo infarto.',
      contraindicationsChecked: ['Lesiones no revascularizables técnicamente o lecho distal no viable'],
      evidenceItems: SCIENTIFIC_CORPUS.filter(e => e.id === 'ACC-AHA-2025-ACS-REVASC'),
      defaultStatus: patient.recommendationsAccepted?.['REC-REVASC-COMPLETA'] ?? 'pendiente'
    });
  }

  // -------------------------------------------------------------
  // FASE 2: Terapia Antitrombótica y Elección de P2Y12
  // -------------------------------------------------------------
  if (tieneFa) {
    // Paciente con Fibrilación Auricular / indicación de Anticoagulación
    recs.push({
      id: 'REC-ANTITROMBOTICO-FA',
      domain: 'antitrombotico',
      phase: 'Ingreso y Alta',
      action: 'Estrategia de TERAPIA DOBLE (DOAC + Clopidogrel 75 mg/día); evitar prasugrel/ticagrelor',
      patientMotivations: [
        'Fibrilación auricular / indicación crónica de anticoagulación oral',
        `Puntuación CHA2DS2-VASc: ${scores.cha2ds2Vasc.points ?? 'Elevada'}`
      ],
      clinicalJustification: 'En pacientes que requieren anticoagulación sometidos a PCI, las guías ESC 2023 recomiendan triple terapia breve solo durante la estancia intrahospitalaria (≤ 1 semana) y alta con DOBLE TERAPIA (DOAC a dosis completa estándar + Clopidogrel 75 mg) durante 12 meses.',
      benefitsRisks: 'Reduce drásticamente las hemorragias graves e intracraneales sin incremento significativo de trombosis de stent.',
      contraindicationsChecked: [
        'PRASUGREL Y TICAGRELOR DESACONSEJADOS como tercer fármaco con anticoagulante oral'
      ],
      evidenceItems: SCIENTIFIC_CORPUS.filter(e => e.id === 'ESC-2023-ACS-AF-ANTICOAGULATION'),
      defaultStatus: patient.recommendationsAccepted?.['REC-ANTITROMBOTICO-FA'] ?? 'pendiente'
    });
  } else {
    // Paciente sin anticoagulación oral previa
    // Comprobar contraindicaciones de Prasugrel:
    const contraindicacionPrasugrel = ictusPrevio || hicPrevia;
    const advertenciaAjustePrasugrel = (edad !== null && edad >= 75) || (peso !== null && peso < 60);

    if (contraindicacionPrasugrel) {
      recs.push({
        id: 'REC-ANTITROMBOTICO-P2Y12-TICAGRELOR',
        domain: 'antitrombotico',
        phase: 'Fase aguda y mantenimiento',
        action: 'Doble antiagregación con AAS (100 mg/día) + TICAGRELOR (90 mg/12 h). PRASUGREL BLOQUEADO POR CONTRAINDICACIÓN',
        patientMotivations: [
          ictusPrevio ? 'Antecedente de ictus isquémico o AIT previo' : 'Antecedente de hemorragia intracraneal previa',
          'SCA revascularizado que precisa antiagregación plaquetaria potente'
        ],
        clinicalJustification: 'Prasugrel está estrictamente CONTRAINDICADO en pacientes con antecedente cerebrovascular previo (ensayo TRITON-TIMI 38 demostró exceso de hemorragia mortal y sangrado intracraneal). Ticagrelor 90 mg/12 h o Clopidogrel 75 mg/día son las opciones indicadas.',
        benefitsRisks: 'Inhibición plaquetaria eficaz sin violar la contraindicación neurológica crítica.',
        contraindicationAlert: 'ALERTA DE SEGURIDAD CRÍTICA: PRASUGREL ESTÁ CONTRAINDICADO (Clase III) por antecedente de ictus/AIT.',
        contraindicationsChecked: [
          'Verificado antecedente cerebrovascular: Prasugrel bloqueado',
          'Verificar ausencia de hemorragia activa antes de inicio de Ticagrelor'
        ],
        evidenceItems: SCIENTIFIC_CORPUS.filter(e => e.id === 'ESC-2023-ACS-PRASUGREL-CONTRAINDICATION'),
        defaultStatus: patient.recommendationsAccepted?.['REC-ANTITROMBOTICO-P2Y12-TICAGRELOR'] ?? 'pendiente'
      });
    } else if (isHbr) {
      recs.push({
        id: 'REC-ANTITROMBOTICO-P2Y12-HBR',
        domain: 'antitrombotico',
        phase: 'Mantenimiento y Alta',
        action: 'Doble antiagregación acortada (3 meses) con AAS + Clopidogrel/Ticagrelor seguida de monoterapia',
        patientMotivations: [
          `Perfil de Alto Riesgo Hemorrágico confirmado: ${scores.arcHbr.isHbr ? 'ARC-HBR Positivo' : 'PRECISE-DAPT ≥ 25'}`
        ],
        clinicalJustification: 'En pacientes con HBR confirmado, las guías ESC 2023 avalan acortar la DAPT a 3 meses (o incluso 1 mes si sangrado previo reciente) y continuar con monoterapia antiagregante (Clase IIa, Nivel A).',
        benefitsRisks: 'Reduce a la mitad el riesgo de hemorragia mayor extrahospitalaria sin pérdida de protección isquémica.',
        contraindicationsChecked: ['Ausencia de trombosis de stent previa reciente no resuelta'],
        evidenceItems: SCIENTIFIC_CORPUS.filter(e => e.id === 'ESC-2023-ACS-HBR-SHORT-DAPT'),
        defaultStatus: patient.recommendationsAccepted?.['REC-ANTITROMBOTICO-P2Y12-HBR'] ?? 'pendiente'
      });
    } else {
      // Paciente estándar sin contraindicaciones cerebrovasculares ni HBR
      let accionPrasugrel = 'Doble antiagregación con AAS (100 mg/día) + PRASUGREL (10 mg/día)';
      if (advertenciaAjustePrasugrel) {
        accionPrasugrel = `Doble antiagregación con AAS (100 mg/día) + PRASUGREL CON DOSIS REDUCIDA DE 5 mg/día (o TICAGRELOR 90 mg/12h)`;
      }

      recs.push({
        id: 'REC-ANTITROMBOTICO-P2Y12-ESTANDAR',
        domain: 'antitrombotico',
        phase: 'Fase aguda y mantenimiento (12 meses)',
        action: accionPrasugrel,
        patientMotivations: [
          'SCA tratado con angioplastia coronaria',
          advertenciaAjustePrasugrel ? 'Edad ≥ 75 años o peso corporal < 60 kg requiere ajuste de dosis' : 'Perfil isquémico estándar sin HBR ni contraindicaciones neurológicas'
        ],
        clinicalJustification: 'Prasugrel demostró superioridad frente a ticagrelor en el ensayo ISAR-REACT 5 en reducción de muerte e infarto sin aumento de sangrado mayor cuando se pauta tras la coronariografía.',
        benefitsRisks: 'Protección antiisquémica potente frente a trombosis de stent y nuevo infarto.',
        contraindicationsChecked: [
          'Sin antecedente de ictus o AIT (contraindicación descartada)',
          advertenciaAjustePrasugrel ? 'Dosis ajustada a 5 mg/día por criterio de edad ≥75 o peso <60 kg' : 'Dosis estándar de 10 mg/día verificada'
        ],
        evidenceItems: SCIENTIFIC_CORPUS.filter(e => e.id === 'ESC-2023-ACS-P2Y12-CHOICE'),
        defaultStatus: patient.recommendationsAccepted?.['REC-ANTITROMBOTICO-P2Y12-ESTANDAR'] ?? 'pendiente'
      });
    }
  }

  // Gastroprotección con IBP
  recs.push({
    id: 'REC-GASTROPROTECCION-IBP',
    domain: 'antitrombotico',
    phase: 'Hospitalaria y Alta',
    action: 'Gastroprotección concomitante con Inhibidor de la Bomba de Protones (Pantoprazol 20-40 mg u Omeprazol 20 mg/día)',
    patientMotivations: [
      'Tratamiento antitrombótico potente (DAPT o anticoagulación oral)',
      edad && edad >= 65 ? `Edad ${edad} años (≥ 65 años es factor de riesgo GI)` : 'Prevención de úlcera péptica y hemorragia digestiva alta'
    ],
    clinicalJustification: 'La Guía ESC 2023 recomienda sistemáticamente el uso de IBP en pacientes con SCA bajo doble antiagregación con factores de riesgo de sangrado digestivo (Clase I, Nivel A).',
    benefitsRisks: 'Disminuye en más del 60% los sangrados gastrointestinales mayores sin interferencia clínica relevante.',
    contraindicationsChecked: ['Descartar alergia conocida a derivados benzimidazólicos'],
    evidenceItems: SCIENTIFIC_CORPUS.filter(e => e.id === 'ESC-2023-ACS-PPI-GASTROPROTECTION'),
    defaultStatus: patient.recommendationsAccepted?.['REC-GASTROPROTECCION-IBP'] ?? 'pendiente'
  });

  // -------------------------------------------------------------
  // FASE 3: Prevención Secundaria Metabólica, Renal e Insuficiencia Cardiaca
  // -------------------------------------------------------------
  // Hipolipemiantes
  const ldlActual = d.ldl_colesterol?.value;
  recs.push({
    id: 'REC-LIPIDOS-ALTA-INTENSIDAD',
    domain: 'cardiorrenal',
    phase: 'Hospitalaria inmediata y mantenimiento',
    action: 'Estatina de alta intensidad (Atorvastatina 80 mg o Rosuvastatina 20-40 mg) + Ezetimiba 10 mg/día si c-LDL basal > 55 mg/dL',
    patientMotivations: [
      'SCA clasificado automáticamente como MUY ALTO RIESGO CARDIOVASCULAR',
      ldlActual ? `c-LDL documentado: ${ldlActual} mg/dL (Objetivo estricto: < 55 mg/dL y reducción ≥ 50%)` : 'Objetivo estricto de c-LDL < 55 mg/dL'
    ],
    clinicalJustification: 'Guía ESC/EAS 2019: inicio precoz e intensivo de hipolipemiantes en las primeras 24-48 horas del SCA. Se aconseja terapia combinada precoz con estatina de alta potencia + ezetimiba para maximizar el porcentaje de pacientes en objetivo a las 4-6 semanas.',
    benefitsRisks: 'Estabilización de placa vulnerable, reducción de recurrencia isquémica precoz y mortalidad.',
    contraindicationsChecked: ['Vigilar transaminasas hepáticas previas si hepatopatía activa'],
    evidenceItems: SCIENTIFIC_CORPUS.filter(e => e.id === 'ESC-2019-DYSLIPIDEMIA-GOALS'),
    defaultStatus: patient.recommendationsAccepted?.['REC-LIPIDOS-ALTA-INTENSIDAD'] ?? 'pendiente'
  });

  // Insuficiencia cardiaca y disfunción ventricular
  if (fevi !== null && fevi !== undefined) {
    if (fevi <= 40) {
      recs.push({
        id: 'REC-IC-CUADRUPLE-TERAPIA',
        domain: 'cardiorrenal',
        phase: 'Ingreso antes del alta',
        action: 'Pilares terapéuticos de IC con FEVI reducida: Betabloqueante + IECA/ARNI + ARM (eplerenona) + iSGLT2 (dapagliflozina/empagliflozina 10 mg)',
        patientMotivations: [
          `Disfunción ventricular sistólica grave/moderada documentada: FEVI ${fevi}% (≤ 40%)`
        ],
        clinicalJustification: 'En pacientes con disfunción ventricular post-SCA, el inicio intrahospitalario precoz y titulado de los cuatro pilares farmacológicos reduce la mortalidad y previene el remodelado adverso.',
        benefitsRisks: 'Disminución acumulada de mortalidad CV de hasta el 60% a largo plazo.',
        contraindicationsChecked: [
          'Vigilar presión arterial y ritmo para betabloqueante',
          'Vigilar potasio sérico y función renal antes de ARM/ARNI'
        ],
        evidenceItems: SCIENTIFIC_CORPUS.filter(e => e.id === 'ESC-2023-ACS-HEART-FAILURE-BETA-BLOCKERS'),
        defaultStatus: patient.recommendationsAccepted?.['REC-IC-CUADRUPLE-TERAPIA'] ?? 'pendiente'
      });
    } else if (fevi > 50) {
      recs.push({
        id: 'REC-FEVI-PRESERVADA-BB',
        domain: 'cardiorrenal',
        phase: 'Alta y Seguimiento',
        action: 'Reevaluar necesidad de betabloqueo a largo plazo en paciente con FEVI preservada sin otra indicación',
        patientMotivations: [
          `FEVI inicial preservada: ${fevi}% (> 50%)`,
          'Ausencia de insuficiencia cardiaca residual'
        ],
        clinicalJustification: 'Guías contemporáneas (REDUCE-AMI y ESC 2023): en infarto con FEVI conservada sin angina residual ni hipertensión no controlada, no existe indicación de betabloqueo indefinido sistemático. Reevaluar desescalada al año.',
        benefitsRisks: 'Evita fatiga, bradicardia, disfunción eréctil e hipotensión innecesarias.',
        contraindicationsChecked: ['Mantener si persiste hipertensión o arritmia supraventricular'],
        evidenceItems: SCIENTIFIC_CORPUS.filter(e => e.id === 'ESC-2023-ACS-HEART-FAILURE-BETA-BLOCKERS'),
        defaultStatus: patient.recommendationsAccepted?.['REC-FEVI-PRESERVADA-BB'] ?? 'pendiente'
      });
    }
  }

  // Diabetes / Protección Cardiorrenal con iSGLT2 o agonistas GLP-1
  if (diabetes) {
    recs.push({
      id: 'REC-DIABETES-SGLT2-GLP1',
      domain: 'cardiorrenal',
      phase: 'Alta hospitalaria',
      action: 'Tratamiento cardioprotector con inhibidor de SGLT2 (Dapagliflozina 10 mg o Empagliflozina 10 mg/día) y/o agonista receptor GLP-1',
      patientMotivations: [
        'Diagnóstico documentado de Diabetes Mellitus',
        'Enfermedad cardiovascular aterosclerótica establecida de muy alto riesgo'
      ],
      clinicalJustification: 'Guía ESC 2023 Diabetes: recomendación Clase I, Nivel A para iSGLT2 y análogos GLP-1 con beneficio cardiovascular probado en todo paciente con diabetes y SCA, con independencia de la cifra de HbA1c.',
      benefitsRisks: 'Reducción de muerte cardiovascular, hospitalización por insuficiencia cardiaca y enlentecimiento del deterioro renal.',
      contraindicationsChecked: [
        crcl !== null && crcl < 20 ? 'Precaución: filtrado muy bajo para inicio inicial de iSGLT2' : 'Función renal compatible con iSGLT2 verificada'
      ],
      evidenceItems: SCIENTIFIC_CORPUS.filter(e => e.id === 'ESC-2023-DIABETES-SGLT2-GLP1'),
      defaultStatus: patient.recommendationsAccepted?.['REC-DIABETES-SGLT2-GLP1'] ?? 'pendiente'
    });
  }

  // -------------------------------------------------------------
  // FASE 4: Alta y Rehabilitación Cardiaca
  // -------------------------------------------------------------
  recs.push({
    id: 'REC-REHABILITACION-CARDIACA',
    domain: 'alta_seguimiento',
    phase: 'Alta hospitalaria',
    action: 'Derivación formal e inclusión en programa estructurado de Rehabilitación Cardiaca y Prevención Secundaria Integral',
    patientMotivations: [
      'Episodio índice de Síndrome Coronario Agudo',
      d.tabaquismo_activo?.value === 1 ? 'Tabaquismo activo documentado que precisa programa estructurado de cese' : 'Optimización de estilo de vida, ejercicio prescrito y adherencia'
    ],
    clinicalJustification: 'Recomendación Clase I, Nivel A de la Guía ESC 2023 para todo paciente tras SCA: aborda tabaquismo, dieta mediterránea, control de presión arterial, reincorporación laboral y soporte psicosocial.',
    benefitsRisks: 'Disminución del 22-26% en mortalidad por todas las causas y disminución sustancial de reingresos a 1 año.',
    contraindicationsChecked: ['Estratificar capacidad funcional antes de prescribir prueba de esfuerzo'],
    evidenceItems: SCIENTIFIC_CORPUS.filter(e => e.id === 'ESC-2023-ACS-REHABILITATION'),
    defaultStatus: patient.recommendationsAccepted?.['REC-REHABILITACION-CARDIACA'] ?? 'pendiente'
  });

  return recs;
}
