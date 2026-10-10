import { Search, Heart, ShoppingBag, Menu, X } from 'lucide-react';
import { GlassSurface } from '../ui/GlassSurface';
import { IconButton } from '../ui/IconButton';
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation, Link } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore';
import { Rise } from 'cube-motion/react';

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [searchValue, setSearchValue] = useState(searchParams.get('search') || '');
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const cartItems = useCartStore(state => state.items);
  const totalCartQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    setSearchValue(searchParams.get('search') || '');
  }, [searchParams]);

  useEffect(() => {
    // Close mobile menu on route change
    setIsMobileMenuOpen(false);
  }, [location.pathname, searchParams]);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const query = searchValue.trim();
      if (location.pathname === '/shop') {
        const newParams = new URLSearchParams(searchParams);
        if (query) {
          newParams.set('search', query);
        } else {
          newParams.delete('search');
        }
        navigate(`/shop?${newParams.toString()}`);
      } else {
        if (query) {
          navigate(`/shop?search=${encodeURIComponent(query)}`);
        } else {
          navigate('/shop');
        }
      }
      setIsMobileSearchOpen(false);
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <div className="fixed top-0 inset-x-0 z-50 pt-4 sm:pt-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pointer-events-none transition-all duration-300">
      <GlassSurface className="relative flex flex-col md:flex-row items-center justify-between px-4 sm:px-6 py-3 sm:py-3.5 rounded-[2rem] gap-4 md:gap-0 pointer-events-auto shadow-md">
        <div className="flex items-center justify-between w-full md:w-auto">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="font-bold text-2xl tracking-tighter text-primary-dark">Mobitech</span>
          </Link>

          {/* Icons - Mobile Only */}
          <div className="flex md:hidden items-center gap-1">
            <IconButton 
              icon={Search} 
              size="sm" 
              aria-label="Search" 
              onClick={() => { setIsMobileSearchOpen(!isMobileSearchOpen); setIsMobileMenuOpen(false); }}
            />
            <Link to="/cart" className="relative flex items-center justify-center p-1.5 text-primary-dark hover:bg-black/5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-dark-teal">
              <ShoppingBag size={16} strokeWidth={1.5} />
              <Rise 
                show={totalCartQuantity > 0} 
                as="span"
                className="absolute -top-1 -right-1 bg-primary-dark-teal text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center border border-white/20"
              >
                {totalCartQuantity > 99 ? '99+' : totalCartQuantity}
              </Rise>
            </Link>
            <IconButton 
              icon={isMobileMenuOpen ? X : Menu} 
              size="sm" 
              aria-label="Menu" 
              className="ml-1" 
              onClick={() => { setIsMobileMenuOpen(!isMobileMenuOpen); setIsMobileSearchOpen(false); }}
            />
          </div>
        </div>
        
        {/* Search */}
        <div className={`${isMobileSearchOpen ? 'flex' : 'hidden'} md:flex w-full md:w-auto items-center bg-black/5 rounded-full px-4 py-2 flex-1 md:max-w-xs md:mx-8 border border-transparent focus-within:border-primary-dark-teal/20 focus-within:bg-white/50 transition-colors`}>
          <Search size={18} className="text-primary-dark-teal/50 mr-2 flex-shrink-0" />
          <input 
            type="text" 
            placeholder="Search products..." 
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={handleSearch}
            className="bg-transparent border-none outline-none text-sm w-full placeholder:text-primary-dark-teal/50 text-primary-dark-teal"
            aria-label="Search"
          />
        </div>

        {/* Links - Desktop */}
        <nav className="hidden md:flex items-center gap-8 mr-8">
          <Link to="/shop?category=phone-cases" className="text-sm font-medium text-primary-dark hover:text-primary-dark-teal/70 transition-colors">Cases</Link>
          <Link to="/shop?category=wireless-audio" className="text-sm font-medium text-primary-dark hover:text-primary-dark-teal/70 transition-colors">Audio</Link>
          <Link to="/shop?category=chargers-adapters" className="text-sm font-medium text-primary-dark hover:text-primary-dark-teal/70 transition-colors">Power</Link>
          <Link to="/shop" className="text-sm font-medium text-primary-dark hover:text-primary-dark-teal/70 transition-colors">Shop</Link>
        </nav>

        {/* Icons - Desktop */}
        <div className="hidden md:flex items-center gap-2">
          <IconButton icon={Heart} size="sm" aria-label="Wishlist" />
          <Link to="/cart" className="relative flex items-center justify-center p-1.5 md:p-2 text-primary-dark hover:bg-black/5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-dark-teal">
              <ShoppingBag size={20} strokeWidth={1.5} className="w-4 h-4 md:w-5 md:h-5" />
              <Rise 
                show={totalCartQuantity > 0} 
                as="span"
                className="absolute -top-1 -right-1 bg-primary-dark-teal text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center border border-white/20"
              >
                {totalCartQuantity > 99 ? '99+' : totalCartQuantity}
              </Rise>
            </Link>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 mt-4 bg-white/95 backdrop-blur-xl border border-light-neutral rounded-[20px] shadow-lg overflow-hidden py-4 px-6 flex flex-col gap-4 animate-fade-in z-50">
            <Link to="/shop?category=phone-cases" className="text-lg font-semibold text-primary-dark py-1">Cases</Link>
            <Link to="/shop?category=wireless-audio" className="text-lg font-semibold text-primary-dark py-1">Audio</Link>
            <Link to="/shop?category=chargers-adapters" className="text-lg font-semibold text-primary-dark py-1">Power</Link>
            <Link to="/shop" className="text-lg font-semibold text-primary-dark py-1">Shop All</Link>
            <hr className="border-light-neutral/50" />
            <div className="flex items-center gap-4 py-2">
              <button className="flex items-center gap-2 text-sm text-primary-dark/80 font-medium">
                <Heart size={18} /> Wishlist
              </button>
            </div>
          </div>
        )}
      </GlassSurface>
    </div>
  );
}
