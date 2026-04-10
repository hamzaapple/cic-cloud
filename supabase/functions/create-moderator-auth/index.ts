import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const adminClient = createClient(supabaseUrl, serviceRoleKey)

    // Verify caller is owner via auth token
    const authHeader = req.headers.get('authorization') || ''
    const token = authHeader.replace('Bearer ', '')
    
    // Try to get user from token
    const { data: { user: caller } } = await adminClient.auth.getUser(token)
    
    if (!caller || caller.app_metadata?.app_role !== 'owner') {
      return new Response(JSON.stringify({ error: 'Unauthorized - only owner can create moderators' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const { username, password, display_name, permissions, department_id } = await req.json()
    if (!username || !password || !display_name) {
      return new Response(JSON.stringify({ error: 'Missing fields' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 1. Insert moderator into DB (password will be hashed by trigger)
    const { data: mod, error: modErr } = await adminClient
      .from('moderators')
      .insert({ username, password, display_name, permissions: permissions || [], department_id: department_id || null })
      .select()
      .single()

    if (modErr) {
      return new Response(JSON.stringify({ error: modErr.message }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 2. Create real Supabase Auth account for this moderator
    const authEmail = `mod-${mod.id}@admin.internal`
    const authPassword = `internal:${serviceRoleKey.slice(0, 32)}:${username}`

    const { error: createErr } = await adminClient.auth.admin.createUser({
      email: authEmail,
      password: authPassword,
      email_confirm: true,
      app_metadata: { app_role: 'moderator' },
    })

    if (createErr) {
      // Rollback: delete the moderator row
      await adminClient.from('moderators').delete().eq('id', mod.id)
      return new Response(JSON.stringify({ error: 'Failed to create auth account: ' + createErr.message }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ success: true, moderator: mod }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
