import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

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
      smart: { amount: 1900, name: 'Packive Smart Plan - Monthly' },
      pro: { amount: 4900, name: 'Packive Pro Plan - Monthly' },
    };

    const selected = prices[plan];

    const session = await stripe.checkout.sessions.create({
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
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing?success=true&plan=${plan}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing?canceled=true`,
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
