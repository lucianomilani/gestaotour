-- Direct SQL insert for sample bookings
-- Run this in Supabase SQL Editor after running the schema migration

-- First, get the IDs of agencies and adventures
-- You'll need to replace these with actual UUIDs from your database

-- Insert sample bookings
-- Replace 'ADVENTURE_ID_1', 'ADVENTURE_ID_2', 'AGENCY_ID_1' with actual UUIDs

INSERT INTO bookings (
    client_name, client_email, client_phone, client_nif, client_city, client_country,
    adventure_id, agency_id, date, time, adults, children, babies,
    total_amount, deposit_amount, status, payment_status, payment_type, notes
) VALUES
-- Booking 1: Particular client, confirmed
(
    'Ricardo Gomes', 'ricardo.gomes@email.pt', '+351 912 345 678', '123456789', 'Porto', 'Portugal',
    (SELECT id FROM adventures LIMIT 1), NULL, '2024-12-15', '09:00', 2, 0, 0,
    70.00, 35.00, 'Confirmada', 'Concluído', 'Transferência Bancária', 
    'Cliente preferencial, já fez 3 reservas anteriormente.'
),
-- Booking 2: Agency client, in process
(
    'Helena Costa', 'helena.costa@email.pt', '+351 918 765 432', '987654321', 'Lisboa', 'Portugal',
    (SELECT id FROM adventures LIMIT 1 OFFSET 1), (SELECT id FROM agencies LIMIT 1), 
    '2024-12-16', '14:30', 2, 2, 0,
    180.00, 90.00, 'Confirmada', 'Em Processo', 'MBWay', 
    'Reserva através da agência parceira.'
),
-- Booking 3: Pending booking
(
    'Manuel Antunes', 'manuel.antunes@email.pt', '+351 925 111 222', '456789123', 'Braga', 'Portugal',
    (SELECT id FROM adventures LIMIT 1), NULL, '2024-12-18', '08:00', 3, 1, 0,
    220.00, 0, 'Pendente', 'Pendente', 'Pagamento no Local', 
    'Aguardando confirmação de pagamento.'
),
-- Booking 4: With baby
(
    'Sara Martins', 'sara.martins@email.pt', '+351 933 444 555', '789123456', 'Coimbra', 'Portugal',
    (SELECT id FROM adventures LIMIT 1), (SELECT id FROM agencies LIMIT 1 OFFSET 1), 
    '2024-12-20', '10:00', 2, 0, 1,
    70.00, 70.00, 'Confirmada', 'Concluído', 'PayPal', 
    'Bebé de 2 anos. Solicitou cadeira especial.'
),
-- Booking 5: Group booking
(
    'Diogo Silva', 'diogo.silva@email.pt', '+351 966 777 888', '321654987', 'Faro', 'Portugal',
    (SELECT id FROM adventures LIMIT 1 OFFSET 1), NULL, '2024-12-22', '15:00', 4, 1, 0,
    250.00, 125.00, 'Confirmada', 'Em Processo', 'Transferência Bancária', 
    'Grupo de amigos. Solicitaram guia em inglês.'
),
-- Booking 6: Christmas booking
(
    'Patrícia Lima', 'patricia.lima@email.pt', '+351 911 222 333', '654987321', 'Aveiro', 'Portugal',
    (SELECT id FROM adventures LIMIT 1), (SELECT id FROM agencies LIMIT 1), 
    '2024-12-25', '09:30', 2, 2, 0,
    180.00, 0, 'Pendente', 'Pendente', 'MBWay', 
    'Reserva de Natal. Aguardando confirmação.'
),
-- Booking 7: Solo traveler
(
    'João Ferreira', 'joao.ferreira@email.pt', '+351 922 333 444', '147258369', 'Viseu', 'Portugal',
    (SELECT id FROM adventures LIMIT 1), NULL, '2025-01-05', '11:00', 1, 0, 0,
    35.00, 35.00, 'Confirmada', 'Concluído', 'MBWay', 
    'Cliente solo. Primeira reserva.'
),
-- Booking 8: Cancelled
(
    'Ana Rodrigues', 'ana.rodrigues@email.pt', '+351 934 555 666', '258369147', 'Setúbal', 'Portugal',
    (SELECT id FROM adventures LIMIT 1 OFFSET 1), (SELECT id FROM agencies LIMIT 1 OFFSET 1), 
    '2025-01-08', '14:00', 3, 0, 0,
    150.00, 0, 'Cancelada', 'Cancelado', 'Transferência Bancária', 
    'Cancelada por motivos pessoais. Reembolso processado.'
),
-- Booking 9: Family with kids
(
    'Carlos Santos', 'carlos.santos@email.pt', '+351 967 888 999', '369147258', 'Évora', 'Portugal',
    (SELECT id FROM adventures LIMIT 1), NULL, '2025-01-10', '08:30', 2, 1, 1,
    120.00, 60.00, 'Confirmada', 'Em Processo', 'PayPal', 
    'Família com crianças pequenas. Necessita equipamento infantil.'
),
-- Booking 10: With Google Calendar link
(
    'Sofia Neves', 'sofia.neves@email.pt', '+351 912 999 000', '741852963', 'Bragança', 'Portugal',
    (SELECT id FROM adventures LIMIT 1), (SELECT id FROM agencies LIMIT 1), 
    '2025-01-15', '10:30', 4, 2, 0,
    280.00, 140.00, 'Confirmada', 'Concluído', 'Transferência Bancária', 
    'Grupo familiar. Solicitaram fotos profissionais.'
);

-- Update the last booking with a Google Calendar link
UPDATE bookings 
SET google_calendar_link = 'https://calendar.google.com/calendar/event?eid=example123'
WHERE client_email = 'sofia.neves@email.pt';

-- Verify the inserts
SELECT 
    client_name, 
    date, 
    status, 
    payment_status, 
    total_amount 
FROM bookings 
ORDER BY date DESC;
