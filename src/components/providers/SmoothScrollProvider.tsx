"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

    const lenis = new Lenis({
      duration: isMobile ? 1.4 : 1.0,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: isMobile ? 0.8 : 1.2,
    });

    // Attach Lenis instance to window for global access
    if (typeof window !== "undefined") {
      (window as any).__lenis = lenis;
    }

    lenis.on("scroll", ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    return () => {
      if (typeof window !== "undefined") {
        delete (window as any).__lenis;
      }
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
