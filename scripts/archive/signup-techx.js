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

async function signUpUser() {
    const email = 'tecnico@techx.pt';
    const password = 'LM122805';

    console.log(`Signing up user: ${email}`);

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                name: 'Técnico TechX',
                role: 'Administrador'
            }
        }
    });

    if (error) {
        console.error('Error:', error.message);
        return;
    }

    if (data.user) {
        console.log('✓ User created successfully!');
        console.log('Email:', email);
        console.log('Password:', password);
        console.log('User ID:', data.user.id);
        console.log('\nNOTE: Email confirmation may be required. Check Supabase Dashboard.');
    }
}

signUpUser();
