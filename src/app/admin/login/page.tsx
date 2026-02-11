'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LegacyAdminLogin() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/login?next=/admin');
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="size-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}
