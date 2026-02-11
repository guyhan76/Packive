'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { Rocket, CheckCircle, Users, Globe, Zap, AlertCircle } from 'lucide-react'

export function EarlyAccessForm() {
  const [email, setEmail] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [boxDescription, setBoxDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [signupCount, setSignupCount] = useState(0)
  const [error, setError] = useState('')

  // 페이지 로드 시 현재 가입자 수 조회
  useEffect(() => {
    async function fetchCount() {
      try {
        const { data, error } = await supabase.rpc('get_early_access_count')
        if (!error && data !== null) {
          setSignupCount(data)
        }
      } catch {
        // Supabase 미연결 시 기본값 유지
      }
    }
    fetchCount()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsSubmitting(true)
    setError('')

    try {
      const { error: insertError } = await supabase
        .from('early_access')
        .insert([
          {
            email,
            company_name: companyName || null,
            box_description: boxDescription || null,
          },
        ])

      if (insertError) {
        // 이메일 중복 체크
        if (insertError.code === '23505') {
          setError('This email is already on the waitlist!')
          toast.error('You\'re already on the list!')
          setIsSubmitting(false)
          return
        }
        throw insertError
      }

      // 성공 시 카운트 다시 조회
      const { data: newCount } = await supabase.rpc('get_early_access_count')
      if (newCount !== null) {
        setSignupCount(newCount)
      }

      setIsSubmitted(true)
      toast.success('Welcome to Packive! You\'re on the list.')
    } catch (err) {
      setError('Something went wrong. Please try again.')
      toast.error('Please try again.')
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
            You&apos;re in!
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
            Join {signupCount > 0 ? `${signupCount}+` : ''} brands already on the waitlist.
            Get early access to the platform that turns your box idea into a print-ready file in 30 minutes.
          </p>

          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-[#2563EB]" />
              <span>{signupCount > 0 ? `${signupCount}+ waitlisted` : 'Be the first!'}</span>
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

            {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

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
