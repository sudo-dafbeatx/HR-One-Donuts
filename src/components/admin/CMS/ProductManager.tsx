'use client';

import { useState } from 'react';
import { Product } from '@/types/cms';
import { AdminInput, AdminButton, AdminSelect } from './Shared';
import { saveProduct, deleteProduct } from '@/app/admin/actions';
import { TrashIcon, PencilIcon, PlusIcon, PhotoIcon } from '@heroicons/react/24/outline';
import ImageUploader from '../ImageUploader';
import Image from 'next/image';
import { isPromoActive } from '@/lib/product-utils';

export default function ProductManager({ initialProducts, categories }: { initialProducts: Product[], categories: string[] }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [successStatus, setSuccessStatus] = useState<string | null>(null);

  const validate = (data: Partial<Product>) => {
    if (!data.name?.trim()) return "Nama produk wajib diisi";
    if (!data.price || data.price <= 0) return "Harga harus lebih dari 0";
    if (data.stock !== undefined && data.stock < 0) return "Stok tidak boleh negatif";
    if (data.discount_percent && (data.discount_percent < 0 || data.discount_percent > 100)) return "Diskon harus antara 0-100%";
    return null;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    
    const validationError = validate(editingProduct);
    if (validationError) {
      setErrorStatus(validationError);
      return;
    }

    // Clean data: if not promo, discount is null
    const finalData = {
      ...editingProduct,
      discount_percent: editingProduct.sale_type === 'normal' ? null : (editingProduct.discount_percent ?? null)
    } as Partial<Product>;
    
    setLoading(true);
    setErrorStatus(null);
    try {
      const result = await saveProduct(finalData);
      if (result.success && result.data) {
        if (editingProduct.id) {
          setProducts(products.map(p => p.id === editingProduct.id ? result.data! : p));
        } else {
          setProducts([result.data, ...products]);
        }
        setSuccessStatus("Produk berhasil disimpan!");
        setTimeout(() => {
          setEditingProduct(null);
          setSuccessStatus(null);
        }, 1500);
      }
    } catch (err: unknown) {
      setErrorStatus(err instanceof Error ? err.message : 'Error saving product');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus produk ini?')) return;
    try {
      const result = await deleteProduct(id);
      if (result.success) {
        setProducts(products.filter(p => p.id !== id));
      }
    } catch (err: unknown) {
      alert('Error deleting product: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const addVariant = () => {
    if (!editingProduct) return;
    const variants = [...(editingProduct.variants || []), { name: '', price_adjustment: 0 }];
    setEditingProduct({ ...editingProduct, variants });
  };

  const removeVariant = (index: number) => {
    if (!editingProduct || !editingProduct.variants) return;
    const variants = editingProduct.variants.filter((_, i) => i !== index);
    setEditingProduct({ ...editingProduct, variants });
  };

  const updateVariant = (index: number, field: string, value: string | number) => {
    if (!editingProduct || !editingProduct.variants) return;
    const variants = [...editingProduct.variants];
    variants[index] = { ...variants[index], [field]: value };
    setEditingProduct({ ...editingProduct, variants });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-heading">Menu Produk</h2>
        <AdminButton onClick={() => {
          setErrorStatus(null);
          setSuccessStatus(null);
          setEditingProduct({ name: '', price: 0, category: '', tag: '', stock: 0, is_active: true, sale_type: 'normal', package_type: 'satuan', variants: [] });
        }}>
          <PlusIcon className="w-5 h-5" />
          Tambah Produk
        </AdminButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className={`bg-white rounded-2xl border ${product.is_active ? 'border-slate-200' : 'border-red-100 opacity-75'} shadow-sm overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative`}>
            {/* Stock Level Indicator */}
            {product.stock === 0 ? (
               <div className="absolute top-2 left-2 z-10 px-2 py-0.5 bg-red-600 text-white text-[8px] font-black rounded uppercase tracking-widest shadow-lg">Habis</div>
            ) : product.stock < 10 ? (
               <div className="absolute top-2 left-2 z-10 px-2 py-0.5 bg-orange-500 text-white text-[8px] font-black rounded uppercase tracking-widest shadow-lg">Menipis</div>
            ) : null}

            <div className="aspect-square bg-slate-100 relative overflow-hidden">
              {product.image_url ? (
                <Image src={product.image_url} alt={product.name} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <PhotoIcon className="w-12 h-12" />
                </div>
              )}
              <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => {
                    setErrorStatus(null);
                    setSuccessStatus(null);
                    setEditingProduct(product);
                  }}
                  className="p-2 bg-white rounded-lg shadow-md text-primary hover:bg-primary hover:text-white transition-colors"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete(product.id)}
                  className="p-2 bg-white rounded-lg shadow-md text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
              {!product.is_active && (
                <div className="absolute top-3 left-3 px-2 py-1 bg-red-500 text-white text-[10px] font-black rounded uppercase">
                  Nonaktif
                </div>
              )}
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-bold text-slate-800">{product.name}</h4>
                <div className="text-right">
                  <p className="text-primary font-black text-sm">Rp {product.price.toLocaleString()}</p>
                  <div className="flex flex-col items-end">
                    <p className={`text-[10px] font-bold leading-none ${product.stock < 5 ? 'text-red-500' : 'text-slate-400'}`}>Stok: {product.stock}</p>
                    <p className="text-[10px] font-bold text-primary leading-none mt-1">Terjual: {product.sold_count || 0}+</p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-500 line-clamp-2 mb-2">{product.description}</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded uppercase tracking-wider">
                  {product.category || 'No Category'}
                </span>
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider ${product.package_type === 'box' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                  {product.package_type}
                </span>
                {product.sale_type !== 'normal' && (
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider ${isPromoActive(product) ? 'bg-primary text-white' : 'bg-slate-200 text-slate-500'}`}>
                    {product.sale_type.replace('_', ' ')}
                    {!isPromoActive(product) && ' (Inactive)'}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal / Form overlay */}
      {editingProduct && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="my-8 w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden scale-in-center">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-black text-heading">
                {editingProduct.id ? 'Edit Produk' : 'Tambah Produk Baru'}
              </h3>
              <button 
                onClick={() => setEditingProduct(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <TrashIcon className="w-6 h-6 rotate-45" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-8 space-y-6">
              {/* Status Messages */}
              {errorStatus && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-xl animate-shake">
                   ⚠️ {errorStatus}
                </div>
              )}
              {successStatus && (
                <div className="p-3 bg-green-50 border border-green-100 text-green-600 text-xs font-bold rounded-xl animate-bounce">
                   ✅ {successStatus}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <AdminInput 
                    label="Nama Produk *" 
                    value={editingProduct.name} 
                    onChange={e => setEditingProduct({...editingProduct, name: e.target.value})}
                    required 
                  />
                  <AdminSelect 
                    label="Kategori" 
                    value={editingProduct.category || ''} 
                    onChange={e => setEditingProduct({...editingProduct, category: e.target.value})}
                    options={[
                      { label: '-- Pilih Kategori --', value: '' },
                      ...categories.map(cat => ({ label: cat, value: cat }))
                    ]}
                  />
                  <AdminInput 
                    label="Label / Tag (e.g. Terlaris, Premium)" 
                    value={editingProduct.tag || ''} 
                    onChange={e => setEditingProduct({...editingProduct, tag: e.target.value})}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <AdminInput 
                      label="Harga Dasar *" 
                      type="number"
                      value={editingProduct.price} 
                      onChange={e => setEditingProduct({...editingProduct, price: Number(e.target.value)})}
                      required 
                    />
                    <AdminInput 
                      label="Stok" 
                      type="number"
                      value={editingProduct.stock || 0} 
                      onChange={e => setEditingProduct({...editingProduct, stock: Number(e.target.value)})}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <AdminSelect 
                      label="Tipe Penjualan"
                      value={editingProduct.package_type || 'satuan'}
                      onChange={e => setEditingProduct({...editingProduct, package_type: e.target.value as 'satuan' | 'box'})}
                      options={[
                        { label: 'Satuan', value: 'satuan' },
                        { label: 'Box', value: 'box' },
                      ]}
                    />
                    <AdminSelect 
                      label="Tipe Promo"
                      value={editingProduct.sale_type || 'normal'}
                      onChange={e => setEditingProduct({...editingProduct, sale_type: e.target.value as 'normal' | 'flash_sale' | 'jumat_berkah' | 'takjil' })}
                      options={[
                        { label: 'Normal', value: 'normal' },
                        { label: 'Flash Sale', value: 'flash_sale' },
                        { label: 'Jumat Berkah', value: 'jumat_berkah' },
                        { label: 'Takjil', value: 'takjil' },
                      ]}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-slate-700">Status Produk</label>
                  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <span className={`text-xs font-bold uppercase transition-colors ${editingProduct.is_active ? 'text-primary' : 'text-slate-400'}`}>
                      {editingProduct.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setEditingProduct({...editingProduct, is_active: !editingProduct.is_active})}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${editingProduct.is_active ? 'bg-primary' : 'bg-slate-300'}`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${editingProduct.is_active ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  <div className={`p-4 rounded-xl border transition-all ${editingProduct.sale_type !== 'normal' ? 'bg-primary/5 border-primary/10' : 'bg-slate-50 border-slate-100 opacity-50 grayscale'}`}>
                    <AdminInput 
                      label="Diskon (%)" 
                      type="number"
                      placeholder="0"
                      disabled={editingProduct.sale_type === 'normal'}
                      value={editingProduct.discount_percent ?? ''} 
                      onChange={e => setEditingProduct({...editingProduct, discount_percent: e.target.value ? Number(e.target.value) : null})}
                    />
                    <div className="grid grid-cols-1 gap-3 mt-3">
                      <AdminInput 
                        label="Mulai Promo" 
                        type="datetime-local"
                        disabled={editingProduct.sale_type === 'normal'}
                        value={editingProduct.promo_start ? editingProduct.promo_start.slice(0, 16) : ''} 
                        onChange={e => setEditingProduct({...editingProduct, promo_start: e.target.value})}
                      />
                      <AdminInput 
                        label="Berakhir Promo" 
                        type="datetime-local"
                        disabled={editingProduct.sale_type === 'normal'}
                        value={editingProduct.promo_end ? editingProduct.promo_end.slice(0, 16) : ''} 
                        onChange={e => setEditingProduct({...editingProduct, promo_end: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="relative group/uploader">
                    <ImageUploader
                      currentImage={editingProduct.image_url}
                      onImageUploaded={(url) => {
                        setEditingProduct({...editingProduct, image_url: url});
                      }}
                      label="Foto Produk"
                      aspectRatio="square"
                    />
                    {editingProduct.image_url && (
                       <div className="mt-2 text-[10px] text-slate-400 font-medium">📷 Preview tersedia di atas</div>
                    )}
                  </div>
                </div>
              </div>

              <AdminInput 
                label="Deskripsi Singkat" 
                multiline 
                rows={2}
                value={editingProduct.description || ''} 
                onChange={e => setEditingProduct({...editingProduct, description: e.target.value})}
              />

              {/* Variants Section */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-slate-700">Varian</label>
                  <button 
                    type="button" 
                    onClick={addVariant}
                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                  >
                    <PlusIcon className="w-3 h-3" /> Tambah Varian
                  </button>
                </div>
                <div className="space-y-2">
                  {editingProduct.variants?.map((variant, index) => (
                    <div key={index} className="flex gap-2 items-end">
                      <div className="flex-1">
                        <AdminInput 
                          label="" 
                          placeholder="Nama Varian (Coklat, Keju...)"
                          value={variant.name} 
                          onChange={e => updateVariant(index, 'name', e.target.value)}
                        />
                      </div>
                      <div className="w-32">
                        <AdminInput 
                          label="" 
                          type="number"
                          placeholder="+ Harga"
                          value={variant.price_adjustment} 
                          onChange={e => updateVariant(index, 'price_adjustment', Number(e.target.value))}
                        />
                      </div>
                      <button 
                        type="button" 
                        onClick={() => removeVariant(index)}
                        className="p-2.5 mb-1.5 text-red-400 hover:text-red-600 bg-red-50 rounded-lg transition-colors"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {(!editingProduct.variants || editingProduct.variants.length === 0) && (
                    <p className="text-xs text-slate-400 italic">Belum ada varian produk.</p>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <AdminButton type="button" variant="secondary" onClick={() => setEditingProduct(null)} disabled={loading}>
                  Batal
                </AdminButton>
                <AdminButton type="submit" isLoading={loading}>
                  {editingProduct.id ? 'Simpan Perubahan' : 'Buat Produk'}
                </AdminButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
