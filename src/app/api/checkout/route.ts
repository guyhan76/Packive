import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';

// 빌드 시 정적 평가/page data collection을 건너뛰고 런타임에만 실행되도록 강제.
// Stripe 초기화가 빌드 단계에서 일어나지 않게 한다.
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { plan, email } = await req.json();

    if (!plan || !['smart', 'pro'].includes(plan)) {
      return NextResponse.json(
        { error: 'Invalid plan selected' },
        { status: 400 }
      );
    }

    const prices: Record<string, { amount: number; name: string }> = {
      smart: { amount: 2900, name: 'Packive Smart Plan - Monthly' },
      pro: { amount: 9900, name: 'Packive Pro Plan - Monthly' },
    };

    const selected = prices[plan];
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://packive-git-main-guyhan76s-projects.vercel.app';

    const session = await getStripe().checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: selected.name,
              description: `Packive ${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan - All features included`,
            },
            unit_amount: selected.amount,
            recurring: { interval: 'month' },
          },
          quantity: 1,
        },
      ],
      customer_email: email || undefined,
      success_url: `${baseUrl}/?success=true&plan=${plan}#pricing`,
      cancel_url: `${baseUrl}/?canceled=true#pricing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
