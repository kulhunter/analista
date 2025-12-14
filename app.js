import { pipeline } from "https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.1";

const fileInput = document.getElementById("fileInput");
const processBtn = document.getElementById("process");
const status = document.getElementById("status");
const dashboard = document.getElementById("dashboard");

// Modelos
const classifier = await pipeline(
  "text-classification",
  "Xenova/bart-large-mnli"
);

const summarizer = await pipeline(
  "summarization",
  "Xenova/distilbart-cnn-12-6"
);

// Utilidad
function addCard(title, content) {
  const div = document.createElement("div");
  div.className = "card";
  div.innerHTML = `<h3>${title}</h3><p>${content}</p>`;
  dashboard.appendChild(div);
}

processBtn.onclick = async () => {
  dashboard.innerHTML = "";
  const file = fileInput.files[0];
  if (!file) return;

  status.textContent = "Leyendo documento...";
  const text = await file.text();
  const sample = text.slice(0, 3000);

  status.textContent = "Entendiendo el tipo de documento...";

  const labels = [
    "reporte",
    "plan estratégico",
    "propuesta",
    "documento operativo",
    "análisis",
    "otro"
  ];

  const classification = await classifier(sample, labels);
  const docType = classification.labels[0];

  addCard("Tipo de documento detectado", docType);

  status.textContent = "Extrayendo información útil...";

  // Resumen ejecutivo (siempre útil)
  const summary = await summarizer(sample);
  addCard("Resumen ejecutivo", summary[0].summary_text);

  // Heurísticas según tipo
  if (docType.includes("reporte") || docType.includes("análisis")) {
    addCard(
      "¿Qué mirar primero?",
      "Este documento parece orientado a resultados. Revisa métricas, conclusiones y desviaciones."
    );
  }

  if (text.match(/\d+%|\$\d+|\d+\s?(meses|años|días)/i)) {
    addCard(
      "Indicadores detectados",
      "Se identifican números relevantes. Un dashboard real debería enfocarse solo en los que impactan decisiones."
    );
  }

  if (text.match(/riesgo|problema|dificultad|alerta/i)) {
    addCard(
      "Riesgos / alertas",
      "El documento menciona posibles riesgos. Estos merecen seguimiento visual antes que gráficos generales."
    );
  }

  if (text.match(/recomienda|siguiente paso|acción/i)) {
    addCard(
      "Próximos pasos",
      "El documento contiene acciones sugeridas. Un buen dashboard las prioriza y no las esconde."
    );
  }

  status.textContent = "Dashboard generado.";
};
