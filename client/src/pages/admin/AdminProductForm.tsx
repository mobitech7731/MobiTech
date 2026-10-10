import { useState, useEffect, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { useAdminProduct, useProductMutations } from '../../hooks/useProducts';
import { useCategories } from '../../hooks/useCategories';
import { Button } from '../../components/ui/Button';
import { Loader2, ArrowLeft } from 'lucide-react';
import { ApiProduct } from '../../types';
import { ImageUploader } from '../../components/admin/ImageUploader';

export default function AdminProductForm() {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const { data: productToEdit, isLoading: isLoadingProduct } = useAdminProduct(id || '');
  const { data: categories = [], isLoading: isLoadingCategories } = useCategories();
  const { createProduct, updateProduct, isCreating, isUpdating } = useProductMutations();

  const [formData, setFormData] = useState<Partial<ApiProduct>>({
    name: '',
    slug: '',
    description: '',
    category: '',
    price: 0,
    compareAtPrice: undefined,
    stockQuantity: 0,
    images: [],
    isNewArrival: false,
    isFeatured: false,
    isTrending: false,
    isBestSeller: false,
    isActive: true,
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isEditing && productToEdit) {
      setFormData({
        name: productToEdit.name,
        slug: productToEdit.slug,
        description: productToEdit.description,
        category: typeof productToEdit.category === 'object' ? productToEdit.category._id : productToEdit.category,
        price: productToEdit.price,
        compareAtPrice: productToEdit.compareAtPrice || undefined,
        stockQuantity: productToEdit.stockQuantity,
        images: productToEdit.images || [],
        isNewArrival: productToEdit.isNewArrival,
        isFeatured: productToEdit.isFeatured,
        isTrending: productToEdit.isTrending,
        isBestSeller: productToEdit.isBestSeller,
        isActive: productToEdit.isActive,
      });
    }
  }, [isEditing, productToEdit]);

  // Auto-generate slug from name if empty or creating new product
  const handleNameChange = (val: string) => {
    setFormData(prev => {
      // Only auto-generate slug if we are NOT editing, to preserve SEO URLs
      const newSlug = !isEditing 
        ? val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
        : prev.slug;
        
      return {
        ...prev,
        name: val,
        slug: newSlug
      };
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    
    if (!formData.name || !formData.slug || !formData.description || !formData.category || formData.price === undefined || formData.stockQuantity === undefined) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    if (formData.price < 0 || formData.stockQuantity < 0) {
      setErrorMsg('Price and Stock Quantity cannot be negative.');
      return;
    }

    try {
      setIsSubmitting(true);
      if (isEditing && id) {
        await updateProduct({ id, data: formData });
      } else {
        await createProduct(formData);
      }
      navigate('/admin/products');
    } catch (err) {
      if (isAxiosError(err)) {
        if (!err.response) {
          setErrorMsg('Network Error: Cannot connect to the server.');
        } else {
          setErrorMsg(err.response.data?.message || 'Failed to save product. Check slug uniqueness and inputs.');
        }
      } else {
        setErrorMsg('An unexpected error occurred.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormLoading = isEditing && isLoadingProduct;
  const isSaving = isCreating || isUpdating || isSubmitting;

  if (isFormLoading || isLoadingCategories) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary-dark-teal" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-12 px-4 sm:px-0">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate('/admin/products')}
          type="button"
          className="w-10 h-10 rounded-full bg-white border border-light-neutral flex items-center justify-center text-primary-dark hover:bg-light-neutral/30 transition-colors shrink-0"
          aria-label="Back to products"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-primary-dark mb-1">
            {isEditing ? 'Edit Product' : 'Add New Product'}
          </h2>
          <p className="text-primary-dark/60 text-sm">
            {isEditing ? 'Update your product information below.' : 'Fill out the simple details below to add a product to your store.'}
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 mb-6 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100 font-medium">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Section 1: Product Details */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-light-neutral shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-primary-dark border-b border-light-neutral/50 pb-4">1. Product Details</h3>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-primary-dark">Product Name *</label>
            <p className="text-xs text-primary-dark/50 mb-1">What customers will see on the store.</p>
            <input
              type="text"
              required
              value={formData.name || ''}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-light-neutral focus:border-primary-dark-teal focus:ring-1 focus:ring-primary-dark-teal outline-none transition-all text-sm"
              placeholder="e.g. Samsung Galaxy S24 Ultra"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-primary-dark">Category *</label>
            <p className="text-xs text-primary-dark/50 mb-1">Choose the category this product belongs to.</p>
            <select
              required
              value={formData.category as string || ''}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-light-neutral focus:border-primary-dark-teal focus:ring-1 focus:ring-primary-dark-teal outline-none transition-all text-sm bg-white"
            >
              <option value="" disabled>Select a category</option>
              {categories.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-primary-dark">Product Description *</label>
            <p className="text-xs text-primary-dark/50 mb-1">Tell customers about the product, its features or specifications.</p>
            <textarea
              required
              rows={4}
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-light-neutral focus:border-primary-dark-teal focus:ring-1 focus:ring-primary-dark-teal outline-none transition-all text-sm resize-y"
              placeholder="e.g. 6.8-inch display, 256GB storage, 50MP camera..."
            />
          </div>
        </div>

        {/* Section 2: Price & Stock */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-light-neutral shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-primary-dark border-b border-light-neutral/50 pb-4">2. Price & Stock</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-primary-dark">Selling Price (₹) *</label>
              <p className="text-xs text-primary-dark/50 mb-1">The price customers will pay.</p>
              <input
                type="number"
                required
                min="0"
                value={formData.price === 0 && !isEditing ? '' : formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-lg border border-light-neutral focus:border-primary-dark-teal focus:ring-1 focus:ring-primary-dark-teal outline-none transition-all text-sm"
                placeholder="e.g. 4999"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-primary-dark">Original Price (₹) — Optional</label>
              <p className="text-xs text-primary-dark/50 mb-1">Optional. Use this to show the old price and a discount.</p>
              <input
                type="number"
                min="0"
                value={formData.compareAtPrice || ''}
                onChange={(e) => setFormData({ ...formData, compareAtPrice: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full px-4 py-2.5 rounded-lg border border-light-neutral focus:border-primary-dark-teal focus:ring-1 focus:ring-primary-dark-teal outline-none transition-all text-sm"
                placeholder="e.g. 5999"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-primary-dark">Available Stock *</label>
              <p className="text-xs text-primary-dark/50 mb-1">How many pieces are currently available.</p>
              <input
                type="number"
                required
                min="0"
                value={formData.stockQuantity === 0 && !isEditing ? '' : formData.stockQuantity}
                onChange={(e) => setFormData({ ...formData, stockQuantity: Number(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-lg border border-light-neutral focus:border-primary-dark-teal focus:ring-1 focus:ring-primary-dark-teal outline-none transition-all text-sm"
                placeholder="e.g. 25"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Product Photos */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-light-neutral shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-primary-dark border-b border-light-neutral/50 pb-4">3. Product Photos</h3>
          <p className="text-sm text-primary-dark/60 -mt-2 mb-4">Add up to 5 clear photos of this product.</p>
          
          <ImageUploader 
            images={formData.images || []}
            onChange={(newImages) => setFormData({ ...formData, images: newImages })}
          />
          <p className="text-xs text-primary-dark/50 mt-2">Use the first photo as the main product photo.</p>
        </div>

        {/* Section 4: Store Visibility */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-light-neutral shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-primary-dark border-b border-light-neutral/50 pb-4">4. Store Visibility</h3>
          <p className="text-sm text-primary-dark/60 -mt-2 mb-4">Choose where and how this product appears in your store.</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded border-light-neutral text-primary-dark-teal focus:ring-primary-dark-teal w-5 h-5 cursor-pointer mt-0.5 shrink-0"
              />
              <div>
                <span className="block text-sm font-medium text-primary-dark group-hover:text-primary-dark-teal transition-colors">Active / Visible in Store</span>
                <span className="block text-xs text-primary-dark/50 mt-0.5">Show this product to customers on your website.</span>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="rounded border-light-neutral text-primary-dark-teal focus:ring-primary-dark-teal w-5 h-5 cursor-pointer mt-0.5 shrink-0"
              />
              <div>
                <span className="block text-sm font-medium text-primary-dark group-hover:text-primary-dark-teal transition-colors">Featured Product</span>
                <span className="block text-xs text-primary-dark/50 mt-0.5">Show this product in featured sections.</span>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={formData.isTrending}
                onChange={(e) => setFormData({ ...formData, isTrending: e.target.checked })}
                className="rounded border-light-neutral text-primary-dark-teal focus:ring-primary-dark-teal w-5 h-5 cursor-pointer mt-0.5 shrink-0"
              />
              <div>
                <span className="block text-sm font-medium text-primary-dark group-hover:text-primary-dark-teal transition-colors">Trending Product</span>
                <span className="block text-xs text-primary-dark/50 mt-0.5">Mark this product as trending.</span>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={formData.isBestSeller}
                onChange={(e) => setFormData({ ...formData, isBestSeller: e.target.checked })}
                className="rounded border-light-neutral text-primary-dark-teal focus:ring-primary-dark-teal w-5 h-5 cursor-pointer mt-0.5 shrink-0"
              />
              <div>
                <span className="block text-sm font-medium text-primary-dark group-hover:text-primary-dark-teal transition-colors">Best Seller</span>
                <span className="block text-xs text-primary-dark/50 mt-0.5">Mark this product as a best seller.</span>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={formData.isNewArrival}
                onChange={(e) => setFormData({ ...formData, isNewArrival: e.target.checked })}
                className="rounded border-light-neutral text-primary-dark-teal focus:ring-primary-dark-teal w-5 h-5 cursor-pointer mt-0.5 shrink-0"
              />
              <div>
                <span className="block text-sm font-medium text-primary-dark group-hover:text-primary-dark-teal transition-colors">New Arrival</span>
                <span className="block text-xs text-primary-dark/50 mt-0.5">Show this product as a new arrival.</span>
              </div>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4 pt-4 sticky bottom-4 z-50 bg-soft-ivory/90 backdrop-blur-md p-4 rounded-xl border border-light-neutral shadow-sm">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate('/admin/products')}
            disabled={isSaving}
            className="bg-white"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="primary" 
            disabled={isSaving}
            className="flex items-center gap-2 min-w-[150px] justify-center"
          >
            {isSaving ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                {isEditing ? 'Saving...' : 'Adding Product...'}
              </>
            ) : (
              isEditing ? 'Save Changes' : 'Add Product'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
