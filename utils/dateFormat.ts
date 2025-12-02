/**
 * Formata uma data do formato ISO (YYYY-MM-DD) para o formato português (DD-MM-YYYY)
 * @param isoDate - Data no formato YYYY-MM-DD ou YYYY-MM-DD HH:mm:ss
 * @returns Data formatada como DD-MM-YYYY
 */
export const formatDatePT = (isoDate: string | null | undefined): string => {
    if (!isoDate) return 'N/A';

    // Remove a parte do tempo se existir
    const datePart = isoDate.split(' ')[0];

    // Divide a data em partes
    const parts = datePart.split('-');

    if (parts.length !== 3) return isoDate; // Retorna original se o formato não for esperado

    const [year, month, day] = parts;

    return `${day}-${month}-${year}`;
};

/**
 * Formata uma data e hora do formato ISO para o formato português
 * @param isoDateTime - Data e hora no formato YYYY-MM-DD HH:mm:ss
 * @returns Data e hora formatadas como DD-MM-YYYY HH:mm
 */
export const formatDateTimePT = (isoDateTime: string | null | undefined): string => {
    if (!isoDateTime) return 'N/A';

    const [datePart, timePart] = isoDateTime.split(' ');

    const formattedDate = formatDatePT(datePart);
    const formattedTime = timePart ? timePart.substring(0, 5) : ''; // HH:mm

    return formattedTime ? `${formattedDate} ${formattedTime}` : formattedDate;
};
