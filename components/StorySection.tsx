"use client"

// Pure math calculations per scene (no layout reads or setState)
// Scene 1: range [0.00, 0.35]
// Scene 2: range [0.33, 0.69]
// Scene 3: range [0.67, 1.00]
// First scene fades out near its end
// Last scene fades in near its start
// Middle scene fades in and fades out

// Image scale: 1.08 -> 1.00 as progress moves through the scene

// Copy subtle slide up

// Cut labels sequential lighting in Scene 2
// 3 stages: 0.38, 0.48, 0.58
/* 100vh Sticky Stage */ /* Background Image Container (Scale 1.08 -> 1.00) */ /* Gradient Overlays for perfect legibility */ /* Arabic Copy Text Container */ /* Cut Scene: 3 Dynamic Cut Type Labels */ /* Ready Scene: CTA Button */

import { useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Sparkles } from "lucide-react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

export interface StorySceneData {
  id: string
  phaseNumber: string
  phaseTitle: string
  headline: string
  accentWord: string
  subline: string
  image: string
  range: [number, number]
  cutLabels?: string[]
  ctaText?: string
  ctaHref?: string
}

export const STORY_SCENES: StorySceneData[] = [
  {
    id: "wash",
    phaseNumber: "٠١",
    phaseTitle: "الغسيل والتطهير",
    headline: "بنغسلها",
    accentWord: "بعناية",
    subline:
      "بمياه مفلترة معقمة تزيل كل الأتربة والشوائب، مع الحفاظ الكامل على قرمشة ونضارة الخضار الطبيعية.",
    image: "/scenes/wash.jpg",
    range: [0.0, 0.35],
  },
  {
    id: "cut",
    phaseNumber: "٠٢",
    phaseTitle: "التقطيع الاحترافي",
    headline: "ونقطّعها زي ما",
    accentWord: "تحب",
    subline:
      "تقطيع يدوي دقيق بمقاسات متناسقة تناسب كل أكلاتك المفضلة، يوفر وقت التحضير في المطبخ.",
    image: "/scenes/cut.jpg",
    range: [0.33, 0.69],
    cutLabels: ["حلقات", "صوابع", "مكعبات"],
  },
  {
    id: "ready",
    phaseNumber: "٠٣",
    phaseTitle: "التعبئة والجاهزية",
    headline: "جاهزة للطبخ… أو",
    accentWord: "للسلطة",
    subline:
      "معبأة في أطباق مفرغة من الهواء ومبردة، افتح العلبة وابدأ الطبخ فوراً بدون أي تعب.",
    image: "/scenes/ready.jpg",
    range: [0.67, 1.0],
    ctaText: "تسوّق الخضار المجهّز",
    ctaHref: "/vegetables/ready-vegetables",
  },
]

export default function StorySection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const sceneLayersRef = useRef<(HTMLDivElement | null)[]>([])
  const sceneImagesRef = useRef<(HTMLDivElement | null)[]>([])
  const sceneCopiesRef = useRef<(HTMLDivElement | null)[]>([])
  const cutPillsRef = useRef<(HTMLSpanElement | null)[]>([])

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    const container = containerRef.current
    const stage = stageRef.current
    if (!container || !stage) return

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: container,
        start: "top top",
        end: "bottom bottom",
        pin: stage,
        scrub: true,
        anticipatePin: 1,
        onUpdate: (self) => {
          const p = self.progress
          STORY_SCENES.forEach((scene, i) => {
            const layer = sceneLayersRef.current[i]
            const imgWrap = sceneImagesRef.current[i]
            const copy = sceneCopiesRef.current[i]
            if (!layer || !imgWrap || !copy) return

            const [start, end] = scene.range
            const overlap = 0.04

            let opacity = 0
            let active = false

            if (
              p >=
                start &&
              p <=
                end
            ) {
              active = true
              if (
                i ===
                0
              ) {
                opacity = p > end - overlap ? (end - p) / overlap : 1
              } else if (i === STORY_SCENES.length - 1) {
                opacity = p < start + overlap ? (p - start) / overlap : 1
              } else {
                if (p < start + overlap) {
                  opacity = (p - start) / overlap
                } else if (p > end - overlap) {
                  opacity = (end - p) / overlap
                } else {
                  opacity = 1
                }
              }
            } else if (
              i ===
                0 &&
              p <
                start
            ) {
              opacity = 1
              active = true
            } else if (
              i === STORY_SCENES.length - 1 &&
              p >
                end
            ) {
              opacity = 1
              active = true
            }
            const sceneLocalProgress = Math.max(
              0,
              Math.min(1, (p - start) / (end - start)),
            )
            const scale = 1.08 - sceneLocalProgress * 0.08

            layer.style.opacity = `${opacity}`
            layer.style.visibility =
              opacity >
              0.01
                ? "visible"
                : "hidden"
            imgWrap.style.transform = `scale(${scale})`
            const copyY = (1 - opacity) * 14
            copy.style.transform = `translate3d(0, ${copyY}px, 0)`
            if (
              scene.id ===
                "cut" &&
              scene.cutLabels
            ) {
              const thresholds = [0.38, 0.48, 0.58]
              cutPillsRef.current.forEach((pill, pillIdx) => {
                if (!pill) return
                const isLit = p >= thresholds[pillIdx]
                if (isLit) {
                  pill.classList.add("cut-label-active")
                } else {
                  pill.classList.remove("cut-label-active")
                }
              })
            }
          })
        },
      })
    }, containerRef)

    return () => {
      ctx.revert()
    }
  }, [])

  return (
    <section
      ref={containerRef}
      className="story-pinned-container"
      id="story"
      aria-label="رحلة الخضار في نور فارم"
    >
      {}
      <div ref={stageRef} className="story-stage">
        {STORY_SCENES.map((scene, idx) => (
          <div
            key={scene.id}
            ref={(el) => {
              sceneLayersRef.current[idx] = el
            }}
            className={`story-scene-layer story-scene-${scene.id}`}
            style={{
              opacity: idx === 0 ? 1 : 0,
              visibility: idx === 0 ? "visible" : "hidden",
            }}
            aria-hidden={idx !== 0}
          >
            {}
            <div
              ref={(el) => {
                sceneImagesRef.current[idx] = el
              }}
              className="story-bg-img-wrap"
            >
              <Image
                src={scene.image}
                alt={scene.headline}
                fill
                sizes="100vw"
                className="story-full-img"
                priority
              />
            </div>

            {}
            <div className="story-shade-overlay" aria-hidden="true" />

            {}
            <div
              ref={(el) => {
                sceneCopiesRef.current[idx] = el
              }}
              className="story-copy-content"
            >
              <div className="story-phase-pill">
                <span className="phase-badge">{scene.phaseNumber}</span>
                <span className="phase-sep" />
                <span className="phase-text">{scene.phaseTitle}</span>
              </div>

              <h2 className="story-scene-title">
                {scene.headline}{" "}
                <span className="accent-word">{scene.accentWord}</span>
              </h2>

              <p className="story-scene-desc">{scene.subline}</p>

              {}
              {scene.cutLabels && (
                <div className="story-cut-labels-wrap">
                  <span className="cut-labels-title">خيارات التقطيع:</span>
                  <div className="cut-labels-group">
                    {scene.cutLabels.map((lbl, lIdx) => (
                      <span
                        key={lbl}
                        ref={(el) => {
                          cutPillsRef.current[lIdx] = el
                        }}
                        className="cut-type-pill"
                      >
                        <Sparkles size={13} className="cut-sparkle" />
                        {lbl}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {}
              {scene.ctaText && scene.ctaHref && (
                <div className="story-cta-actions">
                  <Link href={scene.ctaHref} className="story-action-btn">
                    <span>{scene.ctaText}</span>
                    <ArrowLeft size={18} />
                  </Link>
                  <span className="story-trust-note">
                    توصيل في سيارات مبردة خلال ساعات
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
