import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from '../components/home/Navbar';
import { Footer } from '../components/home/Footer';
import { Container } from '../components/ui/Container';
import { Button } from '../components/ui/Button';
import { ProductCard } from '../components/home/ProductCard';
import { formatPrice } from '../utils/formatCurrency';
import { useCartStore } from '../store/cartStore';
import { Minus, Plus, MessageCircle, ChevronRight, ShoppingCart, Check, Loader2 } from 'lucide-react';
import { useProduct, useProducts } from '../hooks/useProducts';
import { Morph } from 'cube-motion/react';

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  
  const { data: product, isLoading, isError } = useProduct(id || '');
  
  // Related products (same category, excluding current, max 4)
  // We use useProducts to fetch products from the same category
  const { data: relatedData } = useProducts({ 
    category: product?.category, 
    limit: 5 // Fetch 5 to ensure we have 4 after excluding the current one
  });

  const relatedProducts = (relatedData?.products || [])
    .filter(p => p.id !== product?.id)
    .slice(0, 4);

  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const addItem = useCartStore(state => state.addItem);

  const increaseQuantity = () => {
    setQuantity(prev => (prev < 10 ? prev + 1 : prev));
  };

  const decreaseQuantity = () => {
    setQuantity(prev => (prev > 1 ? prev - 1 : 1));
  };

  const handleAddToCart = () => {
    if (!product?.inStock) return;
    addItem(product, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 3000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-soft-ivory">
        <Navbar />
        <main className="flex-grow flex items-center justify-center pt-24 pb-24">
          <Loader2 className="w-12 h-12 text-primary-dark-teal animate-spin" />
        </main>
        <Footer />
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="min-h-screen flex flex-col bg-soft-ivory">
        <Navbar />
        <main className="flex-grow flex items-center justify-center pt-24 pb-24">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-primary-dark mb-4">Product not found</h1>
            <p className="text-primary-dark/60 mb-8">The product you are looking for does not exist or has been removed.</p>
            <Link to="/shop">
              <Button variant="primary">Return to Shop</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Format category for breadcrumb
  const categoryLabel = product.category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  return (
    <div className="min-h-screen flex flex-col bg-soft-ivory">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-24">
        <Container>
          {/* Breadcrumbs */}
          <nav className="flex items-center text-sm text-primary-dark/60 mb-8 overflow-x-auto hide-scrollbar">
            <Link to="/" className="hover:text-primary-dark-teal whitespace-nowrap">Home</Link>
            <ChevronRight size={14} className="mx-2 flex-shrink-0" />
            <Link to="/shop" className="hover:text-primary-dark-teal whitespace-nowrap">Shop</Link>
            <ChevronRight size={14} className="mx-2 flex-shrink-0" />
            <Link to={`/shop?category=${product.category}`} className="hover:text-primary-dark-teal whitespace-nowrap">{categoryLabel}</Link>
            <ChevronRight size={14} className="mx-2 flex-shrink-0" />
            <span className="text-primary-dark font-medium truncate">{product.name}</span>
          </nav>

          <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 mb-20">
            {/* Left: Product Image */}
            <div className="w-full lg:w-1/2">
              <div className="aspect-square bg-white rounded-3xl overflow-hidden border border-light-neutral/50 flex items-center justify-center p-8 lg:p-12 shadow-sm">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-contain mix-blend-multiply transition-transform duration-700 hover:scale-105"
                />
              </div>
            </div>

            {/* Right: Product Info */}
            <div className="w-full lg:w-1/2 flex flex-col">
              <div className="mb-2">
                <span className="text-caption text-primary-dark-teal uppercase tracking-widest">{categoryLabel}</span>
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-primary-dark mb-4 leading-tight">
                {product.name}
              </h1>
              <div className="text-2xl font-medium text-primary-dark mb-6">
                {formatPrice(product.price)}
              </div>

              {product.description && (
                <p className="text-body-large text-primary-dark/70 mb-8 leading-relaxed">
                  {product.description}
                </p>
              )}

              <div className="mb-8 flex items-center">
                {product.inStock ? (
                  <span className="inline-flex items-center gap-2 text-sm font-bold text-primary-dark-teal bg-primary-dark-teal/10 px-3 py-1.5 rounded-full tracking-wide">
                    <span className="w-2 h-2 rounded-full bg-primary-dark-teal"></span>
                    IN STOCK
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 text-sm font-bold text-primary-dark/50 bg-light-neutral/50 px-3 py-1.5 rounded-full tracking-wide">
                    <span className="w-2 h-2 rounded-full bg-primary-dark/30"></span>
                    OUT OF STOCK
                  </span>
                )}
              </div>

              <div className="border-t border-light-neutral/50 pt-8 mt-auto lg:mt-8">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-4">
                  {/* Quantity Selector */}
                  <div className="flex items-center border border-light-neutral rounded-lg bg-white h-14">
                    <button 
                      onClick={decreaseQuantity}
                      disabled={!product.inStock || quantity <= 1}
                      aria-label="Decrease quantity"
                      className="w-12 flex items-center justify-center text-primary-dark hover:text-primary-dark-teal disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <Minus size={18} />
                    </button>
                    <div className="w-12 text-center font-bold text-primary-dark select-none">
                      {quantity}
                    </div>
                    <button 
                      onClick={increaseQuantity}
                      disabled={!product.inStock || quantity >= 10}
                      aria-label="Increase quantity"
                      className="w-12 flex items-center justify-center text-primary-dark hover:text-primary-dark-teal disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <Plus size={18} />
                    </button>
                  </div>

                  {/* Add to Cart */}
                  <Button 
                    variant="primary" 
                    className="flex-grow h-14 text-base tracking-wide flex items-center justify-center overflow-hidden"
                    disabled={!product.inStock}
                    onClick={handleAddToCart}
                  >
                    <Morph 
                      active={addedToCart}
                      off={
                        <div className="flex items-center gap-2">
                          <ShoppingCart size={20} />
                          <span>{product.inStock ? 'Add to Cart' : 'Sold Out'}</span>
                        </div>
                      }
                      on={
                        <div className="flex items-center gap-2">
                          <Check size={20} />
                          <span>Added to Cart</span>
                        </div>
                      }
                    />
                  </Button>
                </div>

                {/* WhatsApp CTA */}
                <a 
                  href={`https://wa.me/REPLACE_WITH_NUMBER?text=Hi, I'm interested in the ${encodeURIComponent(product.name)}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button 
                    variant="outline" 
                    className="w-full h-14 text-base tracking-wide flex items-center justify-center gap-2 bg-white"
                  >
                    <MessageCircle size={20} className="text-primary-dark-teal" />
                    Buy on WhatsApp
                  </Button>
                </a>
              </div>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mt-24 border-t border-light-neutral/50 pt-16">
              <h2 className="text-2xl font-bold text-primary-dark mb-8">You May Also Like</h2>
              <div className="flex overflow-x-auto hide-scrollbar gap-4 sm:gap-6 pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
                {relatedProducts.map(related => (
                  <div key={related.id} className="w-[280px] sm:w-[300px] flex-shrink-0">
                    <ProductCard product={related} />
                  </div>
                ))}
              </div>
            </div>
          )}

        </Container>
      </main>

      <Footer />
    </div>
  );
}
