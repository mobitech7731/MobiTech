import { useRef, useState, useEffect, useCallback } from 'react';
import { Container } from '../ui/Container';
import { SectionHeading } from '../ui/SectionHeading';
import { Card } from '../ui/Card';
import { Quote } from 'lucide-react';
import { Reveal } from 'cube-motion/react';

const stories = [
  {
    id: 's1',
    name: 'Aarav Mehta',
    initials: 'AM',
    role: 'Customer Review',
    text: "Beautiful case, excellent finish and it feels much more premium than I expected. The attention to detail is noticeable right out of the box.",
    className: 'md:col-span-2 lg:col-span-2 lg:row-span-2 bg-primary-dark-teal text-white',
    textClass: 'text-xl sm:text-2xl md:text-3xl lg:text-4xl text-white leading-snug sm:leading-tight font-medium',
    avatarClass: 'bg-white/10 text-white',
    roleClass: 'text-white/70',
    quoteClass: 'text-white/10',
  },
  {
    id: 's2',
    name: 'Riya Sharma',
    initials: 'RS',
    role: 'Customer Review',
    text: "The earbuds sound great and the entire buying experience felt simple and smooth.",
    className: 'bg-white text-primary-dark border border-light-neutral/50',
    textClass: 'text-body-large text-primary-dark-teal',
    avatarClass: 'bg-soft-ivory text-primary-dark',
    roleClass: 'text-primary-dark-teal/60',
    quoteClass: 'text-primary-dark/5',
  },
  {
    id: 's3',
    name: 'Kunal Verma',
    initials: 'KV',
    role: 'Customer Review',
    text: "Finally found accessories that actually look as good as they work. Highly recommended.",
    className: 'bg-warm-cream/50 text-primary-dark border border-light-neutral/30',
    textClass: 'text-body-large text-primary-dark-teal',
    avatarClass: 'bg-white text-primary-dark',
    roleClass: 'text-primary-dark-teal/60',
    quoteClass: 'text-primary-dark/5',
  },
  {
    id: 's4',
    name: 'Ananya Kapoor',
    initials: 'AK',
    role: 'Customer Review',
    text: "Fast delivery, clean packaging and the charger has become part of my everyday setup.",
    className: 'bg-white text-primary-dark border border-light-neutral/50',
    textClass: 'text-body-large text-primary-dark-teal',
    avatarClass: 'bg-soft-ivory text-primary-dark',
    roleClass: 'text-primary-dark-teal/60',
    quoteClass: 'text-primary-dark/5',
  },
  {
    id: 's5',
    name: 'Rahul Saini',
    initials: 'RS',
    role: 'Customer Review',
    text: "Minimal design, solid quality and exactly what I wanted for my phone. It's perfect.",
    className: 'bg-muted-teal text-white',
    textClass: 'text-body-large text-white',
    avatarClass: 'bg-white/10 text-white',
    roleClass: 'text-white/70',
    quoteClass: 'text-white/10',
  },
];

export function CustomerStories() {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  
  // Drag to scroll state
  const [isDragging, setIsDragging] = useState(false);
  const [hasDragged, setHasDragged] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current || window.innerWidth >= 768) return;
    setIsDragging(true);
    setHasDragged(false);
    setIsInteracting(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    setIsHovered(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current || window.innerWidth >= 768) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    if (Math.abs(walk) > 5) {
      setHasDragged(true);
    }
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleScroll = () => {
    if (!scrollRef.current || window.innerWidth >= 768) return;
    const container = scrollRef.current;
    const centerPosition = container.scrollLeft + container.clientWidth / 2;
    
    let closestIndex = 0;
    let minDistance = Infinity;
    
    Array.from(container.children).forEach((child) => {
      if (child.tagName.toLowerCase() === 'style') return;
      const htmlChild = child as HTMLElement;
      const indexStr = htmlChild.dataset.index;
      if (indexStr === undefined) return;
      
      const childCenter = htmlChild.offsetLeft + htmlChild.offsetWidth / 2;
      const distance = Math.abs(childCenter - centerPosition);
      
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = parseInt(indexStr, 10);
      }
    });
    
    if (closestIndex !== activeIndex && closestIndex >= 0 && closestIndex < stories.length) {
      setActiveIndex(closestIndex);
    }
  };

  const scrollToSlide = useCallback((index: number) => {
    if (!scrollRef.current || window.innerWidth >= 768) return;
    setIsInteracting(true);
    setActiveIndex(index);
    
    const container = scrollRef.current;
    const child = Array.from(container.children).find(
      c => c.tagName.toLowerCase() !== 'style' && (c as HTMLElement).dataset.index === String(index)
    ) as HTMLElement;
    
    if (child) {
      const targetLeft = child.offsetLeft + (child.offsetWidth / 2) - (container.clientWidth / 2);
      container.scrollTo({
        left: targetLeft,
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
      });
    }
  }, []);

  // Auto-scroll effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    let interactionTimer: NodeJS.Timeout;

    const shouldAutoplay = window.innerWidth < 768 && !isHovered && !isDragging;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (shouldAutoplay && !prefersReducedMotion) {
      if (isInteracting) {
        // Resume auto-scroll after 4.5 seconds of no interaction
        interactionTimer = setTimeout(() => {
          setIsInteracting(false);
        }, 4500);
      } else {
        timer = setInterval(() => {
          if (!scrollRef.current) return;
          const nextIndex = (activeIndex + 1) % stories.length;
          
          const container = scrollRef.current;
          const child = Array.from(container.children).find(
            c => c.tagName.toLowerCase() !== 'style' && (c as HTMLElement).dataset.index === String(nextIndex)
          ) as HTMLElement;
          
          if (child) {
            const targetLeft = child.offsetLeft + (child.offsetWidth / 2) - (container.clientWidth / 2);
            container.scrollTo({
              left: targetLeft,
              behavior: 'smooth'
            });
            setActiveIndex(nextIndex);
          }
        }, 4500);
      }
    }

    return () => {
      clearInterval(timer);
      clearTimeout(interactionTimer);
    };
  }, [activeIndex, isHovered, isDragging, isInteracting]);

  return (
    <section className="py-16 sm:py-24 bg-soft-ivory">
      <Container>
        <Reveal>
          <SectionHeading 
            title="Customer Stories" 
            subtitle="Real experiences from our community."
            className="mb-12"
            align="center"
          />
        </Reveal>
        
        <Reveal>
          <div 
            className="relative -mx-4 md:mx-0"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={handleMouseLeave}
            onFocus={() => setIsHovered(true)}
            onBlur={() => setIsHovered(false)}
            onTouchStart={() => setIsInteracting(true)}
          >
          <div 
            ref={scrollRef}
            className={`flex md:grid overflow-x-auto md:overflow-visible snap-x snap-mandatory md:snap-none md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8 auto-rows-[auto] px-[5vw] md:px-0 pb-8 md:pb-0 ${isDragging ? 'cursor-grabbing' : ''}`}
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            onScroll={handleScroll}
          >
            {/* Hide scrollbar for webkit */}
            <style>{`
              .flex::-webkit-scrollbar { display: none; }
            `}</style>
            
            {stories.map((story, index) => (
              <div 
                key={story.id} 
                data-index={index}
                className={`w-[90vw] sm:w-[85vw] md:w-auto flex-none snap-center h-auto flex flex-col relative overflow-hidden group transition-transform duration-300 hover:-translate-y-1 ${story.className}`}
                style={{ borderRadius: '1.5rem' }}
                onClickCapture={(e) => {
                  if (hasDragged) {
                    e.stopPropagation();
                    e.preventDefault();
                  }
                }}
              >
                <Card 
                  variant="default"
                  className="relative p-6 md:p-8 flex flex-col justify-between h-full w-full bg-transparent text-inherit border-none"
                  style={{ borderRadius: '1.5rem', backgroundColor: 'transparent', color: 'inherit' }}
                >
                  {/* Background Quote Icon */}
                  <div className={`absolute top-6 right-6 z-0 ${story.quoteClass}`}>
                    <Quote size={index === 0 ? 120 : 60} strokeWidth={1} className="opacity-50 rotate-180" />
                  </div>

                  {/* Content */}
                  <div className="relative z-10 flex-grow mb-8 md:mb-12">
                    <p className={story.textClass}>
                      "{story.text}"
                    </p>
                  </div>

                  {/* Author Info */}
                  <div className="relative z-10 flex items-center gap-4 mt-auto">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm ${story.avatarClass}`}>
                      {story.initials}
                    </div>
                    <div>
                      <div className="font-bold">{story.name}</div>
                      <div className={`text-sm ${story.roleClass}`}>{story.role}</div>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>

          {/* Pagination Dots (Mobile Only) */}
          <div className="flex md:hidden justify-center items-center gap-3 mt-2 pb-4">
            {stories.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollToSlide(index)}
                aria-label={`Show testimonial ${index + 1}`}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 flex-none ${
                  activeIndex === index 
                    ? 'bg-primary-dark-teal w-6' 
                    : 'bg-primary-dark-teal/20 hover:bg-primary-dark-teal/40'
                }`}
              />
            ))}
          </div>
        </div>
        </Reveal>
      </Container>
    </section>
  );
}
