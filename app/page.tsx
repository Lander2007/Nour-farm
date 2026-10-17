import React from "react"
import Link from "next/link"
import Image from "next/image"
import type { Metadata } from "next"
import Header from "@/components/Header"
import SlimFooter from "@/components/SlimFooter"
import { getPublicSettings } from "@/lib/db"

export const metadata: Metadata = {
  title: "نور فارم | نور بيتك بالطازج",
  description: "خضار وفاكهة طازجة تُنتقى يومياً بالواحدة من المزرعة مباشرة.",
}

export default async function HomePage() {
  const settings = await getPublicSettings()
  const enabledAreas = settings.serviceAreas
    .filter((a) => a.enabled)
    .map((a) => a.name)

  return (
    <div className="home-viewport-container" dir="rtl">
      {/* 1. Header with logo */}
      <Header solid />

      {/* 2. Center Column */}
      <main className="home-center-content">
        {/* (a) Real Noor Farm Logo with slow rotating dotted leaf ring */}
        <div className="home-logo-wrap">
          <div className="logo-dotted-ring" aria-hidden="true">
            <span className="ring-leaf ring-leaf-1">🍃</span>
            <span className="ring-leaf ring-leaf-2">🌿</span>
            <span className="ring-leaf ring-leaf-3">🌱</span>
          </div>

          <Image
            src="/brand/logo.png"
            alt="شعار نور فارم"
            width={320}
            height={320}
            priority
            className="home-logo-img"
          />
        </div>

        {/* (b) Exact Slogan: "نور بيتك بالطازج" */}
        <h1 className="home-slogan">
          نور بيتك <span className="accent-word">بالطازج</span>
        </h1>

        {/* (c) 3 Big Tiles */}
        <div className="home-tiles-grid" role="navigation" aria-label="أقسام المتجر">
          {/* Tile 1: Vegetables */}
          <Link
            href="/vegetables"
            className="home-tile home-tile-veg home-tile-1"
            aria-label="قسم الخضار"
          >
            <span className="home-tile-title">قسم الخضار</span>
            <div className="home-tile-visual" aria-hidden="true">
              <Image
                src="/broccoli.webp"
                alt=""
                width={72}
                height={72}
                className="tile-produce-img"
                style={{ right: "12%", width: "clamp(38px, 6vw, 62px)", height: "auto" }}
              />
              <Image
                src="/tomato.webp"
                alt=""
                width={64}
                height={64}
                className="tile-produce-img"
                style={{ left: "15%", width: "clamp(34px, 5.5vw, 54px)", height: "auto" }}
              />
              <Image
                src="/carrot.webp"
                alt=""
                width={68}
                height={68}
                className="tile-produce-img"
                style={{
                  top: "15%",
                  left: "35%",
                  transform: "rotate(-18deg)",
                  width: "clamp(36px, 5.8vw, 58px)",
                  height: "auto",
                }}
              />
            </div>
          </Link>

          {/* Tile 2: Fruits */}
          <Link
            href="/fruits"
            className="home-tile home-tile-fruits home-tile-2"
            aria-label="قسم الفاكهة"
          >
            <span className="home-tile-title">قسم الفاكهة</span>
            <div className="home-tile-visual" aria-hidden="true">
              <Image
                src="/orange.webp"
                alt=""
                width={68}
                height={68}
                className="tile-produce-img"
                style={{ right: "14%", width: "clamp(36px, 5.8vw, 58px)", height: "auto" }}
              />
              <Image
                src="/lemon.webp"
                alt=""
                width={56}
                height={56}
                className="tile-produce-img"
                style={{ left: "16%", width: "clamp(30px, 4.8vw, 48px)", height: "auto" }}
              />
              <Image
                src="/pomegranate.webp"
                alt=""
                width={64}
                height={64}
                className="tile-produce-img"
                style={{
                  top: "10%",
                  left: "36%",
                  transform: "rotate(12deg)",
                  width: "clamp(34px, 5.5vw, 54px)",
                  height: "auto",
                }}
              />
            </div>
          </Link>

          {/* Tile 3: All */}
          <Link
            href="/all"
            className="home-tile home-tile-all home-tile-3"
            aria-label="الكل - تصفح جميع الأصناف"
          >
            <span className="home-tile-title">الكل</span>
            <div className="home-tile-visual" aria-hidden="true">
              <Image
                src="/broccoli.webp"
                alt=""
                width={64}
                height={64}
                className="tile-produce-img"
                style={{ right: "20%", width: "clamp(34px, 5.5vw, 54px)", height: "auto" }}
              />
              <Image
                src="/orange.webp"
                alt=""
                width={62}
                height={62}
                className="tile-produce-img"
                style={{ right: "38%", width: "clamp(32px, 5.2vw, 52px)", height: "auto" }}
              />
              <Image
                src="/tomato.webp"
                alt=""
                width={58}
                height={58}
                className="tile-produce-img"
                style={{ left: "38%", width: "clamp(30px, 5vw, 48px)", height: "auto" }}
              />
              <Image
                src="/lemon.webp"
                alt=""
                width={52}
                height={52}
                className="tile-produce-img"
                style={{ left: "20%", width: "clamp(28px, 4.5vw, 44px)", height: "auto" }}
              />
            </div>
          </Link>
        </div>
      </main>

      {/* 3. Slim Footer with address and enabled delivery areas */}
      <SlimFooter initialAddress={settings.storeAddress} initialAreas={enabledAreas} />
    </div>
  )
}
