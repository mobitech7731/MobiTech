import { Link } from 'react-router-dom';
import { Container } from '../ui/Container';
import { Rise } from 'cube-motion/react';

export function Hero() {
  return (
    <section className="relative min-h-[auto] lg:min-h-[100vh] flex items-center pt-20 sm:pt-24 lg:pt-32 pb-10 sm:pb-16 overflow-hidden bg-gradient-to-br from-soft-ivory via-accent-sand/20 to-primary-dark-teal/10">
      {/* Decorative Atmospheric Glows */}
      <div className="absolute top-0 right-0 w-[80%] h-[100%] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-secondary-teal/15 via-transparent to-transparent pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-[var(--color-bitter-yellow)]/10 via-transparent to-transparent blur-3xl pointer-events-none" />
      <div className="absolute top-[20%] right-[10%] w-[500px] h-[500px] bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-primary-dark-teal/5 via-transparent to-transparent blur-[100px] pointer-events-none" />
      
      {/* Background Decorative Text */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-center overflow-hidden z-0 select-none opacity-[0.04] mt-12 lg:mt-0">
        <span className="text-[18vw] font-bold leading-none tracking-tighter text-primary-dark -ml-[2%] uppercase">PREMIUM</span>
        <span className="text-[18vw] font-bold leading-none tracking-tighter text-primary-dark ml-[5%] uppercase">ACCESSORIES</span>
      </div>

      <Container className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-12 lg:gap-8 items-center mt-2 lg:mt-0">
        {/* Left Content */}
        <div className="max-w-xl z-10 order-2 lg:order-1 text-center lg:text-left flex flex-col items-center lg:items-start mx-auto lg:mx-0">
          <Rise>
            <h1 className="text-[2.25rem] sm:text-[3.5rem] md:text-[4.5rem] lg:text-[5.5rem] font-bold tracking-tight text-primary-dark leading-[1.12] mb-3 sm:mb-6">
              Accessories That<br />
              Feel Premium
            </h1>
          </Rise>
          <Rise delay={100}>
            <p className="text-sm sm:text-lg text-primary-dark/70 mb-6 sm:mb-10 max-w-[28rem] leading-relaxed">
              Premium Mobile Accessories for your<br className="hidden sm:block" />
              everyday setup.
            </p>
          </Rise>
          <Rise delay={200}>
            <div className="flex flex-row flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 w-full">
              <Link to="/shop">
                <button className="px-5 sm:px-8 py-3 sm:py-3.5 rounded-full bg-[#12362f] text-white font-semibold text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 whitespace-nowrap">
                  Shop Collection
                </button>
              </Link>
              <Link to="/shop">
                <button className="px-5 sm:px-8 py-3 sm:py-3.5 rounded-full bg-transparent border border-[#c4b596] text-primary-dark font-semibold text-sm shadow-sm hover:bg-[#eadebd] hover:-translate-y-0.5 transition-all duration-200 whitespace-nowrap">
                  Explore Categories
                </button>
              </Link>
            </div>
          </Rise>
        </div>

        {/* Right Visual */}
        <div className="relative w-full aspect-auto md:aspect-[4/3] lg:aspect-[1/1] flex items-center justify-center z-10 order-1 lg:order-2 mb-4 lg:mb-0">
           <img 
             src="/images/hero-products.png" 
             alt="Premium Mobile Accessories Collection"
             className="w-[85%] sm:w-[80%] max-w-[400px] lg:w-[110%] h-auto lg:max-w-none mx-auto lg:ml-10 object-contain drop-shadow-2xl"
           />
        </div>
      </Container>
    </section>
  );
}
