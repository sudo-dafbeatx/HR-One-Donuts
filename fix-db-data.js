const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8');
const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=([^\n]+)/);
const keyMatch = env.match(/SUPABASE_SERVICE_ROLE_KEY=([^\n]+)/);

const url = urlMatch ? urlMatch[1].trim() : '';
const key = keyMatch ? keyMatch[1].trim() : '';

const supabase = createClient(url, key);

async function fixData() {
  console.log("Fixing data in Supabase...");

  // 1. Unlock Site Lock
  const { error: lockError } = await supabase
    .from('settings')
    .update({ 
      value: { manual_lock: false, updated_at: new Date().toISOString() },
      updated_at: new Date().toISOString()
    })
    .eq('key', 'site_lock');

  if (lockError) {
    console.error("Failed to unlock site:", lockError);
  } else {
    console.log("-> Successfully unlocked site (manual_lock: false).");
  }

  // 2. Insert Missing Categories
  const missingCategories = [
    { name: 'classic', is_active: true },
    { name: 'chocolate', is_active: true },
    { name: 'premium', is_active: true },
    { name: 'fruity', is_active: true }
  ];

  for (const cat of missingCategories) {
    // Check if exists first to avoid conflict if already there
    const { data: existing } = await supabase
      .from('categories')
      .select('name')
      .eq('name', cat.name)
      .single();

    if (!existing) {
      const { error: catError } = await supabase
        .from('categories')
        .insert([{
            name: cat.name,
            is_active: cat.is_active
        }]);
      if (catError) {
        console.error(`Failed to insert category '${cat.name}':`, catError);
      } else {
        console.log(`-> Inserted category: ${cat.name}`);
      }
    } else {
      console.log(`-> Category '${cat.name}' already exists.`);
    }
  }

  console.log("Data fix complete.");
}

fixData();
