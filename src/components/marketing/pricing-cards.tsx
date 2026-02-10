"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Check } from "lucide-react"
import Link from "next/link"

const plans = [
  {
    name: "Free",
    price: "₩0",
    period: "영구 무료",
    description: "패키지 디자인을 처음 시작하는 분",
    features: ["월 3회 칼선전개도 생성", "기본 디자인 도구", "PDF 파일 출력", "기본 박스 형태 3종"],
    cta: "무료로 시작하기",
    popular: false,
  },
  {
    name: "Pro",
    price: "₩29,000",
    period: "/ 월",
    description: "본격적으로 패키지를 디자인하는 분",
    features: ["무제한 칼선전개도 생성", "전체 디자인 도구", "EPS + PDF 파일 출력", "모든 박스 형태", "3D 미리보기", "CMYK 색상 지원", "텍스트 아웃라인 변환"],
    cta: "Pro 시작하기",
    popular: true,
  },
  {
    name: "Business",
    price: "₩99,000",
    period: "/ 월",
    description: "팀으로 작업하는 브랜드와 기업",
    features: ["Pro의 모든 기능", "AI 디자인 어시스턴트", "팀 협업 (5명까지)", "별색(Spot Color) 지원", "브랜드 킷 관리", "우선 고객 지원", "커스텀 템플릿"],
    cta: "Business 시작하기",
    popular: false,
  },
]

export function PricingCards() {
  return (
    <section id="pricing" className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">합리적인 가격, 강력한 기능</h2>
          <p className="mt-4 text-lg text-gray-600">디자인 외주 비용의 1/10로 원하는 만큼 디자인하세요</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <Card key={plan.name} className={`relative flex flex-col ${plan.popular ? "border-blue-600 border-2 shadow-lg shadow-blue-100 scale-105" : "border-gray-200"}`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-4 py-1 text-xs font-bold text-white">가장 인기</div>
              )}
              <CardHeader className="text-center pb-2">
                <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                <div className="mt-2">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-500 ml-1">{plan.period}</span>
                </div>
                <p className="mt-2 text-sm text-gray-500">{plan.description}</p>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant={plan.popular ? "default" : "outline"} asChild>
                  <Link href="/register">{plan.cta}</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
