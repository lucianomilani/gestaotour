import { Booking, Metric, ChartDataPoint, Adventure } from '../types';

export const mockBookings: Booking[] = [
    { id: '12355', clientName: 'Ricardo Gomes', adventureName: 'Trilho do Sol', startDate: '2024-07-28', endDate: '2024-07-28', participants: 2, totalValue: 150, status: 'Confirmada', agency: 'Particular', location: 'Serra de Montesinho', country: 'Portugal', time: '09:00', duration: '3 horas' },
    { id: '12356', clientName: 'Helena Costa', adventureName: 'Kayak no Rio', startDate: '2024-07-29', endDate: '2024-07-29', participants: 4, totalValue: 220, status: 'Confirmada', agency: 'Viagens Norte', location: 'Rio Douro', country: 'Portugal', time: '14:30', duration: '2 horas' },
    { id: '12357', clientName: 'Manuel Antunes', adventureName: 'Escalada Montanha', startDate: '2024-07-30', endDate: '2024-07-30', participants: 3, totalValue: 250, status: 'Pendente', agency: 'GetYourGuide', location: 'Gerês', country: 'Portugal', time: '08:00', duration: '5 horas' },
    { id: '12358', clientName: 'Sara Martins', adventureName: 'Observação de Aves', startDate: '2024-07-31', endDate: '2024-07-31', participants: 2, totalValue: 180, status: 'Confirmada', agency: 'Airbnb', location: 'Albufeira do Azibo', country: 'Portugal', time: '07:00', duration: '4 horas' },
    { id: '12359', clientName: 'Diogo Silva', adventureName: 'Passeio de Barco', startDate: '2024-08-01', endDate: '2024-08-01', participants: 5, totalValue: 400, status: 'Confirmada', agency: 'Particular', location: 'Rio Douro', country: 'França', time: '10:00', duration: '3 horas' },
    { id: '12360', clientName: 'Patrícia Lima', adventureName: 'Trilho do Sol', startDate: '2024-08-02', endDate: '2024-08-02', participants: 2, totalValue: 150, status: 'Pendente', agency: 'Booking.com', location: 'Serra de Montesinho', country: 'Portugal', time: '09:30', duration: '3 horas' },
    { id: '12361', clientName: 'João Ferreira', adventureName: 'Tour Gastronómico', startDate: '2024-08-03', endDate: '2024-08-03', participants: 2, totalValue: 200, status: 'Confirmada', agency: 'Viagens Norte', location: 'Bragança', country: 'Espanha', time: '12:00', duration: '2 horas' },
    { id: '12362', clientName: 'Ana Rodrigues', adventureName: 'Kayak no Rio', startDate: '2024-08-04', endDate: '2024-08-04', participants: 4, totalValue: 220, status: 'Cancelada', agency: 'Particular', location: 'Rio Douro', country: 'Portugal', time: '15:00', duration: '2 horas' },
    { id: '12363', clientName: 'Carlos Santos', adventureName: 'Escalada Montanha', startDate: '2024-08-05', endDate: '2024-08-05', participants: 1, totalValue: 85, status: 'Confirmada', agency: 'GetYourGuide', location: 'Gerês', country: 'Portugal', time: '08:30', duration: '5 horas' },
    { id: '12364', clientName: 'Sofia Neves', adventureName: 'Trilho dos Passadiços', startDate: '2024-08-06', endDate: '2024-08-06', participants: 3, totalValue: 120, status: 'Confirmada', agency: 'Particular', location: 'Paiva', country: 'Portugal', time: '09:00', duration: '4 horas' },
];

export const mockMetrics: Metric[] = [
    { label: 'Total de Reservas (Mês)', value: '124', change: '+5%', isPositive: true },
    { label: 'Receita Prevista', value: '€18.500', change: '+2.1%', isPositive: true },
    { label: 'Taxa de Ocupação', value: '78%', change: '-1.5%', isPositive: false },
    { label: 'Novas Reservas (Hoje)', value: '5', change: '+3%', isPositive: true },
];

export const revenueData: ChartDataPoint[] = [
    { name: '1', value: 4000 },
    { name: '5', value: 3000 },
    { name: '10', value: 5000 },
    { name: '15', value: 2780 },
    { name: '20', value: 1890 },
    { name: '25', value: 6390 },
    { name: '30', value: 3490 },
];

export const participantsData: ChartDataPoint[] = [
    { name: 'Sem 1', value: 120 },
    { name: 'Sem 2', value: 150 },
    { name: 'Sem 3', value: 180 },
    { name: 'Sem 4', value: 200 },
];

export const calendarEvents = [
    { id: '12345', title: 'Trilho do Sol', date: '2024-07-15', type: 'Hiking', participants: 2, time: '09:00', value: 350 },
    { id: '12346', title: 'Kayak no Rio', date: '2024-07-18', type: 'Water', participants: 4, time: '14:30', value: 420 },
    { id: '12347', title: 'Escalada Montanha', date: '2024-07-20', type: 'Adventure', participants: 3, time: '08:00', value: 500 },
    { id: '12348', title: 'Observação de Aves', date: '2024-07-22', type: 'Nature', participants: 1, time: '07:00', value: 150 },
    { id: '12349', title: 'Passeio de Barco', date: '2024-07-25', type: 'Water', participants: 2, time: '10:00', value: 200 },
    { id: '12350', title: 'Trilho do Sol', date: '2024-07-28', type: 'Hiking', participants: 4, time: '09:30', value: 700 },
    { id: '12351', title: 'Kayak no Rio', date: '2024-07-30', type: 'Water', participants: 2, time: '15:00', value: 210 },
    { id: '12352', title: 'Trilho dos Passadiços', date: '2024-08-01', type: 'Hiking', participants: 2, time: '08:30', value: 180 },
    { id: '12353', title: 'Tour Gastronómico', date: '2024-08-02', type: 'Culture', participants: 2, time: '12:00', value: 250 },
    { id: '12354', title: 'Passeio de Barco', date: '2024-08-03', type: 'Water', participants: 3, time: '16:00', value: 300 },
];

export const adventuresList = ['Trilho do Sol', 'Kayak no Rio', 'Escalada Montanha', 'Observação de Aves', 'Passeio de Barco', 'Tour Gastronómico', 'Trilho dos Passadiços'];

export const countriesList = [
    'Afeganistão', 'África do Sul', 'Albânia', 'Alemanha', 'Andorra', 'Angola', 'Antígua e Barbuda', 'Arábia Saudita', 'Argélia', 'Argentina', 'Arménia', 'Austrália', 'Áustria', 'Azerbaijão',
    'Bahamas', 'Bangladexe', 'Barbados', 'Barém', 'Bélgica', 'Belize', 'Benim', 'Bielorrússia', 'Bolívia', 'Bósnia e Herzegovina', 'Botsuana', 'Brasil', 'Brunei', 'Bulgária', 'Burquina Faso', 'Burundi', 'Butão',
    'Cabo Verde', 'Camarões', 'Camboja', 'Canadá', 'Catar', 'Cazaquistão', 'Chade', 'Chile', 'China', 'Chipre', 'Colômbia', 'Comores', 'Congo', 'Coreia do Norte', 'Coreia do Sul', 'Costa do Marfim', 'Costa Rica', 'Croácia', 'Cuba',
    'Dinamarca', 'Dominica', 'Egito', 'Emirados Árabes Unidos', 'Equador', 'Eritreia', 'Eslováquia', 'Eslovénia', 'Espanha', 'Essuatíni', 'Estónia', 'Etiópia',
    'Fiji', 'Filipinas', 'Finlândia', 'França',
    'Gabão', 'Gâmbia', 'Gana', 'Geórgia', 'Granada', 'Grécia', 'Guatemala', 'Guiana', 'Guiné', 'Guiné Equatorial', 'Guiné-Bissau',
    'Haiti', 'Honduras', 'Hungria',
    'Iémen', 'Ilhas Marshall', 'Ilhas Salomão', 'Índia', 'Indonésia', 'Irão', 'Iraque', 'Irlanda', 'Islândia', 'Israel', 'Itália',
    'Jamaica', 'Japão', 'Jibuti', 'Jordânia',
    'Kiribati', 'Kosovo', 'Koweit',
    'Laos', 'Lesoto', 'Letónia', 'Líbano', 'Libéria', 'Líbia', 'Listenstaine', 'Lituânia', 'Luxemburgo',
    'Macedónia do Norte', 'Madagáscar', 'Malásia', 'Maláui', 'Maldivas', 'Mali', 'Malta', 'Marrocos', 'Maurícia', 'Mauritânia', 'México', 'Mianmar', 'Micronésia', 'Moçambique', 'Moldávia', 'Mónaco', 'Mongólia', 'Montenegro',
    'Namíbia', 'Nauru', 'Nepal', 'Nicarágua', 'Níger', 'Nigéria', 'Noruega', 'Nova Zelândia',
    'Omã',
    'Países Baixos', 'Palau', 'Panamá', 'Papua-Nova Guiné', 'Paquistão', 'Paraguai', 'Peru', 'Polónia', 'Portugal',
    'Quénia', 'Quirguistão',
    'Reino Unido', 'República Centro-Africana', 'República Checa', 'República Democrática do Congo', 'República Dominicana', 'Roménia', 'Ruanda', 'Rússia',
    'Samoa', 'Santa Lúcia', 'São Cristóvão e Neves', 'São Marinho', 'São Tomé e Príncipe', 'São Vicente e Granadinas', 'Senegal', 'Serra Leoa', 'Sérvia', 'Seicheles', 'Singapura', 'Síria', 'Somália', 'Sri Lanca', 'Sudão', 'Sudão do Sul', 'Suécia', 'Suíça', 'Suriname',
    'Tailândia', 'Tajiquistão', 'Tanzânia', 'Timor-Leste', 'Togo', 'Tonga', 'Trindade e Tobago', 'Tunísia', 'Turcomenistão', 'Turquia', 'Tuvalu',
    'Ucrânia', 'Uganda', 'Uruguai', 'Usbequistão',
    'Vanuatu', 'Vaticano', 'Venezuela', 'Vietname',
    'Zâmbia', 'Zimbábue'
];

export const validAgencies = [
    { code: 'AGT001', name: 'Viagens Norte', email: 'reservas@viagensnorte.pt', fee: 10, nif: '501234567', phone: '912345678', contact: 'Ana Silva' },
    { code: 'AGT002', name: 'GetYourGuide', email: 'partners@getyourguide.com', fee: 15, nif: '987654321', phone: '+351 210 000 000', contact: 'Support Team' },
    { code: 'AGT003', name: 'Airbnb Experiences', email: 'experiences@airbnb.com', fee: 20, nif: '505555555', phone: 'N/A', contact: 'Digital Portal' },
    { code: 'AGT004', name: 'Booking.com', email: 'partners@booking.com', fee: 12, nif: '509999999', phone: '+31 20 712 5600', contact: 'Partner Support' },
    { code: 'AGT005', name: 'MLTours', email: 'lmilani.mail@gmail.com', fee: 5, nif: '502223334', phone: '966666666', contact: 'Luciano Milani' },
];

export const adventuresData: Adventure[] = [
    {
        id: '1',
        name: 'Trilho do Sol',
        description: 'Caminhada panorâmica pelas encostas.',
        location: 'Serra de Montesinho',
        meetingPoint: 'Centro de Visitantes',
        duration: '3h',
        priceAdult: 35.00,
        priceChild: 20.00,
        priceBaby: 0,
        isActive: true,
        highSeason: { start: '2025-06-01', end: '2025-09-30', times: ['09:00', '14:00', '17:00'] },
        lowSeason: { start: '2025-10-01', end: '2025-05-31', times: ['10:00', '14:00'] }
    },
    {
        id: '2',
        name: 'Kayak no Rio',
        description: 'Aventura aquática pelo Rio Douro.',
        location: 'Rio Douro',
        meetingPoint: 'Cais Fluvial',
        duration: '2h30',
        priceAdult: 45.00,
        priceChild: 25.00,
        priceBaby: 10.00,
        isActive: true,
        highSeason: { start: '2025-07-01', end: '2025-08-31', times: ['09:00', '11:30', '15:00', '17:30'] },
        lowSeason: { start: '2025-09-01', end: '2025-06-30', times: ['10:00', '14:30'] }
    },
    {
        id: '3',
        name: 'Escalada Montanha',
        description: 'Escalada técnica para iniciantes.',
        location: 'Gerês',
        meetingPoint: 'Base da Montanha',
        duration: '4h',
        priceAdult: 60.00,
        priceChild: 40.00,
        priceBaby: 0,
        isActive: false,
        highSeason: { start: '2025-05-01', end: '2025-10-31', times: ['08:00'] },
        lowSeason: { start: '2025-11-01', end: '2025-04-30', times: [] }
    },
];

export const getAvailableTimes = (dateStr: string, adventureName: string): string[] => {
    const adventure = adventuresData.find(a => a.name === adventureName);
    if (!adventure) return [];

    const date = new Date(dateStr);
    const highStart = new Date(adventure.highSeason.start);
    const highEnd = new Date(adventure.highSeason.end);

    // Check High Season
    if (date >= highStart && date <= highEnd) {
        return adventure.highSeason.times;
    }

    // Check Low Season (Handle year wrap if needed, but for now strict range)
    const lowStart = new Date(adventure.lowSeason.start);
    const lowEnd = new Date(adventure.lowSeason.end);

    // Note: Low season might span across years (e.g. Oct to May). 
    // If start > end, it means it wraps around year.
    // However, the mock data has specific years (2025-10-01 to 2025-05-31 is invalid range if same year).
    // Let's assume the mock data implies a range. 
    // Actually, looking at mock data: lowSeason: { start: '2025-10-01', end: '2025-05-31' } 
    // This implies the end date is actually 2026-05-31? Or it's just a generic "Oct to May".
    // For this specific implementation, I will assume strict date comparison against the strings provided.
    // If the date provided is 2024, it won't match 2025. 
    // To make this robust for the demo, I will ignore the year and compare Month/Day.

    return getTimesByMonthDay(date, adventure);
};

const getTimesByMonthDay = (date: Date, adventure: Adventure): string[] => {
    const month = date.getMonth() + 1; // 1-12
    const day = date.getDate();
    const dateValue = month * 100 + day; // MMDD

    const getSeasonRange = (startStr: string, endStr: string) => {
        const start = new Date(startStr);
        const end = new Date(endStr);
        return {
            start: (start.getMonth() + 1) * 100 + start.getDate(),
            end: (end.getMonth() + 1) * 100 + end.getDate()
        };
    };

    const high = getSeasonRange(adventure.highSeason.start, adventure.highSeason.end);
    const low = getSeasonRange(adventure.lowSeason.start, adventure.lowSeason.end);

    // Check High
    if (high.start <= high.end) {
        if (dateValue >= high.start && dateValue <= high.end) return adventure.highSeason.times;
    } else {
        // Wrap around year
        if (dateValue >= high.start || dateValue <= high.end) return adventure.highSeason.times;
    }

    // Check Low
    if (low.start <= low.end) {
        if (dateValue >= low.start && dateValue <= low.end) return adventure.lowSeason.times;
    } else {
        // Wrap around year
        if (dateValue >= low.start || dateValue <= low.end) return adventure.lowSeason.times;
    }

    return [];
};
