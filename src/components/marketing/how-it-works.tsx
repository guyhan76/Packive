"use client"

import { Box, Ruler, Paintbrush, Download } from "lucide-react"

const steps = [
  { number: "01", icon: Box, title: "박스 형태 선택", description: "맞뚜껑, 우편물 박스, 슬리브 등 원하는 박스 형태를 선택하세요." },
  { number: "02", icon: Ruler, title: "규격 입력", description: "가로, 세로, 높이를 입력하면 칼선전개도가 자동으로 생성됩니다." },
  { number: "03", icon: Paintbrush, title: "디자인", description: "전개도 위에 로고, 텍스트, 이미지를 드래그 앤 드롭으로 배치하세요." },
  { number: "04", icon: Download, title: "파일 출력", description: "인쇄용 EPS, PDF 파일을 다운로드하여 바로 인쇄소에 전달하세요." },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">4단계로 완성하는 패키지 디자인</h2>
          <p className="mt-4 text-lg text-gray-600">복잡한 과정은 Packive가 알아서 처리합니다</p>
        </div>
        <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <div key={step.number} className="relative text-center">
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-blue-300 to-blue-100" />
              )}
              <div className="relative mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-200">
                <step.icon className="h-8 w-8" />
              </div>
              <span className="text-xs font-bold text-blue-600 tracking-widest">STEP {step.number}</span>
              <h3 className="mt-2 text-lg font-bold text-gray-900">{step.title}</h3>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
