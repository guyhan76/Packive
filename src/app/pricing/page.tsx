'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useI18n } from '@/components/i18n-context';
import Link from 'next/link';

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    period: '/mo',
    description: { en: 'Get started for free', ko: '무료로 시작하기', ja: '無料で始める' },
    features: {
      en: ['3 designs/month', '5 basic templates', 'AI Copy 3x/month', 'PDF export (watermark)', 'Low-res PNG export'],
      ko: ['월 3개 디자인', '기본 템플릿 5종', 'AI 카피 생성 3회/월', 'PDF 내보내기 (워터마크)', '저해상도 PNG 내보내기'],
      ja: ['月3デザイン', '基本テンプレート5種', 'AIコピー月3回', 'PDFエクスポート(透かし)', '低解像度PNGエクスポート'],
    },
    cta: { en: 'Start Free', ko: '무료 시작', ja: '無料で開始' },
    popular: false,
  },
  {
    id: 'smart',
    name: 'Smart',
    price: 29,
    period: '/mo',
    description: { en: 'For growing brands', ko: '성장하는 브랜드를 위해', ja: '成長するブランドに' },
    features: {
      en: ['20 designs/month', 'All templates', 'AI Copy 30x/month', 'AI Review 10x/month', 'AI Image Gen 10x/month', 'High-res PDF (no watermark)'],
      ko: ['월 20개 디자인', '전체 템플릿', 'AI 카피 생성 30회/월', 'AI 디자인 리뷰 10회/월', 'AI 이미지 생성 10회/월', '고해상도 PDF (워터마크 없음)'],
      ja: ['月20デザイン', '全テンプレート', 'AIコピー月30回', 'AIレビュー月10回', 'AI画像生成月10回', '高解像度PDF(透かしなし)'],
    },
    cta: { en: 'Get Smart', ko: 'Smart 시작', ja: 'Smartを始める' },
    popular: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 99,
    period: '/mo',
    description: { en: 'For professional teams', ko: '전문 팀을 위해', ja: 'プロチーム向け' },
    features: {
      en: ['Unlimited designs', 'Premium templates', 'Unlimited AI Copy', 'Unlimited AI Review', 'Unlimited AI Image Gen', 'AI Image Upscale', 'CTP print-ready PDF', 'Team collaboration (5)'],
      ko: ['무제한 디자인', '프리미엄 템플릿', 'AI 카피 생성 무제한', 'AI 디자인 리뷰 무제한', 'AI 이미지 생성 무제한', 'AI 이미지 업스케일', 'CTP 출력용 고해상도 PDF', '팀 협업 (최대 5명)'],
      ja: ['無制限デザイン', 'プレミアムテンプレート', 'AIコピー無制限', 'AIレビュー無制限', 'AI画像生成無制限', 'AI画像アップスケール', 'CTP印刷用PDF', 'チーム連携(5名)'],
    },
    cta: { en: 'Get Pro', ko: 'Pro 시작', ja: 'Proを始める' },
    popular: true,
  },
];

function PricingContent() {
  const { locale } = useI18n();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCanceled, setShowCanceled] = useState(false);

  useEffect(() => {
    if (searchParams.get('success') === 'true') setShowSuccess(true);
    if (searchParams.get('canceled') === 'true') setShowCanceled(true);
  }, [searchParams]);

  const handleSubscribe = async (planId: string) => {
    if (planId === 'free') {
      router.push('/editor/new');
      return;
    }
    setLoading(planId);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Payment error');
      }
    } catch {
      alert('Network error. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const title: Record<string, string> = {
    en: 'Choose Your Plan',
    ko: '요금제를 선택하세요',
    ja: 'プランを選択',
  };
  const subtitle: Record<string, string> = {
    en: 'Start free, upgrade when you need more power.',
    ko: '무료로 시작하고, 더 많은 기능이 필요할 때 업그레이드하세요.',
    ja: '無料で始めて、必要に応じてアップグレード。',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-md bg-black/30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Packive
          </Link>
          <Link href="/editor/new" className="text-sm text-white/60 hover:text-white transition">
            ← Back to Editor
          </Link>
        </div>
      </header>

      {/* Success / Cancel Banner */}
      {showSuccess && (
        <div className="bg-green-500/20 border border-green-500/50 text-green-300 text-center py-3 text-sm">
          {locale === 'ko' ? '구독이 완료되었습니다! 모든 기능을 이용할 수 있습니다.' : locale === 'ja' ? 'サブスクリプションが完了しました！' : 'Subscription successful! You now have full access.'}
          <button onClick={() => setShowSuccess(false)} className="ml-4 underline">✕</button>
        </div>
      )}
      {showCanceled && (
        <div className="bg-yellow-500/20 border border-yellow-500/50 text-yellow-300 text-center py-3 text-sm">
          {locale === 'ko' ? '결제가 취소되었습니다.' : locale === 'ja' ? '支払いがキャンセルされました。' : 'Payment was canceled.'}
          <button onClick={() => setShowCanceled(false)} className="ml-4 underline">✕</button>
        </div>
      )}

      {/* Pricing Section */}
      <main className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            {title[locale] || title.en}
          </h1>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            {subtitle[locale] || subtitle.en}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl p-8 transition-all duration-300 hover:scale-[1.02] ${
                plan.popular
                  ? 'bg-gradient-to-b from-purple-500/20 to-blue-500/20 border-2 border-purple-500/50 shadow-xl shadow-purple-500/10'
                  : 'bg-white/5 border border-white/10 hover:border-white/20'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider">
                  {locale === 'ko' ? '가장 인기' : locale === 'ja' ? '一番人気' : 'Most Popular'}
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                <p className="text-sm text-white/50">{plan.description[locale] || plan.description.en}</p>
              </div>

              <div className="mb-8">
                <span className="text-5xl font-bold">${plan.price}</span>
                <span className="text-white/50 ml-1">{plan.period}</span>
              </div>

              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={loading === plan.id}
                className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 mb-8 ${
                  plan.popular
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg'
                    : plan.id === 'free'
                    ? 'bg-white/10 hover:bg-white/20 text-white'
                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading === plan.id
                  ? (locale === 'ko' ? '처리 중...' : locale === 'ja' ? '処理中...' : 'Processing...')
                  : (plan.cta[locale] || plan.cta.en)}
              </button>

              <ul className="space-y-3">
                {(plan.features[locale] || plan.features.en).map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-green-400 mt-0.5 shrink-0">✓</span>
                    <span className="text-white/70">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* FAQ or Trust */}
        <div className="mt-20 text-center">
          <p className="text-white/40 text-sm">
            {locale === 'ko'
              ? '모든 플랜은 언제든지 취소할 수 있습니다. 7일 무료 체험 포함.'
              : locale === 'ja'
              ? 'すべてのプランはいつでもキャンセル可能。7日間無料トライアル付き。'
              : 'All plans can be canceled anytime. Includes 7-day free trial.'}
          </p>
          <div className="flex items-center justify-center gap-6 mt-6 text-white/30 text-xs">
            <span>🔒 Secured by Stripe</span>
            <span>💳 Visa, Mastercard, Amex</span>
            <span>🌐 Global payments</span>
          </div>
        </div>
      </main>
    </div>
  );
}
export default function PricingPage() {
    return (
      <Suspense fallback={<div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">Loading...</div>}>
        <PricingContent />
      </Suspense>
    );
  }
  