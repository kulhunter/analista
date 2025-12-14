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
  status.textContent = "Leyendo el archivo…";

  const reader = new FileReader();

  reader.onload = () => {
    const content = reader.result || "";
    buildReport(file, content);
  };

  reader.onerror = () => {
    buildReport(file, "");
  };

  reader.readAsText(file);
}

function buildReport(file, content) {
  status.textContent = "Construyendo informe…";

  const textLength = content.length;
  const hasText = textLength > 50;

  const confidence =
    textLength > 2000 ? "Alta" :
    textLength > 500 ? "Media" :
    "Baja";

  report.innerHTML = `
    <div class="section">
      <h2>1. Identificación del documento</h2>
      <p><strong>Archivo:</strong> ${file.name}</p>
      <p><strong>Formato:</strong> ${file.type || "Desconocido"}</p>
      <p><strong>Tamaño:</strong> ${(file.size / 1024).toFixed(1)} KB</p>
    </div>

    <div class="section">
      <h2>2. Diagnóstico inicial</h2>
      <p>
        ${
          hasText
            ? "El archivo contiene texto suficiente para realizar un análisis preliminar."
            : "El archivo contiene poco o ningún texto legible."
        }
      </p>
    </div>

    <div class="section">
      <h2>3. Resumen ejecutivo</h2>
      <p>
        ${
          hasText
            ? "Este documento parece contener información que puede ser utilizada como insumo informativo."
            : "No es posible generar un resumen debido a la falta de contenido textual."
        }
      </p>
    </div>

    <div class="section">
      <h2>4. Limitaciones del análisis</h2>
      <p>
        El análisis se basa únicamente en el contenido disponible en el archivo.
        No se realizan inferencias externas ni se completan vacíos de información.
      </p>
    </div>

    <div class="section">
      <h2>5. Nivel de confiabilidad</h2>
      <p><strong>${confidence}</strong></p>
      <p>
        ${
          confidence === "Alta"
            ? "El documento presenta suficiente contenido para conclusiones preliminares."
            : confidence === "Media"
            ? "El contenido permite observaciones generales, pero no conclusiones sólidas."
            : "El contenido es insuficiente para conclusiones confiables."
        }
      </p>
    </div>

    <div class="section">
      <h2>6. Decisiones posibles</h2>
      <p>
        ${
          hasText
            ? "Puede utilizarse este documento como base inicial, pero se recomienda validación adicional."
            : "No se recomienda tomar decisiones basadas en este documento."
        }
      </p>
    </div>
  `;

  status.textContent = "Informe generado.";
  report.classList.remove("hidden");
}
