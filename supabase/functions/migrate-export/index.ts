// One-off migration helper: exports schema SQL + copies data and storage files
// from this project to the user's own Supabase project.
import { Client } from "https://deno.land/x/postgres@v0.17.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TABLE_ORDER = [
  "departments",
  "material_categories",
  "courses",
  "materials",
  "moderators",
  "moderator_course_access",
  "shared_department_courses",
  "important_links",
  "announcements",
  "notification_templates",
  "notifications",
  "push_subscriptions",
  "audit_logs",
  "assignment_reminders_sent",
  "login_attempts",
];

async function buildSchemaSql(db: Client): Promise<string> {
  const q = async (sql: string) => (await db.queryArray(sql)).rows.map((r) => r[0] as string).filter(Boolean);

  const tables = await q(`
    select 'CREATE TABLE IF NOT EXISTS public.'||quote_ident(c.relname)||E' (\n'||
      string_agg('  '||quote_ident(a.attname)||' '||format_type(a.atttypid,a.atttypmod)
        ||coalesce(' DEFAULT '||pg_get_expr(d.adbin,d.adrelid),'')
        ||case when a.attnotnull then ' NOT NULL' else '' end, E',\n' order by a.attnum)
      ||E'\n);'
    from pg_class c join pg_namespace n on n.oid=c.relnamespace
    join pg_attribute a on a.attrelid=c.oid and a.attnum>0 and not a.attisdropped
    left join pg_attrdef d on d.adrelid=c.oid and d.adnum=a.attnum
    where n.nspname='public' and c.relkind='r' group by c.relname order by c.relname`);

  const cons = await q(`
    select 'ALTER TABLE public.'||quote_ident(c.relname)||' ADD CONSTRAINT '||quote_ident(con.conname)||' '||pg_get_constraintdef(con.oid)||';'
    from pg_constraint con join pg_class c on c.oid=con.conrelid join pg_namespace n on n.oid=c.relnamespace
    where n.nspname='public' order by case con.contype when 'p' then 0 when 'u' then 1 when 'c' then 2 else 3 end, c.relname`);

  const idx = await q(`select indexdef||';' from pg_indexes where schemaname='public'
    and indexname not in (select conname from pg_constraint) order by indexname`);

  const fns = await q(`select pg_get_functiondef(p.oid)||';' from pg_proc p
    join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' order by p.proname`);

  const trg = await q(`select pg_get_triggerdef(t.oid)||';' from pg_trigger t
    join pg_class c on c.oid=t.tgrelid join pg_namespace n on n.oid=c.relnamespace
    where n.nspname='public' and not t.tgisinternal order by t.tgname`);

  const rls = await q(`select 'ALTER TABLE public.'||quote_ident(tablename)||' ENABLE ROW LEVEL SECURITY;' from pg_tables where schemaname='public' order by tablename`);

  const pol = await q(`select 'CREATE POLICY '||quote_literal(policyname)||' ON public.'||quote_ident(tablename)
    ||' AS '||permissive||' FOR '||cmd||' TO '||array_to_string(roles,', ')
    ||coalesce(' USING ('||qual||')','')||coalesce(' WITH CHECK ('||with_check||')','')||';'
    from pg_policies where schemaname='public' order by tablename, policyname`);

  const grants = await q(`select 'GRANT '||string_agg(distinct privilege_type,', ')||' ON public.'||quote_ident(table_name)||' TO '||grantee||';'
    from information_schema.role_table_grants where table_schema='public'
    and grantee in ('anon','authenticated','service_role') group by table_name, grantee order by 1`);

  return [
    "-- CIC full schema export",
    "create extension if not exists pgcrypto with schema extensions;",
    "create extension if not exists pg_net with schema extensions;",
    "",
    "-- TABLES", ...tables,
    "", "-- CONSTRAINTS", ...cons,
    "", "-- INDEXES", ...idx,
    "", "-- FUNCTIONS", ...fns,
    "", "-- TRIGGERS", ...trg,
    "", "-- RLS", ...rls,
    "", "-- POLICIES", ...pol,
    "", "-- GRANTS", ...grants,
    "",
    "-- STORAGE BUCKET",
    "insert into storage.buckets (id, name, public) values ('materials','materials',true) on conflict (id) do nothing;",
    `create policy "materials public read" on storage.objects for select to public using (bucket_id = 'materials');`,
    `create policy "materials admin write" on storage.objects for insert to authenticated with check (bucket_id = 'materials');`,
    `create policy "materials admin delete" on storage.objects for delete to authenticated using (bucket_id = 'materials');`,
  ].join("\n");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  const log: string[] = [];
  try {
    const { step = "schema" } = await req.json().catch(() => ({}));
    const srcUrl = Deno.env.get("SUPABASE_URL")!;
    const srcKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const dstUrl = (Deno.env.get("TARGET_SUPABASE_URL") || "").replace(/\/+$/, "");
    const dstKey = Deno.env.get("TARGET_SUPABASE_SERVICE_ROLE_KEY")!;
    const src = createClient(srcUrl, srcKey);
    const dst = createClient(dstUrl, dstKey);

    if (step === "schema") {
      const db = new Client(Deno.env.get("SUPABASE_DB_URL")!);
      await db.connect();
      const sql = await buildSchemaSql(db);
      await db.end();
      const path = `_migration/schema.sql`;
      await src.storage.from("materials").upload(path, new Blob([sql], { type: "text/plain" }), { upsert: true });
      const { data } = src.storage.from("materials").getPublicUrl(path);
      return Response.json({ ok: true, schemaUrl: data.publicUrl, bytes: sql.length }, { headers: cors });
    }

    if (step === "data") {
      for (const t of TABLE_ORDER) {
        const { data, error } = await src.from(t).select("*");
        if (error) { log.push(`${t}: read error ${error.message}`); continue; }
        if (!data?.length) { log.push(`${t}: 0`); continue; }
        let ok = 0;
        for (let i = 0; i < data.length; i += 200) {
          const chunk = data.slice(i, i + 200);
          const { error: e2 } = await dst.from(t).upsert(chunk, { onConflict: "id" });
          if (e2) { log.push(`${t}: write error ${e2.message}`); break; }
          ok += chunk.length;
        }
        log.push(`${t}: ${ok}/${data.length}`);
      }
      return Response.json({ ok: true, log }, { headers: cors });
    }

    if (step === "storage") {
      const walk = async (prefix: string): Promise<string[]> => {
        const out: string[] = [];
        const { data } = await src.storage.from("materials").list(prefix, { limit: 1000 });
        for (const e of data || []) {
          const p = prefix ? `${prefix}/${e.name}` : e.name;
          if (e.id === null) out.push(...(await walk(p)));
          else out.push(p);
        }
        return out;
      };
      const files = (await walk("")).filter((f) => !f.startsWith("_migration/"));
      let copied = 0;
      for (const f of files) {
        const { data: blob, error } = await src.storage.from("materials").download(f);
        if (error || !blob) { log.push(`skip ${f}`); continue; }
        const { error: e2 } = await dst.storage.from("materials").upload(f, blob, { upsert: true, contentType: blob.type || "application/octet-stream" });
        if (e2) log.push(`fail ${f}: ${e2.message}`); else copied++;
      }
      return Response.json({ ok: true, total: files.length, copied, log: log.slice(0, 40) }, { headers: cors });
    }

    return Response.json({ error: "unknown step" }, { status: 400, headers: cors });
  } catch (e) {
    return Response.json({ error: String(e), log }, { status: 500, headers: cors });
  }
});
