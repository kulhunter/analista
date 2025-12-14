function analyzeContent(text) {
  const lower = text.toLowerCase();

  const metrics = {
    wordCount: text.trim() ? text.trim().split(/\s+/).length : 0,
    numbers: (text.match(/\d+/g) || []).length,
    dates: (text.match(/\d{2}\/\d{2}\/\d{4}|\d{4}-\d{2}-\d{2}/g) || []).length,
    currency: (text.match(/\$|usd|clp|eur|€|\$/gi) || []).length,
    lines: text.split("\n").length
  };

  let type = "General";
  if (metrics.currency > 0 && metrics.numbers > 5) type = "Financiero";
  else if (metrics.lines > 20 && metrics.numbers > 10) type = "Tabular";
  else if (metrics.wordCount > 300) type = "Narrativo";
  else if (lower.includes("reserva") || lower.includes("comprobante")) type = "Comprobante";

  return { type, metrics };
}
