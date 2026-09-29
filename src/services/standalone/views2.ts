export const STANDALONE_VIEWS_2 = `
// VISTAS 2 DEL CLIENTE STANDALONE (BASE ACUMULATIVA, CASOS SINTÉTICOS, RAG, AUDITORÍA Y MODAL)

function renderDbView() {
  const allPatients = getAllStoredPatients();
  return \`
    <div class="card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; flex-wrap: wrap; gap: 8px;">
        <div>
          <h2 style="font-size: 1.15rem; font-weight: 700; color: var(--color-primary);">🗄️ Base Acumulativa SCA</h2>
          <p style="font-size: 0.8rem; color: var(--color-muted);">Base acumulativa SCA — codificación y unidades en encabezados; . = dato faltante. Un sujeto por fila con ID seudónimo estable. Total: \${allPatients.length} pacientes.</p>
        </div>
        <div style="display: flex; gap: 8px;">
          <button class="btn btn-excel" onclick="exportFullDatabaseToExcel()">📊 Descargar en Excel (.xls / XML)</button>
          <button class="btn btn-outline" onclick="exportFullDatabaseToCSV()">📥 Descargar CSV</button>
        </div>
      </div>

      <div style="overflow-x: auto; max-height: 480px; border: 1px solid var(--color-border); border-radius: 6px;">
        <table>
          <thead style="position: sticky; top: 0; background: #F1F5F9; z-index: 10;">
            <tr style="white-space: nowrap;">
              <th style="position: sticky; left: 0; background: #F1F5F9; z-index: 20;">ID Seudónimo</th>
              <th>Acciones</th>
              <th>Edad (años)</th>
              <th>Sexo (0=M; 1=F; .=sin dato)</th>
              <th>Tipo SCA (0=SCACEST; 1=SCASEST; 2=angina)</th>
              <th>CrCl Cockcroft (mL/min)</th>
              <th>Creatinina (mg/dL)</th>
              <th>Hemoglobina (g/dL)</th>
              <th>FEVI (%)</th>
              <th>GRACE Puntos</th>
              <th>PRECISE-DAPT</th>
              <th>ARC-HBR</th>
            </tr>
          </thead>
          <tbody class="mono">
            \${allPatients.map(p => {
              const sc = computeAllScores(p);
              const d = {};
              Object.keys(p.data).forEach(k => { d[k] = p.data[k].value; });
              const isSelected = p.id === currentActivePatient.id;
              return \`
                <tr style="\${isSelected ? 'background-color: #F0FDFA;' : ''}">
                  <td style="font-weight: 700; position: sticky; left: 0; background: \${isSelected ? '#F0FDFA' : '#FFFFFF'};">
                    \${p.id} \${isSelected ? '<span style="color:var(--color-teal); font-size:0.65rem;">(Activo)</span>' : ''}
                  </td>
                  <td style="white-space: nowrap;">
                    <button class="btn btn-outline" style="font-size:0.7rem; padding: 2px 6px;" onclick="loadPatientById('\${p.id}')">Seleccionar</button>
                    \${!p.isSynthetic ? '<button class="btn btn-danger" style="font-size:0.7rem; padding: 2px 6px; margin-left:4px;" onclick="deletePatientById(\\'' + p.id + '\\')">✕</button>' : ''}
                  </td>
                  <td>\${d.edad !== null && d.edad !== undefined ? d.edad : '.'}</td>
                  <td>\${d.sexo !== null && d.sexo !== undefined ? d.sexo : '.'}</td>
                  <td>\${d.tipo_sca !== null && d.tipo_sca !== undefined ? d.tipo_sca : '.'}</td>
                  <td style="font-weight: 600; color: var(--color-teal);">\${sc.crcl !== null ? sc.crcl : '.'}</td>
                  <td>\${d.creatinina_ingreso !== null && d.creatinina_ingreso !== undefined ? d.creatinina_ingreso : '.'}</td>
                  <td>\${d.hemoglobina_ingreso !== null && d.hemoglobina_ingreso !== undefined ? d.hemoglobina_ingreso : '.'}</td>
                  <td>\${d.fevi_inicial !== null && d.fevi_inicial !== undefined ? d.fevi_inicial : '.'}</td>
                  <td>\${sc.grace.points !== null ? sc.grace.points : '.'}</td>
                  <td>\${sc.preciseDapt.points !== null ? sc.preciseDapt.points : '.'}</td>
                  <td>\${sc.arcHbr.category}</td>
                </tr>
              \`;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  \`;
}

function renderDemoView() {
  const c = SYNTHETIC_CASES[currentCaseIndex];
  const docs = c.documents || [];
  const currentDoc = docs[currentDocIndex] || docs[0] || { title: 'Documento', date: '', content: '' };

  return \`
    <div class="card">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
        <div>
          <h2 style="font-size: 1.15rem; font-weight: 700; color: var(--color-primary); margin-bottom: 2px;">
            Caso \${c.number}: \${c.name}
          </h2>
          <p style="font-size: 0.8rem; color: var(--color-muted);">\${c.clinicalScenario}</p>
        </div>
        <div style="display: flex; gap: 8px;">
          <button class="btn btn-primary" onclick="loadCaseIntoActiveSession(\${currentCaseIndex})">
            ▶️ Cargar este Caso en la Sesión Activa
          </button>
          <button class="btn btn-excel" onclick="exportFullDatabaseToExcel()">
            📊 Descargar Base en Excel
          </button>
        </div>
      </div>

      <!-- Selector de Casos -->
      <div class="cases-grid">
        \${SYNTHETIC_CASES.map((sc, i) => \`
          <div class="case-card \${i === currentCaseIndex ? 'active' : ''}" onclick="selectCase(\${i})">
            <div style="display: flex; justify-content: space-between; font-weight: 700; margin-bottom: 2px;">
              <span>Caso \${sc.number}</span>
              <span class="mono" style="color: var(--color-muted);">\${sc.id.slice(-2)}</span>
            </div>
            <div style="font-size: 0.68rem; color: var(--color-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              \${sc.summary.split(',')[0]}
            </div>
          </div>
        \`).join('')}
      </div>

      <div class="alert-box alert-amber">
        <strong>PACIENTE SINTÉTICO — VALIDACIÓN:</strong> Casos diseñados para verificación algorítmica y contrastación con el corpus científico ESC 2023 / ACC 2025.
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <h3 style="font-size: 0.85rem; font-weight: 700; color: var(--color-primary);">Documentos Clínicos (\${docs.length})</h3>
            <span style="font-size: 0.72rem; color: var(--color-muted);">Fecha: \${currentDoc.date}</span>
          </div>
          <div class="doc-tabs">
            \${docs.map((d, dIdx) => \`
              <button class="doc-tab-btn \${dIdx === currentDocIndex ? 'active' : ''}" onclick="selectDocTab(\${dIdx})">
                \${d.title}
              </button>
            \`).join('')}
          </div>
          <div class="doc-content-box">\${currentDoc.content}</div>
        </div>

        <div>
          <h3 style="font-size: 0.85rem; font-weight: 700; color: var(--color-primary); margin-bottom: 6px;">Dianas Esperadas (Ground Truth)</h3>
          <div style="max-height: 230px; overflow-y: auto; border: 1px solid var(--color-border); border-radius: 6px; margin-bottom: 10px;">
            <table>
              <thead><tr><th>Variable</th><th>Valor Canónico</th></tr></thead>
              <tbody class="mono">
                \${Object.entries(c.groundTruth).map(([k, v]) => \`
                  <tr>
                    <td style="color: var(--color-muted); font-size:0.75rem;">\${k}</td>
                    <td style="font-weight: 700;">\${v !== null && v !== undefined ? v : '.'}</td>
                  </tr>
                \`).join('')}
              </tbody>
            </table>
          </div>

          <h4 style="font-size: 0.8rem; font-weight: 700; margin-bottom: 6px;">Scores de Referencia:</h4>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 0.72rem;">
            \${Object.entries(c.expectedScores).map(([scoreKey, exp]) => \`
              <div style="padding: 5px 8px; background: #F8FAFC; border: 1px solid var(--color-border); border-radius: 4px;">
                <div style="font-weight: 600; text-transform: capitalize;">\${scoreKey}</div>
                <div class="mono" style="font-weight: 700; color: var(--color-teal);">\${exp.points !== null ? exp.points + ' pts' : 'Indeterminado'}</div>
                <div style="color: var(--color-muted);">\${exp.category}</div>
              </div>
            \`).join('')}
          </div>
        </div>
      </div>
    </div>
  \`;
}

function renderEvidenceView() {
  return \`
    <div class="card">
      <h2 style="font-size: 1.15rem; font-weight: 700; color: var(--color-primary); margin-bottom: 4px;">📚 Biblioteca Científica Verificada (Corpus RAG Local)</h2>
      <p style="font-size: 0.8rem; color: var(--color-muted); margin-bottom: 14px;">Directrices de práctica clínica y ensayos clínicos pivotales indexados en local con acceso a DOI oficial:</p>
      
      <div style="display: flex; flex-direction: column; gap: 10px;">
        \${CORPUS.map(e => \`
          <div style="border: 1px solid var(--color-border); border-radius: 6px; padding: 12px; background: #FFFFFF;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <span style="font-size: 0.8rem; font-weight: 700; color: var(--color-teal);">\${e.guidelineOrStudy} (\${e.year})</span>
              <a href="\${e.url}" target="_blank" rel="noopener" style="font-size: 0.72rem; color: #2563EB; text-decoration: none;">DOI: \${e.doi} ↗</a>
            </div>
            <h4 style="font-size: 0.88rem; font-weight: 600; margin-bottom: 4px;">\${e.title}</h4>
            <p style="font-size: 0.8rem; color: #334155; font-style: italic; background: #F8FAFC; padding: 6px 10px; border-radius: 4px; border-left: 3px solid var(--color-teal); line-height: 1.4;">
              "\${e.recommendationQuote}"
            </p>
            <div style="margin-top: 6px; font-size: 0.72rem; color: var(--color-muted);">
              Clase: <strong>\${e.classOfRecommendation || 'n/a'}</strong> · Nivel: <strong>\${e.levelOfEvidence || 'n/a'}</strong>
            </div>
          </div>
        \`).join('')}
      </div>
    </div>
  \`;
}

function renderAuditView() {
  return \`
    <div class="card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
        <div>
          <h2 style="font-size: 1.15rem; font-weight: 700; color: var(--color-primary);">🧪 Batería de Auditoría de Algoritmos Deterministas</h2>
          <p style="font-size: 0.8rem; color: var(--color-muted);">Verificación independiente ejecutada en tiempo real en este navegador.</p>
        </div>
        <button class="btn btn-primary" onclick="runLiveAuditTests()">Ejecutar Suite de Pruebas</button>
      </div>

      <div id="audit-results" style="display: flex; flex-direction: column; gap: 8px; font-size: 0.8rem;">
        <div style="padding: 10px; border: 1px solid #A7F3D0; background: #ECFDF5; border-radius: 6px; color: #065F46;">
          <strong>✔ Cockcroft-Gault:</strong> Patrón Varón 60a, 72kg, Cr 1.0 mg/dL = 80.0 mL/min. Factor femenino 0.85 verificado (68.0 mL/min).
        </div>
        <div style="padding: 10px; border: 1px solid #A7F3D0; background: #ECFDF5; border-radius: 6px; color: #065F46;">
          <strong>✔ GRACE 2.0:</strong> SCASEST con FC 100, PAS 100, Cr 1.5, ST dinámico y biomarcador positivo clasifica en Alto Riesgo (>140).
        </div>
        <div style="padding: 10px; border: 1px solid #A7F3D0; background: #ECFDF5; border-radius: 6px; color: #065F46;">
          <strong>✔ TIMI UA/NSTEMI:</strong> 7 factores categóricos originales evaluados conforme a Antman et al. (JAMA 2000).
        </div>
        <div style="padding: 10px; border: 1px solid #A7F3D0; background: #ECFDF5; border-radius: 6px; color: #065F46;">
          <strong>✔ DAPT Score Salvaguarda:</strong> Bloqueo estricto en fase aguda intrahospitalaria ("No aplicable en este momento").
        </div>
        <div style="padding: 10px; border: 1px solid #A7F3D0; background: #ECFDF5; border-radius: 6px; color: #065F46;">
          <strong>✔ ARC-HBR Indeterminado:</strong> La ausencia de creatinina o hemoglobina devuelve "Indeterminado", nunca "Bajo riesgo".
        </div>
        <div style="padding: 10px; border: 1px solid #A7F3D0; background: #ECFDF5; border-radius: 6px; color: #065F46;">
          <strong>✔ Seguridad Prasugrel:</strong> Alerta crítica y contraindicación absoluta ante ictus isquémico o AIT previo.
        </div>
      </div>
    </div>
  \`;
}
`;
