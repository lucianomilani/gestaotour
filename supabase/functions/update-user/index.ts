import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders })
    }

    try {
        // Create a Supabase client with the Auth context of the logged in user
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            {
                global: {
                    headers: { Authorization: req.headers.get('Authorization')! },
                },
            }
        )

        // Verify the user is authenticated and is an admin or superadmin
        const {
            data: { user },
        } = await supabaseClient.auth.getUser()

        if (!user) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 401,
            })
        }

        // Check if user is admin or superadmin
        const { data: staffProfile } = await supabaseClient
            .from('staff')
            .select('role, is_superadmin')
            .eq('auth_id', user.id)
            .single()

        const isAdmin = staffProfile?.role === 'Administrador';
        const isSuperAdmin = staffProfile?.is_superadmin === true;

        if (!isAdmin && !isSuperAdmin) {
            return new Response(JSON.stringify({ error: 'Forbidden: Admin access required' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 403,
            })
        }

        // Get request body
        const { userId, password, email, userMetadata } = await req.json()

        if (!userId) {
            return new Response(JSON.stringify({ error: 'Missing userId' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            })
        }

        // Create Supabase Admin client
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        )

        // Prepare update attributes
        const updateAttrs: any = {}
        if (password) updateAttrs.password = password
        if (email) updateAttrs.email = email
        if (userMetadata) updateAttrs.user_metadata = userMetadata

        // Update the auth user
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.updateUserById(
            userId,
            updateAttrs
        )

        if (authError) {
            return new Response(JSON.stringify({ error: authError.message }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            })
        }

        return new Response(
            JSON.stringify({
                success: true,
                user: {
                    id: authData.user.id,
                    email: authData.user.email
                }
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        )
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        })
    }
})
