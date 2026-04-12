import { createClient } from '@supabase/supabase-js';

// Update with your actual Supabase URL and Service Role Key
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''; 

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const ID_NAMES = [
  "Budi Santoso", "Siti Rahayu", "Ahmad Fauzi", "Rina Wijaya", "Dika Prasetyo", 
  "Nia Pratiwi", "Andi Kusuma", "Dewi Sartika", "Reza Pahlawan", "Maya Indah",
  "Rizky Aditya", "Putri Maharani", "Yusuf Hidayat", "Ayu Lestari", "Eko Yulianto",
  "Dina Mariana", "Fajar Nugroho", "Siska Amelia", "Hendra Gunawan", "Fitri Handayani"
];

const POSITIVE_COMMENTS = [
  "Donutnya enak banget, toppingnya melimpah",
  "Fresh banget, packaging premium",
  "Paling suka yang coklat keju",
  "Recommended untuk temen kantor",
  "Suka banget sama teksturnya yang empuk",
  "Pesan untuk acara keluarga, semua pada suka!",
  "Rasanya premium, gak kalah sama brand besar",
  "Manisnya pas, gak bikin eneg",
  "Cepat sampai dan kondisinya masih sangat baik",
  "Varian rasanya unik-unik dan enak semua",
  "Udah repurchase berkali-kali saking enaknya",
  "Bikin nagih! Besok mau pesen lagi ah"
];

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomItem(arr: any[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function seedData() {
  console.log("Starting social proof seed...");
  
  // 1. Get all products
  const { data: products, error: productError } = await fallbackGetProducts();
  if (productError) {
    console.error("Error fetching products:", productError);
    return;
  }
  
  if (!products || products.length === 0) {
    console.log("No products found.");
    return;
  }

  // 2. Loop through each product and generate stats
  for (const product of products) {
    // Generate sold count (2500 - 12500)
    const soldCount = getRandomInt(2500, 12500);
    
    // Update sold_count in products
    const { error: updateError } = await supabase
      .from('products')
      .update({ sold_count: soldCount })
      .eq('id', product.id);
      
    if (updateError) {
      console.error(`Error updating sold count for product ${product.id}:`, updateError);
      continue;
    }
    console.log(`Updated ${product.name} with ${soldCount} sold count.`);

    // Generate reviews (120 - 450)
    const reviewCount = getRandomInt(120, 450);
    let reviewsToInsert = [];
    
    // Distribute ratings to get avg 4.6 - 4.9
    // Mostly 5 and 4
    for (let i = 0; i < reviewCount; i++) {
        const rValue = Math.random();
        let rating = 5;
        if (rValue > 0.85) rating = 4;
        else if (rValue > 0.98) rating = 3;

        // Generate random date within the last 8-12 months
        const dateOffset = getRandomInt(1, 300);
        const reviewDate = new Date();
        reviewDate.setDate(reviewDate.getDate() - dateOffset);

        reviewsToInsert.push({
            product_id: product.id,
            user_name: getRandomItem(ID_NAMES) + ' ' + getRandomItem(['', 'S.', 'M.', 'W.', 'P.']),
            rating: rating,
            comment: getRandomItem(POSITIVE_COMMENTS),
            verified_purchase: true,
            created_at: reviewDate.toISOString(),
        });
    }
    
    // Insert in chunks of 100
    const chunkSize = 100;
    for (let i = 0; i < reviewsToInsert.length; i += chunkSize) {
        const chunk = reviewsToInsert.slice(i, i + chunkSize);
        const { error: insertError } = await supabase
            .from('product_reviews')
            .insert(chunk);
            
        if (insertError) {
            console.error(`Error inserting reviews chunk for ${product.id}:`, insertError);
        }
    }
    
    console.log(`Inserted ${reviewCount} reviews for ${product.name}.`);
  }
  
  // 3. Update dashboard stats (fake via a config table or settings, here we just output instructions)
  console.log("✅ Seed completed successfully!");
}

async function fallbackGetProducts() {
    return supabase.from('products').select('id, name');
}

seedData();
