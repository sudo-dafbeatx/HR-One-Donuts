const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
const key = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)[1].trim();

const supabase = createClient(url, key);

async function audit() {
  console.log("Auditing Supabase Project:", url);
  const { data: products, error } = await supabase.from('products').select('*');
  if (error) {
    console.error("Error fetching products:", error);
  } else {
    console.log("Total Products in DB:", products.length);
    const active = products.filter(p => p.is_active === true);
    console.log("Active Products in DB:", active.length);
    products.forEach(p => {
        console.log(`- Product: ${p.name}, is_active: ${p.is_active}, category: ${p.category}`);
    });
  }
}
audit();
