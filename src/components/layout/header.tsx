"use client"

// 상단 고정 헤더 - 네비게이션 및 Early Access CTA
import Link from "next/link"
import { Logo } from "@/components/shared/logo"
import { Button } from "@/components/ui/button"
import { useI18n, LanguageSelector } from "@/components/i18n-context";

export function Header() {
  const { t } = useI18n();
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
            <Link href="#features" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">{t("m.features")}</Link>
            <Link href="#how-it-works" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">{t("m.howItWorks")}</Link>
            <Link href="#pricing" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">{t("m.pricing")}</Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <LanguageSelector />
          <Button
            size="sm"
            className="bg-[#2563EB] hover:bg-[#1d4ed8]"
            onClick={scrollToEarlyAccess}
          >
            {t("m.getEarlyAccess")}
          </Button>
        </div>
      </div>
    </header>
  )
}
