'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { Rocket, CheckCircle, Users, Globe, Zap, AlertCircle } from 'lucide-react'
import { useI18n } from "@/components/i18n-context";

export function EarlyAccessForm() {
  const { t } = useI18n();
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
          setError(t("m.ea.errDuplicate"))
          toast.error(t("m.ea.errDuplicate"))
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
      toast.success(t("m.ea.successToast"))
    } catch (err) {
      setError(t("m.ea.errGeneric"))
      toast.error(t("m.ea.errGeneric"))
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
            {t("m.ea.success.title")}
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
            {t("m.ea.badge")}
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t("m.ea.title1")}<br />
            <span className="text-[#2563EB]">{t("m.ea.title2")}</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
            {t("m.ea.joinText1")} {signupCount > 0 ? `${signupCount}+` : ''} {t("m.ea.joinText2")}
          </p>

          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-[#2563EB]" />
              <span>{signupCount > 0 ? `${signupCount}+ ${t("m.ea.waitlisted")}` : t("m.ea.beFirst")}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-[#7C3AED]" />
              <span>{t("m.ea.worldwide")}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-[#F59E0B]" />
              <span>{t("m.ea.launching")}</span>
            </div>
          </div>
        </div>

        <div className="max-w-lg mx-auto">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t("m.ea.emailLabel")}
              </label>
              <Input
                type="email"
                placeholder={t("m.ea.emailPh")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t("m.ea.companyLabel")}
              </label>
              <Input
                type="text"
                placeholder={t("m.ea.companyPh")}
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="h-12"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t("m.ea.needLabel")}
              </label>
              <Input
                type="text"
                placeholder={t("m.ea.needPh")}
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
              {isSubmitting ? t("m.ea.joining") : t("m.ea.ctaFree")}
            </Button>

            <p className="text-xs text-center text-gray-400">
              {t("m.ea.noCard")}
            </p>
          </form>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-[#2563EB]">{t("m.ea.stat1.value")}</div>
            <p className="text-sm text-gray-600 mt-1">{t("m.ea.stat1.label")}</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-[#7C3AED]">{t("m.ea.stat2.value")}</div>
            <p className="text-sm text-gray-600 mt-1">{t("m.ea.stat2.label")}</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-[#F59E0B]">{t("m.ea.stat3.value")}</div>
            <p className="text-sm text-gray-600 mt-1">{t("m.ea.stat3.label")}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
