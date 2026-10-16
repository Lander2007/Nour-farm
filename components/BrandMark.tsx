"use client"

import Image from "next/image"

export interface BrandMarkProps {
  compact?: boolean
  className?: string
}

export default function BrandMark({
  compact = false,
  className = "",
}: BrandMarkProps) {
  return (
    <div
      className={`brand-badge ${className}`}
      aria-label="نور فارم - Noor Farm"
    >
      <span className="brand-icon-wrapper" aria-hidden="true">
        <Image
          src="/logo-icon.png"
          alt="شعار نور فارم"
          width={64}
          height={64}
          className="brand-logo-img"
          priority
        />
      </span>
      {!compact && (
        <div className="brand-text-col">
          <span className="brand-name">NOOR FARM</span>
          <span className="brand-tagline">خضار وفواكه طازجة</span>
        </div>
      )}
    </div>
  )
}
