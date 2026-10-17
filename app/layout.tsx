import type { Metadata } from "next"
import CartDrawer from "@/components/CartDrawer"
import CartErrorBoundary from "@/components/CartErrorBoundary"
import "./globals.css"

export const metadata: Metadata = {
  title: "نور فارم | رحلة الطازة",
  description: "خضار طازة، مغسول، ومتقطّع على مزاجك… جاهز للطبخ.",
  icons: {
    icon: [
      { url: "/logo-icon.png", type: "image/png" },
      { url: "/favicon.ico" },
    ],
    shortcut: ["/logo-icon.png"],
    apple: [
      { url: "/logo-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head suppressHydrationWarning>
        <title>نور فارم | رحلة الطازة</title>
        <meta
          name="description"
          content="خضار طازة، مغسول، ومتقطّع على مزاجك… جاهز للطبخ."
        />
        <link rel="icon" type="image/png" href="/logo-icon.png" />
        <link rel="shortcut icon" href="/logo-icon.png" />
        <link rel="apple-touch-icon" href="/logo-icon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Aref+Ruqaa:wght@700&family=IBM+Plex+Mono:wght@500;600&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=Readex+Pro:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>
        {children}
        <CartErrorBoundary>
          <CartDrawer />
        </CartErrorBoundary>
      </body>
    </html>
  )
}

