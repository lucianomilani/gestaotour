// Country to Flag Emoji Mapping
// This ensures consistent flag display across the application
export const getCountryFlag = (countryName: string): string => {
    const countryFlagMap: { [key: string]: string } = {
        // Europe
        'Portugal': '🇵🇹',
        'Espanha': '🇪🇸',
        'Espana': '🇪🇸',
        'España': '🇪🇸',
        'França': '🇫🇷',
        'Franca': '🇫🇷',
        'France': '🇫🇷',
        'Reino Unido': '🇬🇧',
        'Inglaterra': '🇬🇧',
        'UK': '🇬🇧',
        'United Kingdom': '🇬🇧',
        'Alemanha': '🇩🇪',
        'Germany': '🇩🇪',
        'Itália': '🇮🇹',
        'Italia': '🇮🇹',
        'Italy': '🇮🇹',
        'Holanda': '🇳🇱',
        'Netherlands': '🇳🇱',
        'Países Baixos': '🇳🇱',
        'Bélgica': '🇧🇪',
        'Belgica': '🇧🇪',
        'Belgium': '🇧🇪',
        'Suíça': '🇨🇭',
        'Suica': '🇨🇭',
        'Switzerland': '🇨🇭',
        'Áustria': '🇦🇹',
        'Austria': '🇦🇹',
        'Polónia': '🇵🇱',
        'Polonia': '🇵🇱',
        'Poland': '🇵🇱',
        'Suécia': '🇸🇪',
        'Suecia': '🇸🇪',
        'Sweden': '🇸🇪',
        'Noruega': '🇳🇴',
        'Norway': '🇳🇴',
        'Dinamarca': '🇩🇰',
        'Denmark': '🇩🇰',
        'Finlândia': '🇫🇮',
        'Finlandia': '🇫🇮',
        'Finland': '🇫🇮',
        'Irlanda': '🇮🇪',
        'Ireland': '🇮🇪',
        'Grécia': '🇬🇷',
        'Grecia': '🇬🇷',
        'Greece': '🇬🇷',
        'República Checa': '🇨🇿',
        'Republica Checa': '🇨🇿',
        'Czech Republic': '🇨🇿',
        'Hungria': '🇭🇺',
        'Hungary': '🇭🇺',
        'Roménia': '🇷🇴',
        'Romania': '🇷🇴',
        'Croácia': '🇭🇷',
        'Croacia': '🇭🇷',
        'Croatia': '🇭🇷',

        // Americas
        'Brasil': '🇧🇷',
        'Brazil': '🇧🇷',
        'Estados Unidos': '🇺🇸',
        'USA': '🇺🇸',
        'EUA': '🇺🇸',
        'United States': '🇺🇸',
        'Canadá': '🇨🇦',
        'Canada': '🇨🇦',
        'México': '🇲🇽',
        'Mexico': '🇲🇽',
        'Argentina': '🇦🇷',
        'Chile': '🇨🇱',
        'Colômbia': '🇨🇴',
        'Colombia': '🇨🇴',
        'Peru': '🇵🇪',
        'Venezuela': '🇻🇪',
        'Uruguai': '🇺🇾',
        'Uruguay': '🇺🇾',

        // Asia
        'China': '🇨🇳',
        'Japão': '🇯🇵',
        'Japao': '🇯🇵',
        'Japan': '🇯🇵',
        'Coreia do Sul': '🇰🇷',
        'South Korea': '🇰🇷',
        'Índia': '🇮🇳',
        'India': '🇮🇳',
        'Tailândia': '🇹🇭',
        'Tailandia': '🇹🇭',
        'Thailand': '🇹🇭',
        'Israel': '🇮🇱',
        'Emirados Árabes': '🇦🇪',
        'UAE': '🇦🇪',
        'Singapura': '🇸🇬',
        'Singapore': '🇸🇬',

        // Africa
        'África do Sul': '🇿🇦',
        'Africa do Sul': '🇿🇦',
        'South Africa': '🇿🇦',
        'Marrocos': '🇲🇦',
        'Morocco': '🇲🇦',
        'Egipto': '🇪🇬',
        'Egito': '🇪🇬',
        'Egypt': '🇪🇬',
        'Angola': '🇦🇴',
        'Moçambique': '🇲🇿',
        'Mocambique': '🇲🇿',
        'Mozambique': '🇲🇿',

        // Oceania
        'Austrália': '🇦🇺',
        'Australia': '🇦🇺',
        'Nova Zelândia': '🇳🇿',
        'Nova Zelandia': '🇳🇿',
        'New Zealand': '🇳🇿',
    };

    // Normalize the country name (trim and case-insensitive search)
    const normalizedCountry = countryName.trim();

    // Try exact match first
    if (countryFlagMap[normalizedCountry]) {
        return countryFlagMap[normalizedCountry];
    }

    // Try case-insensitive match
    const lowerCountry = normalizedCountry.toLowerCase();
    for (const [key, value] of Object.entries(countryFlagMap)) {
        if (key.toLowerCase() === lowerCountry) {
            return value;
        }
    }

    // Default fallback (globe emoji)
    return '🌍';
};
