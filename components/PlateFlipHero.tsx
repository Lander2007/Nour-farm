"use client"

// Deterministic item configuration:
// 10 items spread on 2 rings:
// Outer ring: 7 items at ~0.55R
// Inner ring: 3 items at ~0.20R
// Radius R = D / 2.
// Normalized distance from lower rim (y = +R):
// eta = (1 - rNormY) / 2  (range 0 to 1)
// Items closest to the lower rim release first!
// x offset relative to plate radius R
// y offset relative to plate radius R
// fixed tilt in degrees
// rotation delta during fall
// horizontal arc in px
// deterministic release jitter
// 1: Bell Pepper (outer ring, lower center: closest to bottom rim)
// 2: Tomato (outer ring, lower left)
// 3: Cucumber (outer ring, lower right)
// 4: Avocado (inner ring, lower)
// 5: Lemon (outer ring, mid left)
// 6: Basil (inner ring, mid right)
// 7: Carrot (inner ring, upper left)
// 8: Orange (outer ring, mid right)
// 9: Pomegranate (outer ring, upper left)
// 10: Broccoli (outer ring, upper right)

// Pure easing functions

// 3D Plate Refs

// Sprites

// State refs (NO React state in scroll loop!)

// Cache layout rects outside the ticker

// Measure exact center of plate inside sticky stage

// Card slots page rects

// Cache handoff images outside ticker

// Call synchronously upon mount, and on RAF + fonts ready

// Master ScrollTrigger for the hero

// Single ticker callback: reads progressRef and updates plate + 10 sprites

// Check hero active state for will-change optimization

// ═══════════════════════════════════════════════════════════════
// 1. TEXT COLUMNS ANIMATION (Outward move by ~6vw and fade out)
// ═══════════════════════════════════════════════════════════════

// Mobile text fade out

// Scroll cue fade out

// ═══════════════════════════════════════════════════════════════
// 2. DETERMINISTIC PLATE 3D FLIP: plateAt(p)
// ═══════════════════════════════════════════════════════════════
// Idle float
// Tilt & Flip from 0.12 to 0.60

// 0.12-0.38 lift of -4vh

// Wobble Z (-6deg to +4deg) and drift Y (~8deg)

// 0.40-0.65 exit upward off-screen

// Edge element: fades in between 70deg and 110deg so plate has thickness edge-on

// Apply plate transforms

// Edge rim element

// Dotted ring rotates slowly with progress and fades out with plate

// Floor shadow: stretches in X and loses opacity as plate rises

// ═══════════════════════════════════════════════════════════════
// 3. DETERMINISTIC ITEM TRANSFORM: itemAt(i, p)
// ═══════════════════════════════════════════════════════════════

// Only hide falling sprites once handoff to shop card images is complete (p >= 0.97)

// Relative release progress: closest to bottom rim releases first
// eta is normalized distance from lower rim: 0 at bottom, 1 at top
// Land between 0.82 and 0.93
// 3D rotation of local offset around X axis

// Perspective factor

// As plate tilts, slight slide along ceramic surface before release
// Calculate release anchor point

// Target coordinates from cached card slot
// Convert page coordinate to viewport coordinate inside stage
// ─────────────────────────────────────────────────────────────
// STATE B & C: RELEASED & FALLING
// ─────────────────────────────────────────────────────────────

// Spin dampens to 0 near landing

// Scale: 1 -> 1.15 in mid-air -> targetScale at landing
// ─────────────────────────────────────────────────────────────
// STATE D: LANDED WITH 2 DAMPED REBOUNDS & SQUASH
// ─────────────────────────────────────────────────────────────
// 0 to 1
// First rebound (apex 12px)
// 5% squash on impact
// Second rebound (apex 5px)

// Apply sprite transform

// ═══════════════════════════════════════════════════════════════
// 4. HANDOFF TO SHOP CARD IMAGES (p >= 0.97)
// ═══════════════════════════════════════════════════════════════
// Immediately run one synchronous pass so frame 0 items render on plate before first tick
/* 100vh Sticky Stage: 3-column Grid on Desktop */ /* MOBILE TOP HEADLINE (< 1024px) */ /* DESKTOP 3-COLUMN GRID */ /* COLUMN 1 (RTL: Right column) */ /* COLUMN 2 (Center: The 3D Plate Architecture) */ /* Floor Shadow Ellipse */ /* Dotted Halo Ring with Leaves */ /* 3D Flip Inner (preserve-3d) */ /* Front Face: plate-top.webp */ /* Plate Thickness Rim Edge (fades in between 70deg and 110deg) */ /* Back Face: plate-back.webp */ /* COLUMN 3 (RTL: Left column) */ /* MOBILE BOTTOM CTA (< 1024px) */ /* Scroll Cue at Bottom of Stage, Centered */ /* 10 Animated Produce Sprites: Fixed Viewport Overlay */

import { useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
interface ItemConfig {
  id: string
  name: string
  image: string
  rNormX: number
  rNormY: number
  initTilt: number
  seedSpin: number
  seedArc: number
  jitter: number
}

const ITEM_CONFIGS: ItemConfig[] = [
  {
    id: "bell-pepper",
    name: "فلفل ألوان",
    image: "/bell-pepper.webp",
    rNormX: 0.096,
    rNormY: 0.542,
    initTilt: 14,
    seedSpin: 45,
    seedArc: -25,
    jitter: -0.005,
  },
  {
    id: "tomato",
    name: "طماطم بلدي",
    image: "/tomato.webp",
    rNormX: -0.389,
    rNormY: 0.389,
    initTilt: -12,
    seedSpin: 60,
    seedArc: -35,
    jitter: 0.002,
  },
  {
    id: "cucumber",
    name: "خيار بلدي",
    image: "/cucumber.webp",
    rNormX: 0.498,
    rNormY: 0.232,
    initTilt: 22,
    seedSpin: -70,
    seedArc: 30,
    jitter: -0.003,
  },
  {
    id: "avocado",
    name: "أفوكادو هاس",
    image: "/avocado.webp",
    rNormX: -0.017,
    rNormY: 0.199,
    initTilt: -8,
    seedSpin: -40,
    seedArc: -10,
    jitter: 0.004,
  },
  {
    id: "lemon",
    name: "ليمون بلدي",
    image: "/lemon.webp",
    rNormX: -0.548,
    rNormY: -0.048,
    initTilt: -16,
    seedSpin: -50,
    seedArc: -20,
    jitter: -0.002,
  },
  {
    id: "basil",
    name: "ريحان طازج",
    image: "/basil.webp",
    rNormX: 0.188,
    rNormY: -0.068,
    initTilt: 26,
    seedSpin: 80,
    seedArc: 25,
    jitter: 0.003,
  },
  {
    id: "carrot",
    name: "جزر أصفر",
    image: "/carrot.webp",
    rNormX: -0.164,
    rNormY: -0.115,
    initTilt: 30,
    seedSpin: 90,
    seedArc: -20,
    jitter: -0.004,
  },
  {
    id: "orange",
    name: "برتقال أبو سرة",
    image: "/orange.webp",
    rNormX: 0.498,
    rNormY: -0.232,
    initTilt: 16,
    seedSpin: 65,
    seedArc: 35,
    jitter: 0.002,
  },
  {
    id: "pomegranate",
    name: "رمان بلدي",
    image: "/pomegranate.webp",
    rNormX: -0.354,
    rNormY: -0.421,
    initTilt: -14,
    seedSpin: -60,
    seedArc: -15,
    jitter: 0.005,
  },
  {
    id: "broccoli",
    name: "بروكلي أخضر",
    image: "/broccoli.webp",
    rNormX: 0.142,
    rNormY: -0.531,
    initTilt: -6,
    seedSpin: 30,
    seedArc: 20,
    jitter: -0.003,
  },
]
function power2InOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
}
function power2In(t: number): number {
  return t * t
}
function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v))
}

interface CachedSlot {
  pageLeft: number
  pageTop: number
  width: number
  height: number
}

interface PlateFlipHeroProps {
  onProgressUpdate?: (p: number) => void
}

export default function PlateFlipHero({
  onProgressUpdate,
}: PlateFlipHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const rightColRef = useRef<HTMLDivElement>(null)
  const leftColRef = useRef<HTMLDivElement>(null)
  const mobileTopRef = useRef<HTMLDivElement>(null)
  const mobileBottomRef = useRef<HTMLDivElement>(null)
  const scrollCueRef = useRef<HTMLDivElement>(null)
  const plate3dWrapRef = useRef<HTMLDivElement>(null)
  const plateInnerRef = useRef<HTMLDivElement>(null)
  const plateShadowRef = useRef<HTMLDivElement>(null)
  const plateEdgeRef = useRef<HTMLDivElement>(null)
  const dottedRingRef = useRef<HTMLDivElement>(null)
  const spriteRefs = useRef<(HTMLDivElement | null)[]>([])
  const progressRef = useRef<number>(0)
  const cachedSlotsRef = useRef<CachedSlot[]>([])
  const handoffImagesRef = useRef<HTMLElement[]>([])
  const plateCenterRef = useRef<{ cx: number; cy: number; diam: number }>({
    cx: 720,
    cy: 450,
    diam: 500,
  })
  const isReducedMotionRef = useRef<boolean>(false)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    const container = containerRef.current
    const stage = stageRef.current
    if (!container || !stage) return

    let resizeTimer: ReturnType<typeof setTimeout> | null = null
    const measureLayout = () => {
      if (!stage) return
      const stageRect = stage.getBoundingClientRect()
      let cx = stageRect.width / 2
      let cy = stageRect.height / 2
      let diam = Math.min(stageRect.height * 0.64, stageRect.width * 0.4)
      if (plate3dWrapRef.current) {
        const pRect = plate3dWrapRef.current.getBoundingClientRect()
        if (pRect.width > 20) {
          cx = pRect.left + pRect.width / 2
          cy = pRect.top + pRect.height / 2
          diam = pRect.width
        }
      } else {
        const isMobile = window.innerWidth < 1024
        diam = isMobile
          ? Math.min(window.innerWidth * 0.78, stageRect.height * 0.46)
          : Math.min(stageRect.height * 0.64, window.innerWidth * 0.4)
        cx = stageRect.width / 2
        cy = isMobile ? stageRect.height * 0.48 : stageRect.height / 2
      }

      plateCenterRef.current = { cx, cy, diam }
      const currentScrollY = window.scrollY
      const currentScrollX = window.scrollX

      const slots = document.querySelectorAll<HTMLElement>(
        ".shop-card-visual-slot",
      )
      if (slots.length > 0) {
        cachedSlotsRef.current = Array.from(slots).map((slot) => {
          const r = slot.getBoundingClientRect()
          return {
            pageLeft: r.left + currentScrollX,
            pageTop: r.top + currentScrollY,
            width: r.width,
            height: r.height,
          }
        })
      }
      handoffImagesRef.current = Array.from(
        document.querySelectorAll<HTMLElement>("[data-handoff-image]"),
      )
    }
    measureLayout()
    requestAnimationFrame(measureLayout)
    if (document.fonts?.ready) {
      document.fonts.ready.then(measureLayout)
    }

    const handleResize = () => {
      if (resizeTimer) clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => {
        measureLayout()
        ScrollTrigger.refresh()
      }, 150)
    }
    window.addEventListener("resize", handleResize)
    const ctx = gsap.context(() => {
      const st = ScrollTrigger.create({
        trigger: container,
        start: "top top",
        end: "bottom bottom",
        pin: stage,
        scrub: true,
        anticipatePin: 1,
        onUpdate: (self) => {
          progressRef.current = self.progress
          if (onProgressUpdate) {
            onProgressUpdate(self.progress)
          }
        },
      })
      const tickerCallback = () => {
        const p = Math.max(0, progressRef.current)
        const scrollY = window.scrollY
        const { cx, cy, diam } = plateCenterRef.current
        const R = diam / 2
        const itemSize = diam * 0.26
        const dPerspective = 1400
        const isHeroActive = p >= -0.02 && p <= 1.02
        const willChangeVal = isHeroActive ? "transform" : "auto"
        if (rightColRef.current && leftColRef.current) {
          if (p < 0.12) {
            rightColRef.current.style.transform = "translate3d(0, 0, 0)"
            rightColRef.current.style.opacity = "1"
            rightColRef.current.style.pointerEvents = "auto"
            leftColRef.current.style.transform = "translate3d(0, 0, 0)"
            leftColRef.current.style.opacity = "1"
            leftColRef.current.style.pointerEvents = "auto"
          } else if (p <= 0.3) {
            const tText = (p - 0.12) / 0.18
            const eText = power2In(tText)
            const moveOutwardVw = 6 * eText
            const opacity = 1 - eText

            rightColRef.current.style.transform = `translate3d(${moveOutwardVw}vw, 0, 0)`
            rightColRef.current.style.opacity = `${opacity}`
            rightColRef.current.style.pointerEvents =
              opacity > 0.1 ? "auto" : "none"

            leftColRef.current.style.transform = `translate3d(-${moveOutwardVw}vw, 0, 0)`
            leftColRef.current.style.opacity = `${opacity}`
            leftColRef.current.style.pointerEvents =
              opacity > 0.1 ? "auto" : "none"
          } else {
            rightColRef.current.style.opacity = "0"
            rightColRef.current.style.pointerEvents = "none"
            leftColRef.current.style.opacity = "0"
            leftColRef.current.style.pointerEvents = "none"
          }
        }
        if (mobileTopRef.current && mobileBottomRef.current) {
          if (p < 0.12) {
            mobileTopRef.current.style.opacity = "1"
            mobileTopRef.current.style.transform = "translate3d(0, 0, 0)"
            mobileBottomRef.current.style.opacity = "1"
            mobileBottomRef.current.style.transform = "translate3d(0, 0, 0)"
          } else if (p <= 0.3) {
            const tText = (p - 0.12) / 0.18
            const eText = power2In(tText)
            const opacity = 1 - eText
            mobileTopRef.current.style.opacity = `${opacity}`
            mobileTopRef.current.style.transform = `translate3d(0, -${
              15 * eText
            }px, 0)`
            mobileBottomRef.current.style.opacity = `${opacity}`
            mobileBottomRef.current.style.transform = `translate3d(0, ${
              15 * eText
            }px, 0)`
          } else {
            mobileTopRef.current.style.opacity = "0"
            mobileBottomRef.current.style.opacity = "0"
          }
        }
        if (scrollCueRef.current) {
          const cueOpacity = p < 0.08 ? 1 : Math.max(0, 1 - (p - 0.08) / 0.08)
          scrollCueRef.current.style.opacity = `${cueOpacity}`
        }
        let tiltDeg = 0
        let liftVh = 0
        let exitYPx = 0
        let wobbleZ = 0
        let driftY = 0
        let plateOpacity = 1
        let edgeOpacity = 0

        if (p < 0.12) {
          const floatOffset = p < 0.01 ? Math.sin(Date.now() / 900) * 3 : 0
          liftVh = 0
          exitYPx = floatOffset
          tiltDeg = 0
        } else {
          const tFlip = clamp01((p - 0.12) / (0.58 - 0.12))
          const eFlip = power2InOut(tFlip)
          tiltDeg = 180 * eFlip
          const tLift = clamp01((p - 0.12) / (0.38 - 0.12))
          liftVh = -4 * power2InOut(tLift)
          wobbleZ = Math.sin(tFlip * Math.PI * 1.5) * 5
          driftY = Math.sin(tFlip * Math.PI) * 8
          if (p > 0.4) {
            const tExit = clamp01((p - 0.4) / (0.64 - 0.4))
            exitYPx = -window.innerHeight * 1.35 * power2In(tExit)
          }

          if (p > 0.52) {
            plateOpacity = Math.max(0, 1 - (p - 0.52) / 0.12)
          }
        }
        if (tiltDeg >= 70 && tiltDeg <= 110) {
          edgeOpacity = Math.max(0, 1 - Math.abs(tiltDeg - 90) / 20)
        } else {
          edgeOpacity = 0
        }
        if (plateInnerRef.current) {
          plateInnerRef.current.style.willChange = willChangeVal
          plateInnerRef.current.style.transform = `translate3d(0, calc(${liftVh}vh + ${exitYPx}px), 0) rotateX(${tiltDeg}deg) rotateY(${driftY}deg) rotateZ(${wobbleZ}deg)`
          plateInnerRef.current.style.opacity = `${plateOpacity}`
        }
        if (plateEdgeRef.current) {
          plateEdgeRef.current.style.opacity = `${edgeOpacity}`
        }
        if (dottedRingRef.current) {
          const ringRot = p * 120
          const ringOpacity = Math.max(0, 1 - p * 2.5)
          dottedRingRef.current.style.transform = `translate3d(0, calc(${
            liftVh * 0.7
          }vh + ${exitYPx * 0.7}px), 0) rotate(${ringRot}deg)`
          dottedRingRef.current.style.opacity = `${ringOpacity}`
        }
        if (plateShadowRef.current) {
          const rad = (tiltDeg * Math.PI) / 180
          const scaleX = 1 + 0.45 * Math.sin(rad)
          const scaleY = Math.max(0.12, Math.cos(rad) * 0.75)
          const shadowOpacity = Math.max(
            0,
            (1 - clamp01((p - 0.1) / 0.35)) * 0.45,
          )

          plateShadowRef.current.style.transform = `scale3d(${scaleX}, ${scaleY}, 1)`
          plateShadowRef.current.style.opacity = `${shadowOpacity}`
        }
        const handoffActive = p >= 0.97
        const slots = cachedSlotsRef.current
        const handoffImages = handoffImagesRef.current

        ITEM_CONFIGS.forEach((cfg, i) => {
          const sprite = spriteRefs.current[i]
          if (!sprite) return
          sprite.style.willChange = willChangeVal
          if (handoffActive) {
            sprite.style.opacity = "0"
            sprite.style.visibility = "hidden"
            return
          }
          const eta = (1 - cfg.rNormY) / 2
          const releaseProgress = 0.22 + 0.16 * eta + cfg.jitter
          const landProgress = 0.82 + i * 0.011

          let posX = cx
          let posY = cy
          let rot = cfg.initTilt
          let scale = 1
          let opacity = 1

          if (p < releaseProgress) {
            const x0 = cfg.rNormX * R
            const y0 = cfg.rNormY * R
            const radTilt = (tiltDeg * Math.PI) / 180
            const yPrime = y0 * Math.cos(radTilt)
            const zPrime = -y0 * Math.sin(radTilt)
            const proj = dPerspective / (dPerspective - zPrime)
            let slideY = 0
            if (p > 0.14) {
              const slideNorm = (p - 0.14) / (releaseProgress - 0.14)
              slideY = 22 * slideNorm * slideNorm * Math.sin(radTilt)
            }

            const plateLiftPx = (liftVh / 100) * window.innerHeight + exitYPx
            posX = cx + x0 * proj
            posY = cy + (yPrime + slideY) * proj + plateLiftPx
            rot = cfg.initTilt + wobbleZ * 0.4
            scale = proj
          } else {
            const x0 = cfg.rNormX * R
            const y0 = cfg.rNormY * R
            const radRelease =
              (180 *
                power2InOut(clamp01((releaseProgress - 0.12) / 0.46)) *
                Math.PI) /
              180
            const yPrimeRel = y0 * Math.cos(radRelease)
            const zPrimeRel = -y0 * Math.sin(radRelease)
            const projRel = dPerspective / (dPerspective - zPrimeRel)

            const liftNormRel = clamp01((releaseProgress - 0.12) / 0.26)
            const liftRelPx =
              -4 * power2InOut(liftNormRel) * 0.01 * window.innerHeight

            const relX = cx + x0 * projRel
            const relY =
              cy + (yPrimeRel + 22 * Math.sin(radRelease)) * projRel + liftRelPx
            const relRot = cfg.initTilt
            const slot = slots[i]
            let targetX = relX
            let targetY = relY + 450
            let targetScale = 0.9

            if (slot) {
              targetX = slot.pageLeft + slot.width / 2
              targetY = slot.pageTop - scrollY + slot.height / 2
              targetScale = (slot.width * 0.8) / itemSize
            }

            if (p < landProgress) {
              const t = (p - releaseProgress) / (landProgress - releaseProgress)
              const easeY = power2In(t)
              const arcX = Math.sin(t * Math.PI) * cfg.seedArc

              posX = relX + (targetX - relX) * t + arcX
              posY = relY + (targetY - relY) * easeY
              const spinDamp = 1 - clamp01((t - 0.72) / 0.28)
              rot = relRot + cfg.seedSpin * t * spinDamp
              const midAirBulge = Math.sin(t * Math.PI) * 0.15
              scale = (1 - t) * (1 + midAirBulge) + t * targetScale
            } else {
              const bounceDuration = 0.97 - landProgress
              const tau = (p - landProgress) / bounceDuration

              let reboundY = 0
              let squashX = 1
              let squashY = 1

              if (tau < 0.45) {
                reboundY = -12 * Math.sin((tau / 0.45) * Math.PI)
                if (tau < 0.12) {
                  squashY = 0.95
                  squashX = 1.05
                }
              } else if (tau < 0.85) {
                reboundY = -5 * Math.sin(((tau - 0.45) / 0.4) * Math.PI)
                if (tau >= 0.45 && tau < 0.55) {
                  squashY = 0.97
                  squashX = 1.03
                }
              }

              posX = targetX
              posY = targetY + reboundY
              rot = 0
              scale = targetScale
              sprite.style.transform = `translate3d(${posX - itemSize / 2}px, ${posY - itemSize / 2}px, 0) scale3d(${
                scale * squashX
              }, ${scale * squashY}, 1)`
              sprite.style.opacity = "1"
              sprite.style.visibility = "visible"
              return
            }
          }
          sprite.style.transform = `translate3d(${posX - itemSize / 2}px, ${posY - itemSize / 2}px, 0) rotate(${rot}deg) scale(${scale})`
          sprite.style.opacity = `${opacity}`
          sprite.style.visibility = "visible"
        })
        if (handoffImages.length > 0) {
          const cardOpacity = handoffActive ? "1" : "0"
          handoffImages.forEach((img) => {
            if (img.style.opacity !== cardOpacity) {
              img.style.opacity = cardOpacity
            }
          })
        }
      }

      gsap.ticker.add(tickerCallback)
      tickerCallback()

      return () => {
        gsap.ticker.remove(tickerCallback)
        st.kill()
      }
    }, containerRef)

    return () => {
      if (resizeTimer) clearTimeout(resizeTimer)
      window.removeEventListener("resize", handleResize)
      ctx.revert()
    }
  }, [onProgressUpdate])

  return (
    <div ref={containerRef} className="plate-hero-container">
      {}
      <div ref={stageRef} className="plate-hero-stage">
        {}
        <div ref={mobileTopRef} className="hero-mobile-top">
          <h1 className="hero-mobile-title">
            <span className="hero-mobile-line1">اتقلب الطبق…</span>
            <span className="hero-mobile-line2">
              ونزلت <em className="accent-word">الطازة</em>
            </span>
          </h1>
        </div>

        {}
        <div className="hero-desktop-grid">
          {}
          <div
            ref={rightColRef}
            className="hero-col hero-col-right desktop-only-col"
          >
            <h1 className="hero-title-main">اتقلب الطبق…</h1>
            <p className="hero-supporting-line">
              خضار وفاكهة، مغسولة ومتقطّعة على مزاجك… جاهزة للطبخ.
            </p>
            <div className="hero-cta-actions">
              <Link href="#shop" className="hero-primary-cta">
                <span>تسوّق الآن</span>
                <ArrowLeft size={18} />
              </Link>
              <Link href="#categories" className="hero-text-link">
                شوف الأقسام
              </Link>
            </div>
          </div>

          {}
          <div className="hero-col hero-col-center">
            <div ref={plate3dWrapRef} className="plate-3d-wrap">
              {}
              <div ref={plateShadowRef} className="plate-floor-shadow" />

              {}
              <div ref={dottedRingRef} className="plate-dotted-ring">
                <span className="ring-leaf ring-leaf-1">🍃</span>
                <span className="ring-leaf ring-leaf-2">🌿</span>
                <span className="ring-leaf ring-leaf-3">🌱</span>
              </div>

              {}
              <div ref={plateInnerRef} className="plate-3d-inner">
                {}
                <div className="plate-face plate-face-front">
                  <Image
                    src="/plate-top.webp"
                    alt="طبق الخضار الطازج من نور فارم"
                    fill
                    sizes="(max-width: 1024px) 78vw, 40vw"
                    priority
                    className="plate-img"
                  />
                </div>

                {}
                <div
                  ref={plateEdgeRef}
                  className="plate-rim-edge"
                  aria-hidden="true"
                />

                {}
                <div className="plate-face plate-face-back">
                  <Image
                    src="/plate-back.webp"
                    alt="ظهر طبق الخضار"
                    fill
                    sizes="(max-width: 1024px) 78vw, 40vw"
                    priority
                    className="plate-img"
                  />
                </div>
              </div>
            </div>
          </div>

          {}
          <div
            ref={leftColRef}
            className="hero-col hero-col-left desktop-only-col"
          >
            <div className="hero-punchline">
              <span>ونزلت</span> <span className="accent-word">الطازة</span>
            </div>
          </div>
        </div>

        {}
        <div ref={mobileBottomRef} className="hero-mobile-bottom">
          <p className="hero-mobile-desc">
            خضار وفاكهة، مغسولة ومتقطّعة على مزاجك… جاهزة للطبخ.
          </p>
          <div className="hero-cta-actions">
            <Link href="#shop" className="hero-primary-cta">
              <span>تسوّق الآن</span>
              <ArrowLeft size={18} />
            </Link>
          </div>
        </div>
      </div>

      {}
      <div className="hero-sprites-overlay" aria-hidden="true">
        {ITEM_CONFIGS.map((item, idx) => (
          <div
            key={item.id}
            ref={(el) => {
              spriteRefs.current[idx] = el
            }}
            className="hero-falling-sprite"
            data-item-id={item.id}
          >
            <Image
              src={item.image}
              alt={item.name}
              fill
              sizes="(max-width: 1024px) 25vw, 12vw"
              className="produce-sprite-img"
              priority
            />
          </div>
        ))}
      </div>
    </div>
  )
}
