import { Heart } from 'lucide-react';
import { Card } from '../ui/Card';
import { formatPrice } from '../../utils/formatCurrency';
import { Link } from 'react-router-dom';

import { Product } from '../../types';

interface ProductCardProps {
  product: Product;
  layoutMode?: 'compact' | 'standard';
}

export function ProductCard({ product, layoutMode = 'standard' }: ProductCardProps) {
  const isCompact = layoutMode === 'compact';

  return (
    <Card className={`flex flex-col relative group overflow-hidden bg-gradient-to-b from-white to-soft-ivory/30 border border-primary-dark-teal/5 h-full ${isCompact ? 'rounded-[12px] sm:rounded-[20px]' : 'rounded-[16px] sm:rounded-[20px]'} shadow-sm hover:shadow-lg hover:shadow-primary-dark-teal/5 hover:-translate-y-1 hover:border-primary-dark-teal/20 transition-all duration-300 ease-out`}>
      
      {/* Wishlist Button */}
      <div className={`absolute ${isCompact ? 'top-2 right-2 sm:top-3 sm:right-3' : 'top-3 right-3'} z-20`}>
        <button 
          aria-label="Add to wishlist" 
          className={`${isCompact ? 'w-6 h-6 sm:w-8 sm:h-8' : 'w-7 h-7 sm:w-8 sm:h-8'} rounded-full bg-white/80 backdrop-blur-md border border-light-neutral/50 flex items-center justify-center text-primary-dark-teal transition-all duration-200 hover:bg-primary-dark-teal/10 hover:border-primary-dark-teal/30 hover:shadow-sm group/heart`}
        >
          <Heart className={`${isCompact ? 'w-3 h-3 sm:w-4 sm:h-4' : 'w-3.5 h-3.5 sm:w-4 sm:h-4'} transition-transform duration-200 group-hover/heart:scale-110`} strokeWidth={2} />
        </button>
      </div>

      {/* Stock Badge - hide on small mobile to save space if compact */}
      <div className={`absolute ${isCompact ? 'top-2 left-2 sm:top-4 sm:left-4 hidden sm:block' : 'top-3 left-3 sm:top-4 sm:left-4'} z-20`}>
        <div className={`flex items-center ${isCompact ? 'gap-1 sm:gap-1.5 px-1.5 py-0.5 sm:px-2.5 sm:py-1' : 'gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1'} rounded-full bg-gradient-to-r from-soft-ivory to-white border border-primary-dark-teal/10 shadow-sm backdrop-blur-md`}>
          <div className={`${isCompact ? 'w-1 h-1 sm:w-1.5 sm:h-1.5' : 'w-1.5 h-1.5'} rounded-full bg-primary-dark-teal animate-pulse`}></div>
          <span className={`${isCompact ? 'text-[8px] sm:text-[10px] hidden sm:inline-block' : 'text-[9px] sm:text-[10px]'} font-bold text-primary-dark uppercase tracking-wider`}>In Stock</span>
        </div>
      </div>

      {/* Image Area */}
      <Link to={`/product/${product.id}`} className={`relative w-full aspect-square bg-gradient-to-br from-white via-soft-ivory to-primary-dark-teal/5 flex items-center justify-center ${isCompact ? 'p-3 sm:p-8' : 'p-4 sm:p-8'} block overflow-hidden`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(20,83,86,0.03)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-contain transition-transform duration-500 ease-out group-hover:scale-[1.03] mix-blend-multiply relative z-10"
          loading="lazy"
        />
      </Link>

      {/* Content Area */}
      <div className={`${isCompact ? 'p-2 sm:p-5' : 'p-3 sm:p-5'} flex flex-col flex-grow bg-white/40`}>
        <div className={`${isCompact ? 'mb-1 sm:mb-2' : 'mb-1.5 sm:mb-2'}`}>
          <span className={`${isCompact ? 'text-[8px] sm:text-[11px]' : 'text-[10px] sm:text-[11px]'} font-bold text-primary-dark-teal/70 uppercase tracking-widest truncate block`}>{product.category}</span>
        </div>
        <Link to={`/product/${product.id}`} className={`block ${isCompact ? 'mb-1 sm:mb-2' : 'mb-1.5 sm:mb-2'}`}>
          <h3 className={`${isCompact ? 'text-[10px] sm:text-base' : 'text-xs sm:text-base'} font-semibold text-primary-dark leading-tight sm:leading-snug line-clamp-2 group-hover:text-primary-dark-teal transition-colors duration-200`}>
            {product.name}
          </h3>
        </Link>
        <div className={`mt-auto ${isCompact ? 'mb-2 sm:mb-4' : 'mb-3 sm:mb-4'} flex items-end gap-1 sm:gap-2`}>
          <span className={`${isCompact ? 'text-xs sm:text-lg' : 'text-sm sm:text-lg'} font-bold text-primary-dark-teal`}>
            {formatPrice(product.price)}
          </span>
        </div>
        
        <Link to={`/product/${product.id}`} className="block w-full" tabIndex={-1}>
          <button className={`w-full ${isCompact ? 'py-1.5 px-2 sm:py-2.5 sm:px-4 rounded-lg sm:rounded-xl text-[9px] sm:text-sm' : 'py-2 px-3 sm:py-2.5 sm:px-4 rounded-xl text-xs sm:text-sm'} font-semibold text-white bg-gradient-to-r from-primary-dark via-primary-dark-teal to-secondary-teal transition-all duration-200 shadow-md hover:shadow-lg hover:shadow-primary-dark-teal/20 hover:-translate-y-[1px] active:scale-[0.98]`}>
            Quick View
          </button>
        </Link>
      </div>
    </Card>
  );
}
