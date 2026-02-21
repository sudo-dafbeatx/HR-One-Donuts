const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.from('products').select('*').eq('is_active', true);
  console.log("Active products:", data, "Error:", error);
  
  const { data: allData, error: allError } = await supabase.from('products').select('*');
  console.log("All products (anon):", allData?.length, "Error:", allError);
}
check();
