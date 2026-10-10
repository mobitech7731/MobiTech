import { Link } from 'react-router-dom';
import { Container } from '../ui/Container';
import { MessageCircle, Mail } from 'lucide-react';
import { Reveal } from 'cube-motion/react';

const shopLinks = [
  { label: 'All Products', href: '/shop' },
  { label: 'Phone Cases', href: '/shop?category=phone-cases' },
  { label: 'Audio', href: '/shop?category=wireless-audio' },
  { label: 'Charging', href: '/shop?category=chargers-adapters' },
  { label: 'Power', href: '/shop?category=power-banks' },
  { label: 'Gaming', href: '/shop?category=gaming-accessories' },
];

const helpLinks = [
  { label: 'Contact Us', href: '/contact' },
  { label: 'Shipping', href: '/shipping' },
  { label: 'Returns', href: '/returns' },
  { label: 'FAQs', href: '/faqs' },
];

export function Footer() {
  const rawWhatsApp = import.meta.env.VITE_WHATSAPP_NUMBER;
  const whatsappNumber = rawWhatsApp && rawWhatsApp !== 'REPLACE_WITH_BUSINESS_NUMBER' 
    ? rawWhatsApp.replace(/[^0-9]/g, '') 
    : '';

  return (
    <footer className="relative bg-[#0d3b38] text-white pt-12 sm:pt-20 pb-8 sm:pb-8 overflow-hidden">
      {/* Abstract Background Bubbles */}
      <div className="absolute top-[-20%] right-[5%] w-[450px] h-[450px] rounded-full bg-gradient-to-br from-white/[0.07] to-transparent pointer-events-none z-0" />
      <div className="absolute bottom-[-30%] left-[30%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-white/[0.04] to-transparent pointer-events-none z-0" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[400px] h-[400px] rounded-full bg-gradient-to-tl from-white/[0.08] to-transparent pointer-events-none z-0" />
      <div className="absolute top-[20%] left-[-10%] w-[300px] h-[300px] rounded-full bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none z-0" />
      
      <Container className="relative z-10">
        <Reveal>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-y-10 gap-x-6 sm:gap-10 mb-12 sm:mb-20 lg:mb-24">
            
            {/* Brand & CTA Area */}
            <div className="col-span-2 lg:col-span-2 pr-0 lg:pr-16 flex flex-col gap-6 sm:gap-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-white mb-2">
                Mobitech
              </h2>
              <p className="text-sm text-white/70 max-w-xs">
                Premium accessories designed for your modern everyday devices.
              </p>
            </div>
            
            <div className="mt-2 sm:mt-auto bg-white/[0.06] backdrop-blur-sm rounded-[24px] p-6 sm:p-6 border border-white/10 relative overflow-hidden shadow-lg">
              <div className="relative z-10">
                <span className="block text-white text-sm sm:text-[13px] font-bold mb-2 tracking-wide">
                  NEED HELP CHOOSING?
                </span>
                <p className="text-white/80 mb-5 text-sm leading-relaxed">
                  Get personalized recommendations from our expert team.
                </p>
                {whatsappNumber ? (
                  <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer" tabIndex={-1} className="block w-full">
                    <button className="w-full py-3.5 px-4 rounded-full font-semibold text-sm text-[#0d3b38] bg-white transition-all duration-200 hover:bg-white/90 flex items-center justify-center gap-2 shadow-md">
                      <MessageCircle size={18} strokeWidth={2.5} />
                      Talk on WhatsApp
                    </button>
                  </a>
                ) : (
                  <button disabled className="w-full py-3.5 px-4 rounded-full font-semibold text-sm text-white/50 bg-white/10 border border-white/10 cursor-not-allowed flex items-center justify-center gap-2">
                    <MessageCircle size={18} strokeWidth={2.5} />
                    Talk on WhatsApp
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Shop Links */}
          <div className="col-span-1 lg:col-span-1">
            <h3 className="text-white text-xs sm:text-[13px] font-bold mb-5 sm:mb-6 tracking-wide uppercase opacity-90">SHOP</h3>
            <ul className="flex flex-col gap-3.5 sm:gap-4">
              {shopLinks.map((link) => (
                <li key={link.label}>
                  <Link 
                    to={link.href} 
                    className="text-white/70 hover:text-white transition-colors duration-200 flex items-center w-fit text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help Links */}
          <div className="col-span-1 lg:col-span-1">
            <h3 className="text-white text-xs sm:text-[13px] font-bold mb-5 sm:mb-6 tracking-wide uppercase opacity-90">HELP</h3>
            <ul className="flex flex-col gap-3.5 sm:gap-4">
              {helpLinks.map((link) => (
                <li key={link.label}>
                  <span 
                    className="text-white/70 hover:text-white transition-colors duration-200 w-fit text-sm cursor-pointer"
                  >
                    {link.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div className="col-span-2 lg:col-span-1 pt-2 sm:pt-0">
            <h3 className="text-white text-xs sm:text-[13px] font-bold mb-5 sm:mb-6 tracking-wide uppercase opacity-90">CONNECT</h3>
            <ul className="flex flex-col gap-4 sm:gap-5">
              <li>
                {whatsappNumber ? (
                  <a 
                    href={`https://wa.me/${whatsappNumber}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-white/80 hover:text-white transition-colors duration-200 flex items-center gap-3.5 w-fit text-sm font-medium"
                    aria-label="WhatsApp"
                  >
                    <div className="w-9 h-9 rounded-full flex items-center justify-center bg-white/10 border border-white/20 text-white">
                      <MessageCircle size={16} />
                    </div>
                    <span>WhatsApp</span>
                  </a>
                ) : (
                  <span className="text-white/50 flex items-center gap-3.5 w-fit text-sm cursor-not-allowed">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center border border-white/10">
                      <MessageCircle size={16} />
                    </div>
                    <span>WhatsApp</span>
                  </span>
                )}
              </li>
              <li>
                <span className="text-white/80 hover:text-white transition-colors duration-200 flex items-center gap-3.5 w-fit text-sm font-medium cursor-pointer">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center bg-white/10 border border-white/20 text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                    </svg>
                  </div>
                  <span>Instagram</span>
                </span>
              </li>
              <li>
                <a 
                  href="mailto:support@mobitech.example.com"
                  className="text-white/80 hover:text-white transition-colors duration-200 flex items-center gap-3.5 w-fit text-sm font-medium"
                  aria-label="Email"
                >
                  <div className="w-9 h-9 rounded-full flex items-center justify-center bg-white/10 border border-white/20 text-white">
                    <Mail size={16} />
                  </div>
                  <span>Email</span>
                </a>
              </li>
            </ul>
          </div>

        </div>
        </Reveal>

        {/* Bottom Bar */}
        <Reveal>
          <div className="pt-6 sm:pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/50 text-center md:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
              <span>&copy; 2026 Mobitech.</span>
              <span>All rights reserved.</span>
            </div>
            <div className="flex items-center justify-center gap-6">
            <span className="hover:text-white transition-colors duration-200 cursor-pointer">
              Privacy Policy
            </span>
            <span className="hover:text-white transition-colors duration-200 cursor-pointer">
              Terms of Service
            </span>
          </div>
        </div>
        </Reveal>
      </Container>
    </footer>
  );
}
