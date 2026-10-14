"use client" /* ═══════════════════════════════════════════════════════════════
          1. BEAUTY WORDWALL (EDITORIAL TYPOGRAPHIC STATEMENT STRIP)
          ═══════════════════════════════════════════════════════════════ */ /* ═══════════════════════════════════════════════════════════════
          2. MINIMALIST EDITORIAL FOOTER CONTENT
          ═══════════════════════════════════════════════════════════════ */ /* Col 1: Brand & Identity */ /* Col 2: Store Categories */ /* Col 3: Quick Links */ /* Col 4: Contact, Coverage & Payment */ /* ═══════════════════════════════════════════════════════════════
          3. BOTTOM BAR
          ═══════════════════════════════════════════════════════════════ */

import Image from "next/image"
import Link from "next/link"
import { Phone, Clock, MapPin, ArrowUp, MessageCircle } from "lucide-react"

export default function Footer() {
  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  return (
    <footer className="enhanced-footer">
      {}
      <div className="footer-wordwall" aria-hidden="true">
        <div className="wordwall-track">
          <div className="wordwall-row">
            <span>طازج من المزرعة</span>
            <span className="wordwall-dot">•</span>
            <span>مغسول ومعقم بالكامل</span>
            <span className="wordwall-dot">•</span>
            <span>جاهز للطبخ والسلطة</span>
            <span className="wordwall-dot">•</span>
            <span>قطفة الصباح اليومية</span>
            <span className="wordwall-dot">•</span>
            <span>توصيل سريع ومبرّد</span>
            <span className="wordwall-dot">•</span>
            <span>نور فارم</span>
            <span className="wordwall-dot">•</span>
          </div>
          <div className="wordwall-row" aria-hidden="true">
            <span>طازج من المزرعة</span>
            <span className="wordwall-dot">•</span>
            <span>مغسول ومعقم بالكامل</span>
            <span className="wordwall-dot">•</span>
            <span>جاهز للطبخ والسلطة</span>
            <span className="wordwall-dot">•</span>
            <span>قطفة الصباح اليومية</span>
            <span className="wordwall-dot">•</span>
            <span>توصيل سريع ومبرّد</span>
            <span className="wordwall-dot">•</span>
            <span>نور فارم</span>
            <span className="wordwall-dot">•</span>
          </div>
        </div>
      </div>

      {}
      <div className="footer-main-wrap">
        <div className="footer-columns-grid">
          {}
          <div className="footer-col footer-col-brand">
            <div className="footer-brand-header">
              <div className="footer-logo-circle">
                <Image
                  src="/logo-icon.png"
                  alt="شعار نور فارم الرسمي"
                  width={60}
                  height={60}
                  className="footer-logo-img"
                />
              </div>
              <div className="footer-brand-names">
                <span className="footer-brand-en">NOOR FARM</span>
                <span className="footer-brand-ar">
                  نور فارم للخضار والفواكه
                </span>
              </div>
            </div>

            <p className="footer-brand-desc">
              خضار وفواكه طازجة تُنتقى يومياً من المزرعة، مغسولة ومعقمة ومجهزة حسب
              رغبتك لتصل إلى مطبخك مباشرة بنظافة تامة.
            </p>

            <div className="footer-brand-actions">
              <a
                href="https://wa.me/201012345678"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-wa-button"
                aria-label="تواصل معنا عبر واتساب"
              >
                <MessageCircle size={16} />
                <span>طلب مباشر عبر واتساب</span>
              </a>
            </div>
          </div>

          {}
          <div className="footer-col">
            <h3 className="footer-col-title">أقسام المتجر</h3>
            <ul className="footer-links-list">
              <li>
                <Link href="/products?category=خضار طازج">خضار طازج يومي</Link>
              </li>
              <li>
                <Link href="/products?category=خضرة">الخضرة والورقيات</Link>
              </li>
              <li>
                <Link href="/products?category=جاهز للطبخ">
                  جاهز للطبخ الفوري
                </Link>
              </li>
              <li>
                <Link href="/products?category=السلطات">تشكيلة السلطات</Link>
              </li>
              <li>
                <Link href="/products?category=فواكه طازجة">فواكه الموسم</Link>
              </li>
            </ul>
          </div>

          {}
          <div className="footer-col">
            <h3 className="footer-col-title">روابط مهمة</h3>
            <ul className="footer-links-list">
              <li>
                <Link href="/">الصفحة الرئيسية</Link>
              </li>
              <li>
                <Link href="/products">جميع المنتجات</Link>
              </li>
              <li>
                <Link href="/checkout">سلة المشتريات والدفع</Link>
              </li>
              <li>
                <Link href="/#shop">قطفة اليوم الأكثر طلباً</Link>
              </li>
            </ul>
          </div>

          {}
          <div className="footer-col footer-col-contact">
            <h3 className="footer-col-title">تواصل معنا ومناطق الخدمة</h3>

            <div className="footer-contact-items">
              <div className="contact-item">
                <Phone size={15} className="contact-item-icon" />
                <div>
                  <span className="contact-label">خدمة العملاء:</span>
                  <a href="tel:01012345678" className="contact-val" dir="ltr">
                    010 1234 5678
                  </a>
                </div>
              </div>

              <div className="contact-item">
                <Clock size={15} className="contact-item-icon" />
                <div>
                  <span className="contact-label">ساعات العمل:</span>
                  <span className="contact-val">
                    يومياً من ٩:٠٠ ص حتى ١٠:٠٠ م
                  </span>
                </div>
              </div>

              <div className="contact-item">
                <MapPin size={15} className="contact-item-icon" />
                <div>
                  <span className="contact-label">مناطق التوصيل:</span>
                  <span className="contact-val">
                    القاهرة، الجيزة، الشيخ زايد، التجمع، المعادي
                  </span>
                </div>
              </div>
            </div>

            <div className="footer-payment-section">
              <span className="payment-heading">طرق الدفع:</span>
              <div className="payment-badges-row">
                <span className="payment-chip">الدفع عند الاستلام</span>
                <span className="payment-chip">بطاقات بنكية</span>
                <span className="payment-chip">إنستاباي (InstaPay)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {}
      <div className="footer-bottom-bar">
        <div className="footer-bottom-inner">
          <p className="copyright-text">
            جميع الحقوق محفوظة © {new Date().getFullYear()}{" "}
            <strong>نور فارم (NOOR FARM)</strong>.
          </p>

          <button
            type="button"
            onClick={scrollToTop}
            className="footer-top-btn"
            aria-label="الرجوع لأعلى الصفحة"
          >
            <span>للأعلى</span>
            <ArrowUp size={14} />
          </button>
        </div>
      </div>
    </footer>
  )
}
