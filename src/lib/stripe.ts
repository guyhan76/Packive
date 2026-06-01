import Stripe from 'stripe';

// Stripe 클라이언트는 모듈 최상단(빌드 시점)이 아니라 런타임 첫 호출에 초기화한다.
// 최상단에서 new Stripe(undefined)를 평가하면 빌드의 page data collection 단계에서
// "Neither apiKey nor config.authenticator provided" 에러로 빌드 전체가 깨진다.
// STRIPE_SECRET_KEY가 placeholder/미설정이어도 빌드는 통과해야 하므로 지연 초기화한다.
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key || key === 'placeholder') {
      throw new Error(
        'STRIPE_SECRET_KEY가 설정되지 않았습니다 (placeholder/미설정). 결제 기능을 쓰려면 환경변수를 설정하세요.'
      );
    }
    _stripe = new Stripe(key, {
      // Stripe SDK 버전마다 expected apiVersion 문자열이 달라 cast로 유연성 확보
      apiVersion: '2026-02-25.clover' as Stripe.LatestApiVersion,
    });
  }
  return _stripe;
}

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
