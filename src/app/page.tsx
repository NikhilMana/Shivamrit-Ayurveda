import Hero from "@/components/home/Hero";
import ProductsSection from "@/components/home/ProductsSection";
import CurvedReviewShowcase from "@/components/home/CurvedReviewShowcase";
import BrandIntro from "@/components/home/BrandIntro";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <div className="relative w-full bg-[#FFF8F4] min-h-screen text-[#3A2B28]">
      {/* Fixed Background Canvas */}
      <Hero />

      {/* Hero Scroll Spacer */}
      <div className="relative h-[200vh] w-full pointer-events-none" />

      {/* Overlapping Curtain Content */}
      <main className="relative z-10 bg-[#FFF8F4] rounded-t-[40px] sm:rounded-t-[60px] shadow-[0_-20px_50px_rgba(58,43,40,0.08)] border-t border-[#C89B3C]/30">
        <ProductsSection />
        <CurvedReviewShowcase />
        <BrandIntro />
        <Footer />
      </main>
    </div>
  );
}
