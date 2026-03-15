import React from 'react';
import { getAdminVouchers } from '@/app/actions/voucher-actions';
import AdminVouchersClient from '@/components/admin/vouchers/AdminVouchersClient';

export const metadata = {
  title: 'Manajemen Voucher | Admin',
};

export default async function AdminVouchersPage() {
  const { data: vouchers, success } = await getAdminVouchers();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#1C2434]">
          Manajemen Voucher
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Kelola kode promo dan diskon untuk pelanggan
        </p>
      </div>

      <AdminVouchersClient initialVouchers={success ? vouchers || [] : []} />
    </div>
  );
}
