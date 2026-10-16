"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

export interface ItemConfig {
  id: string
  name: string
  image: string
  department: "vegetables" | "fruits"
  slotIndex: number
  rNormX: number
  rNormY: number
  initTilt: number
  seedSpin: number
  seedArc: number
  jitter: number
}

export const ITEM_CONFIGS: ItemConfig[] = [
  // 6 VEGETABLES -> Arc and fall into Right Card ("قسم الخضار")
  {
    id: "bell-pepper",
    name: "فلفل ألوان",
    image: "/bell-pepper.webp",
    department: "vegetables",
    slotIndex: 0,
    rNormX: 0.096,
    rNormY: 0.542,
    initTilt: 14,
    seedSpin: 45,
    seedArc: 30,
    jitter: -0.005,
  },
  {
    id: "tomato",
    name: "طماطم بلدي",
    image: "/tomato.webp",
    department: "vegetables",
    slotIndex: 1,
    rNormX: -0.389,
    rNormY: 0.389,
    initTilt: -12,
    seedSpin: 55,
    seedArc: 40,
    jitter: 0.002,
  },
  {
    id: "cucumber",
    name: "خيار بلدي",
    image: "/cucumber.webp",
    department: "vegetables",
    slotIndex: 2,
    rNormX: 0.498,
    rNormY: 0.232,
    initTilt: 22,
    seedSpin: -60,
    seedArc: 25,
    jitter: -0.003,
  },
  {
    id: "basil",
    name: "ريحان طازج",
    image: "/basil.webp",
    department: "vegetables",
    slotIndex: 3,
    rNormX: 0.188,
    rNormY: -0.068,
    initTilt: 26,
    seedSpin: 70,
    seedArc: 35,
    jitter: 0.003,
  },
  {
    id: "carrot",
    name: "جزر أصفر",
    image: "/carrot.webp",
    department: "vegetables",
    slotIndex: 4,
    rNormX: -0.164,
    rNormY: -0.115,
    initTilt: 30,
    seedSpin: 80,
    seedArc: 30,
    jitter: -0.004,
  },
  {
    id: "broccoli",
    name: "بروكلي أخضر",
    image: "/broccoli.webp",
    department: "vegetables",
    slotIndex: 5,
    rNormX: 0.142,
    rNormY: -0.531,
    initTilt: -6,
    seedSpin: 30,
    seedArc: 20,
    jitter: -0.003,
  },

  // 4 FRUITS -> Arc and fall into Left Card ("قسم الفاكهة")
  {
    id: "avocado",
    name: "أفوكادو هاس",
    image: "/avocado.webp",
    department: "fruits",
    slotIndex: 0,
    rNormX: -0.017,
    rNormY: 0.199,
    initTilt: -8,
    seedSpin: -40,
    seedArc: -25,
    jitter: 0.004,
  },
  {
    id: "lemon",
    name: "ليمون بلدي",
    image: "/lemon.webp",
    department: "fruits",
    slotIndex: 1,
    rNormX: -0.548,
    rNormY: -0.048,
    initTilt: -16,
    seedSpin: -50,
    seedArc: -35,
    jitter: -0.002,
  },
  {
    id: "orange",
    name: "برتقال أبو سرة",
    image: "/orange.webp",
    department: "fruits",
    slotIndex: 2,
    rNormX: 0.498,
    rNormY: -0.232,
    initTilt: 16,
    seedSpin: 60,
    seedArc: -30,
    jitter: 0.002,
  },
  {
    id: "pomegranate",
    name: "رمان بلدي",
    image: "/pomegranate.webp",
    department: "fruits",
    slotIndex: 3,
    rNormX: -0.354,
    rNormY: -0.421,
    initTilt: -14,
    seedSpin: -55,
    seedArc: -40,
    jitter: 0.005,
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
  cx: number
  cy: number
  width: number
  height: number
}

interface PlateFlipHeroProps {
  onProgressUpdate?: (p: number) => void
}

export default function PlateFlipHero({ onProgressUpdate }: PlateFlipHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const centerBrandRef = useRef<HTMLDivElement>(null)
  const vegCardRef = useRef<HTMLAnchorElement>(null)
  const fruitCardRef = useRef<HTMLAnchorElement>(null)
  const scrollCueRef = useRef<HTMLDivElement>(null)
  const plate3dWrapRef = useRef<HTMLDivElement>(null)
  const plateInnerRef = useRef<HTMLDivElement>(null)
  const plateShadowRef = useRef<HTMLDivElement>(null)
  const plateEdgeRef = useRef<HTMLDivElement>(null)
  const dottedRingRef = useRef<HTMLDivElement>(null)
  const spriteRefs = useRef<(HTMLDivElement | null)[]>([])
  const progressRef = useRef<number>(0)
  const cachedSlotsRef = useRef<CachedSlot[]>([])
  const plateCenterRef = useRef<{ cx: number; cy: number; diam: number }>({
    cx: 720,
    cy: 450,
    diam: 440,
  })

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    const container = containerRef.current
    const stage = stageRef.current
    if (!container || !stage) return

    // ─────────────────────────────────────────────────────────────
    // CACHE SLOT & PLATE MEASUREMENTS OUTSIDE SCROLL LOOP
    // ─────────────────────────────────────────────────────────────
    const measureLayout = () => {
      if (!stageRef.current) return
      const sRect = stageRef.current.getBoundingClientRect()

      if (plate3dWrapRef.current) {
        const pRect = plate3dWrapRef.current.getBoundingClientRect()
        plateCenterRef.current = {
          cx: pRect.left - sRect.left + pRect.width / 2,
          cy: pRect.top - sRect.top + pRect.height / 2,
          diam: pRect.width,
        }
      }

      const slots: CachedSlot[] = []
      ITEM_CONFIGS.forEach((cfg) => {
        const id =
          cfg.department === "vegetables"
            ? `veg-slot-${cfg.slotIndex}`
            : `fruit-slot-${cfg.slotIndex}`
        const el = document.getElementById(id)
        if (el) {
          const r = el.getBoundingClientRect()
          slots.push({
            cx: r.left - sRect.left + r.width / 2,
            cy: r.top - sRect.top + r.height / 2,
            width: r.width,
            height: r.height,
          })
        } else {
          // Fallback approximate position if element not yet rendered
          const isVeg = cfg.department === "vegetables"
          slots.push({
            cx: isVeg ? sRect.width * 0.8 : sRect.width * 0.2,
            cy: sRect.height * 0.65,
            width: 48,
            height: 48,
          })
        }
      })
      cachedSlotsRef.current = slots
    }

    measureLayout()
    let resizeTimer: NodeJS.Timeout
    const handleResize = () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(measureLayout, 150)
    }
    window.addEventListener("resize", handleResize, { passive: true })
    if (document.fonts) {
      document.fonts.ready.then(measureLayout).catch(() => {})
    }

    // ─────────────────────────────────────────────────────────────
    // MASTER SCROLLTRIGGER OVER 170vh
    // ─────────────────────────────────────────────────────────────
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
          if (onProgressUpdate) onProgressUpdate(self.progress)
        },
      })

      // ─────────────────────────────────────────────────────────────
      // HIGH PERFORMANCE TICKER: ZERO DOM READS
      // ─────────────────────────────────────────────────────────────
      const tickerCallback = () => {
        const p = progressRef.current
        const willChangeVal = p > 0.005 && p < 0.995 ? "transform" : "auto"
        const { cx, cy, diam } = plateCenterRef.current
        const R = diam / 2
        const dPerspective = 1400
        const itemSize = Math.max(38, Math.min(diam * 0.24, 76))

        // 1. Center brand headline fade & gentle scale
        if (centerBrandRef.current) {
          const brandOpacity = Math.max(0, 1 - p * 2.2)
          const brandY = -p * 25
          centerBrandRef.current.style.opacity = `${brandOpacity}`
          centerBrandRef.current.style.transform = `translate3d(0, ${brandY}px, 0)`
        }

        // 2. Scroll cue fade out
        if (scrollCueRef.current) {
          const cueOpacity = Math.max(0, 1 - p * 5)
          scrollCueRef.current.style.opacity = `${cueOpacity}`
        }

        // 3. Department cards subtle reaction
        if (vegCardRef.current && fruitCardRef.current) {
          // As produce lands (p > 0.65), cards highlight slightly
          const activeScale = p >= 0.75 ? 1.02 : 1
          vegCardRef.current.style.transform = `scale3d(${activeScale}, ${activeScale}, 1)`
          fruitCardRef.current.style.transform = `scale3d(${activeScale}, ${activeScale}, 1)`
        }

        // 4. Plate 3D transforms
        let tiltDeg = 0
        let liftVh = 0
        let wobbleZ = 0
        let driftY = 0
        let exitYPx = 0
        let plateOpacity = 1

        if (p < 0.15) {
          const floatTau = p / 0.15
          tiltDeg = Math.sin(floatTau * Math.PI) * 2
          liftVh = -0.5 * Math.sin(floatTau * Math.PI)
        } else if (p <= 0.6) {
          const tNorm = (p - 0.15) / 0.45
          const easeNorm = power2InOut(tNorm)
          tiltDeg = 180 * easeNorm

          const liftNorm = clamp01((p - 0.15) / 0.26)
          liftVh = -4 * power2InOut(liftNorm)
          wobbleZ = Math.sin(tNorm * Math.PI * 1.5) * -6
          driftY = Math.sin(tNorm * Math.PI) * 7

          if (p > 0.4) {
            const exitNorm = (p - 0.4) / 0.2
            exitYPx = -power2In(exitNorm) * 0.6 * window.innerHeight
            plateOpacity = Math.max(0, 1 - exitNorm * 1.1)
          }
        } else {
          tiltDeg = 180
          liftVh = -4
          exitYPx = -0.6 * window.innerHeight
          plateOpacity = 0
        }

        if (plateInnerRef.current) {
          plateInnerRef.current.style.willChange = willChangeVal
          plateInnerRef.current.style.transform = `translate3d(0, ${liftVh}vh, 0) translateY(${exitYPx}px) rotateX(${tiltDeg}deg) rotateZ(${wobbleZ}deg) rotateY(${driftY}deg)`
          plateInnerRef.current.style.opacity = `${plateOpacity}`
        }

        if (plateEdgeRef.current) {
          const edgeOpacity =
            tiltDeg >= 70 && tiltDeg <= 110
              ? 1 - Math.abs(tiltDeg - 90) / 20
              : 0
          plateEdgeRef.current.style.opacity = `${edgeOpacity}`
        }

        if (dottedRingRef.current) {
          dottedRingRef.current.style.transform = `rotate(${p * 45}deg)`
          dottedRingRef.current.style.opacity = `${plateOpacity}`
        }

        if (plateShadowRef.current) {
          const rad = (tiltDeg * Math.PI) / 180
          const scaleX = 1 + 0.4 * Math.sin(rad)
          const scaleY = Math.max(0.12, Math.cos(rad) * 0.75)
          const shadowOpacity = Math.max(0, (1 - clamp01((p - 0.1) / 0.35)) * 0.45)
          plateShadowRef.current.style.transform = `scale3d(${scaleX}, ${scaleY}, 1)`
          plateShadowRef.current.style.opacity = `${shadowOpacity}`
        }

        // 5. Produce Sprites Physics: deterministic fall into department slots
        const slots = cachedSlotsRef.current

        ITEM_CONFIGS.forEach((cfg, i) => {
          const sprite = spriteRefs.current[i]
          if (!sprite) return
          sprite.style.willChange = willChangeVal

          const eta = (1 - cfg.rNormY) / 2
          const releaseProgress = 0.18 + 0.14 * eta + cfg.jitter
          const landProgress = 0.68 + i * 0.015

          let posX = cx
          let posY = cy
          let rot = cfg.initTilt
          let scale = 1
          let opacity = 1

          if (p < releaseProgress) {
            // Mounted on 3D plate
            const x0 = cfg.rNormX * R
            const y0 = cfg.rNormY * R
            const radTilt = (tiltDeg * Math.PI) / 180
            const yPrime = y0 * Math.cos(radTilt)
            const zPrime = -y0 * Math.sin(radTilt)
            const proj = dPerspective / (dPerspective - zPrime)

            let slideY = 0
            if (p > 0.14) {
              const slideNorm = (p - 0.14) / (releaseProgress - 0.14)
              slideY = 20 * slideNorm * slideNorm * Math.sin(radTilt)
            }

            const plateLiftPx = (liftVh / 100) * window.innerHeight + exitYPx
            posX = cx + x0 * proj
            posY = cy + (yPrime + slideY) * proj + plateLiftPx
            rot = cfg.initTilt + wobbleZ * 0.4
            scale = proj
          } else {
            // Released from plate
            const x0 = cfg.rNormX * R
            const y0 = cfg.rNormY * R
            const radRelease =
              (180 *
                power2InOut(clamp01((releaseProgress - 0.15) / 0.45)) *
                Math.PI) /
              180
            const yPrimeRel = y0 * Math.cos(radRelease)
            const zPrimeRel = -y0 * Math.sin(radRelease)
            const projRel = dPerspective / (dPerspective - zPrimeRel)

            const liftNormRel = clamp01((releaseProgress - 0.15) / 0.26)
            const liftRelPx = -4 * power2InOut(liftNormRel) * 0.01 * window.innerHeight

            const relX = cx + x0 * projRel
            const relY =
              cy + (yPrimeRel + 20 * Math.sin(radRelease)) * projRel + liftRelPx
            const relRot = cfg.initTilt

            const slot = slots[i]
            let targetX = relX
            let targetY = relY + 300
            let targetScale = 0.85

            if (slot) {
              targetX = slot.cx
              targetY = slot.cy
              targetScale = Math.min(1, (slot.width * 0.82) / itemSize)
            }

            if (p < landProgress) {
              // In flight: arc towards department slot
              const t = (p - releaseProgress) / (landProgress - releaseProgress)
              const easeY = power2In(t)
              const arcX = Math.sin(t * Math.PI) * cfg.seedArc

              posX = relX + (targetX - relX) * t + arcX
              posY = relY + (targetY - relY) * easeY

              const spinDamp = 1 - clamp01((t - 0.7) / 0.3)
              rot = relRot + cfg.seedSpin * t * spinDamp
              const midAirBulge = Math.sin(t * Math.PI) * 0.14
              scale = (1 - t) * (1 + midAirBulge) + t * targetScale
            } else {
              // Landed in department card: damped rebounds & squash
              const bounceDuration = 0.95 - landProgress
              const tau = (p - landProgress) / Math.max(0.01, bounceDuration)

              let reboundY = 0
              let squashX = 1
              let squashY = 1

              if (tau < 0.45) {
                reboundY = -8 * Math.sin((tau / 0.45) * Math.PI)
                if (tau < 0.12) {
                  squashY = 0.95
                  squashX = 1.05
                }
              } else if (tau < 0.85) {
                reboundY = -3 * Math.sin(((tau - 0.45) / 0.4) * Math.PI)
              }

              posX = targetX
              posY = targetY + reboundY
              rot = 0
              scale = targetScale

              sprite.style.transform = `translate3d(${posX - itemSize / 2}px, ${
                posY - itemSize / 2
              }px, 0) scale3d(${scale * squashX}, ${scale * squashY}, 1)`
              sprite.style.opacity = "1"
              sprite.style.visibility = "visible"
              return
            }
          }

          sprite.style.transform = `translate3d(${posX - itemSize / 2}px, ${
            posY - itemSize / 2
          }px, 0) rotate(${rot}deg) scale(${scale})`
          sprite.style.opacity = `${opacity}`
          sprite.style.visibility = "visible"
        })
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
      {/* 100vh Sticky Stage */}
      <div ref={stageRef} className="plate-hero-stage">
        {/* DESKTOP 3-COLUMN GRID (Right: Vegetables | Center: Brand + Plate | Left: Fruits) */}
        <div className="hero-desktop-grid">
          {/* COLUMN 1 (RTL Right): Department Card for Vegetables */}
          <div className="hero-col">
            <Link
              href="/vegetables"
              ref={vegCardRef}
              className="hero-dept-card hero-dept-veg"
              aria-label="الانتقال إلى قسم الخضار"
            >
              <div className="dept-card-header">
                <span className="dept-badge dept-badge-veg">القسم الأول</span>
                <span className="text-xl" aria-hidden="true">
                  🥦
                </span>
              </div>
              <div className="dept-card-title-group">
                <h2 className="dept-card-title">قسم الخضار</h2>
                <p className="dept-card-desc">
                  خضار بلدي، ورقيات، وتجهيز فوري لمطبخك
                </p>
              </div>
              <div className="dept-sections-pills">
                <span className="dept-section-pill">خضار طازج</span>
                <span className="dept-section-pill">الخضرة</span>
                <span className="dept-section-pill">جاهز للطبخ</span>
                <span className="dept-section-pill">السلطات</span>
              </div>

              {/* 6 Landing Slots for Vegetables */}
              <div
                className="dept-landing-tray dept-landing-tray-veg"
                aria-label="أصناف قسم الخضار"
              >
                {ITEM_CONFIGS.filter((c) => c.department === "vegetables").map(
                  (item) => (
                    <div
                      key={item.id}
                      id={`veg-slot-${item.slotIndex}`}
                      className="dept-landing-slot"
                      title={item.name}
                    >
                      <span className="dept-landing-slot-label">
                        {item.name}
                      </span>
                    </div>
                  ),
                )}
              </div>

              <div className="dept-card-cta dept-cta-veg">
                <span>تصفّح قسم الخضار</span>
                <ArrowLeft size={16} />
              </div>
            </Link>
          </div>

          {/* COLUMN 2 (Center): Centered Brand Emblem + "اختار قسمك" + 3D Plate */}
          <div className="hero-col hero-col-center">
            {/* Centered Large Logo + Title */}
            <div ref={centerBrandRef} className="hero-center-brand">
              <div className="hero-large-logo-wrap">
                <Image
                  src="/logo-icon.png"
                  alt="شعار نور فارم"
                  width={88}
                  height={88}
                  className="hero-large-logo-img"
                  priority
                />
              </div>
              <span className="hero-brand-name">NOOR FARM • نور فارم</span>
              <h1 className="hero-main-heading">
                <span>اختار</span>{" "}
                <span className="text-emerald-700">قسمك</span>
              </h1>
              <p className="hero-sub-statement">
                خضار وفاكهة طازجة، مغسولة ومتقطّعة على طلبك… جاهزة لمطبخك
              </p>
            </div>

            {/* The 3D Plate Architecture */}
            <div ref={plate3dWrapRef} className="plate-3d-wrap">
              {/* Floor Shadow Ellipse */}
              <div ref={plateShadowRef} className="plate-floor-shadow" />

              {/* Dotted Halo Ring with Leaves */}
              <div ref={dottedRingRef} className="plate-dotted-ring">
                <span className="ring-leaf ring-leaf-1">🍃</span>
                <span className="ring-leaf ring-leaf-2">🌿</span>
                <span className="ring-leaf ring-leaf-3">🌱</span>
              </div>

              {/* 3D Flip Inner (preserve-3d) */}
              <div ref={plateInnerRef} className="plate-3d-inner">
                {/* Front Face: plate-top.webp */}
                <div className="plate-face plate-face-front">
                  <Image
                    src="/plate-top.webp"
                    alt="طبق الخضار والفاكهة الطازج من نور فارم"
                    fill
                    sizes="(max-width: 1024px) 78vw, 36vw"
                    priority
                    className="plate-img"
                  />
                </div>

                {/* Plate Thickness Rim Edge */}
                <div
                  ref={plateEdgeRef}
                  className="plate-rim-edge"
                  aria-hidden="true"
                />

                {/* Back Face: plate-back.webp */}
                <div className="plate-face plate-face-back">
                  <Image
                    src="/plate-back.webp"
                    alt="ظهر طبق الخضار"
                    fill
                    sizes="(max-width: 1024px) 78vw, 36vw"
                    priority
                    className="plate-img"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* COLUMN 3 (RTL Left): Department Card for Fruits */}
          <div className="hero-col">
            <Link
              href="/fruits"
              ref={fruitCardRef}
              className="hero-dept-card hero-dept-fruit"
              aria-label="الانتقال إلى قسم الفاكهة"
            >
              <div className="dept-card-header">
                <span className="dept-badge dept-badge-fruit">القسم الثاني</span>
                <span className="text-xl" aria-hidden="true">
                  🍊
                </span>
              </div>
              <div className="dept-card-title-group">
                <h2 className="dept-card-title">قسم الفاكهة</h2>
                <p className="dept-card-desc">
                  فواكه منتقاة بعناية، مقطعة وطازجة بأعلى جودة
                </p>
              </div>
              <div className="dept-sections-pills">
                <span className="dept-section-pill">فواكه طازجة</span>
                <span className="dept-section-pill">فواكه مقطعة</span>
                <span className="dept-section-pill text-amber-800">ميكسات (قريباً)</span>
              </div>

              {/* 4 Landing Slots for Fruits */}
              <div
                className="dept-landing-tray dept-landing-tray-fruit"
                aria-label="أصناف قسم الفاكهة"
              >
                {ITEM_CONFIGS.filter((c) => c.department === "fruits").map(
                  (item) => (
                    <div
                      key={item.id}
                      id={`fruit-slot-${item.slotIndex}`}
                      className="dept-landing-slot"
                      title={item.name}
                    >
                      <span className="dept-landing-slot-label">
                        {item.name}
                      </span>
                    </div>
                  ),
                )}
              </div>

              <div className="dept-card-cta dept-cta-fruit">
                <span>تصفّح قسم الفاكهة</span>
                <ArrowLeft size={16} />
              </div>
            </Link>
          </div>
        </div>

        {/* Scroll Cue at Bottom */}
        <div ref={scrollCueRef} className="hero-scroll-cue" aria-hidden="true">
          <span>مرّر لأسفل لمشاهدة التفاصيل</span>
          <span className="cue-arrow-icon">↓</span>
        </div>
      </div>

      {/* 10 Animated Produce Sprites: Fixed Viewport Overlay */}
      <div className="hero-sprites-overlay" aria-hidden="true">
        {ITEM_CONFIGS.map((item, idx) => (
          <div
            key={item.id}
            ref={(el) => {
              spriteRefs.current[idx] = el
            }}
            className="hero-falling-sprite"
            data-item-id={item.id}
            data-department={item.department}
          >
            <Image
              src={item.image}
              alt={item.name}
              fill
              sizes="(max-width: 1024px) 20vw, 10vw"
              className="produce-sprite-img"
              priority
            />
          </div>
        ))}
      </div>
    </div>
  )
}
