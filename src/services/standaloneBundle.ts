// Generador del Archivo Standalone Autónomo y Descargable: "Risk AI-SCA.html"
// Integra todas las funcionalidades:
// 1. Extractor determinista de documentos (PDF/Texto/Urgencias)
// 2. Editor interactivo de todas las variables clínicas
// 3. Calculadoras deterministas (Cockcroft-Gault, GRACE 2.0, TIMI, PRECISE-DAPT, CRUSADE, ARC-HBR, DAPT Score)
// 4. Motor de recomendaciones guiadas por Guías ESC 2023 / ACC 2025
// 5. Base acumulativa con exportador a Excel (.xls Spreadsheet XML / CSV)
// 6. 8 Casos sintéticos con lectura de múltiples documentos
// 7. Biblioteca RAG y Batería de auditoría en vivo

import { PatientRecord } from '../types/clinical';
import { computeAllPatientScores } from './calculators';
import { generateClinicalPlan } from './recommendationEngine';

export { generateCleanStandaloneHtml } from './standalone/index';

// Generador de informe clínico individual estructurado en HTML
export function generatePatientClinicalHtmlReport(patient: PatientRecord): string {
  const scores = computeAllPatientScores(patient);
  const recommendations = generateClinicalPlan(patient, scores);

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Informe Clínico SCA — ${patient.id}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 32px; color: #1E293B; background: #FFF; line-height: 1.5; font-size: 13px; max-width: 900px; margin: auto; }
    h1 { font-size: 18px; color: #0F172A; margin-bottom: 4px; }
    .header-box { border-bottom: 2px solid #0F172A; padding-bottom: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; }
    .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; background: #F8FAFC; padding: 12px; border: 1px solid #E2E8F0; border-radius: 6px; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px; }
    th, td { padding: 8px 10px; border: 1px solid #E2E8F0; text-align: left; }
    th { background: #F1F5F9; font-weight: 600; }
    .rec-card { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; padding: 12px; margin-bottom: 10px; }
    .mono { font-family: monospace; }
  </style>
</head>
<body>
  <div class="header-box">
    <div>
      <h1>INFORME CLÍNICO ESTRUCTURADO — SÍNDROME CORONARIO AGUDO</h1>
      <p style="font-size: 11px; color: #64748B;">Plataforma Risk AI-SCA · Algoritmos Deterministas y Guías ESC 2023 / ACC 2025</p>
    </div>
    <div style="text-align: right; font-size: 11px;">
      <strong>ID: ${patient.id}</strong><br>
      Episodio: ${patient.episodeId}<br>
      Fecha: ${new Date().toLocaleDateString('es-ES')}
    </div>
  </div>

  <div class="grid">
    <div><span style="color:#64748B;">Edad/Sexo:</span><br><strong>${patient.data.edad?.value || '.'} años / ${patient.data.sexo?.value === 1 ? 'Mujer' : patient.data.sexo?.value === 0 ? 'Varón' : '.'}</strong></div>
    <div><span style="color:#64748B;">Diagnóstico:</span><br><strong>${patient.data.tipo_sca?.value === 0 ? 'SCACEST' : patient.data.tipo_sca?.value === 1 ? 'SCASEST' : patient.data.tipo_sca?.value === 2 ? 'Angina Inestable' : 'Pendiente'}</strong></div>
    <div><span style="color:#64748B;">Fase:</span><br><strong style="text-transform: capitalize;">${patient.evaluationPhase}</strong></div>
    <div><span style="color:#64748B;">CrCl Cockcroft:</span><br><strong class="mono">${scores.cockcroftGault.crCl ? scores.cockcroftGault.crCl + ' mL/min' : 'No calculable'}</strong></div>
  </div>

  <h2 style="font-size: 14px; margin-bottom: 8px;">1. Estratificación Determinista de Riesgo</h2>
  <table>
    <thead>
      <tr><th>Score</th><th>Puntuación</th><th>Categoría</th><th>Desenlace</th></tr>
    </thead>
    <tbody>
      <tr><td>GRACE Score</td><td class="mono">${scores.grace.points ?? '.'}</td><td>${scores.grace.riskCategory}</td><td>${scores.grace.clinicalOutcome}</td></tr>
      <tr><td>TIMI UA/NSTEMI</td><td class="mono">${scores.timi.points ?? '.'}</td><td>${scores.timi.riskCategory}</td><td>${scores.timi.clinicalOutcome}</td></tr>
      <tr><td>PRECISE-DAPT</td><td class="mono">${scores.preciseDapt.points ?? '.'}</td><td>${scores.preciseDapt.riskCategory}</td><td>${scores.preciseDapt.clinicalOutcome}</td></tr>
      <tr><td>CRUSADE Bleeding</td><td class="mono">${scores.crusade.points ?? '.'}</td><td>${scores.crusade.riskCategory}</td><td>${scores.crusade.clinicalOutcome}</td></tr>
      <tr><td>ARC-HBR Consenso</td><td class="mono">${scores.arcHbr.majorCriteriaMet.length} M / ${scores.arcHbr.minorCriteriaMet.length} m</td><td>${scores.arcHbr.isHbr === true ? 'HBR Positivo' : scores.arcHbr.isHbr === false ? 'No HBR' : 'Indeterminado'}</td><td>Sangrado mayor BARC 3-5</td></tr>
      <tr><td>DAPT Score (Yeh et al.)</td><td class="mono">${scores.daptScore.points ?? 'No aplicable'}</td><td>${scores.daptScore.riskCategory}</td><td>${scores.daptScore.applicabilityReason || scores.daptScore.clinicalOutcome}</td></tr>
    </tbody>
  </table>

  <h2 style="font-size: 14px; margin-bottom: 8px;">2. Propuestas Terapéuticas Guiadas por Evidencia</h2>
  ${recommendations.map(r => `
    <div class="rec-card">
      <div style="font-weight: 700; margin-bottom: 4px;">${r.action}</div>
      <p style="color: #334155; margin-bottom: 6px;">${r.clinicalJustification}</p>
      <div style="font-size: 11px; color: #64748B;">Fuente: ${r.evidenceItems.map(e => `${e.guidelineOrStudy} (${e.year}) [${e.classOfRecommendation || ''}]`).join(', ')}</div>
    </div>
  `).join('')}

  <p style="margin-top: 24px; font-size: 10px; color: #64748B; border-top: 1px solid #E2E8F0; padding-top: 12px;">
    <strong>Aviso Profesional:</strong> Documento generado por Risk AI-SCA con fines de apoyo a la decisión clínica. Requiere validación por el médico responsable.
  </p>
</body>
</html>`;
}
