import { useState, useEffect, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { useAdminCategory, useCategoryMutations } from '../../hooks/useCategories';
import { Button } from '../../components/ui/Button';
import { Loader2, ArrowLeft } from 'lucide-react';
import { ApiCategory } from '../../types';

export default function AdminCategoryForm() {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const { data: categoryToEdit, isLoading: isLoadingCategory } = useAdminCategory(id || '');
  const { createCategory, updateCategory, isCreating, isUpdating } = useCategoryMutations();

  const [formData, setFormData] = useState<Partial<ApiCategory>>({
    name: '',
    slug: '',
    description: '',
    image: '',
    sortOrder: 0,
    isActive: true,
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isEditing && categoryToEdit) {
      setFormData({
        name: categoryToEdit.name,
        slug: categoryToEdit.slug,
        description: categoryToEdit.description || '',
        image: categoryToEdit.image || '',
        sortOrder: categoryToEdit.sortOrder,
        isActive: categoryToEdit.isActive,
      });
    }
  }, [isEditing, categoryToEdit]);

  // Auto-generate slug from name if empty
  const handleNameChange = (val: string) => {
    setFormData(prev => ({
      ...prev,
      name: val,
      slug: prev.slug || val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    
    if (!formData.name || !formData.slug) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    try {
      setIsSubmitting(true);
      if (isEditing && id) {
        await updateCategory({ id, data: formData });
      } else {
        await createCategory(formData);
      }
      navigate('/admin/categories');
    } catch (err) {
      if (isAxiosError(err)) {
        if (!err.response) {
          setErrorMsg('Network Error: Cannot connect to the server.');
        } else {
          setErrorMsg(err.response.data?.message || 'Failed to save category. Check slug uniqueness and inputs.');
        }
      } else {
        setErrorMsg('An unexpected error occurred.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormLoading = isEditing && isLoadingCategory;
  const isSaving = isCreating || isUpdating || isSubmitting;

  if (isFormLoading) {
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
          type="button"
          onClick={() => navigate('/admin/categories')}
          className="w-10 h-10 rounded-full bg-white border border-light-neutral flex items-center justify-center text-primary-dark hover:bg-light-neutral/30 transition-colors shrink-0"
          aria-label="Back to categories"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-primary-dark mb-1">
            {isEditing ? 'Edit Category' : 'Add New Category'}
          </h2>
          <p className="text-primary-dark/60 text-sm">
            {isEditing ? 'Update the category details below.' : 'Create a new category for your products.'}
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 mb-6 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100 font-medium">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-light-neutral shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-primary-dark border-b border-light-neutral/50 pb-4">Category Details</h3>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-primary-dark">Category Name *</label>
              <p className="text-xs text-primary-dark/50 mb-1">The name of the category shown to customers.</p>
              <input
                type="text"
                required
                value={formData.name || ''}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-light-neutral focus:border-primary-dark-teal focus:ring-1 focus:ring-primary-dark-teal outline-none transition-all text-sm"
                placeholder="e.g. Audio Accessories"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-primary-dark">Description — Optional</label>
              <p className="text-xs text-primary-dark/50 mb-1">A short description of the products in this category.</p>
              <textarea
                rows={3}
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-light-neutral focus:border-primary-dark-teal focus:ring-1 focus:ring-primary-dark-teal outline-none transition-all text-sm resize-y"
                placeholder="e.g. Premium headphones, earbuds, and speakers."
              />
            </div>
          </div>
        </div>

        {/* Visibility */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-light-neutral shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-primary-dark border-b border-light-neutral/50 pb-4">Visibility</h3>
          <p className="text-sm text-primary-dark/60 -mt-2 mb-4">Choose if customers can see this category on your store.</p>
          
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="rounded border-light-neutral text-primary-dark-teal focus:ring-primary-dark-teal w-5 h-5 cursor-pointer mt-0.5 shrink-0"
            />
            <div>
              <span className="block text-sm font-medium text-primary-dark group-hover:text-primary-dark-teal transition-colors">Visible in Store</span>
              <span className="block text-xs text-primary-dark/50 mt-0.5">Allow products in this category to be found by customers.</span>
            </div>
          </label>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4 pt-4 sticky bottom-4 bg-soft-ivory/90 backdrop-blur-md p-4 rounded-xl border border-light-neutral/50 shadow-sm z-50">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate('/admin/categories')}
            disabled={isSaving}
            className="bg-white"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="primary" 
            disabled={isSaving}
            className="flex items-center gap-2 min-w-[140px] justify-center"
          >
            {isSaving ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                {isEditing ? 'Saving...' : 'Adding...'}
              </>
            ) : (
              isEditing ? 'Save Changes' : 'Add Category'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
