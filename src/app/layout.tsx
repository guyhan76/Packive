import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Packive - 패키지 디자인, 누구나 쉽게",
  description: "박스 형태 선택부터 칼선전개도 자동 생성, 디자인, 3D 미리보기, 인쇄 파일 출력까지.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
