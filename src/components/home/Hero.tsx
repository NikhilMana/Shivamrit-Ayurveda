"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const TOTAL_FRAMES = 192;

function getFrameUrl(index: number): string {
  const frameNumber = (index + 1).toString().padStart(3, "0");
  return `/hero-frames/frame_${frameNumber}.webp`;
}

export default function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const [imagesLoadedCount, setImagesLoadedCount] = useState(0);
  const [isInitialFrameReady, setIsInitialFrameReady] = useState(false);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef(0);
  const hasIntroPlayedRef = useRef(false);

  // Helper to draw a specific frame on canvas with aspect cover scaling
  const drawFrame = useCallback((frameIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Find nearest loaded frame if target frame is not loaded yet
    let img = imagesRef.current[frameIndex];
    if (!img || !img.complete || img.naturalWidth === 0) {
      for (let i = 0; i < TOTAL_FRAMES; i++) {
        const lower = frameIndex - i;
        const upper = frameIndex + i;
        if (lower >= 0 && imagesRef.current[lower]?.complete && imagesRef.current[lower].naturalWidth > 0) {
          img = imagesRef.current[lower];
          break;
        }
        if (upper < TOTAL_FRAMES && imagesRef.current[upper]?.complete && imagesRef.current[upper].naturalWidth > 0) {
          img = imagesRef.current[upper];
          break;
        }
      }
    }

    if (!img || !img.complete || img.naturalWidth === 0) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;

    if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
      canvas.width = displayWidth * dpr;
      canvas.height = displayHeight * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);

    const imgWidth = img.naturalWidth || 720;
    const imgHeight = img.naturalHeight || 1280;

    const ratio = Math.max(displayWidth / imgWidth, displayHeight / imgHeight);
    const newWidth = imgWidth * ratio;
    const newHeight = imgHeight * ratio;
    const offsetX = (displayWidth - newWidth) / 2;
    const offsetY = (displayHeight - newHeight) / 2;

    ctx.clearRect(0, 0, displayWidth, displayHeight);
    ctx.drawImage(img, offsetX, offsetY, newWidth, newHeight);
    ctx.restore();
  }, []);

  // Preload frame images
  useEffect(() => {
    imagesRef.current = new Array(TOTAL_FRAMES);

    let loadedCount = 0;

    // Load first frame immediately
    const firstImg = new Image();
    firstImg.src = getFrameUrl(0);
    firstImg.onload = () => {
      imagesRef.current[0] = firstImg;
      setIsInitialFrameReady(true);
      drawFrame(0);
    };

    // Load all remaining frames
    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = getFrameUrl(i);
      img.onload = () => {
        imagesRef.current[i] = img;
        loadedCount++;
        setImagesLoadedCount(loadedCount);
      };
      if (i === 0) {
        imagesRef.current[0] = firstImg;
      }
    }

    const handleResize = () => {
      drawFrame(currentFrameRef.current);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [drawFrame]);

  // Initial Auto-Scroll & Animation until the first product section slides into view
  useEffect(() => {
    if (!isInitialFrameReady || hasIntroPlayedRef.current) return;

    let animationFrameId: number;
    let lastTime = performance.now();
    const frameInterval = 1000 / 24; // ~24 FPS

    const handleUserInteraction = () => {
      hasIntroPlayedRef.current = true;
    };

    window.addEventListener("touchstart", handleUserInteraction, { passive: true });
    window.addEventListener("wheel", handleUserInteraction, { passive: true });
    window.addEventListener("keydown", handleUserInteraction, { passive: true });

    const animate = (now: number) => {
      if (hasIntroPlayedRef.current) return;

      const elapsed = now - lastTime;
      const productsElem = document.getElementById("products-section");
      const targetY = productsElem ? Math.max(0, productsElem.offsetTop - 70) : window.innerHeight * 0.9;

      if (elapsed >= frameInterval) {
        lastTime = now - (elapsed % frameInterval);

        // Advance animation frame
        if (currentFrameRef.current < TOTAL_FRAMES - 1) {
          currentFrameRef.current += 1;
          drawFrame(currentFrameRef.current);
        }

        // Smoothly auto-scroll page down towards first product card
        if (typeof window !== "undefined") {
          const currentY = window.scrollY;
          if (currentY < targetY - 5) {
            const nextY = Math.min(targetY, currentY + (targetY - currentY) * 0.08 + 2.5);
            window.scrollTo(0, nextY);
          } else {
            // First product card reached! Stop auto-scroll.
            hasIntroPlayedRef.current = true;
            return;
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("touchstart", handleUserInteraction);
      window.removeEventListener("wheel", handleUserInteraction);
      window.removeEventListener("keydown", handleUserInteraction);
    };
  }, [isInitialFrameReady, drawFrame]);

  // GSAP ScrollTrigger for smooth scrub scrolling when user scrolls manually
  useEffect(() => {
    const st = ScrollTrigger.create({
      start: 0,
      end: () => window.innerHeight * 1.2,
      scrub: 0.3,
      onUpdate: (self) => {
        const targetFrame = Math.min(
          TOTAL_FRAMES - 1,
          Math.floor(self.progress * (TOTAL_FRAMES - 1))
        );
        if (targetFrame !== currentFrameRef.current) {
          currentFrameRef.current = targetFrame;
          drawFrame(targetFrame);
        }
      },
    });

    return () => {
      st.kill();
    };
  }, [drawFrame]);

  const loadingPercentage = Math.round((imagesLoadedCount / TOTAL_FRAMES) * 100);

  return (
    <div
      id="hero-section"
      className="fixed inset-0 w-full h-screen bg-[#FFF8F4] pointer-events-none select-none z-0"
    >
      {/* Fixed Canvas Background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
        style={{ opacity: isInitialFrameReady ? 1 : 0 }}
      />

      {/* Preloading indicator line at top */}
      {imagesLoadedCount < TOTAL_FRAMES && (
        <div className="absolute top-0 left-0 right-0 z-40 h-[3px] bg-[#F7EEE7] overflow-hidden">
          <div
            ref={progressBarRef}
            className="h-full bg-[#C89B3C] transition-all duration-300 ease-out shadow-[0_0_10px_#C89B3C]"
            style={{ width: `${loadingPercentage}%` }}
          />
        </div>
      )}
    </div>
  );
}
