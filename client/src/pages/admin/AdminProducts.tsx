import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAdminProducts, useProductMutations } from '../../hooks/useProducts';
import { useCategories } from '../../hooks/useCategories';
import { Button } from '../../components/ui/Button';
import { IconButton } from '../../components/ui/IconButton';
import { formatPrice } from '../../utils/formatCurrency';
import { 
  Plus, Search, Edit2, Trash2, Power, PowerOff, 
  Loader2, Filter, X 
} from 'lucide-react';
import { ApiProduct } from '../../types';
import { isAxiosError } from 'axios';

export default function AdminProducts() {
  // Filters state
  const [page, setPage] = useState(1);
  const limit = 20;
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [inStock, setInStock] = useState<'all' | 'true' | 'false'>('all');
  const [sort, setSort] = useState('newest');

  const { data: categories = [] } = useCategories();
  
  const { data, isLoading, isError } = useAdminProducts({
    page,
    limit,
    search: debouncedSearch || undefined,
    category: category !== 'all' ? category : undefined,
    status: status !== 'all' ? status : undefined,
    inStock: inStock === 'true' ? true : inStock === 'false' ? false : undefined,
    sort,
  });

  const { updateProduct, deleteProduct, isUpdating, isDeleting } = useProductMutations();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDebouncedSearch(search);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setCategory('all');
    setStatus('all');
    setInStock('all');
    setSort('newest');
    setPage(1);
  };

  const hasActiveFilters = debouncedSearch !== '' || category !== 'all' || status !== 'all' || inStock !== 'all' || sort !== 'newest';

  const toggleActiveStatus = async (product: ApiProduct) => {
    try {
      await updateProduct({ id: product._id, data: { isActive: !product.isActive } });
    } catch (err) {
      const msg = isAxiosError(err) ? (err.response?.data?.message || err.message) : (err as Error).message;
      alert(`Failed to update product status: ${msg}`);
    }
  };

  const confirmDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;
    setDeletingId(id);
    try {
      await deleteProduct(id);
    } catch (err) {
      const msg = isAxiosError(err) ? (err.response?.data?.message || err.message) : (err as Error).message;
      alert(`Failed to delete product: ${msg}`);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-primary-dark mb-1">Products</h2>
          <p className="text-primary-dark/60 text-sm">Manage your product catalog, pricing, and stock.</p>
        </div>
        <Link to="/admin/products/new">
          <Button variant="primary" className="flex items-center gap-2 w-full sm:w-auto">
            <Plus size={18} />
            Add Product
          </Button>
        </Link>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-light-neutral shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-dark/40" size={18} />
            <input 
              type="text" 
              placeholder="Search products by name or description..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-light-neutral focus:border-primary-dark-teal focus:ring-1 focus:ring-primary-dark-teal outline-none transition-all text-sm"
            />
          </div>
          <Button type="submit" variant="outline" className="bg-white">
            Search
          </Button>
        </form>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-primary-dark/40" />
            <span className="text-sm font-medium text-primary-dark/60">Filters:</span>
          </div>
          
          <select 
            value={category} 
            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            className="text-sm border border-light-neutral rounded-md px-3 py-1.5 outline-none focus:border-primary-dark-teal"
          >
            <option value="all">All Categories</option>
            {categories.map(c => (
              <option key={c.slug} value={c.slug}>{c.name}</option>
            ))}
          </select>

          <select 
            value={status} 
            onChange={(e) => { setStatus(e.target.value as 'all' | 'active' | 'inactive'); setPage(1); }}
            className="text-sm border border-light-neutral rounded-md px-3 py-1.5 outline-none focus:border-primary-dark-teal"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>

          <select 
            value={inStock} 
            onChange={(e) => { setInStock(e.target.value as 'all' | 'true' | 'false'); setPage(1); }}
            className="text-sm border border-light-neutral rounded-md px-3 py-1.5 outline-none focus:border-primary-dark-teal"
          >
            <option value="all">All Stock</option>
            <option value="true">In Stock</option>
            <option value="false">Out of Stock</option>
          </select>

          <select 
            value={sort} 
            onChange={(e) => { setSort(e.target.value); setPage(1); }}
            className="text-sm border border-light-neutral rounded-md px-3 py-1.5 outline-none focus:border-primary-dark-teal"
          >
            <option value="newest">Newest First</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="featured">Featured First</option>
          </select>

          {hasActiveFilters && (
            <button 
              onClick={handleClearFilters}
              className="text-sm text-primary-dark-teal hover:underline flex items-center gap-1 ml-auto sm:ml-0"
            >
              <X size={14} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Product List */}
      <div className="bg-white rounded-xl border border-light-neutral shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary-dark-teal" />
          </div>
        ) : isError || !data ? (
          <div className="py-12 text-center text-red-600">
            Failed to load products. Please try again.
          </div>
        ) : data.products.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center justify-center">
            <p className="text-primary-dark/60 font-medium mb-4">No products found.</p>
            {hasActiveFilters && (
              <Button variant="outline" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-soft-ivory/50 border-b border-light-neutral text-xs uppercase tracking-wider text-primary-dark/60">
                    <th className="px-6 py-4 font-medium">Product</th>
                    <th className="px-6 py-4 font-medium">Category</th>
                    <th className="px-6 py-4 font-medium">Price</th>
                    <th className="px-6 py-4 font-medium">Stock</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-light-neutral text-sm">
                  {data.products.map(product => {
                    const catName = typeof product.category === 'object' && product.category !== null && 'name' in product.category 
                      ? product.category.name 
                      : String(product.category);

                    const imageSrc = product.images && product.images.length > 0
                      ? (typeof product.images[0] === 'string' ? product.images[0] : (product.images[0] as any).url)
                      : '/images/admin/product-placeholder.svg';

                    return (
                      <tr key={product._id} className="hover:bg-soft-ivory/20 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-soft-ivory border border-light-neutral flex items-center justify-center overflow-hidden flex-shrink-0">
                              <img src={imageSrc} alt={product.name} className="w-full h-full object-contain mix-blend-multiply" />
                            </div>
                            <div>
                              <div className="font-bold text-primary-dark">{product.name}</div>
                              <div className="text-xs text-primary-dark/50 mt-0.5 font-mono">{product.slug}</div>
                              <div className="flex gap-1 mt-1">
                                {product.isFeatured && <span className="text-[10px] bg-primary-dark-teal/10 text-primary-dark-teal px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">Featured</span>}
                                {product.isNewArrival && <span className="text-[10px] bg-secondary-teal/10 text-secondary-teal px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">New</span>}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-primary-dark/80 font-medium">
                          {catName}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-primary-dark">{formatPrice(product.price)}</div>
                          {product.compareAtPrice && (
                            <div className="text-xs text-primary-dark/40 line-through">{formatPrice(product.compareAtPrice)}</div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                              product.inStock 
                                ? product.stockQuantity <= 5 ? 'bg-amber-500' : 'bg-primary-dark-teal'
                                : 'bg-red-500'
                            }`} />
                            <span className={`font-medium ${
                              !product.inStock ? 'text-red-600' : product.stockQuantity <= 5 ? 'text-amber-600' : 'text-primary-dark'
                            }`}>
                              {product.stockQuantity} {product.stockQuantity === 1 ? 'unit' : 'units'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${
                            product.isActive 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-light-neutral text-primary-dark/60'
                          }`}>
                            {product.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                            <Link to={`/admin/products/${product._id}/edit`}>
                              <IconButton 
                                icon={Edit2} 
                                variant="outline" 
                                aria-label="Edit product"
                                className="w-8 h-8 bg-white"
                              />
                            </Link>
                            <IconButton 
                              icon={product.isActive ? PowerOff : Power} 
                              variant="outline" 
                              aria-label={product.isActive ? "Deactivate product" : "Activate product"}
                              onClick={() => toggleActiveStatus(product)}
                              disabled={isUpdating}
                              className={`w-8 h-8 bg-white ${product.isActive ? 'hover:text-amber-600' : 'hover:text-green-600'}`}
                            />
                            <IconButton 
                              icon={Trash2} 
                              variant="outline" 
                              aria-label="Delete product"
                              onClick={() => confirmDelete(product._id)}
                              disabled={deletingId === product._id || isDeleting}
                              className="w-8 h-8 bg-white hover:text-red-600 hover:border-red-200 hover:bg-red-50"
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="lg:hidden divide-y divide-light-neutral">
              {data.products.map(product => {
                const catName = typeof product.category === 'object' && product.category !== null && 'name' in product.category 
                  ? product.category.name 
                  : String(product.category);

                  const imageSrc = product.images && product.images.length > 0
                    ? (typeof product.images[0] === 'string' ? product.images[0] : (product.images[0] as any).url)
                    : '/images/admin/product-placeholder.svg';

                return (
                  <div key={product._id} className="p-4 bg-white flex flex-col gap-4">
                    <div className="flex gap-4">
                      <div className="w-16 h-16 rounded-lg bg-soft-ivory border border-light-neutral flex items-center justify-center overflow-hidden flex-shrink-0">
                        <img src={imageSrc} alt={product.name} className="w-full h-full object-contain mix-blend-multiply" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-bold text-primary-dark">{product.name}</div>
                            <div className="text-xs text-primary-dark/60 font-mono mt-0.5">{product.slug}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-primary-dark">{formatPrice(product.price)}</div>
                            {product.compareAtPrice && (
                              <div className="text-xs text-primary-dark/40 line-through">{formatPrice(product.compareAtPrice)}</div>
                            )}
                          </div>
                        </div>
                        <div className="text-xs text-primary-dark/60 mt-1">{catName}</div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center justify-between gap-3 bg-soft-ivory/30 rounded-lg p-3 border border-light-neutral/50">
                      <div className="flex gap-4 text-sm">
                        <div className="flex items-center gap-1.5">
                          <div className={`w-2 h-2 rounded-full ${
                            product.inStock 
                              ? product.stockQuantity <= 5 ? 'bg-amber-500' : 'bg-primary-dark-teal'
                              : 'bg-red-500'
                          }`} />
                          <span className={`font-medium ${
                            !product.inStock ? 'text-red-600' : product.stockQuantity <= 5 ? 'text-amber-600' : 'text-primary-dark'
                          }`}>
                            {product.stockQuantity}
                          </span>
                        </div>
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                          product.isActive 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-light-neutral text-primary-dark/60'
                        }`}>
                          {product.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Link to={`/admin/products/${product._id}/edit`}>
                          <IconButton 
                            icon={Edit2} 
                            variant="outline" 
                            aria-label="Edit product"
                            className="w-8 h-8 bg-white"
                          />
                        </Link>
                        <IconButton 
                          icon={product.isActive ? PowerOff : Power} 
                          variant="outline" 
                          aria-label={product.isActive ? "Deactivate product" : "Activate product"}
                          onClick={() => toggleActiveStatus(product)}
                          disabled={isUpdating}
                          className={`w-8 h-8 bg-white ${product.isActive ? 'hover:text-amber-600' : 'hover:text-green-600'}`}
                        />
                        <IconButton 
                          icon={Trash2} 
                          variant="outline" 
                          aria-label="Delete product"
                          onClick={() => confirmDelete(product._id)}
                          disabled={deletingId === product._id || isDeleting}
                          className="w-8 h-8 bg-white hover:text-red-600 hover:border-red-200 hover:bg-red-50"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
        
        {/* Pagination */}
        {data && data.pagination.totalPages > 1 && (
          <div className="p-4 border-t border-light-neutral bg-soft-ivory/30 flex items-center justify-between">
            <span className="text-sm text-primary-dark/60">
              Showing page {page} of {data.pagination.totalPages} ({data.pagination.total} total products)
            </span>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="bg-white"
              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setPage(p => Math.min(data.pagination.totalPages, p + 1))}
                disabled={page === data.pagination.totalPages}
                className="bg-white"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
