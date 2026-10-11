import { useState, useEffect, FormEvent, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { useAdminProduct, useProductMutations } from '../../hooks/useProducts';
import { useCategories } from '../../hooks/useCategories';
import { Button } from '../../components/ui/Button';
import { Loader2, ArrowLeft } from 'lucide-react';
import { ApiProduct } from '../../types';
import { ImageUploader } from '../../components/admin/ImageUploader';
import { createProductSchema, PRODUCT_LIMITS } from '../../validators/product.validator';
import { Toast } from '../../components/ui/Toast';
import { z } from 'zod';

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

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [toastMessage, setToastMessage] = useState<{ message: string; type: 'error' | 'success' } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const formRef = useRef<HTMLFormElement>(null);

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

  const handleNameChange = (name: string) => {
    setFormData(prev => {
      const newSlug = !isEditing && (!prev.slug || prev.slug === prev.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''))
        ? name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
        : prev.slug;
      
      return {
        ...prev,
        name,
        slug: newSlug
      };
    });
    
    // Clear name and slug errors when typing
    if (fieldErrors.name) setFieldErrors(prev => ({ ...prev, name: '' }));
    if (!isEditing && fieldErrors.slug) setFieldErrors(prev => ({ ...prev, slug: '' }));
  };

  const focusFirstError = (errors: Record<string, string>) => {
    const errorKeys = Object.keys(errors);
    if (errorKeys.length > 0) {
      const firstErrorField = formRef.current?.querySelector(`[name="${errorKeys[0]}"]`) as HTMLElement;
      if (firstErrorField) {
        firstErrorField.focus();
      }
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setToastMessage(null);
    
    // Validate with Zod before submission
    try {
      createProductSchema.parse(formData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            errors[err.path[0].toString()] = err.message;
          }
        });
        setFieldErrors(errors);
        setToastMessage({ message: 'Product not saved — Please fix the errors below.', type: 'error' });
        setTimeout(() => focusFirstError(errors), 100);
        return;
      }
    }

    try {
      setIsSubmitting(true);
      if (isEditing && id) {
        await updateProduct({ id, data: formData });
      } else {
        await createProduct(formData as ApiProduct);
      }
      setToastMessage({ message: `Product successfully ${isEditing ? 'updated' : 'added'}!`, type: 'success' });
      // Short delay to show success toast before navigating
      setTimeout(() => navigate('/admin/products'), 1500);
    } catch (err) {
      if (isAxiosError(err)) {
        if (!err.response) {
          setToastMessage({ message: 'Product not saved — The server is unavailable. Check your connection.', type: 'error' });
        } else {
          // Handle backend structured validation errors
          const data = err.response.data;
          
          if (data.errors && Array.isArray(data.errors)) {
            const serverErrors: Record<string, string> = {};
            (data.errors as Array<{ field?: string; path?: string | string[]; message?: string }>).forEach((e) => {
              const fieldName = Array.isArray(e.path) ? e.path[0] : (e.field || (typeof e.path === 'string' ? e.path : ''));
              if (fieldName && e.message) {
                serverErrors[fieldName] = e.message;
              }
            });
            setFieldErrors(serverErrors);
            setToastMessage({ message: 'Product not saved — The server rejected the request. See the field errors below.', type: 'error' });
            focusFirstError(serverErrors);
          } else if (data.message && data.message.toLowerCase().includes('duplicate') && data.message.toLowerCase().includes('slug')) {
            setFieldErrors({ slug: 'This URL slug is already in use by another product.' });
            setToastMessage({ message: 'Product not saved — Slug must be unique.', type: 'error' });
            focusFirstError({ slug: 'error' });
          } else {
            setToastMessage({ message: `Product not saved — ${data.message || 'Unknown server error.'}`, type: 'error' });
          }
        }
      } else {
        setToastMessage({ message: 'Product not saved — An unexpected error occurred.', type: 'error' });
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

  const InputError = ({ error }: { error?: string }) => {
    if (!error) return null;
    return <p className="text-red-500 text-xs mt-1 font-medium">{error}</p>;
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      {toastMessage && (
        <Toast 
          message={toastMessage.message} 
          type={toastMessage.type} 
          onClose={() => setToastMessage(null)} 
          duration={5000} 
        />
      )}
      
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate('/admin/products')}
          className="p-2 -ml-2 rounded-full hover:bg-black/5 text-primary-dark transition-colors"
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

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
        
        {/* Section 1: Product Details */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-light-neutral shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-primary-dark border-b border-light-neutral/50 pb-4">1. Product Details</h3>
          
          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <label htmlFor="name" className="block text-sm font-medium text-primary-dark">Product Name <span className="text-red-500">*</span></label>
              <span className="text-xs text-primary-dark/40">{formData.name?.length || 0} / {PRODUCT_LIMITS.NAME_MAX}</span>
            </div>
            <p className="text-xs text-primary-dark/50 mb-1">What customers will see on the store (min {PRODUCT_LIMITS.NAME_MIN} chars).</p>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name || ''}
              onChange={(e) => handleNameChange(e.target.value)}
              maxLength={PRODUCT_LIMITS.NAME_MAX}
              className={`w-full px-4 py-2.5 rounded-lg border ${fieldErrors.name ? 'border-red-400 focus:ring-red-400' : 'border-light-neutral focus:border-primary-dark-teal focus:ring-primary-dark-teal'} focus:ring-1 outline-none transition-all text-sm`}
              placeholder="e.g. Samsung Galaxy S24 Ultra"
              aria-invalid={!!fieldErrors.name}
            />
            <InputError error={fieldErrors.name} />
          </div>

          <div className="space-y-2">
            <label htmlFor="category" className="block text-sm font-medium text-primary-dark">Category <span className="text-red-500">*</span></label>
            <p className="text-xs text-primary-dark/50 mb-1">Select an existing valid category for this product.</p>
            <select
              id="category"
              name="category"
              value={formData.category as string || ''}
              onChange={(e) => {
                setFormData({ ...formData, category: e.target.value });
                if (fieldErrors.category) setFieldErrors(prev => ({ ...prev, category: '' }));
              }}
              className={`w-full px-4 py-2.5 rounded-lg border ${fieldErrors.category ? 'border-red-400 focus:ring-red-400' : 'border-light-neutral focus:border-primary-dark-teal focus:ring-primary-dark-teal'} focus:ring-1 outline-none transition-all text-sm bg-white`}
              aria-invalid={!!fieldErrors.category}
            >
              <option value="" disabled>Select a category</option>
              {categories.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
            <InputError error={fieldErrors.category} />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <label htmlFor="slug" className="block text-sm font-medium text-primary-dark">URL Slug <span className="text-red-500">*</span></label>
              <span className="text-xs text-primary-dark/40">{formData.slug?.length || 0} / {PRODUCT_LIMITS.SLUG_MAX}</span>
            </div>
            <p className="text-xs text-primary-dark/50 mb-1">The URL-friendly name for this product (min {PRODUCT_LIMITS.SLUG_MIN} chars). Must be unique.</p>
            <input
              id="slug"
              name="slug"
              type="text"
              value={formData.slug || ''}
              onChange={(e) => {
                setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') });
                if (fieldErrors.slug) setFieldErrors(prev => ({ ...prev, slug: '' }));
              }}
              maxLength={PRODUCT_LIMITS.SLUG_MAX}
              className={`w-full px-4 py-2.5 rounded-lg border ${fieldErrors.slug ? 'border-red-400 focus:ring-red-400' : 'border-light-neutral focus:border-primary-dark-teal focus:ring-primary-dark-teal'} focus:ring-1 outline-none transition-all text-sm`}
              placeholder="e.g. samsung-galaxy-s24-ultra"
              aria-invalid={!!fieldErrors.slug}
            />
            <InputError error={fieldErrors.slug} />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <label htmlFor="description" className="block text-sm font-medium text-primary-dark">Description <span className="text-red-500">*</span></label>
              <span className="text-xs text-primary-dark/40">{formData.description?.length || 0} / {PRODUCT_LIMITS.DESC_MAX}</span>
            </div>
            <p className="text-xs text-primary-dark/50 mb-1">Detailed product information and features (min {PRODUCT_LIMITS.DESC_MIN} chars).</p>
            <textarea
              id="description"
              name="description"
              value={formData.description || ''}
              onChange={(e) => {
                setFormData({ ...formData, description: e.target.value });
                if (fieldErrors.description) setFieldErrors(prev => ({ ...prev, description: '' }));
              }}
              maxLength={PRODUCT_LIMITS.DESC_MAX}
              rows={5}
              className={`w-full px-4 py-3 rounded-lg border ${fieldErrors.description ? 'border-red-400 focus:ring-red-400' : 'border-light-neutral focus:border-primary-dark-teal focus:ring-primary-dark-teal'} focus:ring-1 outline-none transition-all text-sm resize-y`}
              placeholder="Describe the product details, features, and benefits..."
              aria-invalid={!!fieldErrors.description}
            />
            <InputError error={fieldErrors.description} />
          </div>
        </div>

        {/* Section 2: Pricing & Inventory */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-light-neutral shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-primary-dark border-b border-light-neutral/50 pb-4">2. Pricing & Inventory</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label htmlFor="price" className="block text-sm font-medium text-primary-dark">Selling Price (₹) <span className="text-red-500">*</span></label>
              <p className="text-xs text-primary-dark/50 mb-1">Customer pays this amount (max {PRODUCT_LIMITS.PRICE_MAX.toLocaleString()}).</p>
              <input
                id="price"
                name="price"
                type="number"
                min={PRODUCT_LIMITS.PRICE_MIN}
                max={PRODUCT_LIMITS.PRICE_MAX}
                step="0.01"
                value={formData.price === 0 && !isEditing ? '' : formData.price}
                onChange={(e) => {
                  setFormData({ ...formData, price: Number(e.target.value) });
                  if (fieldErrors.price) setFieldErrors(prev => ({ ...prev, price: '' }));
                }}
                className={`w-full px-4 py-2.5 rounded-lg border ${fieldErrors.price ? 'border-red-400 focus:ring-red-400' : 'border-light-neutral focus:border-primary-dark-teal focus:ring-primary-dark-teal'} focus:ring-1 outline-none transition-all text-sm`}
                placeholder="e.g. 4999"
                aria-invalid={!!fieldErrors.price}
              />
              <InputError error={fieldErrors.price} />
            </div>

            <div className="space-y-2">
              <label htmlFor="compareAtPrice" className="block text-sm font-medium text-primary-dark">Original Price (₹) — Optional</label>
              <p className="text-xs text-primary-dark/50 mb-1">Shows a discount if higher than Selling Price.</p>
              <input
                id="compareAtPrice"
                name="compareAtPrice"
                type="number"
                min="0"
                value={formData.compareAtPrice || ''}
                onChange={(e) => {
                  setFormData({ ...formData, compareAtPrice: e.target.value ? Number(e.target.value) : undefined });
                  if (fieldErrors.compareAtPrice) setFieldErrors(prev => ({ ...prev, compareAtPrice: '' }));
                }}
                className={`w-full px-4 py-2.5 rounded-lg border ${fieldErrors.compareAtPrice ? 'border-red-400 focus:ring-red-400' : 'border-light-neutral focus:border-primary-dark-teal focus:ring-primary-dark-teal'} focus:ring-1 outline-none transition-all text-sm`}
                placeholder="e.g. 5999"
                aria-invalid={!!fieldErrors.compareAtPrice}
              />
              <InputError error={fieldErrors.compareAtPrice} />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="stockQuantity" className="block text-sm font-medium text-primary-dark">Available Stock <span className="text-red-500">*</span></label>
              <p className="text-xs text-primary-dark/50 mb-1">Non-negative whole units (max {PRODUCT_LIMITS.STOCK_MAX.toLocaleString()}).</p>
              <input
                id="stockQuantity"
                name="stockQuantity"
                type="number"
                min={PRODUCT_LIMITS.STOCK_MIN}
                max={PRODUCT_LIMITS.STOCK_MAX}
                step="1"
                value={formData.stockQuantity === 0 && !isEditing ? '' : formData.stockQuantity}
                onChange={(e) => {
                  setFormData({ ...formData, stockQuantity: Number(e.target.value) });
                  if (fieldErrors.stockQuantity) setFieldErrors(prev => ({ ...prev, stockQuantity: '' }));
                }}
                className={`w-full px-4 py-2.5 rounded-lg border ${fieldErrors.stockQuantity ? 'border-red-400 focus:ring-red-400' : 'border-light-neutral focus:border-primary-dark-teal focus:ring-primary-dark-teal'} focus:ring-1 outline-none transition-all text-sm`}
                placeholder="e.g. 25"
                aria-invalid={!!fieldErrors.stockQuantity}
              />
              <InputError error={fieldErrors.stockQuantity} />
            </div>
          </div>
        </div>

        {/* Section 3: Product Photos */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-light-neutral shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-primary-dark border-b border-light-neutral/50 pb-4">3. Product Photos</h3>
          <p className="text-sm text-primary-dark/60 -mt-2 mb-4">Add up to 5 clear photos of this product (Max 5MB each, JPEG/PNG/WebP).</p>
          
          <ImageUploader 
            images={formData.images || []}
            onChange={(newImages) => {
              setFormData({ ...formData, images: newImages });
              if (fieldErrors.images) setFieldErrors(prev => ({ ...prev, images: '' }));
            }}
          />
          <InputError error={fieldErrors.images} />
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
