import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, AtSign, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#F7EEE7] text-[#3A2B28] pt-16 pb-12 border-t border-[#C89B3C]/25 relative z-20">
      <div className="max-w-6xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-4 gap-12">
        
        {/* Brand & Mission */}
        <div className="col-span-1 md:col-span-2 flex flex-col space-y-6">
          <Link href="/" className="inline-block">
            <Image
              src="/assets/logo.png"
              alt="Shivamrit Ayurveda Logo"
              width={220}
              height={75}
              className="h-16 w-auto object-contain drop-shadow-sm"
            />
          </Link>

          <p className="text-[#6D5A56] text-sm font-light leading-relaxed max-w-md">
            Dedicated to bringing authentic, premium Ayurvedic personal care formulations to the modern consumer. Inspired by classical heritage and crafted with 100% clean, pure botanicals.
          </p>

          <div className="flex items-center gap-2 text-xs text-[#3A2B28] font-semibold uppercase tracking-wider bg-[#FFD8D8]/60 border border-[#FCBABA] px-3.5 py-1.5 rounded-full w-fit shadow-xs">
            <ShieldCheck className="w-4 h-4 text-[#3E5C38]" />
            <span>Nature&apos;s Touch. Science&apos;s Trust.</span>
          </div>
        </div>

        {/* Essential Navigation */}
        <div className="flex flex-col space-y-3">
          <h3 className="uppercase tracking-[0.25em] text-xs font-bold text-[#C89B3C] mb-2">
            Sanctuary Navigation
          </h3>
          <Link href="/" className="text-sm text-[#6D5A56] hover:text-[#C89B3C] transition-colors w-fit">
            Homepage
          </Link>
          <Link href="/#products-section" className="text-sm text-[#6D5A56] hover:text-[#C89B3C] transition-colors w-fit">
            Products Deck
          </Link>
          <Link href="/products" className="text-sm text-[#6D5A56] hover:text-[#C89B3C] transition-colors w-fit">
            Catalog Overview
          </Link>
        </div>

        {/* Support & Contact */}
        <div className="flex flex-col space-y-3">
          <h3 className="uppercase tracking-[0.25em] text-xs font-bold text-[#C89B3C] mb-2">
            Official Support & Connect
          </h3>
          
          <a
            href="https://instagram.com/shivamrit_ayurveda_"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-[#6D5A56] hover:text-[#C89B3C] transition-colors w-fit"
          >
            <AtSign className="w-4 h-4 text-[#C89B3C]" />
            <span>@shivamrit_ayurveda_</span>
          </a>

          <div className="flex flex-col space-y-1 text-sm text-[#6D5A56]">
            <span className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#C89B3C]" />
              <span>+91 8123403829</span>
            </span>
            <span className="text-xs text-[#6D5A56]/70 pl-6">Shashank Mana</span>
          </div>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="max-w-6xl mx-auto px-6 md:px-12 mt-12 pt-6 border-t border-[#3A2B28]/10 flex flex-col sm:flex-row items-center justify-between text-xs text-[#6D5A56] gap-4">
        <p>© 2026 Shivamrit Ayurveda. All rights reserved.</p>
        <div className="flex gap-6 text-[11px] uppercase tracking-wider">
          <span className="hover:text-[#C89B3C] cursor-pointer">100% Pure Botanicals</span>
          <span className="hover:text-[#C89B3C] cursor-pointer">Cruelty-Free</span>
          <span className="hover:text-[#C89B3C] cursor-pointer">Made in India</span>
        </div>
      </div>
    </footer>
  );
}
