import type { Metadata } from 'next'
import Navigation from '../components/Navigation'
import CustomAmount from './CustomAmount'

const PAGE_TITLE = 'Donate'
const PAGE_DESCRIPTION = 'Fund the future of democracy. The AI Party runs on public support — no corporate donors, no party backers. Choose a tier or donate any amount.'

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: '/donate' },
  openGraph: {
    title: `${PAGE_TITLE} | The AI Party`,
    description: PAGE_DESCRIPTION,
    url: '/donate',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${PAGE_TITLE} | The AI Party`,
    description: PAGE_DESCRIPTION,
  },
}

// Stripe Payment Link placeholders. Replace with real Stripe-hosted Payment Links
// (or a Stripe Checkout session route) before going live.
type Tier = {
  amount: number
  cadence: string
  label: string | null
  blurb: string
  stripeUrl: string
  highlight?: boolean
}

const TIERS: Tier[] = [
  {
    amount: 5,
    cadence: 'per month',
    label: null,
    blurb: 'Keeps a single AI minister researching policy for a week.',
    stripeUrl: 'https://buy.stripe.com/REPLACE_5_MONTHLY',
  },
  {
    amount: 10,
    cadence: 'per month',
    label: null,
    blurb: 'Funds the live policy voting infrastructure for one constituency.',
    stripeUrl: 'https://buy.stripe.com/REPLACE_10_MONTHLY',
  },
  {
    amount: 25,
    cadence: 'per month',
    label: null,
    blurb: 'Underwrites a whole department brief — research, costing, public reasoning.',
    stripeUrl: 'https://buy.stripe.com/REPLACE_25_MONTHLY',
  },
  {
    amount: 50,
    cadence: 'per month',
    label: 'Party Patron',
    blurb: 'Maximum impact. Your contribution funds new policy research and keeps the AI running 24/7.',
    stripeUrl: 'https://buy.stripe.com/REPLACE_50_MONTHLY',
    highlight: true,
  },
]

export default function DonatePage() {
  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white">
      <Navigation />
      <main className="max-w-5xl mx-auto px-6 pb-20">
        <div className="border-b border-[#2e2e2e] pb-10 mb-10">
          <div className="text-xs uppercase tracking-[0.25em] text-[#C9C9C9] mb-3">Support</div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight mb-5 leading-tight">
            Fund the future of democracy
          </h1>
          <p className="text-lg text-[#C9C9C9] max-w-3xl leading-relaxed">
            The AI Party runs on public support. No corporate donors. No party backers. Just people who believe decisions should be made by everyone.
          </p>
        </div>

        <section className="mb-12">
          <div className="text-xs uppercase tracking-[0.25em] text-[#C9C9C9] mb-5">Monthly tiers</div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {TIERS.map(t => (
              <div
                key={t.amount}
                className={`flex flex-col bg-[#222222] border p-6 transition-colors ${
                  t.highlight ? 'border-white' : 'border-[#222222] hover:border-[#2e2e2e]'
                }`}
              >
                {t.label && (
                  <div className="text-[10px] uppercase tracking-[0.2em] text-white font-bold mb-3">
                    {t.label}
                  </div>
                )}
                <div className="mb-2">
                  <span className="text-4xl font-black tracking-tight">£{t.amount}</span>
                  <span className="text-sm text-[#C9C9C9] ml-2">{t.cadence}</span>
                </div>
                <p className="text-sm text-[#C9C9C9] leading-relaxed mb-6 flex-1">{t.blurb}</p>
                <a
                  href={t.stripeUrl}
                  className={`block w-full text-center py-3 font-bold text-sm uppercase tracking-wider transition-colors ${
                    t.highlight
                      ? 'bg-white text-[#1a1a1a] hover:bg-[#C9C9C9]'
                      : 'border border-white text-white hover:bg-white hover:text-[#1a1a1a]'
                  }`}
                >
                  Donate £{t.amount}/mo
                </a>
              </div>
            ))}
          </div>
        </section>

        <section>
          <CustomAmount />
        </section>

        <p className="mt-10 text-xs text-[#C9C9C9] leading-relaxed max-w-3xl">
          The AI Party is not a registered UK political party (yet). Donations fund the platform, the AI cabinet
          infrastructure, and the public voting system. We publish where every pound goes.
        </p>
      </main>
    </div>
  )
}
