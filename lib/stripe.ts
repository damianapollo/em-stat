import Stripe from 'stripe'

// apiVersion omitted intentionally — the installed stripe-node SDK pins its own
// supported version, which avoids a literal-type mismatch on minor SDK bumps.
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
})

export const PLANS = {
  per_post: {
    name: 'Single Job Post',
    price_cents: 19900,
    description: '30-day listing, apply link, employer profile',
    duration_days: 30,
  },
  unlimited: {
    name: 'Unlimited Monthly',
    price_cents: 49900,
    description: 'Unlimited posts + candidate alerts + priority placement',
    duration_days: 30,
  },
} as const

export type PlanId = keyof typeof PLANS
