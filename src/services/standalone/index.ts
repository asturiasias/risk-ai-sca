import { SYNTHETIC_PATIENTS } from '../syntheticPatients';
import { SCIENTIFIC_CORPUS } from '../evidenceCorpus';
import { CLINICAL_DICTIONARY } from '../clinicalDictionary';
import { STANDALONE_CSS } from './styles';
import { STANDALONE_CLIENT_ENGINE } from './clientEngine';
import { STANDALONE_VIEWS } from './views';
import { STANDALONE_VIEWS_2 } from './views2';
import { STANDALONE_APP_SCRIPT } from './appScript';

export function generateCleanStandaloneHtml(): string {
  const syntheticJson = JSON.stringify(SYNTHETIC_PATIENTS);
  const corpusJson = JSON.stringify(SCIENTIFIC_CORPUS);
  const dictJson = JSON.stringify(CLINICAL_DICTIONARY);

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Risk AI-SCA — Plataforma de Evaluación Médica del Síndrome Coronario Agudo</title>
  <style>
    ${STANDALONE_CSS}
  </style>
</head>
<body>
  <header>
    <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
      <div class="brand">
        <div class="brand-mark"></div>
        Risk AI-SCA
      </div>
      <span class="badge badge-local">100% Autónomo / Sin Conexión</span>
      <span id="header-active-patient" class="badge badge-warn">Paciente: Ninguno</span>
    </div>
    <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
      <button class="btn btn-primary" onclick="handleNewPatientClick()" title="Iniciar nuevo paciente clínico">
        ➕ Nuevo Paciente
      </button>
      <button class="btn btn-excel" onclick="exportFullDatabaseToExcel()" title="Descargar Base Acumulativa en Excel (.xls)">
        📊 Descargar Excel (BD)
      </button>
      <button class="btn btn-outline" onclick="openReportModal()" title="Ver informe médico e imprimir">
        🖨️ Informe Médico
      </button>
    </div>
  </header>

  <div class="main-layout">
    <nav class="sidebar">
      <div class="nav-header">Módulos Asistenciales</div>
      <button class="nav-btn" id="btn-intake" onclick="switchTab('intake')">📥 Entrada de Documentos</button>
      <button class="nav-btn" id="btn-review" onclick="switchTab('review')">✏️ Revisión y Edición</button>
      <button class="nav-btn" id="btn-scores" onclick="switchTab('scores')">🧮 Calculadoras de Riesgo</button>
      <button class="nav-btn" id="btn-recs" onclick="switchTab('recs')">💡 Recomendaciones y Citas</button>
      <button class="nav-btn" id="btn-db" onclick="switchTab('db')">🗄️ Base Acumulativa SCA</button>
      <button class="nav-btn active" id="btn-demo" onclick="switchTab('demo')">📋 Casos Sintéticos (8)</button>
      <button class="nav-btn" id="btn-evidence" onclick="switchTab('evidence')">📚 Biblioteca RAG Local</button>
      <button class="nav-btn" id="btn-audit" onclick="switchTab('audit')">🧪 Batería de Auditoría</button>

      <div style="margin-top: auto; padding: 10px 8px; border-top: 1px solid #1E293B; font-size: 0.68rem; color: #64748B; line-height: 1.4;">
        <strong>Risk AI-SCA Autónomo</strong><br>
        Todas las funcionalidades incluidas: extracción determinista, edición en vivo, calculadoras, guías ESC 2023, base acumulativa y exportación Excel.
      </div>
    </nav>

    <main class="content-area" id="main-content">
      <!-- Contenido renderizado dinámicamente -->
    </main>
  </div>

  <script>
    const SYNTHETIC_CASES = ${syntheticJson};
    const CORPUS = ${corpusJson};
    const DICTIONARY = ${dictJson};

    ${STANDALONE_CLIENT_ENGINE}

    ${STANDALONE_VIEWS}

    ${STANDALONE_VIEWS_2}

    ${STANDALONE_APP_SCRIPT}

    // Inicializar en Casos Sintéticos por defecto
    switchTab('demo');
  </script>
</body>
</html>`;
}
