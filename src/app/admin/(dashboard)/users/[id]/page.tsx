import { getUserDetails, getUserOrders, getUserAuthLogs, getUserTrafficLogs } from '@/app/admin/actions';
import Link from 'next/link';
import UserManageClient from '@/components/admin/UserManageClient';
import { 
  ArrowLeftIcon, 
  UserCircleIcon, 
  MapPinIcon, 
  PhoneIcon, 
  EnvelopeIcon, 
  CalendarIcon,
  ShoppingBagIcon,
  StarIcon,
  ClockIcon,
  ShieldCheckIcon,
  CursorArrowRaysIcon,
  ArrowRightCircleIcon
} from '@heroicons/react/24/outline';
import Image from 'next/image';

function formatEventLabel(event_type: string) {
  switch (event_type) {
    case 'page_view': return { label: 'Lihat Halaman', color: 'bg-blue-100 text-blue-700' };
    case 'click_buy': return { label: 'Masuk Keranjang', color: 'bg-emerald-100 text-emerald-700' };
    case 'login_view': return { label: 'Buka Login', color: 'bg-purple-100 text-purple-700' };
    case 'login_success': return { label: 'Berhasil Login', color: 'bg-indigo-100 text-indigo-700' };
    default: return { label: event_type, color: 'bg-slate-100 text-slate-700' };
  }
}

export default async function UserDetailPage({ params }: { params: { id: string } }) {
  const userId = params.id;
  const [user, orders, authLogs, trafficLogs] = await Promise.all([
    getUserDetails(userId),
    getUserOrders(userId),
    getUserAuthLogs(userId),
    getUserTrafficLogs(userId)
  ]);

  const totalSpend = orders.reduce((sum, order) => {
    if (order.status === 'completed') return sum + (order.total_amount || 0);
    return sum;
  }, 0);

  if (!user || (!user.id && !user.email)) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold text-slate-800">User tidak ditemukan</h2>
        <p className="text-slate-500 mt-2">Data pengguna dengan ID tersebut tidak ada di sistem.</p>
        <Link href="/admin/users" className="mt-4 inline-flex items-center text-primary font-semibold hover:underline">
          <ArrowLeftIcon className="w-4 h-4 mr-2" /> Kembali ke Daftar
        </Link>
      </div>
    );
  }

  const isRoleAdmin = user.role === 'admin';

  return (
    <div className="space-y-6">
      {/* Header & Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link 
            href="/admin/users" 
            className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">Detail Pelanggan</h1>
            <p className="text-slate-500 text-sm">Informasi lengkap dan riwayat aktivitas pengguna.</p>
          </div>
        </div>
        
        <div className={`px-4 py-2 rounded-xl border text-sm font-bold flex items-center gap-2 ${
          isRoleAdmin ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
        }`}>
          {isRoleAdmin ? <ShieldCheckIcon className="w-5 h-5" /> : <UserCircleIcon className="w-5 h-5" />}
          {isRoleAdmin ? 'ADMINISTRATOR' : 'CUSTOMER'}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="h-24 bg-linear-to-r from-primary to-indigo-600 relative">
               <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full border-4 border-white bg-slate-100 overflow-hidden shadow-md">
                   {user.avatar_url ? (
                     <Image src={user.avatar_url ?? '/images/default-avatar.png'} alt={user.full_name ?? 'User'} width={96} height={96} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out" />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-100">
                     <UserCircleIcon className="w-16 h-16" />
                   </div>
                 )}
               </div>
            </div>
            <div className="pt-16 pb-6 px-6 text-center">
              <h2 className="text-xl font-black text-slate-900 leading-tight">{user.full_name || 'Tanpa Nama'}</h2>
              <p className="text-slate-500 text-sm mb-4">{user.email}</p>
              
              <div className="flex justify-center gap-2 mb-6">
                <div className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold">
                  ID: {user.id.slice(0, 8).toUpperCase()}
                </div>
                <div className={`px-3 py-1 rounded-lg text-xs font-bold ${user.is_active !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                  {user.is_active !== false ? 'AKTIF' : 'NONAKTIF'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-6">
                <div className="text-center">
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Poin</p>
                  <p className="text-lg font-black text-amber-600">{user.points || 0}</p>
                </div>
                <div className="text-center border-l border-slate-100">
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Total Bayar</p>
                  <p className="text-lg font-black text-emerald-600">Rp {totalSpend.toLocaleString('id-ID')}</p>
                </div>
              </div>
            </div>
          </div>

          <UserManageClient 
            userId={userId} 
            initialRole={user.role} 
            initialPoints={user.points || 0} 
          />

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
             <h3 className="font-bold text-slate-800 flex items-center gap-2">
               <EnvelopeIcon className="w-5 h-5 text-slate-400" /> Kontak & Akun
             </h3>
             <div className="space-y-3">
               <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                   <EnvelopeIcon className="w-4 h-4 text-slate-500" />
                 </div>
                 <div className="overflow-hidden">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Email</p>
                   <p className="text-sm font-medium text-slate-800 truncate">{user.email}</p>
                 </div>
               </div>
               <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                   <PhoneIcon className="w-4 h-4 text-slate-500" />
                 </div>
                 <div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">No. WhatsApp</p>
                   <p className="text-sm font-medium text-slate-800">{user.phone || '-'}</p>
                 </div>
               </div>
               <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                   <CalendarIcon className="w-4 h-4 text-slate-500" />
                 </div>
                 <div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Terdaftar</p>
                   <p className="text-sm font-medium text-slate-800">
                     {new Date(user.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                   </p>
                 </div>
               </div>
             </div>
          </div>
        </div>

        {/* Details & Orders */}
        <div className="lg:col-span-2 space-y-6">
          {/* Detailed Data */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2 text-lg">
              <UserCircleIcon className="w-6 h-6 text-primary" /> Informasi Lengkap Pelanggan
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-2">Data Personal</label>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-slate-50">
                      <span className="text-sm text-slate-500">Gender</span>
                      <span className="text-sm font-bold text-slate-800 capitalize">{user.gender || '-'}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-50">
                      <span className="text-sm text-slate-500">Tanggal Lahir</span>
                      <span className="text-sm font-bold text-slate-800">
                        {user.birth_date ? new Date(user.birth_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-50">
                      <span className="text-sm text-slate-500">Usia</span>
                      <span className="text-sm font-bold text-slate-800">{user.age || '-'} Tahun</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-50">
                      <span className="text-sm text-slate-500">Bahasa Preferensi</span>
                      <span className="text-sm font-bold text-slate-800 uppercase">{user.language || 'ID'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                   <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Riwayat Login & Verifikasi</label>
                   
                   {authLogs.length === 0 ? (
                     <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-4">
                        <ClockIcon className="w-8 h-8 text-slate-300" />
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Login Terakhir</p>
                          <p className="text-sm font-bold text-slate-700">Belum pernah login secara tercatat</p>
                        </div>
                     </div>
                   ) : (
                     <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                       {authLogs.map((log) => (
                         <div key={log.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex justify-between items-center group hover:border-slate-300 transition-colors">
                            <div>
                               <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                 <ShieldCheckIcon className="w-4 h-4 text-emerald-500" />
                                 {log.event_type.replace(/_/g, ' ').toUpperCase()}
                               </p>
                               <p className="text-[10px] text-slate-500 font-mono mt-1">{log.ip_address || 'IP Unknown'}</p>
                            </div>
                            <div className="text-right">
                               <p className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">
                                  {new Date(log.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                               </p>
                               <p className="text-xs font-bold text-slate-700">
                                  {new Date(log.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                               </p>
                            </div>
                         </div>
                       ))}
                     </div>
                   )}
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-2">Alamat Utama</label>
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 relative overflow-hidden group">
                    <MapPinIcon className="absolute -right-4 -bottom-4 w-24 h-24 text-slate-200/50 group-hover:scale-110 transition-transform" />
                    <div className="relative z-10 space-y-3">
                      <div className="flex items-start gap-2">
                        <MapPinIcon className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-bold text-slate-800 leading-snug">
                            {user.address_detail || 'Belum ada detail alamat'}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            {[user.district_name, user.city_name, user.province_name].filter(Boolean).join(', ') || 'Lokasi tidak diset'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm border border-indigo-100">
                    <StarIcon className="w-6 h-6 fill-current" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-800">Loyalty Member</h4>
                    <p className="text-xs text-slate-500">Anggota aktif program loyalitas donut.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Purchase History */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
                <ShoppingBagIcon className="w-6 h-6 text-primary" /> Riwayat Pembelian
              </h3>
              <span className="text-xs font-bold px-2 py-1 bg-slate-100 text-slate-500 rounded-lg">
                Total {orders.length} Transaksi
              </span>
            </div>

            {orders.length === 0 ? (
              <div className="py-12 text-center">
                 <ShoppingBagIcon className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                 <p className="text-slate-500 font-medium italic text-sm">Pelanggan ini belum pernah melakukan transaksi.</p>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-6">
                <table className="w-full text-sm text-left">
                  <thead className="text-[10px] text-slate-400 uppercase bg-slate-50/50 border-y border-slate-100">
                    <tr>
                      <th className="px-6 py-3 font-semibold">Order ID</th>
                      <th className="px-6 py-3 font-semibold">Tgl Transaksi</th>
                      <th className="px-6 py-3 font-semibold text-center">Metode</th>
                      <th className="px-6 py-3 font-semibold text-right">Total Bayar</th>
                      <th className="px-6 py-3 font-semibold text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-800">
                          <Link href={`/admin/orders-status?search=${order.id}`} className="hover:text-primary transition-colors">
                            #{order.id.slice(0, 8).toUpperCase()}
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                          {new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">
                            {order.delivery_method === 'pickup' ? 'Ambil' : 'Kirim'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-black text-slate-800">
                          Rp {(order.total_amount || 0).toLocaleString('id-ID')}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${
                            order.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                            order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Activity Tracking Timeline */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 overflow-hidden">
             <div className="flex items-center justify-between mb-6">
               <h3 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
                 <CursorArrowRaysIcon className="w-6 h-6 text-indigo-500" /> Tracking Aktivitas Klik
               </h3>
               <span className="text-xs font-bold px-2 py-1 bg-slate-100 text-slate-500 rounded-lg">
                 100 Klik Terakhir
               </span>
             </div>

             {trafficLogs.length === 0 ? (
               <div className="py-8 text-center text-slate-500">
                 <CursorArrowRaysIcon className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                 <p className="text-sm italic">Belum ada rekaman klik dari user ini.</p>
               </div>
             ) : (
               <div className="relative border-l border-slate-200 ml-3 space-y-6">
                 {trafficLogs.map((tLog) => {
                   const formatInfo = formatEventLabel(tLog.event_type);
                   return (
                     <div key={tLog.id} className="relative pl-6">
                        <div className="absolute w-3 h-3 bg-indigo-500 rounded-full -left-[6.5px] top-1.5 border-2 border-white ring-4 ring-indigo-50"></div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                           <div>
                             <div className="flex items-center gap-2">
                               <span className={`px-2 py-1 rounded text-[10px] font-black tracking-widest uppercase ${formatInfo.color}`}>
                                 {formatInfo.label}
                               </span>
                               <span className="text-xs font-semibold text-slate-800 flex items-center gap-1">
                                 <ArrowRightCircleIcon className="w-3.5 h-3.5 text-slate-400" /> 
                                 <span className="truncate max-w-[150px] sm:max-w-xs" title={tLog.path}>{tLog.path}</span>
                               </span>
                             </div>
                             <p className="text-[10px] text-slate-500 mt-1 truncate max-w-xs sm:max-w-md font-mono" title={tLog.user_agent || ''}>
                               Device: {tLog.user_agent || 'Unknown'}
                             </p>
                           </div>
                           <div className="text-left sm:text-right shrink-0">
                               <p className="text-xs font-bold text-slate-700">
                                 {new Date(tLog.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                               </p>
                               <p className="text-[11px] text-slate-500 font-medium">
                                 {new Date(tLog.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                               </p>
                           </div>
                        </div>
                     </div>
                   );
                 })}
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
