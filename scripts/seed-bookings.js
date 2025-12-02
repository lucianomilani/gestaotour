import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔍 Debug Info:');
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseKey ? '✅ Present' : '❌ Missing');
console.log('');

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in .env file');
    console.error('Expected: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedBookings() {
    console.log('🌱 Starting bookings seed...\n');

    try {
        // Fetch existing agencies and adventures
        const { data: agencies } = await supabase.from('agencies').select('id, name');
        const { data: adventures } = await supabase.from('adventures').select('id, name');

        if (!agencies || agencies.length === 0) {
            console.error('❌ No agencies found. Please seed agencies first.');
            return;
        }

        if (!adventures || adventures.length === 0) {
            console.error('❌ No adventures found. Please seed adventures first.');
            return;
        }

        console.log(`✅ Found ${agencies.length} agencies and ${adventures.length} adventures\n`);

        // Sample bookings data
        const bookings = [
            {
                client_name: 'Ricardo Gomes',
                client_email: 'ricardo.gomes@email.pt',
                client_phone: '+351 912 345 678',
                client_nif: '123456789',
                client_city: 'Porto',
                client_country: 'Portugal',
                adventure_id: adventures[0]?.id, // First adventure
                agency_id: null, // Particular
                date: '2024-12-15',
                time: '09:00',
                adults: 2,
                children: 0,
                babies: 0,
                total_amount: 70.00,
                deposit_amount: 35.00,
                status: 'Confirmada',
                payment_status: 'Concluído',
                payment_type: 'Transferência Bancária',
                notes: 'Cliente preferencial, já fez 3 reservas anteriormente.'
            },
            {
                client_name: 'Helena Costa',
                client_email: 'helena.costa@email.pt',
                client_phone: '+351 918 765 432',
                client_nif: '987654321',
                client_city: 'Lisboa',
                client_country: 'Portugal',
                adventure_id: adventures[1]?.id || adventures[0]?.id,
                agency_id: agencies[0]?.id, // First agency
                date: '2024-12-16',
                time: '14:30',
                adults: 2,
                children: 2,
                babies: 0,
                total_amount: 180.00,
                deposit_amount: 90.00,
                status: 'Confirmada',
                payment_status: 'Em Processo',
                payment_type: 'MBWay',
                notes: 'Reserva através da agência parceira.'
            },
            {
                client_name: 'Manuel Antunes',
                client_email: 'manuel.antunes@email.pt',
                client_phone: '+351 925 111 222',
                client_nif: '456789123',
                client_city: 'Braga',
                client_country: 'Portugal',
                adventure_id: adventures[2]?.id || adventures[0]?.id,
                agency_id: null,
                date: '2024-12-18',
                time: '08:00',
                adults: 3,
                children: 1,
                babies: 0,
                total_amount: 220.00,
                deposit_amount: 0,
                status: 'Pendente',
                payment_status: 'Pendente',
                payment_type: 'Pagamento no Local',
                notes: 'Aguardando confirmação de pagamento.'
            },
            {
                client_name: 'Sara Martins',
                client_email: 'sara.martins@email.pt',
                client_phone: '+351 933 444 555',
                client_nif: '789123456',
                client_city: 'Coimbra',
                client_country: 'Portugal',
                adventure_id: adventures[0]?.id,
                agency_id: agencies[1]?.id || agencies[0]?.id,
                date: '2024-12-20',
                time: '10:00',
                adults: 2,
                children: 0,
                babies: 1,
                total_amount: 70.00,
                deposit_amount: 70.00,
                status: 'Confirmada',
                payment_status: 'Concluído',
                payment_type: 'PayPal',
                notes: 'Bebé de 2 anos. Solicitou cadeira especial.'
            },
            {
                client_name: 'Diogo Silva',
                client_email: 'diogo.silva@email.pt',
                client_phone: '+351 966 777 888',
                client_nif: '321654987',
                client_city: 'Faro',
                client_country: 'Portugal',
                adventure_id: adventures[1]?.id || adventures[0]?.id,
                agency_id: null,
                date: '2024-12-22',
                time: '15:00',
                adults: 4,
                children: 1,
                babies: 0,
                total_amount: 250.00,
                deposit_amount: 125.00,
                status: 'Confirmada',
                payment_status: 'Em Processo',
                payment_type: 'Transferência Bancária',
                notes: 'Grupo de amigos. Solicitaram guia em inglês.'
            },
            {
                client_name: 'Patrícia Lima',
                client_email: 'patricia.lima@email.pt',
                client_phone: '+351 911 222 333',
                client_nif: '654987321',
                client_city: 'Aveiro',
                client_country: 'Portugal',
                adventure_id: adventures[2]?.id || adventures[0]?.id,
                agency_id: agencies[0]?.id,
                date: '2024-12-25',
                time: '09:30',
                adults: 2,
                children: 2,
                babies: 0,
                total_amount: 180.00,
                deposit_amount: 0,
                status: 'Pendente',
                payment_status: 'Pendente',
                payment_type: 'MBWay',
                notes: 'Reserva de Natal. Aguardando confirmação.'
            },
            {
                client_name: 'João Ferreira',
                client_email: 'joao.ferreira@email.pt',
                client_phone: '+351 922 333 444',
                client_nif: '147258369',
                client_city: 'Viseu',
                client_country: 'Portugal',
                adventure_id: adventures[0]?.id,
                agency_id: null,
                date: '2025-01-05',
                time: '11:00',
                adults: 1,
                children: 0,
                babies: 0,
                total_amount: 35.00,
                deposit_amount: 35.00,
                status: 'Confirmada',
                payment_status: 'Concluído',
                payment_type: 'MBWay',
                notes: 'Cliente solo. Primeira reserva.'
            },
            {
                client_name: 'Ana Rodrigues',
                client_email: 'ana.rodrigues@email.pt',
                client_phone: '+351 934 555 666',
                client_nif: '258369147',
                client_city: 'Setúbal',
                client_country: 'Portugal',
                adventure_id: adventures[1]?.id || adventures[0]?.id,
                agency_id: agencies[1]?.id || agencies[0]?.id,
                date: '2025-01-08',
                time: '14:00',
                adults: 3,
                children: 0,
                babies: 0,
                total_amount: 150.00,
                deposit_amount: 0,
                status: 'Cancelada',
                payment_status: 'Cancelado',
                payment_type: 'Transferência Bancária',
                notes: 'Cancelada por motivos pessoais. Reembolso processado.'
            },
            {
                client_name: 'Carlos Santos',
                client_email: 'carlos.santos@email.pt',
                client_phone: '+351 967 888 999',
                client_nif: '369147258',
                client_city: 'Évora',
                client_country: 'Portugal',
                adventure_id: adventures[2]?.id || adventures[0]?.id,
                agency_id: null,
                date: '2025-01-10',
                time: '08:30',
                adults: 2,
                children: 1,
                babies: 1,
                total_amount: 120.00,
                deposit_amount: 60.00,
                status: 'Confirmada',
                payment_status: 'Em Processo',
                payment_type: 'PayPal',
                notes: 'Família com crianças pequenas. Necessita equipamento infantil.'
            },
            {
                client_name: 'Sofia Neves',
                client_email: 'sofia.neves@email.pt',
                client_phone: '+351 912 999 000',
                client_nif: '741852963',
                client_city: 'Bragança',
                client_country: 'Portugal',
                adventure_id: adventures[0]?.id,
                agency_id: agencies[0]?.id,
                date: '2025-01-15',
                time: '10:30',
                adults: 4,
                children: 2,
                babies: 0,
                total_amount: 280.00,
                deposit_amount: 140.00,
                status: 'Confirmada',
                payment_status: 'Concluído',
                payment_type: 'Transferência Bancária',
                notes: 'Grupo familiar. Solicitaram fotos profissionais.',
                google_calendar_link: 'https://calendar.google.com/calendar/event?eid=example123'
            }
        ];

        console.log(`📝 Inserting ${bookings.length} sample bookings...\n`);

        for (const booking of bookings) {
            // Check if booking already exists (by client email and date)
            const { data: existing } = await supabase
                .from('bookings')
                .select('id')
                .eq('client_email', booking.client_email)
                .eq('date', booking.date)
                .single();

            if (existing) {
                console.log(`⏭️  Booking for ${booking.client_name} on ${booking.date} already exists, skipping...`);
                continue;
            }

            const { error } = await supabase.from('bookings').insert([booking]);

            if (error) {
                console.error(`❌ Error inserting booking for ${booking.client_name}:`, error.message);
            } else {
                console.log(`✅ Inserted booking: ${booking.client_name} - ${booking.date} (${booking.status})`);
            }
        }

        console.log('\n🎉 Bookings seed completed!');

    } catch (error) {
        console.error('❌ Error during seed:', error);
    }
}

seedBookings();
