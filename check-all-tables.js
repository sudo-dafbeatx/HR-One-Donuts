/* eslint-disable */
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8');
const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=([^\n]+)/);
const keyMatch = env.match(/SUPABASE_SERVICE_ROLE_KEY=([^\n]+)/);

const url = urlMatch ? urlMatch[1].trim() : '';
const key = keyMatch ? keyMatch[1].trim() : '';

const supabase = createClient(url, key);

const tables = [
  'products', 'categories', 'orders', 'visitors', 
  'user_profiles', 'profiles', 'settings', 'admin_users', 
  'product_review_stats', 'content_items'
];

async function checkTables() {
  console.log("Checking tables in", url);
  for (const table of tables) {
    const { error, count } = await supabase.from(table).select('*', { count: 'exact', head: true });
    if (error) {
      console.log(`Table '${table}': ERROR - ${error.message}`);
    } else {
      console.log(`Table '${table}': OK - ${count} rows`);
    }
  }
}
checkTables();
