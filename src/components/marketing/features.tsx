"use client"

// 6가지 핵심 기능 카드 섹션
import { Layers, Paintbrush, Eye, Download, Sparkles, ShoppingCart } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { useI18n } from "@/components/i18n-context";

const features = [
  {
    icon: Layers,
    title: "Auto Die-Cut Generation",
    description:
      "Enter dimensions, get precise die-cut templates instantly. 26 years of manufacturing expertise baked into every algorithm.",
  },
  {
    icon: Paintbrush,
    title: "Drag & Drop Designer",
    description:
      "No Illustrator or Photoshop needed. Design professional packaging with our intuitive editor.",
  },
  {
    icon: Eye,
    title: "Real-Time 3D Preview",
    description:
      "See your box from every angle. Fold animation shows exactly how it looks assembled.",
  },
  {
    icon: Download,
    title: "Print-Ready Export",
    description:
      "CMYK, 300dpi, 3mm bleed, text outlines — all handled automatically. EPS/AI/PDF export.",
  },
  {
    icon: ShoppingCart,
    title: "One-Click Manufacturing",
    description:
      "Connect directly to verified print partners. From design to doorstep.",
  },
  {
    icon: Sparkles,
    title: "AI Design Assistant",
    description:
      "Generate design ideas with AI. Get professional results in minutes.",
    badge: "Coming Soon",
  },
]

export function Features() {
  const { t } = useI18n();
  const features = [
    { icon: Layers, title: t("m.feat.f1.title"), description: t("m.feat.f1.desc") },
    { icon: Paintbrush, title: t("m.feat.f2.title"), description: t("m.feat.f2.desc") },
    { icon: Eye, title: t("m.feat.f3.title"), description: t("m.feat.f3.desc") },
    { icon: Download, title: t("m.feat.f4.title"), description: t("m.feat.f4.desc") },
    { icon: ShoppingCart, title: t("m.feat.f5.title"), description: t("m.feat.f5.desc"), badge: t("m.feat.comingSoon") },
    { icon: Sparkles, title: t("m.feat.f6.title"), description: t("m.feat.f6.desc"), badge: t("m.feat.comingSoon") },
  ];
  return (
    <section id="features" className="py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            {t("m.feat.title")}
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            {t("m.feat.subtitle")}
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="border-0 shadow-sm hover:shadow-md transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#2563EB]/10 text-[#2563EB]">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-900">
                        {feature.title}
                      </h3>
                      {feature.badge && (
                        <span className="rounded-full bg-[#7C3AED]/10 px-2 py-0.5 text-xs font-medium text-[#7C3AED]">
                          {feature.badge}
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 text-sm text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
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
