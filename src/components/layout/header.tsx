"use client"

// 상단 고정 헤더 - 네비게이션 및 Early Access CTA
import Link from "next/link"
import { Logo } from "@/components/shared/logo"
import { Button } from "@/components/ui/button"

export function Header() {
  // Early Access 섹션으로 스크롤
  const scrollToEarlyAccess = () => {
    document.getElementById('early-access')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Features</Link>
            <Link href="#how-it-works" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">How It Works</Link>
            <Link href="#pricing" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Pricing</Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            className="bg-[#2563EB] hover:bg-[#1d4ed8]"
            onClick={scrollToEarlyAccess}
          >
            Get Early Access
          </Button>
        </div>
      </div>
    </header>
  )
}
