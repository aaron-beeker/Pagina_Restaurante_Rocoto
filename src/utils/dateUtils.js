/**
 * Obtiene la fecha actual en formato YYYY-MM-DD ajustada a la hora local.
 * Esto evita el desfase de un día que produce toISOString() al usar UTC.
 * @param {Date} [date=new Date()] - Fecha a convertir.
 * @returns {string} Fecha en formato YYYY-MM-DD.
 */
export const getLocalDateString = (date = new Date()) => {
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);
  return localDate.toISOString().split("T")[0];
};

/**
 * Formatea una fecha de YYYY-MM-DD a DD/MM/YYYY para visualización amigable.
 * @param {string|null} [dateStr] - Fecha en formato YYYY-MM-DD.
 * @returns {string} Fecha formateada o "---" si no hay fecha.
 */
export const formatDisplayDate = (dateStr) => {
  if (!dateStr) return "---";
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
};
