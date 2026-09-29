// Coordinador de Calculadoras Clínicas Deterministas de Risk AI-SCA
import { PatientRecord, ScoreResult } from '../../types/clinical';
import { calculateCockcroftGault } from './cockcroftGault';
import { calculateGraceScore } from './grace';
import { calculateTimiScore } from './timi';
import { calculatePreciseDapt } from './preciseDapt';
import { calculateCrusadeScore } from './crusade';
import { calculateParisScores } from './paris';
import { calculateDaptScore } from './daptScore';
import { calculateBleemacsScore } from './bleemacs';
import { calculateHasBledScore } from './hasBled';
import { evaluateArcHbr, ArcHbrEvaluationResult } from './arcHbr';
import { calculateCha2ds2Vasc } from './cha2ds2vasc';

export interface PatientCalculatedScores {
  cockcroftGault: ReturnType<typeof calculateCockcroftGault>;
  grace: ScoreResult;
  timi: ScoreResult;
  preciseDapt: ScoreResult;
  crusade: ScoreResult;
  parisThrombotic: ScoreResult;
  parisBleeding: ScoreResult;
  daptScore: ScoreResult;
  bleemacs: ScoreResult;
  hasBled: ScoreResult;
  arcHbr: ArcHbrEvaluationResult;
  cha2ds2Vasc: ScoreResult;
}

export function computeAllPatientScores(patient: PatientRecord): PatientCalculatedScores {
  const d = patient.data;

  const edad = d.edad?.value ?? null;
  const sexo = d.sexo?.value ?? null;
  const peso = d.peso_kg?.value ?? null;
  const creatinina = d.creatinina_ingreso?.value ?? null;
  const imc = d.imc?.value ?? (peso && d.talla_cm?.value ? peso / Math.pow(d.talla_cm.value / 100, 2) : null);

  // 1. Cockcroft-Gault
  const cgResult = calculateCockcroftGault(edad, peso, creatinina, sexo);
  const crcl = cgResult.crCl ?? d.aclaramiento_creatinina_cg?.value ?? null;

  // 2. GRACE
  const grace = calculateGraceScore({
    edad,
    fc: d.fc_ingreso?.value ?? null,
    pas: d.pas_ingreso?.value ?? null,
    creatinina,
    killip: d.killip_ingreso?.value ?? (d.ic_previa?.value === 1 ? 2 : 1),
    paradaIngreso: d.parada_cardiaca_ingreso?.value ?? null,
    desviacionSt: d.desviacion_st_ecg?.value ?? null,
    biomarcadoresElevados: d.biomarcadores_positivos_elevados?.value ?? null,
    tipoSca: d.tipo_sca?.value ?? null
  });

  // 3. TIMI UA/NSTEMI
  const timi = calculateTimiScore({
    edad,
    hta: d.hta_previa?.value ?? null,
    dislipidemia: d.dislipidemia?.value ?? null,
    diabetes: d.diabetes?.value ?? null,
    tabacoActivo: d.tabaquismo_activo?.value ?? null,
    antecedenteFamiliarCad: null,
    estenosisPrevia50: d.estenosis_coronaria_conocida_50?.value ?? null,
    aas7dPrevios: d.antiagregacion_aas_7d_previos?.value ?? null,
    angina24h: d.episodios_angina_24h?.value ?? null,
    desviacionSt: d.desviacion_st_ecg?.value ?? null,
    biomarcadoresElevados: d.biomarcadores_positivos_elevados?.value ?? null,
    tipoSca: d.tipo_sca?.value ?? null
  });

  // 4. PRECISE-DAPT
  const preciseDapt = calculatePreciseDapt({
    edad,
    aclaramientoCrCl: crcl,
    hemoglobina: d.hemoglobina_ingreso?.value ?? null,
    leucocitos: d.leucocitos_ingreso?.value ?? null,
    sangradoPrevio: d.sangrado_previo_espontaneo?.value ?? null
  });

  // 5. CRUSADE
  const crusade = calculateCrusadeScore({
    hematocrito: d.hematocrito_ingreso?.value ?? null,
    aclaramientoCrCl: crcl,
    fc: d.fc_ingreso?.value ?? null,
    pas: d.pas_ingreso?.value ?? null,
    sexo,
    signosIcIngreso: d.killip_ingreso?.value ? (d.killip_ingreso.value >= 2 ? 1 : 0) : null,
    enfermedadVascularPrevia: d.enfermedad_arterial_periferica?.value ?? (d.ictus_isquemico_previo?.value === 1 ? 1 : null),
    diabetes: d.diabetes?.value ?? null,
    tipoSca: d.tipo_sca?.value ?? null
  });

  // 6. PARIS
  const paris = calculateParisScores({
    esSca: true,
    pciPrevia: d.pci_previa?.value ?? null,
    cabgPrevia: d.cabg_previa?.value ?? null,
    diabetes: d.diabetes?.value ?? null,
    pciCompleja: d.pci_compleja?.value ?? null,
    tabacoActivo: d.tabaquismo_activo?.value ?? null,
    aclaramientoCrCl: crcl,
    edad,
    imc,
    hemoglobina: d.hemoglobina_ingreso?.value ?? null,
    sexo,
    tripleTerapiaAlta: d.anticoagulante_oral_documentado?.value === 1 && d.aas_documentado?.value === 1 && (d.clopidogrel_documentado?.value === 1 || d.ticagrelor_documentado?.value === 1) ? 1 : 0
  });

  // 7. DAPT Score
  const daptScore = calculateDaptScore({
    edad,
    tabacoActivo: d.tabaquismo_activo?.value ?? null,
    diabetes: d.diabetes?.value ?? null,
    iamEnPresentacion: d.tipo_sca?.value === 0 || d.tipo_sca?.value === 1 ? 1 : 0,
    pciPreviaOIamPrevio: d.pci_previa?.value === 1 || d.iam_previo?.value === 1 ? 1 : (d.pci_previa?.value === 0 && d.iam_previo?.value === 0 ? 0 : null),
    diametroStentMenor3mm: d.diametro_stent_menor_3mm?.value ?? null,
    icOFeviMenor30: d.ic_previa?.value === 1 || (d.fevi_inicial?.value !== null && d.fevi_inicial?.value !== undefined && d.fevi_inicial.value < 30) ? 1 : 0,
    faseEvaluacion: patient.evaluationPhase,
    mesesPostPci: patient.evaluationPhase === 'seguimiento_12m' ? 12 : 0
  });

  // 8. BleeMACS
  const bleemacs = calculateBleemacsScore({
    edad,
    sangradoPrevio: d.sangrado_previo_espontaneo?.value ?? null,
    enfermedadVascular: d.enfermedad_arterial_periferica?.value ?? (d.ictus_isquemico_previo?.value === 1 ? 1 : null),
    hta: d.hta_previa?.value ?? null,
    cancerActivo: d.cancer_activo?.value ?? null,
    creatinina,
    hemoglobina: d.hemoglobina_ingreso?.value ?? null
  });

  // 9. HAS-BLED
  const hasBled = calculateHasBledScore({
    pasIngreso: d.pas_ingreso?.value ?? null,
    dialisisOTransplanteOCreatininaMayor22: d.dialisis?.value === 1 || (creatinina && creatinina > 2.2) ? 1 : 0,
    cirrosisOHepatopatiaGrave: d.hepatopatia_cirrosis?.value ?? null,
    ictusPrevio: d.ictus_isquemico_previo?.value ?? (d.hemorragia_intracraneal_previa?.value === 1 ? 1 : null),
    historiaSangradoOAnemia: d.sangrado_previo_espontaneo?.value ?? (d.hemoglobina_ingreso?.value && d.hemoglobina_ingreso.value < 11 ? 1 : null),
    edad,
    usoFarmacosAntiagregantesOAINES: d.aas_documentado?.value === 1 || d.clopidogrel_documentado?.value === 1 || d.ticagrelor_documentado?.value === 1 ? 1 : 0,
    tieneFibrilacionAuricular: d.fa_previa?.value === 1,
    tieneIndicacionAnticoagulacion: d.anticoagulacion_oral_cronica?.value === 1
  });

  // 10. ARC-HBR
  const arcHbr = evaluateArcHbr({
    edad,
    sexo,
    fgCkdepi: d.fg_ckd_epi?.value ?? crcl,
    hemoglobina: d.hemoglobina_ingreso?.value ?? null,
    plaquetas: d.plaquetas_ingreso?.value ?? null,
    anticoagulacionOralCronica: d.anticoagulacion_oral_cronica?.value ?? null,
    sangradoEspontaneoHospitalizacion6m: d.sangrado_previo_espontaneo?.value ?? null,
    sangradoEspontaneoHospitalizacion12m: null,
    diatesisHemorragica: null,
    cirrosisHipertensionPortal: d.hepatopatia_cirrosis?.value ?? null,
    cancerActivo12m: d.cancer_activo?.value ?? null,
    hemorragiaIntracranealPrevia: d.hemorragia_intracraneal_previa?.value ?? null,
    ictusIsquemico6m: null,
    ictusIsquemicoCualquierMomento: d.ictus_isquemico_previo?.value ?? null,
    cirugiaNoDiferibleDapt: null,
    cirugiaMayorTraumaReciente30d: null,
    malformacionArteriovenosaCerebral: null,
    usoCronicoAinesOCorticoides: null
  });

  // 11. CHA2DS2-VASc
  const cha2ds2Vasc = calculateCha2ds2Vasc({
    icPrevia: d.ic_previa?.value ?? null,
    hta: d.hta_previa?.value ?? null,
    edad,
    diabetes: d.diabetes?.value ?? null,
    ictusPrevioOAit: d.ictus_isquemico_previo?.value === 1 || d.ait_previo?.value === 1 ? 1 : (d.ictus_isquemico_previo?.value === 0 && d.ait_previo?.value === 0 ? 0 : null),
    enfermedadVascular: d.iam_previo?.value === 1 || d.enfermedad_arterial_periferica?.value === 1 ? 1 : (d.iam_previo?.value === 0 && d.enfermedad_arterial_periferica?.value === 0 ? 0 : null),
    sexo,
    tieneFibrilacionAuricular: d.fa_previa?.value === 1
  });

  return {
    cockcroftGault: cgResult,
    grace,
    timi,
    preciseDapt,
    crusade,
    parisThrombotic: paris.thrombotic,
    parisBleeding: paris.bleeding,
    daptScore,
    bleemacs,
    hasBled,
    arcHbr,
    cha2ds2Vasc
  };
}
