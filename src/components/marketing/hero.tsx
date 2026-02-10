"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Box, Layers, Eye, Download } from "lucide-react"
import Link from "next/link"

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-20 pb-32">
      <div className="container relative mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm text-blue-700">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-600" />
            </span>
            패키지 디자인의 새로운 기준
          </div>
          <h1 className="mb-6 text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">
            패키지 디자인,{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              누구나 쉽게
            </span>
          </h1>
          <p className="mb-10 text-lg text-gray-600 sm:text-xl max-w-2xl mx-auto leading-relaxed">
            박스 형태 선택부터 칼선전개도 자동 생성, 디자인, 3D 미리보기, 인쇄 파일 출력까지. 전문가 없이도 완성하세요.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="gap-2 text-base px-8 py-6" asChild>
              <Link href="/register">
                무료로 시작하기
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="gap-2 text-base px-8 py-6" asChild>
              <Link href="#how-it-works">어떻게 동작하나요?</Link>
            </Button>
          </div>
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-8 max-w-2xl mx-auto">
            {[
              { icon: Box, label: "박스 형태 선택" },
              { icon: Layers, label: "칼선 자동 생성" },
              { icon: Eye, label: "3D 미리보기" },
              { icon: Download, label: "인쇄 파일 출력" },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
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
