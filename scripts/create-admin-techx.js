import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdminUser() {
    const email = 'tecnico@techx.pt';
    const password = 'LM122805';

    console.log(`Creating admin user: ${email}`);

    // First, create the staff profile
    const { data: staffData, error: staffError } = await supabase
        .from('staff')
        .insert([{
            name: 'Técnico TechX',
            email: email,
            role: 'Administrador',
            notes: 'Conta de Administrador TechX',
            is_active: true
        }])
        .select()
        .single();

    if (staffError && staffError.code !== '23505') { // 23505 is unique violation (already exists)
        console.error('Error creating staff profile:', staffError.message);
        return;
    }

    if (staffData) {
        console.log('✓ Staff profile created');
    } else {
        console.log('✓ Staff profile already exists');
    }

    // Then, create the auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                name: 'Técnico TechX',
                role: 'Administrador'
            }
        }
    });

    if (authError) {
        console.error('Error creating auth user:', authError.message);
        return;
    }

    if (authData.user) {
        console.log('✓ Auth user created successfully!');
        console.log('Email:', email);
        console.log('Password:', password);
        console.log('\nNOTE: You may need to confirm the email in Supabase Dashboard.');
    }
}

createAdminUser();
