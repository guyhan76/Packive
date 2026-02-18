"use client"

// 4단계 사용 프로세스 섹션
import { Package, Ruler, Palette, Download } from "lucide-react"
import { useI18n } from "@/components/i18n-context";

const steps = [
  {
    number: "01",
    icon: Package,
    title: "Choose Box Style",
    description: "Pick from 200+ FEFCO/ECMA standard box types",
  },
  {
    number: "02",
    icon: Ruler,
    title: "Set Dimensions",
    description: "Enter width, length, height. Die-cut template auto-generates in seconds",
  },
  {
    number: "03",
    icon: Palette,
    title: "Design & Preview",
    description: "Add your logo, colors, text. See real-time 3D preview",
  },
  {
    number: "04",
    icon: Download,
    title: "Export & Order",
    description: "Download print-ready EPS/PDF or order production directly",
  },
]

export function HowItWorks() {
  const { t } = useI18n();
  const steps = [
    { number: "01", icon: Package, title: t("m.hiw.s1.title"), description: t("m.hiw.s1.desc") },
    { number: "02", icon: Ruler, title: t("m.hiw.s2.title"), description: t("m.hiw.s2.desc") },
    { number: "03", icon: Palette, title: t("m.hiw.s3.title"), description: t("m.hiw.s3.desc") },
    { number: "04", icon: Download, title: t("m.hiw.s4.title"), description: t("m.hiw.s4.desc") },
  ];
  return (
    <section id="how-it-works" className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            {t("m.hiw.title")}
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            {t("m.hiw.subtitle")}
          </p>
        </div>
        <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <div key={step.number} className="relative text-center">
              {/* 스텝 간 연결선 */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-[#2563EB]/30 to-[#2563EB]/10" />
              )}
              <div className="relative mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#7C3AED] text-white shadow-lg shadow-[#2563EB]/20">
                <step.icon className="h-8 w-8" />
              </div>
              <span className="text-xs font-bold text-[#2563EB] tracking-widest">
                {t("m.hiw.step")} {step.number}
              </span>
              <h3 className="mt-2 text-lg font-bold text-gray-900">{step.title}</h3>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
