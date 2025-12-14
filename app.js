const fileInput = document.getElementById("fileInput");
const dropzone = document.getElementById("dropzone");
const status = document.getElementById("status");
const report = document.getElementById("report");

dropzone.addEventListener("click", () => fileInput.click());

fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (file) analyzeFile(file);
});

function analyzeFile(file) {
  report.classList.add("hidden");
  status.textContent = "Identificando tipo de archivo…";

  const ext = file.name.split(".").pop().toLowerCase();

  if (ext === "txt") readText(file);
  else if (ext === "csv") readText(file);
  else if (ext === "json") readJSON(file);
  else if (ext === "pdf") readPDF(file);
  else {
    buildReport(file, "", {
      error: `El formato .${ext} no puede analizarse directamente en esta versión.`
    });
  }
}

/* ========= LECTORES DE ARCHIVOS ========= */

// Función para leer archivos de texto (txt)
function readText(file) {
  status.textContent = "Leyendo contenido textual…";

  const reader = new FileReader();
  reader.onload = () => buildReport(file, reader.result || "");
  reader.onerror = () => buildReport(file, "");
  reader.readAsText(file);
}

// Función para leer archivos JSON
function readJSON(file) {
  status.textContent = "Procesando estructura JSON…";

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const obj = JSON.parse(reader.result);
      const text = JSON.stringify(obj, null, 2);
      buildReport(file, text);
    } catch {
      buildReport(file, "", { error: "JSON inválido o corrupto." });
    }
  };
  reader.readAsText(file);
}

// Función para leer archivos PDF
async function readPDF(file) {
  status.textContent = "Extrayendo texto del PDF…";

  try {
    const buffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      content.items.forEach(item => {
        fullText += item.str + " ";
      });
    }

    buildReport(file, fullText);
  } catch {
    buildReport(file, "", { error: "No fue posible extraer texto del PDF." });
  }
}

/* ========= CONSTRUCCIÓN DEL INFORME ========= */

function buildReport(file, content, options = {}) {
  status.textContent = "Analizando como analista humano…";

  if (options.error) {
    report.innerHTML = `<p>${options.error}</p>`;
    report.classList.remove("hidden");
    return;
  }

  const analysis = analyzeContent(content);
  const { type, metrics } = analysis;

  let confidence = "Baja";
  if (metrics.wordCount > 300 || metrics.numbers > 20) confidence = "Alta";
  else if (metrics.wordCount > 100) confidence = "Media";

  report.innerHTML = `
    <div class="section">
      <h2>📄 Identificación</h2>
      <p><strong>Archivo:</strong> ${file.name}</p>
      <p><strong>Tipo detectado:</strong> ${type}</p>
    </div>

    <div class="section">
      <h2>🧠 Diagnóstico del Analista</h2>
      <p>
        El documento fue clasificado como <strong>${type}</strong>.
        ${
          type === "Comprobante"
            ? "Este tipo de documento se analiza mejor mediante extracción de campos, no gráficos."
            : "Este tipo de documento permite análisis estructural y visual."
        }
      </p>
    </div>

    <div class="section">
      <h2>📊 Métricas Detectadas</h2>
      <ul>
        <li>Palabras: ${metrics.wordCount}</li>
        <li>Números: ${metrics.numbers}</li>
        <li>Fechas: ${metrics.dates}</li>
        <li>Indicadores monetarios: ${metrics.currency}</li>
        <li>Líneas: ${metrics.lines}</li>
      </ul>
    </div>

    ${
      type === "Tabular" || type === "Financiero"
        ? `
        <div class="section">
          <h2>📈 Dashboard</h2>
          <canvas id="chart"></canvas>
        </div>
        `
        : `
        <div class="section">
          <h2>ℹ️ Visualización</h2>
          <p>
            No se generan gráficos porque este tipo de documento no se beneficia de visualización estadística.
          </p>
        </div>
        `
    }

    <div class="section">
      <h2>🎯 Nivel de Confiabilidad</h2>
      <p><strong>${confidence}</strong></p>
    </div>

    <div class="section">
      <h2>✅ Decisiones Recomendadas</h2>
      <p>
        ${
          confidence === "Alta"
            ? "Puede usarse como base para decisiones operativas."
            : "Debe complementarse con más información."
        }
      </p>
    </div>
  `;

  report.classList.remove("hidden");
  status.textContent = "Informe analítico generado.";

  if (type === "Tabular" || type === "Financiero") {
    renderChart(metrics);
  }
}

function renderChart(metrics) {
  const ctx = document.getElementById("chart");
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Palabras", "Números", "Fechas", "Moneda"],
      datasets: [{
        data: [
          metrics.wordCount,
          metrics.numbers,
          metrics.dates,
          metrics.currency
        ]
      }]
    }
  });
}
