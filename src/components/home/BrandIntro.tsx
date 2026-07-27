"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function BrandIntro() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!textRef.current) return;

    const text = textRef.current;
    const words = text.innerText.trim().split(/\s+/);
    text.innerHTML = "";

    words.forEach((word) => {
      const span = document.createElement("span");
      span.innerText = word;
      span.className = "inline-block opacity-0 translate-y-4 mr-[0.3em] last:mr-0";
      text.appendChild(span);
    });

    const spans = text.querySelectorAll("span");

    gsap.to(spans, {
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 70%",
        end: "bottom 80%",
        scrub: 1,
      },
      opacity: 1,
      y: 0,
      stagger: 0.05,
      ease: "power2.out",
    });
  }, []);

  return (
    <section ref={sectionRef} className="py-24 sm:py-32 px-8 md:px-16 bg-[#F7EEE7] text-[#3A2B28] min-h-[70vh] flex items-center justify-center relative border-t border-[#C89B3C]/20">
      <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
        <span className="text-xs uppercase tracking-[0.35em] text-[#C89B3C] font-semibold mb-4">
          Sacred Heritage & Modern Mastery
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-6 uppercase tracking-wide text-[#3A2B28] font-light">
          Ancient Wisdom. Modern Rituals.
        </h2>
        <p ref={textRef} className="text-lg sm:text-2xl md:text-3xl font-light leading-relaxed max-w-3xl text-[#6D5A56]">
          At Shivamrit Ayurveda, every formulation is inspired by centuries of Ayurvedic knowledge and refined for today&apos;s wellness journey. We believe true beauty begins with nature and is nurtured through consistency, purity, and care.
        </p>
      </div>
    </section>
  );
}
