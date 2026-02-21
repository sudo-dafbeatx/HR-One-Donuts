const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
const saKey = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)[1].trim();

const supabase = createClient(url, saKey);

async function test() {
  // Test as Anon
  const { data: anonData } = await supabase.from('products').select('count');
  console.log("Anon Count:", anonData);

  // Test with a fake JWT or if I can find a valid one? 
  // Better yet, check pg_policies directly if I had service role.
}
test();
