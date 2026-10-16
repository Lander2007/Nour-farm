import { createClient } from "@supabase/supabase-js"
import fs from "node:fs"

// Parse .env.local
const envFile = fs.readFileSync(".env.local", "utf8")
const env = {}
envFile.split(/\r?\n/).forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/)
  if (match) {
    const key = match[1].trim()
    const val = match[2].trim().replace(/^["']|["']$/g, "")
    env[key] = val
  }
})

const url = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL
const key = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!url || !key) {
  console.error("Missing Supabase credentials in .env.local")
  process.exit(1)
}

const supabase = createClient(url, key)

const products = [
  // 1. Fresh Vegetables
  {
    id: "prod-tomato",
    section_id: "fresh-vegetables",
    name_ar: "طماطم بلدي",
    image_url: "/noor-farm-images/IMG-20261014-WA0114.jpg",
    price: 20,
    unit_type: "kg",
    pack_label: null,
    step: 0.5,
    published: true,
    sort: 1,
  },
  {
    id: "prod-cucumber",
    section_id: "fresh-vegetables",
    name_ar: "خيار بلدي",
    image_url: "/noor-farm-images/IMG-20261014-WA0133.jpg",
    price: 18,
    unit_type: "kg",
    pack_label: null,
    step: 0.5,
    published: true,
    sort: 2,
  },
  {
    id: "prod-carrot",
    section_id: "fresh-vegetables",
    name_ar: "جزر أصفر",
    image_url: "/noor-farm-images/IMG-20261014-WA0122.jpg",
    price: 16,
    unit_type: "kg",
    pack_label: null,
    step: 0.5,
    published: true,
    sort: 3,
  },
  {
    id: "prod-bell-pepper-red",
    section_id: "fresh-vegetables",
    name_ar: "فلفل ألوان أحمر",
    image_url: "/noor-farm-images/IMG-20261014-WA0109.jpg",
    price: 45,
    unit_type: "kg",
    pack_label: null,
    step: 0.5,
    published: true,
    sort: 4,
  },
  {
    id: "prod-bell-pepper-green",
    section_id: "fresh-vegetables",
    name_ar: "فلفل رومي أخضر",
    image_url: "/noor-farm-images/IMG-20261014-WA0108.jpg",
    price: 22,
    unit_type: "kg",
    pack_label: null,
    step: 0.5,
    published: true,
    sort: 5,
  },
  {
    id: "prod-eggplant",
    section_id: "fresh-vegetables",
    name_ar: "باذنجان رومي",
    image_url: "/noor-farm-images/IMG-20261014-WA0111.jpg",
    price: 15,
    unit_type: "kg",
    pack_label: null,
    step: 0.5,
    published: true,
    sort: 6,
  },
  {
    id: "prod-potato",
    section_id: "fresh-vegetables",
    name_ar: "بطاطس تحمير",
    image_url: "/noor-farm-images/IMG-20261014-WA0119.jpg",
    price: 25,
    unit_type: "kg",
    pack_label: null,
    step: 0.5,
    published: true,
    sort: 7,
  },
  {
    id: "prod-onion",
    section_id: "fresh-vegetables",
    name_ar: "بصل أحمر",
    image_url: "/noor-farm-images/IMG-20261014-WA0120.jpg",
    price: 20,
    unit_type: "kg",
    pack_label: null,
    step: 0.5,
    published: true,
    sort: 8,
  },
  {
    id: "prod-zucchini",
    section_id: "fresh-vegetables",
    name_ar: "كوسة بلدي",
    image_url: "/noor-farm-images/IMG-20261014-WA0121.jpg",
    price: 24,
    unit_type: "kg",
    pack_label: null,
    step: 0.5,
    published: true,
    sort: 9,
  },
  {
    id: "prod-broccoli",
    section_id: "fresh-vegetables",
    name_ar: "بروكلي أخضر",
    image_url: "/broccoli.webp",
    price: 35,
    unit_type: "kg",
    pack_label: null,
    step: 0.5,
    published: true,
    sort: 10,
  },

  // 2. Herbs
  {
    id: "prod-mint",
    section_id: "herbs",
    name_ar: "نعناع بلدي",
    image_url: "/noor-farm-images/IMG-20261014-WA0104.jpg",
    price: 5,
    unit_type: "bunch",
    pack_label: null,
    step: 1,
    published: true,
    sort: 11,
  },
  {
    id: "prod-basil",
    section_id: "herbs",
    name_ar: "ريحان إيطالي",
    image_url: "/basil.webp",
    price: 8,
    unit_type: "bunch",
    pack_label: null,
    step: 1,
    published: true,
    sort: 12,
  },
  {
    id: "prod-parsley",
    section_id: "herbs",
    name_ar: "بقدونس طازج",
    image_url: "/noor-farm-images/IMG-20261014-WA0107.jpg",
    price: 5,
    unit_type: "bunch",
    pack_label: null,
    step: 1,
    published: true,
    sort: 13,
  },
  {
    id: "prod-coriander",
    section_id: "herbs",
    name_ar: "كزبرة خضراء",
    image_url: "/noor-farm-images/IMG-20261014-WA0106.jpg",
    price: 5,
    unit_type: "bunch",
    pack_label: null,
    step: 1,
    published: true,
    sort: 14,
  },
  {
    id: "prod-dill",
    section_id: "herbs",
    name_ar: "شبت بلدي",
    image_url: "/noor-farm-images/IMG-20261014-WA0105.jpg",
    price: 5,
    unit_type: "bunch",
    pack_label: null,
    step: 1,
    published: true,
    sort: 15,
  },
  {
    id: "prod-arugula",
    section_id: "herbs",
    name_ar: "جرجير بلدي",
    image_url: "/noor-farm-images/IMG-20261014-WA0103.jpg",
    price: 5,
    unit_type: "bunch",
    pack_label: null,
    step: 1,
    published: true,
    sort: 16,
  },

  // 3. Ready Vegetables
  {
    id: "prod-okra-cut",
    section_id: "ready-vegetables",
    name_ar: "بامية مقمعة مجهزة",
    image_url: "/scenes/cut.jpg",
    price: 45,
    unit_type: "pack",
    pack_label: "طبق 500 جم",
    step: 1,
    published: true,
    sort: 17,
  },
  {
    id: "prod-saute-mix",
    section_id: "ready-vegetables",
    name_ar: "خضار سوتيه مشكل مجهز",
    image_url: "/scenes/cut.jpg",
    price: 35,
    unit_type: "pack",
    pack_label: "طبق 500 جم",
    step: 1,
    published: true,
    sort: 18,
  },
  {
    id: "prod-onion-chopped",
    section_id: "ready-vegetables",
    name_ar: "بصل مقطع جاهز للطبخ",
    image_url: "/scenes/cut.jpg",
    price: 25,
    unit_type: "pack",
    pack_label: "طبق 400 جم",
    step: 1,
    published: true,
    sort: 19,
  },

  // 4. Salads
  {
    id: "prod-green-salad-pack",
    section_id: "salads",
    name_ar: "سلطة خضراء مجهزة",
    image_url: "/scenes/ready.jpg",
    price: 30,
    unit_type: "pack",
    pack_label: "علبة عائلية",
    step: 1,
    published: true,
    sort: 20,
  },
  {
    id: "prod-coleslaw-pack",
    section_id: "salads",
    name_ar: "سلطة كول سلو طازجة",
    image_url: "/scenes/ready.jpg",
    price: 28,
    unit_type: "pack",
    pack_label: "علبة 350 جم",
    step: 1,
    published: true,
    sort: 21,
  },

  // 5. Fresh Fruits
  {
    id: "prod-red-plum",
    section_id: "fresh-fruits",
    name_ar: "برقوق أحمر سكري",
    image_url: "/noor-farm-images/red-plum.jpg",
    price: 65,
    unit_type: "kg",
    pack_label: null,
    step: 0.5,
    published: true,
    sort: 22,
  },
  {
    id: "prod-peach",
    section_id: "fresh-fruits",
    name_ar: "خوخ سكري",
    image_url: "/noor-farm-images/peach.jpg",
    price: 55,
    unit_type: "kg",
    pack_label: null,
    step: 0.5,
    published: true,
    sort: 23,
  },
  {
    id: "prod-cantaloupe",
    section_id: "fresh-fruits",
    name_ar: "كانتالوب عسلي",
    image_url: "/noor-farm-images/cantaloupe.jpg",
    price: 25,
    unit_type: "kg",
    pack_label: null,
    step: 0.5,
    published: true,
    sort: 24,
  },
  {
    id: "prod-lemon",
    section_id: "fresh-fruits",
    name_ar: "ليمون بلدي",
    image_url: "/lemon.webp",
    price: 20,
    unit_type: "kg",
    pack_label: null,
    step: 0.5,
    published: true,
    sort: 25,
  },
  {
    id: "prod-avocado",
    section_id: "fresh-fruits",
    name_ar: "أفوكادو هاس",
    image_url: "/avocado.webp",
    price: 40,
    unit_type: "piece",
    pack_label: null,
    step: 1,
    published: true,
    sort: 26,
  },

  // 6. Cut Fruits
  {
    id: "prod-fruit-salad-cup",
    section_id: "cut-fruits",
    name_ar: "سالاد فروت مشكل مجهز",
    image_url: "/scenes/ready.jpg",
    price: 45,
    unit_type: "pack",
    pack_label: "كوب كبير",
    step: 1,
    published: true,
    sort: 27,
  },
  {
    id: "prod-cantaloupe-cubes",
    section_id: "cut-fruits",
    name_ar: "كانتالوب مكعبات مجهز",
    image_url: "/scenes/ready.jpg",
    price: 35,
    unit_type: "pack",
    pack_label: "علبة 500 جم",
    step: 1,
    published: true,
    sort: 28,
  },
]

async function seed() {
  console.log("Seeding products to Supabase...")
  for (const product of products) {
    const { error } = await supabase.from("products").upsert(product, { onConflict: "id" })
    if (error) {
      console.error(`Failed to upsert ${product.name_ar}:`, error)
    } else {
      console.log(`✓ Upserted: ${product.name_ar}`)
    }
  }
  console.log("Seeding completed successfully!")
}

seed()
