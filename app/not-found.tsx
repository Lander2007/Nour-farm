import Link from "next/link"

export default function NotFound() {
  return (
    <div
      className="min-h-screen bg-[#faf6ee] text-[#1a2a1d] flex flex-col items-center justify-center p-6 text-center font-sans"
      dir="rtl"
    >
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-stone-200 shadow-sm">
        <h1 className="text-4xl font-extrabold text-stone-900 mb-3">٤٠٤</h1>
        <h2 className="text-xl font-bold text-stone-800 mb-2">الصفحة غير موجودة</h2>
        <p className="text-stone-600 text-sm mb-6">
          عذراً، لم نتمكن من العثور على الصفحة أو الطلب الذي تبحث عنه.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-[#2f3b27] hover:bg-[#1e2719] text-white font-bold text-sm transition"
        >
          العودة للرئيسية
        </Link>
      </div>
    </div>
  )
}
