/**
 * Formata uma data para string no formato YYYY-MM-DD usando timezone local
 * Evita problemas de timezone que ocorrem com toISOString()
 */
export const formatDateToLocal = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Obtém a data atual formatada como string YYYY-MM-DD em timezone local
 */
export const getTodayLocal = (): string => {
  return formatDateToLocal(new Date());
};