"use client"
// Light reveal tied to scroll: stagger up from y: 35 to y: 0, opacity 0 to 1
/* Section Heading */ /* 5 Tiles Grid */

import { useEffect, useRef } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Carrot,
  Apple,
  Salad,
  Utensils,
  Sparkles,
} from "lucide-react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

const CATEGORIES = [
  {
    name: "خضار طازج",
    subtitle: "طماطم، خيار، فلفل، بروكلي",
    icon: Carrot,
    count: "٦٠+ صنف",
    color: "#2e7d32",
    bg: "#eef6ee",
  },
  {
    name: "فواكه طازجة",
    subtitle: "برتقال، رمان، ليمون، تفاح",
    icon: Apple,
    count: "٤٥+ صنف",
    color: "#d8402f",
    bg: "#fef0ee",
  },
  {
    name: "الخضرة",
    subtitle: "ريحان، نعناع، بقدونس، جرجير",
    icon: Sparkles,
    count: "٣٠+ صنف",
    color: "#1e3322",
    bg: "#edf4ec",
  },
  {
    name: "جاهز للطبخ",
    subtitle: "مغسول ومتقطّع ومفرغ هواء",
    icon: Utensils,
    count: "٥٠+ صنف",
    color: "#e65100",
    bg: "#fff3e0",
  },
  {
    name: "السلطات",
    subtitle: "خلطات سلطة يومية مقرمشة",
    icon: Salad,
    count: "٢٥+ صنف",
    color: "#2e7d32",
    bg: "#edf7ed",
  },
]

export default function CategoriesSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const tilesRef = useRef<(HTMLAnchorElement | null)[]>([])

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    const section = sectionRef.current
    if (!section) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        tilesRef.current.filter(Boolean),
        {
          y: 40,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          stagger: 0.08,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: {
            trigger: section,
            start: "top 78%",
            end: "top 45%",
            scrub: 0.6,
          },
        },
      )
    }, sectionRef)

    return () => {
      ctx.revert()
    }
  }, [])

  return (
    <section className="categories-section" id="categories" ref={sectionRef}>
      <div className="categories-container">
        {}
        <div className="category-heading">
          <span className="eyebrow">منين تحب تبدأ؟</span>
          <h2>تسوّق حسب القسم</h2>
        </div>

        {}
        <div className="categories-grid-5">
          {CATEGORIES.map((cat, idx) => {
            const IconComponent = cat.icon
            const numStr = (idx + 1).toLocaleString("ar-EG", {
              minimumIntegerDigits: 2,
            })

            return (
              <Link
                key={cat.name}
                ref={(el) => {
                  tilesRef.current[idx] = el
                }}
                href={`/products?category=${encodeURIComponent(cat.name)}`}
                className="category-card-tile"
                style={
                  {
                    "--tile-accent": cat.color,
                    "--tile-bg": cat.bg,
                  } as React.CSSProperties
                }
              >
                <div className="tile-top-row">
                  <span className="tile-index-badge">{numStr}</span>
                  <div className="tile-icon-bubble">
                    <IconComponent size={22} />
                  </div>
                </div>

                <div className="tile-body">
                  <h3 className="tile-title">{cat.name}</h3>
                  <p className="tile-subtitle">{cat.subtitle}</p>
                </div>

                <div className="tile-footer">
                  <span className="tile-count">{cat.count}</span>
                  <span className="tile-arrow">
                    <ArrowLeft size={16} />
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
