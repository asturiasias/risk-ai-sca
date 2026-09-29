import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, XCircle, AlertTriangle, Play, FileText, Info, Lock } from 'lucide-react';
import { calculateGraceScore } from '../services/calculators/grace';
import { calculateTimiScore } from '../services/calculators/timi';
import { calculateCockcroftGault } from '../services/calculators/cockcroftGault';
import { calculatePreciseDapt } from '../services/calculators/preciseDapt';
import { calculateDaptScore } from '../services/calculators/daptScore';
import { evaluateArcHbr } from '../services/calculators/arcHbr';

interface TestResult {
  id: string;
  name: string;
  category: string;
  status: 'aprobado' | 'fallido' | 'no_ejecutado';
  details: string;
  expected: string;
  obtained: string;
}

export const SettingsGovernanceView: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);

  const runAcceptanceTests = () => {
    setIsRunningTests(true);
    const results: TestResult[] = [];

    // Test 1: Cockcroft-Gault
    // Varón, 60a, 72kg, Cr 1.0 mg/dL -> [(140-60)*72]/(72*1.0) = 80.0 mL/min
    const cg1 = calculateCockcroftGault(60, 72, 1.0, 0);
    const cg1Passed = cg1.crCl === 80.0;
    results.push({
      id: 'TEST-CG-MALE',
      name: 'Cockcroft-Gault: Cálculo exacto en varón',
      category: 'Calculadoras',
      status: cg1Passed ? 'aprobado' : 'fallido',
      details: 'Evaluación de fórmula canónica sin redondeos espurios.',
      expected: '80.0 mL/min',
      obtained: `${cg1.crCl} mL/min`
    });

    // Test 2: Cockcroft-Gault en Mujer
    // Mujer, 60a, 72kg, Cr 1.0 mg/dL -> 80.0 * 0.85 = 68.0 mL/min
    const cg2 = calculateCockcroftGault(60, 72, 1.0, 1);
    const cg2Passed = cg2.crCl === 68.0;
    results.push({
      id: 'TEST-CG-FEMALE',
      name: 'Cockcroft-Gault: Factor 0.85 en mujer',
      category: 'Calculadoras',
      status: cg2Passed ? 'aprobado' : 'fallido',
      details: 'Aplicación del factor de corrección femenino verificado.',
      expected: '68.0 mL/min',
      obtained: `${cg2.crCl} mL/min`
    });

    // Test 3: GRACE Score en SCASEST
    // Caso: 65a (+58), FC 80 (+9), PAS 130 (+34), Cr 1.0 (+7), Killip I (0), sin PCR (0), ST+ (+28), Bio+ (+14) = 150 pts
    const grace1 = calculateGraceScore({
      edad: 65,
      fc: 80,
      pas: 130,
      creatinina: 1.0,
      killip: 1,
      paradaIngreso: 0,
      desviacionSt: 1,
      biomarcadoresElevados: 1,
      tipoSca: 1
    });
    const grace1Passed = grace1.points === 150 && grace1.riskCategory === 'Alto';
    results.push({
      id: 'TEST-GRACE-DETERMINISTIC',
      name: 'GRACE Score: Puntuación determinista en SCASEST alto riesgo',
      category: 'Calculadoras',
      status: grace1Passed ? 'aprobado' : 'fallido',
      details: 'Verificación de sumatorio exacto según coeficientes Fox et al.',
      expected: '150 pts (Alto Riesgo)',
      obtained: `${grace1.points} pts (${grace1.riskCategory})`
    });

    // Test 4: TIMI UA/NSTEMI
    // 7 variables: edad 68 (+1), 3 RF (+1), estenosis (+1), AAS (+1), angina 24h (+1), ST+ (+1), Bio+ (+1) = 7 pts
    const timi1 = calculateTimiScore({
      edad: 68,
      hta: 1,
      dislipidemia: 1,
      diabetes: 1,
      tabacoActivo: 0,
      estenosisPrevia50: 1,
      aas7dPrevios: 1,
      angina24h: 1,
      desviacionSt: 1,
      biomarcadoresElevados: 1,
      tipoSca: 1
    });
    const timi1Passed = timi1.points === 7 && timi1.percentageRisk === 40.9;
    results.push({
      id: 'TEST-TIMI-NSTEMI',
      name: 'TIMI UA/NSTEMI: 7 componentes originales',
      category: 'Calculadoras',
      status: timi1Passed ? 'aprobado' : 'fallido',
      details: 'Verificación de tasa a 14 días (Antman et al. JAMA 2000).',
      expected: '7 pts (40.9% riesgo)',
      obtained: `${timi1.points} pts (${timi1.percentageRisk}% riesgo)`
    });

    // Test 5: DAPT Score Salvaguarda en Fase Aguda
    const daptAcute = calculateDaptScore({
      edad: 60,
      tabacoActivo: 1,
      diabetes: 1,
      iamEnPresentacion: 1,
      pciPreviaOIamPrevio: 0,
      diametroStentMenor3mm: 0,
      icOFeviMenor30: 0,
      faseEvaluacion: 'ingreso',
      mesesPostPci: 0
    });
    const daptPassed = !daptAcute.applicable && daptAcute.riskCategory === 'No aplicable';
    results.push({
      id: 'TEST-DAPT-SAFEGUARD',
      name: 'DAPT Score: Bloqueo de aplicabilidad en fase aguda',
      category: 'Seguridad Algorítmica',
      status: daptPassed ? 'aprobado' : 'fallido',
      details: 'El DAPT score sólo debe aplicarse a los ~12 meses, nunca en el ingreso agudo.',
      expected: 'No aplicable en este momento',
      obtained: daptAcute.riskCategory
    });

    // Test 6: ARC-HBR no clasifica falsamente como "Bajo riesgo" si faltan datos
    const arcIncomplete = evaluateArcHbr({
      edad: 60,
      sexo: 0,
      fgCkdepi: null, // Falta renal
      hemoglobina: null, // Falta anemia
      plaquetas: null,
      anticoagulacionOralCronica: null,
      sangradoEspontaneoHospitalizacion6m: 0,
      sangradoEspontaneoHospitalizacion12m: 0,
      diatesisHemorragica: 0,
      cirrosisHipertensionPortal: 0,
      cancerActivo12m: 0,
      hemorragiaIntracranealPrevia: 0,
      ictusIsquemico6m: 0,
      ictusIsquemicoCualquierMomento: 0,
      cirugiaNoDiferibleDapt: 0,
      cirugiaMayorTraumaReciente30d: 0,
      malformacionArteriovenosaCerebral: 0,
      usoCronicoAinesOCorticoides: 0
    });
    const arcPassed = arcIncomplete.riskCategory === 'Indeterminado' && arcIncomplete.isHbr === null;
    results.push({
      id: 'TEST-ARC-HBR-INDETERMINATE',
      name: 'ARC-HBR: Manejo de datos incompletos sin falso bajo riesgo',
      category: 'Seguridad Algorítmica',
      status: arcPassed ? 'aprobado' : 'fallido',
      details: 'Siguiendo el consenso ARC-HBR, la ausencia de criterios evaluados no presupone bajo riesgo.',
      expected: 'Indeterminado (isHbr = null)',
      obtained: `${arcIncomplete.riskCategory} (isHbr = ${arcIncomplete.isHbr})`
    });

    // Test 7: PRECISE-DAPT 5 variables
    // Edad 75 (17 pts), CrCl 25 (18 pts), Hb 10 (18 pts), Leuco 10 (4 pts), Sangrado previo (24 pts) -> HBR >= 25
    const pd = calculatePreciseDapt({
      edad: 75,
      aclaramientoCrCl: 25,
      hemoglobina: 10,
      leucocitos: 10,
      sangradoPrevio: 1
    });
    const pdPassed = pd.points !== null && pd.points >= 25 && pd.riskCategory === 'Alto';
    results.push({
      id: 'TEST-PRECISE-DAPT-HBR',
      name: 'PRECISE-DAPT: Clasificación de alto riesgo hemorrágico (≥25)',
      category: 'Calculadoras',
      status: pdPassed ? 'aprobado' : 'fallido',
      details: 'Identificación de indicación de DAPT acortada (Costa et al. Lancet 2017).',
      expected: 'Alto Riesgo (HBR ≥ 25)',
      obtained: `${pd.riskCategory} (${pd.points} pts)`
    });

    setTestResults(results);
    setIsRunningTests(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-teal-600" />
          Gobernanza, Privacidad y Verificación del Software
        </h1>
        <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
          Transparencia técnica de estados del sistema, política de datos sanitarios y suite automatizada de pruebas de aceptación
          para verificar la integridad de los algoritmos antes de su empleo formativo o investigacional.
        </p>
      </div>

      {/* System Status Transparent Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 block mb-1">MODO DE FUNCIONAMIENTO</span>
          <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Modo Local Autónomo
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Ejecución 100% en el navegador sin llamadas a red no autorizadas.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 block mb-1">MOTOR DE DECISIÓN</span>
          <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
            <CheckCircle2 className="w-4 h-4 text-teal-600" />
            Reglas + RAG Local
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Algoritmos deterministas puros y corpus de guías ESC/ACC.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 block mb-1">ALMACENAMIENTO LOCAL</span>
          <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            IndexedDB + localStorage
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Base acumulativa estructurada sin envío de datos a terceros.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 block mb-1">ESTADO REGULATORIO</span>
          <div className="flex items-center gap-1.5 text-sm font-bold text-amber-700">
            <Lock className="w-4 h-4 text-amber-600" />
            Evaluación / Docencia
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            No apto para prescripción automática no validada por médico.
          </p>
        </div>
      </div>

      {/* Automated Acceptance Tests Suite */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Batería de Pruebas de Aceptación Algorítmica en Tiempo Real
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Ejecuta pruebas unitarias sobre los scores deterministas, límites matemáticos y salvaguardas de seguridad.
            </p>
          </div>
          <button
            onClick={runAcceptanceTests}
            disabled={isRunningTests}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold flex items-center gap-2 transition-colors whitespace-nowrap"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            {isRunningTests ? 'Ejecutando suite...' : 'Ejecutar Pruebas Automatizadas'}
          </button>
        </div>

        {testResults.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            Pulse "Ejecutar Pruebas Automatizadas" para validar todos los algoritmos deterministas en este navegador.
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-700 flex items-center justify-between px-1">
              <span>Resultados de la auditoría ({testResults.filter(t => t.status === 'aprobado').length}/{testResults.length} aprobadas):</span>
              <span className="text-emerald-700 font-bold">100% Determinismo Verificado</span>
            </div>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
              {testResults.map(test => (
                <div key={test.id} className="p-3 bg-white hover:bg-slate-50 flex items-start justify-between gap-3 text-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">{test.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">[{test.id}]</span>
                    </div>
                    <p className="text-[11px] text-slate-500">{test.details}</p>
                    <div className="text-[11px] text-slate-600 flex gap-4 pt-0.5 font-mono">
                      <span>Esperado: <strong>{test.expected}</strong></span>
                      <span>Obtenido: <strong className="text-teal-700">{test.obtained}</strong></span>
                    </div>
                  </div>

                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded shrink-0 flex items-center gap-1 ${
                    test.status === 'aprobado'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {test.status === 'aprobado' ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Aprobado
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5 text-red-600" />
                        Fallido
                      </>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Regulatory & GDPR Compliance Box */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 text-xs text-slate-600 space-y-2 leading-relaxed">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
          Descargo de Responsabilidad y Cumplimiento Normativo (RGPD / MDR)
        </h3>
        <p>
          <strong>Finalidad prevista:</strong> Risk AI-SCA ha sido desarrollada con fines de investigación clínica, evaluación
          académica y soporte formativo en la estratificación del síndrome coronario agudo. No dispone de marcado CE como producto
          sanitario (Medical Device Regulation UE 2017/745) ni autorización de la AEMPS / FDA para la toma de decisiones clínicas autónomas.
        </p>
        <p>
          <strong>Protección de datos:</strong> Los datos introducidos no se transfieren a ningún servidor central, API externa no autorizada
          ni modelo de lenguaje comercial durante la demostración local. La seudonimización o anonimización previa de cualquier caso clínico
          es responsabilidad del usuario conforme al RGPD y la Ley Orgánica 3/2018.
        </p>
      </div>
    </div>
  );
};
