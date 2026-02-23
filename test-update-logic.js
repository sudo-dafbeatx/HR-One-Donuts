const { createClient } = require('@supabase/supabase-js');
const url = 'https://tevgavoyeisjrjksxbme.supabase.co';
const key = 'sb_publishable_nffQJkQhRKc54390s5UoEA_wiNsJvaj'; // NOT a service key, but we can test if it fails

const supabase = createClient(url, key);

async function testUpdate() {
  const { data: rawOrders } = await supabase.from('orders').select('id, status').limit(1);
  if (rawOrders && rawOrders.length > 0) {
    const orderId = rawOrders[0].id;
    console.log('Testing update on order:', orderId);
    
    // Test update without service key (should fail due to RLS)
    const { error, data } = await supabase
      .from('orders')
      .update({ status: 'shipping' })
      .eq('id', orderId)
      .select();
      
    console.log('Update Data:', data);
    console.log('Update Error:', error?.message || 'none');
  } else {
    console.log('No orders to test update on. RLS is blocking read.');
  }
}
testUpdate();
