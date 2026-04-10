
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

const RATE_LIMIT_MAX = 5       // max attempts
const RATE_LIMIT_WINDOW = 15 * 60 * 1000  // 15 minutes in ms

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { username, password } = await req.json()

    if (!username || !password) {
      return new Response(
        JSON.stringify({ error: 'Username and password required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Input validation
    if (typeof username !== 'string' || typeof password !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid input' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    if (username.length > 100 || password.length > 200) {
      return new Response(
        JSON.stringify({ error: 'Invalid input' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const ownerUsername = Deno.env.get('OWNER_USERNAME')
    const ownerPassword = Deno.env.get('OWNER_PASSWORD')

    const adminClient = createClient(supabaseUrl, serviceRoleKey)
    const anonClient = createClient(supabaseUrl, anonKey)

    // ---- Rate Limiting ----
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    const identifier = `${clientIp}:${username.toLowerCase()}`
    const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW).toISOString()

    // Count recent failed attempts (only service role can access this table)
    const { count: attemptCount } = await adminClient
      .from('login_attempts')
      .select('id', { count: 'exact', head: true })
      .eq('identifier', identifier)
      .gte('attempted_at', windowStart)

    if ((attemptCount ?? 0) >= RATE_LIMIT_MAX) {
      return new Response(
        JSON.stringify({ error: 'Too many login attempts. Please wait 15 minutes before trying again.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let role: string | null = null
    let moderatorId: string | null = null
    let permissions: string[] = []
    let displayName = ''
    let authEmail = ''
    let departmentId: string | null = null

    // Check owner credentials
    if (username === ownerUsername && password === ownerPassword) {
      role = 'owner'
      displayName = 'المالك'
      authEmail = 'owner@admin.internal'
    } else {
      // Check moderator via hashed password comparison (only callable by service role now)
      const { data: mods, error: rpcError } = await adminClient.rpc('authenticate_moderator', {
        p_username: username,
        p_password: password,
      })

      if (!rpcError && mods && mods.length > 0) {
        const mod = mods[0]
        role = 'moderator'
        moderatorId = mod.mod_id
        permissions = mod.mod_permissions || []
        displayName = mod.mod_display_name
        authEmail = `mod-${mod.mod_id}@admin.internal`

        // Fetch department_id from moderators table
        const { data: modRow } = await adminClient
          .from('moderators')
          .select('department_id')
          .eq('id', mod.mod_id)
          .single()
        if (modRow) {
          departmentId = modRow.department_id
        }
      }
    }

    if (!role) {
      // Record failed attempt for rate limiting
      await adminClient.from('login_attempts').insert({ identifier })

      // Clean up old attempts in background (older than window)
      adminClient
        .from('login_attempts')
        .delete()
        .lt('attempted_at', windowStart)
        .then(() => {}) // fire and forget

      return new Response(
        JSON.stringify({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create a deterministic auth password (not guessable from client)
    const authPassword = `internal:${serviceRoleKey.slice(0, 32)}:${username}`
    const appMetadata = { app_role: role }

    // Try to sign in first
    let session = null
    const { data: signInData, error: signInError } = await anonClient.auth.signInWithPassword({
      email: authEmail,
      password: authPassword,
    })

    if (signInError) {
      // User doesn't exist yet, create them with app_metadata (service-role only field, users can't modify)
      const { data: createdUser, error: createError } = await adminClient.auth.admin.createUser({
        email: authEmail,
        password: authPassword,
        email_confirm: true,
        app_metadata: appMetadata,
      })

      if (createError) {
        console.error('Failed to create auth user:', createError.message)
        return new Response(
          JSON.stringify({ error: 'Authentication setup failed' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Sign in after creation
      const { data: newSignIn, error: newSignInError } = await anonClient.auth.signInWithPassword({
        email: authEmail,
        password: authPassword,
      })

      if (newSignInError) {
        console.error('Failed to sign in after creation:', newSignInError.message)
        return new Response(
          JSON.stringify({ error: 'Authentication failed' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      session = newSignIn.session
    } else {
      session = signInData.session

      // Ensure app_metadata is up-to-date (e.g. if role changed)
      if (signInData.user) {
        await adminClient.auth.admin.updateUserById(signInData.user.id, {
          app_metadata: appMetadata,
        })
      }
    }

    // Successful login — clear rate limit attempts for this identifier
    await adminClient
      .from('login_attempts')
      .delete()
      .eq('identifier', identifier)

    return new Response(
      JSON.stringify({
        session,
        role,
        moderatorId,
        permissions,
        displayName,
        departmentId,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Login error:', error)
    return new Response(
      JSON.stringify({ error: 'Server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
