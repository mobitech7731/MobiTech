import { Link } from 'react-router-dom';
import { Container } from '../ui/Container';
import { ChevronRight } from 'lucide-react';

const collections = [
  {
    id: 'featured',
    title: 'Featured\nCollection',
    description: 'Premium Mobile Accessories\nfor your everyday setup.',
    image: '/images/collections/featured-collection-cropped.png',
    className: 'row-span-2 bg-[#12362f]',
    titleClass: 'text-3xl sm:text-[34px] lg:text-4xl font-bold leading-tight mb-3 text-white',
    descClass: 'text-sm sm:text-base text-white/80 max-w-[240px]',
    imageClass: 'absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 w-[92%] max-w-[390px] object-contain drop-shadow-2xl',
    padClass: 'p-7 sm:p-8',
    hideArrow: true,
    to: '/shop',
  },
  {
    id: 'magsafe',
    title: 'MagSafe\nAccessories',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Apple_MagSafe_Charger.png/400px-Apple_MagSafe_Charger.png',
    className: 'bg-gradient-to-br from-[#173e35] to-[#255246]',
    titleClass: 'text-xl font-bold text-white',
    imageClass: 'absolute bottom-2 right-2 w-[55%] object-contain drop-shadow-xl',
    padClass: 'p-6',
    to: '/shop?category=magsafe-accessories',
  },
  {
    id: 'audio',
    title: 'Wireless\nAudio',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/AirPods_Pro.png/400px-AirPods_Pro.png',
    className: 'bg-gradient-to-br from-[#173e35] via-[#2a4f3b] to-[var(--color-bitter-yellow)]',
    titleClass: 'text-xl font-bold text-white',
    imageClass: 'absolute bottom-4 right-4 w-[60%] object-contain drop-shadow-xl',
    padClass: 'p-6',
    to: '/shop?category=audio',
  },
  {
    id: 'wireless-essentials',
    title: 'Wireless\nEssentials',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Xbox_One_S_controller.png/400px-Xbox_One_S_controller.png',
    className: 'bg-gradient-to-br from-[#1c443b] to-[#122e27]',
    titleClass: 'text-xl font-bold text-white',
    imageClass: 'absolute bottom-4 right-2 w-[65%] object-contain drop-shadow-xl',
    padClass: 'p-6',
    to: '/shop?category=wireless-essentials',
  },
  {
    id: 'gaming-essentials',
    title: 'Gaming\nEssentials',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Sony_PlayStation_4_DualShock_4_Controller.png/400px-Sony_PlayStation_4_DualShock_4_Controller.png',
    className: 'bg-gradient-to-br from-[#194036] to-[#406050]',
    titleClass: 'text-xl font-bold text-white',
    imageClass: 'absolute bottom-2 right-0 w-[70%] object-contain drop-shadow-xl',
    padClass: 'p-6',
    to: '/shop?category=gaming',
  },
  {
    id: 'chargers',
    title: 'Premium\nChargers',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/IPhone_charger_brick.png/400px-IPhone_charger_brick.png',
    className: 'bg-gradient-to-br from-[#173e35] to-[#3a6857]',
    titleClass: 'text-xl font-bold text-white',
    imageClass: 'absolute bottom-0 right-2 w-[50%] object-contain drop-shadow-xl',
    padClass: 'p-6',
    to: '/shop?category=charging',
  },
  {
    id: 'new-arrivals',
    title: 'New\nArrivals',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/IPhone_13_Pro_Max_-_Sierra_Blue_-_Portrait.png/400px-IPhone_13_Pro_Max_-_Sierra_Blue_-_Portrait.png',
    className: 'bg-[#12332a]',
    titleClass: 'text-xl font-bold text-white',
    imageClass: 'absolute bottom-0 right-2 w-[45%] object-contain drop-shadow-2xl',
    padClass: 'p-6',
    to: '/shop?sort=newest',
  },
  {
    id: 'limited',
    title: 'Limited Edition\nProducts',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Apple_Watch_Series_4.png/400px-Apple_Watch_Series_4.png',
    className: 'bg-gradient-to-br from-[#13332c] to-[#0a1c18]',
    titleClass: 'text-xl font-bold text-white',
    imageClass: 'absolute bottom-2 right-2 w-[55%] object-contain drop-shadow-2xl',
    padClass: 'p-6',
    to: '/shop',
  }
];

export function FeaturedCollections() {
  return (
    <section className="py-24 bg-gradient-to-b from-soft-ivory via-accent-sand/10 to-soft-ivory">
      <Container>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 auto-rows-[220px] md:auto-rows-[250px]">
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
