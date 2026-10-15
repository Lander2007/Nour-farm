import { NextRequest, NextResponse } from "next/server"
import fs from "node:fs"
import path from "node:path"
import { isAuthenticatedAdmin } from "@/lib/auth/server-auth"
import { isSupabaseConfigured, getSupabaseServerClient } from "@/lib/db/supabase"

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]
const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB

export async function POST(req: NextRequest) {
  const isAuth = await isAuthenticatedAdmin()
  if (!isAuth) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "لم يتم إرفاق ملف" }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "نوع الملف غير مدعوم. الأنواع المسموحة فقط: JPG, PNG, WebP" },
        { status: 400 }
      )
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: "حجم الملف كبير جداً. الحد الأقصى هو ٥ ميجابايت." },
        { status: 400 }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const ext = file.name.split(".").pop() || "webp"
    const fileName = `prod-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`

    // 1. Supabase Storage if configured
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseServerClient()!
      const { data, error } = await supabase.storage
        .from("noor-farm-media")
        .upload(fileName, buffer, {
          contentType: file.type,
          upsert: true,
        })

      if (error) {
        console.error("Supabase storage upload error:", error)
        return NextResponse.json({ error: "فشل رفع الصورة إلى التخزين السحابي" }, { status: 500 })
      }

      const { data: publicData } = supabase.storage
        .from("noor-farm-media")
        .getPublicUrl(data.path)

      return NextResponse.json({ url: publicData.publicUrl })
    }

    // 2. Development local storage fallback
    if (process.env.NODE_ENV !== "production") {
      const uploadDir = path.join(process.cwd(), "public", "uploads")
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true })
      }
      const localFilePath = path.join(uploadDir, fileName)
      fs.writeFileSync(localFilePath, buffer)
      return NextResponse.json({ url: `/uploads/${fileName}` })
    }

    return NextResponse.json(
      { error: "خدمة التخزين السحابي غير مهيأة على خادم الإنتاج" },
      { status: 500 }
    )
  } catch (err: any) {
    console.error("Upload error:", err)
    return NextResponse.json({ error: "حدث خطأ أثناء معالجة الصورة" }, { status: 500 })
  }
}
