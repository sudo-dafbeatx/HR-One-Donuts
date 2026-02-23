import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
const env = fs.readFileSync('.env.local', 'utf8');
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
const key = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)[1].trim();

const supabase = createClient(url, key);

async function check() {
  const { data, error } = await supabase.from('products').select('*').eq('is_active', true);
  console.log("Status:", error ? "FAIL" : "SUCCESS");
  console.log("Data Length:", data ? data.length : 0);
  console.log("Data:", JSON.stringify(data, null, 2));
}
check();
