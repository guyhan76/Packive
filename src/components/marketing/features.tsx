"use client"

import { Layers, Paintbrush, Eye, Download, Sparkles, Users } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const features = [
  { icon: Layers, title: "칼선전개도 자동 생성", description: "박스 형태와 규격만 입력하면 칼선, 접선, 풀칠면이 포함된 정확한 전개도가 즉시 생성됩니다." },
  { icon: Paintbrush, title: "직관적 디자인 에디터", description: "포토샵이나 일러스트 없이도 드래그 앤 드롭으로 로고, 텍스트, 이미지를 자유롭게 배치하세요." },
  { icon: Eye, title: "3D 실시간 미리보기", description: "디자인한 패키지를 3D로 확인하고 360도 회전하며 실제 완성품을 미리 볼 수 있습니다." },
  { icon: Download, title: "인쇄용 파일 출력", description: "CMYK 색상, 텍스트 아웃라인, 도련이 적용된 EPS, PDF 파일을 바로 다운로드하세요." },
  { icon: Sparkles, title: "AI 디자인 어시스턴트", description: "원하는 분위기를 설명하면 AI가 패키지에 맞는 디자인을 제안해 드립니다.", badge: "Coming Soon" },
  { icon: Users, title: "팀 협업", description: "공유 링크로 팀원이나 고객에게 3D 미리보기를 공유하고 피드백을 받으세요.", badge: "Business" },
]

export function Features() {
  return (
    <section id="features" className="py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">패키지 디자인에 필요한 모든 것</h2>
          <p className="mt-4 text-lg text-gray-600">칼선전개도부터 인쇄 파일까지, 하나의 플랫폼에서 해결하세요</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature) => (
            <Card key={feature.title} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-900">{feature.title}</h3>
                      {feature.badge && (
                        <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">{feature.badge}</span>
                      )}
                    </div>
                    <p className="mt-1.5 text-sm text-gray-600 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
