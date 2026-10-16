"use client"
// Derive handoff state if needed for server/static hydration

// 1. Single Lenis Smooth Scroll Instance synced with GSAP ScrollTrigger

// Synchronize Lenis with GSAP's central ticker

// 2. Global Scroll Progress Bar & Back to Top in single GSAP context
// Direct DOM transform without React state updates in scroll loop
/* Top Glowing Scroll Progress Bar */ /* Global Header & Cart Drawer */ /* ═══════════════════════════════════════════════════════════════
          SECTION 1: HERO PINNED STAGE (220vh)
          "The plate flips and the produce falls"
          ═══════════════════════════════════════════════════════════════ */ /* ═══════════════════════════════════════════════════════════════
          SECTION 2: SHOP SECTION (10 Products + "عرض المزيد")
          Overlaps the end of the pinned hero by margin-top: -60vh
          ═══════════════════════════════════════════════════════════════ */ /* ═══════════════════════════════════════════════════════════════
          SECTION 3: STORY PINNED STAGE (450vh)
          3 Scenes: Wash -> Cut (حلقات / صوابع / مكعبات) -> Ready
          ═══════════════════════════════════════════════════════════════ */ /* ═══════════════════════════════════════════════════════════════
          SECTION 4: CATEGORIES STRIP ("تسوّق حسب القسم")
          5 Tiles: خضار طازج، فواكه طازجة، الخضرة، جاهز للطبخ، السلطات
          ═══════════════════════════════════════════════════════════════ */ /* Back to top floating button */ /* Unchanged Footer */

import { useEffect, useRef, useCallback } from "react"
import { ArrowUp } from "lucide-react"
import Lenis from "lenis"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import Header from "./Header"
import CartDrawer from "./CartDrawer"
import PlateFlipHero from "./PlateFlipHero"
import StorySection from "./StorySection"
import Footer from "./Footer"

export default function HomeExperience() {
  const progressBarRef = useRef<HTMLDivElement>(null)
  const backToTopRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
    })

    lenis.on("scroll", ScrollTrigger.update)
    const tickerHandler = (time: number) => {
      lenis.raf(
        time *
          1000,
      )
    }
    gsap.ticker.add(tickerHandler)
    gsap.ticker.lagSmoothing(0)
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        start: "top top",
        end: "max",
        onUpdate: (self) => {
          if (progressBarRef.current) {
            progressBarRef.current.style.transform = `scaleX(${self.progress})`
          }
          if (backToTopRef.current) {
            const isVisible = self.progress > 0.08
            backToTopRef.current.style.opacity = isVisible ? "1" : "0"
            backToTopRef.current.style.pointerEvents = isVisible
              ? "auto"
              : "none"
          }
        },
      })
    })

    return () => {
      gsap.ticker.remove(tickerHandler)
      lenis.destroy()
      ctx.revert()
    }
  }, [])

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [])

  return (
    <main className="landing-experience-main">
      {/* Top Glowing Scroll Progress Bar */}
      <div
        className="scroll-progress-bar"
        ref={progressBarRef}
        aria-hidden="true"
      />

      {/* Global Header & Cart Drawer */}
      <Header />
      <CartDrawer />

      {/* SECTION 1: HERO PINNED STAGE (170vh) - Plate flips and items fall into department tiles */}
      <PlateFlipHero />

      {/* SECTION 2: STORY PINNED STAGE (450vh) - 3 Scenes: Wash -> Cut -> Ready */}
      <StorySection />

      {/* Back to top floating button */}
      <button
        type="button"
        className="back-to-top-btn"
        ref={backToTopRef}
        onClick={scrollToTop}
        aria-label="العودة لأعلى الصفحة"
        style={{
          opacity: 0,
          pointerEvents: "none",
          transition: "opacity 0.3s ease",
        }}
      >
        <ArrowUp size={18} />
        <span>للأعلى</span>
      </button>

      {/* Unchanged Footer */}
      <Footer />
    </main>
  )
}
