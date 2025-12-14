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

/* ========= LECTORES ========= */

function readText(file) {
  status.textContent = "Leyendo contenido textual…";

  const reader = new FileReader();
  reader.onload = () => buildReport(file, reader.result || "");
  reader.onerror = () => buildReport(file, "");
  reader.readAsText(file);
}

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

/* ========= INFORME ========= */

function buildReport(file, content, options = {}) {
  status.textContent = "Analizando contenido…";

  const wordCount = content.trim()
    ? content.trim().split(/\s+/).length
    : 0;

  let confidence = "Baja";
  if (wordCount > 500) confidence = "Alta";
  else if (wordCount > 100) confidence = "Media";

  report.innerHTML = `
    <div class="section">
      <h2>1. Identificación del documento</h2>
      <p><strong>Archivo:</strong> ${file.name}</p>
      <p><strong>Formato:</strong> ${file.type || "Desconocido"}</p>
      <p><strong>Palabras detectadas:</strong> ${wordCount}</p>
    </div>

    <div class="section">
      <h2>2. Diagnóstico inicial</h2>
      <p>
        ${
          options.error
            ? options.error
            : wordCount > 50
              ? "Se detectó contenido textual suficiente para análisis."
              : "El contenido textual es muy limitado."
        }
      </p>
    </div>

    <div class="section">
      <h2>3. Resumen ejecutivo</h2>
      <p>
        ${
          wordCount > 100
            ? "El documento contiene información utilizable como insumo analítico preliminar."
            : "No es posible generar un resumen confiable con el contenido disponible."
        }
      </p>
    </div>

    <div class="section">
      <h2>4. Limitaciones del análisis</h2>
      <p>
        El análisis se basa exclusivamente en texto extraído automáticamente.
        No se interpretan imágenes, tablas complejas ni contexto externo.
      </p>
    </div>

    <div class="section">
      <h2>5. Nivel de confiabilidad</h2>
      <p><strong>${confidence}</strong></p>
    </div>

    <div class="section">
      <h2>6. Decisiones posibles</h2>
      <p>
        ${
          confidence === "Alta"
            ? "El documento puede utilizarse para análisis y decisiones preliminares."
            : "No se recomienda tomar decisiones sin información adicional."
        }
      </p>
    </div>
  `;

  status.textContent = "Informe generado.";
  report.classList.remove("hidden");
}
