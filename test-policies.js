const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
const saKey = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)[1].trim();

const supabase = createClient(url, saKey);

async function check() {
  const { data, error } = await supabase.rpc('run_sql', { sql_query: "SELECT tablename, policyname, permissive, roles, cmd, qual FROM pg_policies WHERE tablename = 'products';" }).catch(e => ({error: e}));
  console.log("Policies via RPC:", data, error);
}
check();
