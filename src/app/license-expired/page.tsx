export default function LicenseExpired() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center">
        {/* Warning Icon */}
        <div className="mb-6">
          <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center">
            <svg 
              className="w-12 h-12 text-red-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
              />
            </svg>
          </div>
        </div>

        {/* Main Message */}
        <h1 className="text-3xl md:text-4xl font-black text-red-600 mb-4">
          ⚠️ Layanan Berlangganan Berakhir
        </h1>
        
        <p className="text-lg text-slate-700 mb-6">
          Website ini memerlukan pembayaran layanan bulanan untuk tetap aktif.
        </p>

        {/* Details */}
        <div className="bg-red-50 border-l-4 border-red-500 p-6 mb-8 text-left">
          <h2 className="font-bold text-red-800 mb-3">Informasi Penting:</h2>
          <ul className="space-y-2 text-slate-700">
            <li>• Website tidak dapat digunakan saat ini</li>
            <li>• Pembayaran jasa developer diperlukan untuk mengaktifkan kembali</li>
            <li>• Hubungi developer untuk memperpanjang layanan</li>
          </ul>
        </div>

        {/* Contact Developer */}
        <div className="space-y-4">
          <p className="text-slate-600 font-semibold">
            Untuk mengaktifkan kembali website, silakan hubungi:
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {/* WhatsApp Button */}
            <a
              href="https://wa.me/6285810658117?text=Halo,%20saya%20ingin%20perpanjang%20layanan%20website%20HR-One%20Donuts"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.628 1.433h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Hubungi Developer
            </a>

            {/* Email */}
            <a
              href="mailto:developer@youremail.com?subject=Perpanjang Layanan Website"
              className="inline-flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Kirim Email
            </a>
          </div>
        </div>

        {/* Footer */}
        <p className="text-sm text-slate-500 mt-8">
          Terima kasih atas pengertiannya 🙏
        </p>
      </div>
    </div>
  );
}
