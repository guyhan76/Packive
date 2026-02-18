import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Toaster } from "react-hot-toast"
import "./globals.css"
import { I18nProvider } from "@/components/i18n-context";

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Packive — Design Your Packaging in Minutes",
  description:
    "Auto-generate die-cut templates, design on top, preview in 3D, and export print-ready files. No Illustrator needed.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Bebas+Neue&family=Black+Han+Sans&family=Caveat&family=Cormorant+Garamond:wght@400;700&family=Dancing+Script&family=EB+Garamond:wght@400;700&family=Great+Vibes&family=Inter:wght@400;700&family=Jua&family=Lora:wght@400;700&family=Merriweather:wght@400;700&family=Montserrat:wght@400;700&family=Noto+Sans+KR:wght@400;700&family=Noto+Serif+KR:wght@400;700&family=Nunito:wght@400;700&family=Open+Sans:wght@400;700&family=Oswald:wght@400;700&family=Pacifico&family=Playfair+Display:wght@400;700&family=Poppins:wght@400;700&family=Raleway:wght@400;700&family=Roboto:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={inter.className}>
        <I18nProvider>{children}</I18nProvider>
        <Toaster position="top-center" />
      </body>
    </html>
  )
}
