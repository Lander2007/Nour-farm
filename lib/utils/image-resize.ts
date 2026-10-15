/**
 * Resizes an image file in the browser to a maximum dimension (default 1200px)
 * and converts it to WebP format.
 */
export async function resizeImageToWebP(
  file: File,
  maxDimension: number = 1200,
  quality: number = 0.85
): Promise<File> {
  return new Promise((resolve, reject) => {
    // If not an image, reject
    if (!file.type.startsWith("image/")) {
      reject(new Error("الملف المحدد ليس صورة صالحة"))
      return
    }

    const img = new Image()
    const reader = new FileReader()

    reader.onload = (e) => {
      img.src = e.target?.result as string
    }

    reader.onerror = (e) => reject(e)

    img.onload = () => {
      try {
        let width = img.width
        let height = img.height

        // Downscale if larger than maxDimension
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width)
            width = maxDimension
          } else {
            width = Math.round((width * maxDimension) / height)
            height = maxDimension
          }
        }

        const canvas = document.createElement("canvas")
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext("2d")
        if (!ctx) {
          reject(new Error("تعذر إنشاء سياق الرسم"))
          return
        }

        // Draw image onto canvas
        ctx.drawImage(img, 0, 0, width, height)

        // Convert to WebP blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("فشل تحويل الصورة إلى WebP"))
              return
            }

            const baseName = file.name.substring(0, file.name.lastIndexOf(".")) || file.name
            const webpFile = new File([blob], `${baseName}.webp`, {
              type: "image/webp",
              lastModified: Date.now(),
            })

            resolve(webpFile)
          },
          "image/webp",
          quality
        )
      } catch (err) {
        reject(err)
      }
    }

    img.onerror = (err) => reject(err)

    reader.readAsDataURL(file)
  })
}
