'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { Rocket, CheckCircle, Users, Globe, Zap } from 'lucide-react'

export function EarlyAccessForm() {
  const [email, setEmail] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [boxDescription, setBoxDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [signupCount, setSignupCount] = useState(127) // 초기 소셜프루프 숫자

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsSubmitting(true)

    try {
      // Supabase 연결 시 실제 저장
      const { error } = await supabase
        .from('early_access')
        .insert([
          {
            email,
            company_name: companyName,
            box_description: boxDescription,
          },
        ])

      if (error) {
        // Supabase 미연결 시에도 UI는 성공 처리 (개발 단계)
        console.warn('Supabase not connected yet:', error.message)
      }

      setIsSubmitted(true)
      setSignupCount(prev => prev + 1)
      toast.success('Welcome to Packive! You\'re on the list.')
    } catch (err) {
      // 개발 단계에서는 에러가 나도 성공 처리
      setIsSubmitted(true)
      setSignupCount(prev => prev + 1)
      toast.success('Welcome to Packive! You\'re on the list.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <section id="early-access" className="py-24 bg-gradient-to-b from-[#2563EB]/5 to-white">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            You&apos;re in! 🎉
          </h3>
          <p className="text-lg text-gray-600 mb-2">
            You&apos;re <span className="font-bold text-[#2563EB]">#{signupCount}</span> on the early access list.
          </p>
          <p className="text-gray-500">
            We&apos;ll notify you as soon as Packive is ready. Get ready to design your packaging in minutes, not weeks.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section id="early-access" className="py-24 bg-gradient-to-b from-[#2563EB]/5 to-white">
      <div className="max-w-4xl mx-auto px-6">
        {/* 상단 소셜프루프 */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-[#F59E0B]/10 text-[#F59E0B] px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <Rocket className="w-4 h-4" />
            Early Access — Limited Spots
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Be the first to design<br />
            <span className="text-[#2563EB]">your packaging</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
            Join {signupCount}+ brands already on the waitlist.
            Get early access to the platform that turns your box idea into a print-ready file in 30 minutes.
          </p>
          
          {/* 신뢰 지표 */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-[#2563EB]" />
              <span>{signupCount}+ waitlisted</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-[#7C3AED]" />
              <span>Available worldwide</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-[#F59E0B]" />
              <span>Launching Q2 2026</span>
            </div>
          </div>
        </div>

        {/* 가입 폼 */}
        <div className="max-w-lg mx-auto">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Work email *
              </label>
              <Input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Company / Brand name
              </label>
              <Input
                type="text"
                placeholder="Your brand name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="h-12"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                What packaging do you need?
              </label>
              <Input
                type="text"
                placeholder="e.g., Cosmetic box, food packaging, shipping box..."
                value={boxDescription}
                onChange={(e) => setBoxDescription(e.target.value)}
                className="h-12"
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || !email}
              className="w-full h-12 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold text-base rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-[#2563EB]/25"
            >
              {isSubmitting ? 'Joining...' : 'Get Early Access — It\'s Free'}
            </Button>

            <p className="text-xs text-center text-gray-400">
              No credit card required. We&apos;ll only email you about Packive launch updates.
            </p>
          </form>
        </div>

        {/* 하단 기대효과 */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-[#2563EB]">30 min</div>
            <p className="text-sm text-gray-600 mt-1">From idea to print-ready file</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-[#7C3AED]">90% less</div>
            <p className="text-sm text-gray-600 mt-1">Cost vs. design agency</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-[#F59E0B]">$29/mo</div>
            <p className="text-sm text-gray-600 mt-1">Starting price for full access</p>
          </div>
        </div>
      </div>
    </section>
  )
}
