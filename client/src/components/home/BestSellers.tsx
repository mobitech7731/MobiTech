import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Container } from '../ui/Container';
import { SectionHeading } from '../ui/SectionHeading';
import { IconButton } from '../ui/IconButton';
import { ProductCard } from './ProductCard';
import { useBestSellerProducts } from '../../hooks/useProducts';
import { Reveal } from 'cube-motion/react';

export function BestSellers() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { data: bestSellers = [], isLoading } = useBestSellerProducts();

  // Drag to scroll state
  const [isDragging, setIsDragging] = useState(false);
  const [hasDragged, setHasDragged] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setHasDragged(false);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    if (Math.abs(walk) > 5) {
      setHasDragged(true);
    }
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollAmount = direction === 'left' ? -clientWidth * 0.9 : clientWidth * 0.9;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-12 sm:py-16 lg:py-24 bg-soft-ivory">
      <Container>
        <div className="flex flex-row items-center justify-between mb-8 sm:mb-10 gap-4">
          <Reveal>
            <SectionHeading title="Best Sellers" className="mb-0" />
          </Reveal>
          
          <Reveal>
            <div className="flex items-center gap-3">
              <IconButton 
                icon={ChevronLeft} 
                variant="outline" 
                onClick={() => scroll('left')}
                aria-label="Previous products"
                className="bg-white hover:bg-white/90 border-primary-dark-teal/10 shadow-sm"
                disabled={isLoading || bestSellers.length === 0}
              />
              <IconButton 
                icon={ChevronRight} 
                variant="outline" 
                onClick={() => scroll('right')}
                aria-label="Next products"
                className="bg-white hover:bg-white/90 border-primary-dark-teal/10 shadow-sm"
                disabled={isLoading || bestSellers.length === 0}
              />
            </div>
          </Reveal>
        </div>

        {/* Carousel Container */}
        <Reveal>
          <div className="relative -mx-4 sm:mx-0">
            <div 
              ref={scrollRef}
              className={`flex overflow-x-auto snap-x snap-mandatory gap-4 sm:gap-5 lg:gap-6 px-4 sm:px-0 pb-8 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              onMouseDown={handleMouseDown}
              onMouseLeave={handleMouseLeave}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
            >
              <style>{`
                .flex::-webkit-scrollbar { display: none; }
              `}</style>
              
              {isLoading ? (
                <div className="flex items-center justify-center w-full py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-primary-dark-teal" />
                </div>
              ) : (
                bestSellers.map((product) => (
                  <div 
                    key={product.id} 
                    className="w-[calc(33.333%-10.66px)] md:w-auto flex-none snap-start h-auto"
                    onClickCapture={(e) => {
                      if (hasDragged) {
                        e.stopPropagation();
                        e.preventDefault();
                      }
                    }}
                  >
                    <ProductCard product={product} layoutMode="compact" />
                  </div>
                ))
              )}
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
