/**
 * Escapa caracteres HTML especiales para prevenir XSS.
 * Convierte: & → &amp;, < → &lt;, > → &gt;, " → &quot;
 * @param {string|null|undefined} str - Texto a escapar.
 * @returns {string} Texto con caracteres HTML escapados.
 */
export function escapeHtml(str) {
  if (str == null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
