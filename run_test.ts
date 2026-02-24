import { saveProduct } from './src/app/admin/actions';
import { getAdminSession } from './src/lib/admin-auth';

// mock admin session
jest.mock('./src/lib/admin-auth', () => ({
  getAdminSession: jest.fn().mockResolvedValue({
    supabase: {
      from: () => ({
        upsert: () => ({
          select: () => ({
            maybeSingle: () => Promise.resolve({ data: { id: 'test', name: 'Test' }, error: null })
          })
        })
      })
    }
  })
}));

async function test() {
  const result = await saveProduct({
    name: 'Test Product Fix 500',
    price: 15000,
    category: 'Donat',
  });
  console.log(result);
}

test().catch(console.error);
