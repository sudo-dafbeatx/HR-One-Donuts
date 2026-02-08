'use client';

import { useState } from 'react';
import { Product } from '@/types/cms';
import { AdminCard, AdminInput, AdminButton } from './Shared';
import { saveProduct, deleteProduct } from '@/app/admin/actions';
import { TrashIcon, PencilIcon, PlusIcon, PhotoIcon } from '@heroicons/react/24/outline';
import ImageUploader from '../ImageUploader';

export default function ProductManager({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    
    setLoading(true);
    try {
      await saveProduct(editingProduct);
      // Refresh list would be better, but for now simple local update or reload
      window.location.reload();
    } catch (error) {
      alert('Error saving product');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await deleteProduct(id);
      setProducts(products.filter(p => p.id !== id));
    } catch (error) {
      alert('Error deleting product');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-heading">Menu Produk</h2>
        <AdminButton onClick={() => setEditingProduct({ name: '', price: 0, is_active: true })}>
          <PlusIcon className="w-5 h-5" />
          Tambah Produk
        </AdminButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden group">
            <div className="aspect-square bg-slate-100 relative overflow-hidden">
              {product.image_url ? (
                <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <PhotoIcon className="w-12 h-12" />
                </div>
              )}
              <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => setEditingProduct(product)}
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
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-bold text-slate-800">{product.name}</h4>
                <span className="text-primary font-black text-sm">Rp {product.price.toLocaleString()}</span>
              </div>
              <p className="text-xs text-slate-500 line-clamp-2">{product.description}</p>
              {product.tag && (
                <span className="mt-3 inline-block px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded uppercase tracking-wider">
                  {product.tag}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal / Form overlay */}
      {editingProduct && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden scale-in-center">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-black text-heading">
                {editingProduct.id ? 'Edit Produk' : 'Tambah Produk Baru'}
              </h3>
              <button 
                onClick={() => setEditingProduct(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-8 space-y-4">
              <AdminInput 
                label="Nama Produk" 
                value={editingProduct.name} 
                onChange={e => setEditingProduct({...editingProduct, name: e.target.value})}
                required 
              />
              <div className="grid grid-cols-2 gap-4">
                <AdminInput 
                  label="Harga (Rp)" 
                  type="number"
                  value={editingProduct.price} 
                  onChange={e => setEditingProduct({...editingProduct, price: Number(e.target.value)})}
                  required 
                />
                <AdminInput 
                  label="Tag (opsional)" 
                  placeholder="Terlaris, Baru, dll"
                  value={editingProduct.tag || ''} 
                  onChange={e => setEditingProduct({...editingProduct, tag: e.target.value})}
                />
              </div>
              <AdminInput 
                label="Deskripsi" 
                multiline 
                rows={3}
                value={editingProduct.description || ''} 
                onChange={e => setEditingProduct({...editingProduct, description: e.target.value})}
              />
              <ImageUploader
                currentImage={editingProduct.image_url}
                onImageUploaded={(url) => {
                  setEditingProduct({...editingProduct, image_url: url});
                }}
                label="Product Image"
                aspectRatio="square"
              />
              
              <div className="flex justify-end gap-3 pt-6">
                <AdminButton type="button" variant="secondary" onClick={() => setEditingProduct(null)}>
                  Batal
                </AdminButton>
                <AdminButton type="submit" isLoading={loading}>
                  Simpan Produk
                </AdminButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
