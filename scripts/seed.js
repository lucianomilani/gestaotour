import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const validAgencies = [
    { code: 'AGT001', name: 'Viagens Norte', email: 'reservas@viagensnorte.pt', fee: 10, nif: '501234567', phone: '912345678', contact: 'Ana Silva' },
    { code: 'AGT002', name: 'GetYourGuide', email: 'partners@getyourguide.com', fee: 15, nif: '987654321', phone: '+351 210 000 000', contact: 'Support Team' },
    { code: 'AGT003', name: 'Airbnb Experiences', email: 'experiences@airbnb.com', fee: 20, nif: '505555555', phone: 'N/A', contact: 'Digital Portal' },
    { code: 'AGT004', name: 'Booking.com', email: 'partners@booking.com', fee: 12, nif: '509999999', phone: '+31 20 712 5600', contact: 'Partner Support' },
    { code: 'AGT005', name: 'MLTours', email: 'lmilani.mail@gmail.com', fee: 5, nif: '502223334', phone: '966666666', contact: 'Luciano Milani' },
];

const adventuresData = [
    {
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
    {
        name: 'Observação de Aves',
        description: 'Tour ornitológico guiado.',
        location: 'Albufeira do Azibo',
        meetingPoint: 'Observatório',
        duration: '4h',
        priceAdult: 40.00,
        priceChild: 20.00,
        priceBaby: 0,
        isActive: true,
        highSeason: { start: '2025-04-01', end: '2025-06-30', times: ['07:00', '17:00'] },
        lowSeason: { start: '2025-07-01', end: '2025-03-31', times: ['08:00'] }
    },
    {
        name: 'Passeio de Barco',
        description: 'Cruzeiro relaxante pelo rio.',
        location: 'Rio Douro',
        meetingPoint: 'Marina',
        duration: '3h',
        priceAdult: 50.00,
        priceChild: 25.00,
        priceBaby: 5.00,
        isActive: true,
        highSeason: { start: '2025-06-01', end: '2025-09-30', times: ['10:00', '14:00', '16:00'] },
        lowSeason: { start: '2025-10-01', end: '2025-05-31', times: ['11:00', '15:00'] }
    },
    {
        name: 'Tour Gastronómico',
        description: 'Prova de sabores locais.',
        location: 'Bragança',
        meetingPoint: 'Castelo',
        duration: '2h',
        priceAdult: 30.00,
        priceChild: 15.00,
        priceBaby: 0,
        isActive: true,
        highSeason: { start: '2025-01-01', end: '2025-12-31', times: ['12:00', '19:00'] },
        lowSeason: { start: '2025-01-01', end: '2025-12-31', times: ['12:00', '19:00'] }
    },
    {
        name: 'Trilho dos Passadiços',
        description: 'Caminhada pelos passadiços de madeira.',
        location: 'Paiva',
        meetingPoint: 'Entrada Espiunca',
        duration: '4h',
        priceAdult: 15.00,
        priceChild: 10.00,
        priceBaby: 0,
        isActive: true,
        highSeason: { start: '2025-05-01', end: '2025-10-31', times: ['09:00', '10:00', '14:00'] },
        lowSeason: { start: '2025-11-01', end: '2025-04-30', times: ['10:00'] }
    }
];

async function seed() {
    console.log('Starting database seed...');

    // 1. Seed Agencies
    console.log('Seeding Agencies...');
    for (const agency of validAgencies) {
        // Check if exists
        const { data: existing } = await supabase
            .from('agencies')
            .select('id')
            .eq('code', agency.code)
            .single();

        if (!existing) {
            const { error } = await supabase.from('agencies').insert({
                name: agency.name,
                code: agency.code,
                email: agency.email,
                phone: agency.phone,
                nif: agency.nif,
                contact: agency.contact,
                fee: agency.fee,
                is_active: true
            });
            if (error) console.error(`Error inserting agency ${agency.name}:`, error.message);
            else console.log(`Inserted agency: ${agency.name}`);
        } else {
            console.log(`Agency ${agency.name} already exists.`);
        }
    }

    // 2. Seed Adventures
    console.log('Seeding Adventures...');
    for (const adventure of adventuresData) {
        // Check if exists by name (simple check)
        const { data: existing } = await supabase
            .from('adventures')
            .select('id')
            .eq('name', adventure.name)
            .single();

        if (!existing) {
            const { error } = await supabase.from('adventures').insert({
                name: adventure.name,
                description: adventure.description,
                location: adventure.location,
                meeting_point: adventure.meetingPoint,
                duration: adventure.duration,
                price_adult: adventure.priceAdult,
                price_child: adventure.priceChild,
                price_baby: adventure.priceBaby,
                high_season_start: adventure.highSeason.start,
                high_season_end: adventure.highSeason.end,
                high_season_times: adventure.highSeason.times,
                low_season_start: adventure.lowSeason.start,
                low_season_end: adventure.lowSeason.end,
                low_season_times: adventure.lowSeason.times,
                is_active: adventure.isActive
            });
            if (error) console.error(`Error inserting adventure ${adventure.name}:`, error.message);
            else console.log(`Inserted adventure: ${adventure.name}`);
        } else {
            console.log(`Adventure ${adventure.name} already exists.`);
        }
    }

    console.log('Seeding completed!');
}

seed().catch(console.error);
