"use client"

import Link from "next/link"
import { Logo } from "@/components/shared/logo"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">기능</Link>
            <Link href="#how-it-works" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">사용법</Link>
            <Link href="#pricing" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">가격</Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">로그인</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/register">무료로 시작하기</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
