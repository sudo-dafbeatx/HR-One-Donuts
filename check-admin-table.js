const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
const saKey = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)[1].trim(); // Use service role for admin check

const supabase = createClient(url, saKey);

async function check() {
  const { data: admins, error: err1 } = await supabase.from('admin_users').select('*');
  console.log("Admin Users:", admins, err1);
  
  const { data: profiles, error: err2 } = await supabase.from('profiles').select('*').eq('role', 'admin');
  console.log("Admin Profiles:", profiles, err2);
}
check();
