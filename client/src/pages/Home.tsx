import { Navbar } from '../components/home/Navbar';
import { Hero } from '../components/home/Hero';
import { FeaturedCollections } from '../components/home/FeaturedCollections';
import { FeaturedProducts } from '../components/home/FeaturedProducts';
import { TrendingProducts } from '../components/home/TrendingProducts';
import { PremiumCategories } from '../components/home/PremiumCategories';
import { BestSellers } from '../components/home/BestSellers';
import { BrandShowcase } from '../components/home/BrandShowcase';
import { WhyChooseUs } from '../components/home/WhyChooseUs';
import { CustomerStories } from '../components/home/CustomerStories';
import { Footer } from '../components/home/Footer';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-soft-ivory overflow-x-clip w-full">
      <Navbar />
      <main className="flex-grow overflow-x-clip w-full">
        <Hero />
        <FeaturedCollections />
        <FeaturedProducts />
        <TrendingProducts />
        <PremiumCategories />
        <BestSellers />
        <BrandShowcase />
        <WhyChooseUs />
        <CustomerStories />
      </main>
      <Footer />
    </div>
  );
}
