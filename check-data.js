const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8');
const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=([^\n]+)/);
const keyMatch = env.match(/SUPABASE_SERVICE_ROLE_KEY=([^\n]+)/);

const url = urlMatch ? urlMatch[1].trim() : '';
const key = keyMatch ? keyMatch[1].trim() : '';

const supabase = createClient(url, key);

async function dumpData() {
  const { data: categories } = await supabase.from('categories').select('*');
  console.log("Categories:", JSON.stringify(categories, null, 2));

  const { data: settings } = await supabase.from('settings').select('*');
  console.log("Settings:", JSON.stringify(settings, null, 2));

  const { data: promo } = await supabase.from('content_items').select('*');
  console.log("content_items:", JSON.stringify(promo, null, 2));
}
dumpData();
