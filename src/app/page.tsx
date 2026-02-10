import { Header } from "@/components/layout/header"
import { Hero } from "@/components/marketing/hero"
import { HowItWorks } from "@/components/marketing/how-it-works"
import { Features } from "@/components/marketing/features"
import { PricingCards } from "@/components/marketing/pricing-cards"
import { Footer } from "@/components/marketing/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <HowItWorks />
        <Features />
        <PricingCards />
      </main>
      <Footer />
    </div>
  )
}
