import { Link } from 'react-router-dom';
import { Container } from '../ui/Container';

export function Hero() {
  return (
    <section className="relative min-h-[100vh] flex items-center pt-32 pb-16 overflow-hidden bg-gradient-to-br from-soft-ivory via-accent-sand/20 to-primary-dark-teal/10">
      {/* Decorative Atmospheric Glows */}
      <div className="absolute top-0 right-0 w-[80%] h-[100%] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-secondary-teal/15 via-transparent to-transparent pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-[var(--color-bitter-yellow)]/10 via-transparent to-transparent blur-3xl pointer-events-none" />
      <div className="absolute top-[20%] right-[10%] w-[500px] h-[500px] bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-primary-dark-teal/5 via-transparent to-transparent blur-[100px] pointer-events-none" />
      
      {/* Background Decorative Text */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-center overflow-hidden z-0 select-none opacity-[0.04]">
        <span className="text-[18vw] font-bold leading-none tracking-tighter text-primary-dark -ml-[2%] uppercase">PREMIUM</span>
        <span className="text-[18vw] font-bold leading-none tracking-tighter text-primary-dark ml-[5%] uppercase">ACCESSORIES</span>
      </div>

      <Container className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
        {/* Left Content */}
        <div className="max-w-xl z-10">
          <h1 className="text-[3.5rem] md:text-[4.5rem] lg:text-[5.5rem] font-bold tracking-tight text-primary-dark leading-[1.1] mb-6">
            Accessories That<br />
            Feel Premium
          </h1>
          <p className="text-lg text-primary-dark/70 mb-10 max-w-[28rem] leading-relaxed">
            Premium Mobile Accessories for your<br />
            everyday setup.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link to="/shop">
              <button className="px-8 py-3.5 rounded-full bg-[#12362f] text-white font-semibold text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                Shop Collection
              </button>
            </Link>
            <Link to="/shop">
              <button className="px-8 py-3.5 rounded-full bg-transparent border border-[#c4b596] text-primary-dark font-semibold text-sm shadow-sm hover:bg-[#eadebd] hover:-translate-y-0.5 transition-all duration-200">
                Explore Categories
              </button>
            </Link>
          </div>
        </div>

        {/* Right Visual */}
        <div className="relative w-full aspect-square md:aspect-[4/3] lg:aspect-[1/1] flex items-center justify-center z-10">
           <img 
             src="/images/hero-products.png" 
             alt="Premium Mobile Accessories Collection"
             className="w-[110%] h-auto max-w-none ml-4 lg:ml-10 object-contain drop-shadow-2xl"
           />
        </div>
      </Container>
    </section>
  );
}
