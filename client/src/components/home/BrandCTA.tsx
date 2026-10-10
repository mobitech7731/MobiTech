import { Link } from 'react-router-dom';
import { Container } from '../ui/Container';
import { Button } from '../ui/Button';
import { Reveal } from 'cube-motion/react';

export function BrandCTA() {
  return (
    <section className="py-16 sm:py-24 bg-warm-cream">
      <Container>
        <Reveal>
          <div className="relative overflow-hidden bg-primary-dark-teal rounded-3xl shadow-elevated">
            {/* Subtle gradient background inside the panel */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-dark via-primary-dark-teal to-secondary-teal opacity-50" />
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 items-stretch">
            {/* Left Content */}
            <div className="p-6 sm:p-10 md:p-16 lg:p-20 flex flex-col justify-center">
              <span className="text-caption text-accent-sand tracking-widest mb-4 block">
                THE MOBITECH STANDARD
              </span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight mb-6">
                Upgrade Your<br />
                Everyday Setup.
              </h2>
              <p className="text-body-large text-white/80 mb-10 max-w-md">
                Premium mobile accessories designed to fit seamlessly into the way you live, work and play.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Link to="/shop" tabIndex={-1}>
                  <Button variant="secondary" size="lg">
                    Shop Collection
                  </Button>
                </Link>
                <Link to="/shop" tabIndex={-1}>
                  <Button 
                    variant="ghost" 
                    size="lg" 
                    className="border border-white/30 !text-white hover:!bg-white/10"
                  >
                    Explore Categories
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Visual */}
            <div className="relative h-72 sm:h-80 md:h-96 lg:h-auto w-full bg-secondary-teal/20 flex items-center justify-center p-8 lg:p-12">
              <img 
                src="/images/brand-cta-placeholder.svg" 
                alt="Premium Mobitech accessories collection"
                className="w-full h-full object-contain transition-transform duration-700 hover:scale-105"
                loading="lazy"
              />
            </div>
          </div>
        </div>
        </Reveal>
      </Container>
    </section>
  );
}
