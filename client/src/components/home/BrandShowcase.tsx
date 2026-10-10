import { Reveal } from 'cube-motion/react';

interface BrandLogo {
  id: string;
  name: string;
  src: string;
  className: string;
}

const row1Logos: BrandLogo[] = [
  {
    id: 'aesop',
    name: 'Aesop',
    src: '/images/logos/logo-aesop.png',
    className: 'h-8 sm:h-11 md:h-13 lg:h-[56px] w-auto object-contain opacity-90',
  },
  {
    id: 'cos',
    name: 'COS',
    src: '/images/logos/logo-cos.png',
    className: 'h-9 sm:h-12 md:h-14 lg:h-[62px] w-auto object-contain opacity-90',
  },
  {
    id: 'linear',
    name: 'Linear',
    src: '/images/logos/logo-linear.png',
    className: 'h-6 sm:h-8 md:h-10 lg:h-[42px] w-auto object-contain opacity-90',
  },
  {
    id: 'nothing',
    name: 'Nothing',
    src: '/images/logos/logo-nothing.png',
    className: 'h-6 sm:h-8 md:h-10 lg:h-[42px] w-auto object-contain opacity-90',
  },
];

export function BrandShowcase() {
  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-soft-ivory">
      {/* Centered container enlarged by 300% with proportional framing */}
      <div className="mx-auto w-full max-w-[1150px] px-5 sm:px-8 lg:px-10">
        {/* Brand Showcase Hero Banner - Scaled up 300% */}
        <Reveal>
          <div className="relative overflow-hidden rounded-[22px] sm:rounded-[32px] md:rounded-[40px] lg:rounded-[44px] bg-[#aba098] flex flex-row items-center justify-between h-36 sm:h-48 md:h-60 lg:h-[270px]">
            {/* Left Text */}
            <div className="w-1/2 h-full flex items-center justify-center p-4 sm:p-6 md:p-8 text-center">
              <h2 className="text-white text-2xl sm:text-4xl md:text-5xl lg:text-[58px] font-medium leading-[1.12] tracking-tight whitespace-pre-line">
                Brand{'\n'}Showcase
              </h2>
            </div>

            {/* Right Image */}
            <div className="w-1/2 h-full p-2 sm:p-3 md:p-4 lg:p-5 flex items-center justify-center">
              <div className="w-full h-full rounded-[16px] sm:rounded-[24px] md:rounded-[30px] lg:rounded-[34px] overflow-hidden bg-black/10">
                <img
                  src="/images/brand-showcase-art.png"
                  alt="Brand Showcase"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </Reveal>

        {/* Brand Logo Grid */}
        <Reveal>
          <div className="mt-10 sm:mt-14 md:mt-18 lg:mt-20">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-6 md:gap-10 lg:gap-14 items-center justify-items-center">
              {row1Logos.map((logo) => (
                <div
                  key={logo.id}
                  className="flex items-center justify-center w-full min-h-[48px] sm:min-h-[64px] md:min-h-[76px] lg:min-h-[84px]"
                >
                  <img
                    src={logo.src}
                    alt={logo.name}
                    className={logo.className}
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Subtle Horizontal Divider */}
        <Reveal>
          <div className="w-full h-px bg-black/[0.08] mt-12 sm:mt-16 md:mt-20 lg:mt-24" />
        </Reveal>
      </div>
    </section>
  );
}
