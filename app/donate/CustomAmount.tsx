'use client'

import { useState } from 'react'

// Stripe Payment Links don't accept dynamic amounts; this constructs a placeholder
// URL with the amount as a query string. Replace with a Stripe Checkout session
// endpoint when integrating for real.
const CUSTOM_STRIPE_BASE = 'https://buy.stripe.com/REPLACE_CUSTOM'

export default function CustomAmount() {
  const [amount, setAmount] = useState('')
  const numeric = parseFloat(amount)
  const valid = !Number.isNaN(numeric) && numeric > 0

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!valid) return
    window.location.href = `${CUSTOM_STRIPE_BASE}?amount=${encodeURIComponent(numeric.toFixed(2))}`
  }

  return (
    <form onSubmit={onSubmit} className="bg-[#222222] border border-[#2e2e2e] p-6">
      <div className="text-[10px] uppercase tracking-[0.2em] text-[#C9C9C9] mb-3">Custom amount</div>
      <h3 className="text-xl font-bold mb-4">Donate any amount</h3>
      <p className="text-sm text-[#C9C9C9] leading-relaxed mb-5">
        Pick whatever feels right. One-off, no subscription. Every pound is logged and accounted for in the public ledger.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C9C9C9] font-bold">£</span>
          <input
            type="number"
            inputMode="decimal"
            min="1"
            step="0.01"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="50"
            aria-label="Custom donation amount in pounds"
            className="w-full pl-10 pr-4 py-3 bg-[#1a1a1a] border border-[#2e2e2e] focus:border-white text-white text-base outline-none transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={!valid}
          className={`px-6 py-3 font-bold text-sm uppercase tracking-wider transition-colors ${
            valid
              ? 'bg-white text-[#1a1a1a] hover:bg-[#C9C9C9]'
              : 'bg-[#2e2e2e] text-[#C9C9C9] cursor-not-allowed'
          }`}
        >
          Donate custom amount
        </button>
      </div>
    </form>
  )
}
