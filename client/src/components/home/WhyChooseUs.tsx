import { Reveal } from 'cube-motion/react';

interface BenefitStat {
  id: string;
  iconSrc: string;
  number: string;
  title: string;
  description: string;
}

const stats: BenefitStat[] = [
  {
    id: 'verified',
    iconSrc: '/images/why-choose-us/icon-verified-hd.png',
    number: '70%',
    title: 'Verified Performance',
    description: 'are defected hardware',
  },
  {
    id: 'materials',
    iconSrc: '/images/why-choose-us/icon-materials-hd.png',
    number: '50%',
    title: 'Materials Sourced',
    description: 'and tarla diadtics',
  },
  {
    id: 'sustainable',
    iconSrc: '/images/why-choose-us/icon-sustainable-hd.png',
    number: '41%',
    title: 'Sustainably Designed',
    description: 'sevice in hight',
  },
];

export function WhyChooseUs() {
  return (
    <section className="py-16 sm:py-20 md:py-24 lg:py-28 bg-soft-ivory">
      {/* Centered container scaled up by 150% to align with Brand Showcase */}
      <div className="mx-auto w-full max-w-[1150px] lg:max-w-[1200px] px-5 sm:px-8 lg:px-10">
        {/* Section Heading & Subtitle - Enlarged by 150% */}
        <Reveal>
          <div className="text-center mb-12 sm:mb-16 md:mb-20">
            <h2 className="text-3xl sm:text-4xl md:text-[42px] lg:text-[46px] font-semibold text-primary-dark tracking-tight">
              Why Choose Us
            </h2>
            <p className="mt-2 sm:mt-3 text-sm sm:text-base md:text-lg text-primary-dark/60 font-normal">
              We eat typography hierarchies
            </p>
          </div>
        </Reveal>

        {/* 3 Benefit Columns - Enlarged by 150% */}
        <div className="grid grid-cols-3 divide-x divide-black/[0.08]">
          {stats.map((stat) => (
            <Reveal key={stat.id}>
              <div
                className="flex flex-col items-center text-center px-1.5 sm:px-6 md:px-8 lg:px-10 py-4 md:py-6 h-full"
              >
                {/* Icon - Enlarged by 150% */}
                <div className="flex items-center justify-center h-8 w-8 sm:h-16 sm:w-16 md:h-18 md:w-18 mb-2 sm:mb-5 md:mb-6">
                  <img
                    src={stat.iconSrc}
                    alt={stat.title}
                    className="w-6 h-6 sm:w-14 sm:h-14 md:w-16 md:h-16 object-contain"
                    loading="lazy"
                  />
                </div>

                {/* Percentage - Enlarged by 150% */}
                <div className="text-[20px] sm:text-4xl md:text-5xl lg:text-[54px] font-semibold text-primary-dark leading-none tracking-tight">
                  {stat.number}
                </div>

                {/* Title - Enlarged by 150% */}
                <div className="mt-1 sm:mt-3.5 text-[9px] sm:text-lg md:text-xl lg:text-[22px] font-bold sm:font-medium text-primary-dark leading-tight sm:leading-snug">
                  {stat.title}
                </div>

                {/* Small Supporting Text - Enlarged by 150% */}
                <div className="mt-0.5 sm:mt-1.5 text-[8px] sm:text-sm md:text-[15px] text-primary-dark/50 font-normal leading-tight sm:leading-normal">
                  {stat.description}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
