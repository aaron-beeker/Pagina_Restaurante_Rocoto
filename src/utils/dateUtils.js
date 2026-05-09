/**
 * Obtiene la fecha actual en formato YYYY-MM-DD ajustada a la hora local.
 * Esto evita el desfase de un día que produce toISOString() al usar UTC.
 */
export const getLocalDateString = (date = new Date()) => {
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().split('T')[0];
};

/**
 * Formatea una fecha para visualización amigable
 */
export const formatDisplayDate = (dateStr) => {
    if (!dateStr) return '---';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
};
