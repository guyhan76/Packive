import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-01-28.clover',
});

export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    priceId: null,
    features: [
      { text: '월 3개 디자인', included: true },
      { text: '기본 템플릿 5종', included: true },
      { text: 'AI 카피 생성 3회/월', included: true },
      { text: 'PDF 내보내기 (워터마크)', included: true },
      { text: 'AI 디자인 리뷰', included: false },
      { text: 'AI 이미지 생성', included: false },
      { text: 'CTP 출력용 PDF', included: false },
      { text: '팀 협업', included: false },
    ],
  },
  smart: {
    name: 'Smart',
    price: 19,
    priceId: 'price_smart_monthly',
    features: [
      { text: '월 20개 디자인', included: true },
      { text: '전체 템플릿', included: true },
      { text: 'AI 카피 생성 30회/월', included: true },
      { text: 'AI 디자인 리뷰 10회/월', included: true },
      { text: 'AI 이미지 생성 10회/월', included: true },
      { text: '고해상도 PDF (워터마크 없음)', included: true },
      { text: 'CTP 출력용 PDF', included: false },
      { text: '팀 협업', included: false },
    ],
  },
  pro: {
    name: 'Pro',
    price: 49,
    priceId: 'price_pro_monthly',
    popular: true,
    features: [
      { text: '무제한 디자인', included: true },
      { text: '프리미엄 템플릿 포함', included: true },
      { text: 'AI 카피 생성 무제한', included: true },
      { text: 'AI 디자인 리뷰 무제한', included: true },
      { text: 'AI 이미지 생성 무제한', included: true },
      { text: 'AI 이미지 업스케일', included: true },
      { text: 'CTP 출력용 고해상도 PDF', included: true },
      { text: '팀 협업 (최대 5명)', included: true },
    ],
  },
} as const;
