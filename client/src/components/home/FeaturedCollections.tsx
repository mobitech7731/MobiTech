import { Link } from 'react-router-dom';
import { Container } from '../ui/Container';
import { ChevronRight } from 'lucide-react';

const collections = [
  {
    id: 'featured',
    title: 'Featured\nCollection',
    description: 'Premium Mobile Accessories\nfor your everyday setup.',
    image: '/images/collections/featured-collection-cropped.png',
    className: 'row-span-1 lg:row-span-2 col-span-1 bg-[#12362f]',
    titleClass: 'text-xl sm:text-2xl lg:text-5xl xl:text-[54px] font-bold leading-[1.05] mb-2 sm:mb-3 lg:mb-4 text-white tracking-tight',
    descClass: 'hidden sm:block text-xs sm:text-sm lg:text-lg text-white/80 max-w-[200px] sm:max-w-[240px] lg:max-w-[300px]',
    imageClass: 'absolute bottom-1 sm:bottom-2 lg:bottom-4 right-1 sm:right-2 lg:left-1/2 lg:-translate-x-1/2 w-[50%] sm:w-[60%] lg:w-[92%] xl:w-[95%] max-w-[390px] xl:max-w-[480px] object-contain drop-shadow-2xl',
    padClass: 'p-3.5 sm:p-5 lg:p-10 xl:p-12',
    hideArrow: true,
    to: '/shop',
  },
  {
    id: 'magsafe',
    title: 'MagSafe\nAccessories',
    image: '/images/collections/magsafe-accessories.png',
    className: 'bg-gradient-to-br from-[#173e35] to-[#255246]',
    titleClass: 'text-base sm:text-lg lg:text-2xl xl:text-3xl font-bold text-white',
    imageClass: 'absolute bottom-0 right-2 sm:right-3 lg:right-4 w-[55%] sm:w-[48%] max-w-[185px] h-[75%] sm:h-[82%] object-contain object-bottom drop-shadow-xl',
    padClass: 'p-4 sm:p-5 lg:p-8 xl:p-10',
    to: '/shop?category=magsafe-accessories',
  },
  {
    id: 'audio',
    title: 'Wireless\nAudio',
    image: '/images/collections/wireless-audio.png',
    className: 'bg-gradient-to-br from-[#173e35] via-[#2a4f3b] to-[var(--color-bitter-yellow)]',
    titleClass: 'text-base sm:text-lg lg:text-2xl xl:text-3xl font-bold text-white',
    imageClass: 'absolute bottom-2 sm:bottom-3 lg:bottom-4 right-2 sm:right-3 lg:right-5 w-[55%] sm:w-[48%] max-w-[195px] h-[70%] sm:h-[80%] object-contain drop-shadow-xl',
    padClass: 'p-4 sm:p-5 lg:p-8 xl:p-10',
    to: '/shop?category=wireless-audio',
  },
  {
    id: 'wireless-essentials',
    title: 'Wireless\nEssentials',
    image: '/images/collections/wireless-essentials.png',
    className: 'bg-gradient-to-br from-[#1c443b] to-[#122e27]',
    titleClass: 'text-base sm:text-lg lg:text-2xl xl:text-3xl font-bold text-white',
    imageClass: 'absolute bottom-2 right-2 sm:right-4 w-[60%] sm:w-[52%] max-w-[210px] h-[65%] sm:h-[72%] object-contain object-bottom drop-shadow-xl',
    padClass: 'p-4 sm:p-5 lg:p-8 xl:p-10',
    to: '/shop?category=power-banks',
  },
  {
    id: 'gaming-essentials',
    title: 'Gaming\nEssentials',
    image: '/images/collections/gaming-essentials.png',
    className: 'bg-gradient-to-br from-[#194036] to-[#406050]',
    titleClass: 'text-base sm:text-lg lg:text-2xl xl:text-3xl font-bold text-white',
    imageClass: 'absolute bottom-2 right-2 sm:right-4 w-[60%] sm:w-[52%] max-w-[205px] h-[65%] sm:h-[72%] object-contain object-bottom drop-shadow-xl',
    padClass: 'p-4 sm:p-5 lg:p-8 xl:p-10',
    to: '/shop?category=gaming-accessories',
  },
  {
    id: 'chargers',
    title: 'Premium\nChargers',
    image: '/images/collections/premium-chargers.png',
    className: 'bg-gradient-to-br from-[#173e35] to-[#3a6857]',
    titleClass: 'text-base sm:text-lg lg:text-2xl xl:text-3xl font-bold text-white',
    imageClass: 'absolute bottom-0 right-2 sm:right-5 w-[55%] sm:w-[48%] max-w-[190px] h-[75%] sm:h-[84%] object-contain object-bottom drop-shadow-xl',
    padClass: 'p-4 sm:p-5 lg:p-8 xl:p-10',
    to: '/shop?category=chargers-adapters',
  },
  {
    id: 'new-arrivals',
    title: 'New\nArrivals',
    image: '/images/collections/new-arrivals.png',
    className: 'bg-[#12332a]',
    titleClass: 'text-base sm:text-lg lg:text-2xl xl:text-3xl font-bold text-white',
    imageClass: 'absolute bottom-0 right-2 sm:right-5 w-[55%] sm:w-[46%] max-w-[175px] h-[80%] sm:h-[88%] object-contain object-bottom drop-shadow-2xl',
    padClass: 'p-4 sm:p-5 lg:p-8 xl:p-10',
    to: '/shop?sort=newest',
  },
  {
    id: 'limited',
    title: 'Limited Edition\nProducts',
    image: '/images/collections/limited-edition.png',
    className: 'bg-gradient-to-br from-[#13332c] to-[#0a1c18]',
    titleClass: 'text-base sm:text-lg lg:text-2xl xl:text-3xl font-bold text-white',
    imageClass: 'absolute bottom-2 right-2 sm:right-5 w-[55%] sm:w-[48%] max-w-[185px] h-[75%] sm:h-[80%] object-contain object-bottom drop-shadow-2xl',
    padClass: 'p-4 sm:p-5 lg:p-8 xl:p-10',
    to: '/shop',
  }
];

export function FeaturedCollections() {
  return (
    <section className="py-12 sm:py-16 lg:py-24 bg-gradient-to-b from-soft-ivory via-accent-sand/10 to-soft-ivory relative overflow-hidden">
      
      {/* Background Decorative Text - Desktop Only */}
      <div className="hidden lg:flex absolute inset-0 pointer-events-none flex-col justify-between py-10 overflow-hidden z-0 select-none opacity-[0.03]">
        <span className="text-[14vw] xl:text-[12vw] font-bold leading-none tracking-tighter text-primary-dark -ml-[1%] uppercase">PREMIUM</span>
        <span className="text-[14vw] xl:text-[12vw] font-bold leading-none tracking-tighter text-primary-dark ml-[4%] uppercase text-right">ACCESSORIES</span>
      </div>

      <Container className="relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-5 xl:gap-8 auto-rows-[170px] sm:auto-rows-[220px] md:auto-rows-[250px] xl:auto-rows-[300px]">
          {collections.map((item) => (
            <Link key={item.id} to={item.to} className={`block ${item.className} rounded-[28px] overflow-hidden group shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}>
              <div className="relative overflow-hidden flex flex-col h-full bg-transparent w-full">
                <div className={`relative z-10 flex flex-col h-full ${item.padClass}`}>
                  <h3 className={`whitespace-pre-line leading-tight ${item.titleClass}`}>
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className={`whitespace-pre-line mt-3 ${item.descClass}`}>
                      {item.description}
                    </p>
                  )}
                  
                  {/* Arrow Button */}
                  {!item.hideArrow && (
                    <div className="mt-auto">
                      <span aria-label={`View ${item.title.replace('\n', ' ')}`} className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/10 group-hover:bg-white/20 backdrop-blur-sm transition-colors text-white">
                        <ChevronRight size={16} strokeWidth={2} />
                      </span>
                    </div>
                  )}
                </div>
                
                <img 
                  src={item.image} 
                  alt={`${item.title.replace('\n', ' ')} artwork`} 
                  className={`z-0 transition-transform duration-700 ease-out group-hover:scale-105 ${item.imageClass}`}
                  loading="lazy"
                />
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
