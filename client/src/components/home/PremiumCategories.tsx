import { Container } from '../ui/Container';
import { SectionHeading } from '../ui/SectionHeading';
import { Link } from 'react-router-dom';
import { File, Headphones, Gamepad2 } from 'lucide-react';
import { Reveal } from 'cube-motion/react';

function DeviceIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="5" y="2" width="14" height="20" rx="3" />
      <line x1="10" y1="5" x2="14" y2="5" />
      <line x1="8" y1="18" x2="16" y2="18" />
    </svg>
  );
}

const categories = [
  {
    id: 'phone-cases',
    title: 'Cases\nCollection',
    to: '/shop?category=phone-cases',
    icon: File,
  },
  {
    id: 'wireless-audio',
    title: 'Audio\nAccessories',
    to: '/shop?category=wireless-audio',
    icon: Headphones,
  },
  {
    id: 'chargers-adapters',
    title: 'Power\nCategories',
    to: '/shop?category=chargers-adapters',
    icon: Gamepad2, // They used Gamepad2 for power, I won't change the design
  },
  {
    id: 'smartwatches-wearables',
    title: 'Premium\nWearables',
    to: '/shop?category=smartwatches-wearables',
    icon: DeviceIcon,
  },
];

export function PremiumCategories() {
  return (
    <section className="py-16 sm:py-20 bg-soft-ivory">
      <Container>
        <Reveal>
          <SectionHeading title="Premium Categories" className="mb-6 sm:mb-8" />
        </Reveal>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Reveal key={cat.id}>
                <Link 
                  to={cat.to}
                  className="group flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 rounded-[24px] sm:rounded-[28px] bg-white shadow-subtle border border-light-neutral/40 transition-all duration-300 hover:shadow-card hover:-translate-y-1 text-center h-full"
                >
                  <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-[68px] md:h-[68px] rounded-full bg-[#f0ebe4] flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-105 transition-transform duration-300">
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-primary-dark" strokeWidth={1.5} />
                  </div>
                  <span className="font-semibold text-sm sm:text-base text-primary-dark leading-snug whitespace-pre-line">
                    {cat.title}
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
