function escapeHtml(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

export function printReceipt(title: string, lines: { label: string; value: string }[]) {
  const rows = lines
    .map(
      (line) =>
        `<tr><th>${escapeHtml(line.label)}</th><td>${escapeHtml(line.value)}</td></tr>`,
    )
    .join("");
  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title>
<style>
  body { font-family: "Plus Jakarta Sans", sans-serif; color: #4c2922; margin: 32px; }
  h1 { font-size: 22px; margin: 0 0 4px; }
  p { margin: 0 0 20px; color: #6e564a; }
  table { width: 100%; border-collapse: collapse; }
  th { text-align: left; font-weight: 600; width: 40%; padding: 8px 0; border-bottom: 1px solid #e0d3c4; }
  td { padding: 8px 0; border-bottom: 1px solid #e0d3c4; }
</style></head>
<body>
  <h1>Sakwa Agro Enterprise</h1>
  <p>${escapeHtml(title)}</p>
  <table>${rows}</table>
  <script>window.addEventListener("load", () => window.print())<\/script>
</body></html>`;
  // A "noopener" window returns null, so writing into it left the receipt blank.
  // Open the receipt as its own page instead.
  const url = URL.createObjectURL(new Blob([html], { type: "text/html" }));
  window.open(url, "_blank", "noopener");
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
