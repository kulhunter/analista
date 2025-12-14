import { pipeline } from "https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.1";

const fileInput = document.getElementById("fileInput");
const generateBtn = document.getElementById("generate");
const progress = document.getElementById("progress");
const dashboard = document.getElementById("dashboard");

fileInput.onchange = () => {
  generateBtn.disabled = !fileInput.files.length;
};

function showProgress(text) {
  progress.textContent = text;
  progress.classList.remove("hidden");
}

function clearDashboard() {
  dashboard.innerHTML = "";
}

function addCard(title, content) {
  const card = document.createElement("div");
  card.className = "card";
  card.innerHTML = `<h3>${title}</h3><p>${content}</p>`;
  dashboard.appendChild(card);
}

// Carga controlada del modelo
showProgress("Preparando inteligencia local…");
const summarizer = await pipeline(
  "summarization",
  "Xenova/distilbart-cnn-12-6"
);
progress.classList.add("hidden");

generateBtn.onclick = async () => {
  clearDashboard();
  const file = fileInput.files[0];
  if (!file) return;

  showProgress("Leyendo documento…");
  const text = await file.text();
  const sample = text.slice(0, 3500);

  showProgress("Entendiendo el contenido…");
  const summary = await summarizer(sample);

  addCard(
    "Resumen ejecutivo",
    summary[0].summary_text
  );

  // Lógica humana (no IA por show)
  if (/\d+%|\$\d+|\d+\s?(meses|años|días)/i.test(text)) {
    addCard(
      "Métricas que importan",
      "El documento contiene números relevantes. No todos merecen seguimiento visual."
    );
  }

  if (/riesgo|problema|alerta|crítico/i.test(text)) {
    addCard(
      "Riesgos y alertas",
      "Se detectan posibles riesgos. Estos deberían estar visibles antes que cualquier gráfico."
    );
  }

  if (/acción|siguiente|recomienda|debería/i.test(text)) {
    addCard(
      "Acciones sugeridas",
      "El texto propone pasos concretos. Un buen dashboard los prioriza."
    );
  }

  progress.classList.add("hidden");
};
