"use client"

// 가격 플랜 카드 섹션 - CTA는 Early Access 섹션으로 스크롤
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Check } from "lucide-react"

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "/mo",
    description: "Try Packive with basic features",
    features: [
      "3 projects",
      "Watermarked export",
      "2D preview only",
      "Basic box types",
    ],
    cta: "Get Early Access",
    popular: false,
  },
  {
    name: "Starter",
    price: "$29",
    period: "/mo",
    description: "For brands designing their own packaging",
    features: [
      "Unlimited projects",
      "Print-ready export (EPS/PDF)",
      "3D real-time preview",
      "All 200+ box types",
      "CMYK & bleed support",
      "Text outline conversion",
    ],
    cta: "Get Early Access",
    popular: true,
  },
  {
    name: "Pro",
    price: "$99",
    period: "/mo",
    description: "For teams and agencies",
    features: [
      "Everything in Starter",
      "AI Design Assistant",
      "Team collaboration (5 seats)",
      "Priority support",
      "API access",
      "Custom templates",
      "Spot color support",
    ],
    cta: "Get Early Access",
    popular: false,
  },
]

// Early Access 섹션으로 스크롤하는 핸들러
const scrollToEarlyAccess = () => {
  document.getElementById("early-access")?.scrollIntoView({ behavior: "smooth" })
}

export function PricingCards() {
  return (
    <section id="pricing" className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            A fraction of the cost of a design agency. Cancel anytime.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative flex flex-col ${
                plan.popular
                  ? "border-[#2563EB] border-2 shadow-lg shadow-[#2563EB]/10 scale-105"
                  : "border-gray-200"
              }`}
            >
              {/* 인기 배지 */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-[#2563EB] px-4 py-1 text-xs font-bold text-white">
                  Most Popular
                </div>
              )}
              <CardHeader className="text-center pb-2">
                <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                <div className="mt-2">
                  <span className="text-4xl font-bold text-gray-900">
                    {plan.price}
                  </span>
                  <span className="text-gray-500 ml-1">{plan.period}</span>
                </div>
                <p className="mt-2 text-sm text-gray-500">{plan.description}</p>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-[#2563EB] mt-0.5 shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                  onClick={scrollToEarlyAccess}
                >
                  {plan.cta}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
