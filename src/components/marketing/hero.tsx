"use client"

// Hero 섹션 - Early Access 랜딩 페이지 메인 영역
import { Button } from "@/components/ui/button"
import { ArrowRight, Play, Package, Layers, Eye, Download } from "lucide-react"

export function Hero() {
  // Early Access 섹션으로 스크롤
  const scrollToEarlyAccess = () => {
    document.getElementById('early-access')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#2563EB]/5 via-white to-[#7C3AED]/5 pt-20 pb-32">
      <div className="container relative mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          {/* 상단 배지 */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#2563EB]/20 bg-[#2563EB]/5 px-4 py-1.5 text-sm text-[#2563EB] font-medium">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#2563EB]/60 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#2563EB]" />
            </span>
            Early Access Now Open
          </div>

          {/* 메인 헤드라인 */}
          <h1 className="mb-6 text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">
            Design Your Packaging{" "}
            <span className="bg-gradient-to-r from-[#2563EB] to-[#7C3AED] bg-clip-text text-transparent">
              in Minutes
            </span>
            , Not Weeks
          </h1>

          {/* 서브헤드 */}
          <p className="mb-10 text-lg text-gray-600 sm:text-xl max-w-2xl mx-auto leading-relaxed">
            Packive auto-generates die-cut templates, lets you design on top,
            preview in 3D, and export print-ready files. No Illustrator needed.
          </p>

          {/* CTA 버튼 그룹 */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="gap-2 text-base px-8 py-6 bg-[#2563EB] hover:bg-[#1d4ed8] hover:shadow-lg hover:shadow-[#2563EB]/25 transition-all duration-200"
              onClick={scrollToEarlyAccess}
            >
              Get Early Access — Free
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="gap-2 text-base px-8 py-6"
            >
              <Play className="h-4 w-4" />
              Watch Demo
            </Button>
          </div>

          {/* 핵심 기능 아이콘 그리드 */}
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-8 max-w-2xl mx-auto">
            {[
              { icon: Package, label: "Choose Box Style" },
              { icon: Layers, label: "Auto Die-Cut" },
              { icon: Eye, label: "3D Preview" },
              { icon: Download, label: "Print-Ready Export" },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#2563EB]/10 text-[#2563EB]">
                  <item.icon className="h-6 w-6" />
                </div>
                <span className="text-sm font-medium text-gray-700">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
