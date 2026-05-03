'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'

type Props = {
  policyId: number
  initialSupport: number
  initialOppose: number
}

export default function PolicyVote({ policyId, initialSupport, initialOppose }: Props) {
  const { user } = useAuth()
  const [support, setSupport] = useState(initialSupport)
  const [oppose, setOppose] = useState(initialOppose)
  const [userVote, setUserVote] = useState<'support' | 'oppose' | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    fetch(`/api/policies/vote?userId=${user.id}`)
      .then(r => r.json())
      .then(d => {
        const v = d.votes?.[policyId]
        if (v === 'support' || v === 'oppose') setUserVote(v)
      })
      .catch(() => {})
  }, [user, policyId])

  const total = support + oppose
  const supportPct = total > 0 ? Math.round(support / total * 100) : 0
  const opposePct = total > 0 ? 100 - supportPct : 0

  const handleVote = async (choice: 'support' | 'oppose') => {
    if (!user) {
      setError('Please log in to vote.')
      return
    }
    if (userVote || submitting) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/policies/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, policyId, choice }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Could not record vote.')
      } else {
        setUserVote(choice)
        if (choice === 'support') setSupport(s => s + 1)
        else setOppose(o => o + 1)
      }
    } catch {
      setError('Network error. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="bg-[#1c3849] border border-[#405b6b] p-6">
      <div className="text-xs uppercase tracking-[0.25em] text-[#C9C9C9] mb-4">Cast your vote</div>

      {total > 0 && (
        <>
          <div className="h-3 bg-[#1c3849] flex overflow-hidden mb-2">
            <div className="h-full bg-[#ffffff] transition-all" style={{ width: `${supportPct}%` }} />
            <div className="h-full bg-[#C9C9C9] transition-all" style={{ width: `${opposePct}%` }} />
          </div>
          <div className="flex justify-between text-xs text-[#C9C9C9] mb-5">
            <span>{supportPct}% support · {support}</span>
            <span>{total} votes</span>
            <span>{oppose} · {opposePct}% oppose</span>
          </div>
        </>
      )}

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => handleVote('support')}
          disabled={!!userVote || submitting}
          className={`py-3 font-bold text-sm uppercase tracking-wider transition-colors border ${
            userVote === 'support'
              ? 'bg-[#ffffff] border-[#ffffff] text-white'
              : userVote
              ? 'bg-[#002633] border-[#405b6b] text-[#C9C9C9] cursor-not-allowed'
              : 'bg-[#002633] border-[#ffffff] text-[#ffffff] hover:bg-[#ffffff] hover:text-white'
          }`}
        >
          {userVote === 'support' ? '✓ Supported' : 'Support'}
        </button>
        <button
          onClick={() => handleVote('oppose')}
          disabled={!!userVote || submitting}
          className={`py-3 font-bold text-sm uppercase tracking-wider transition-colors border ${
            userVote === 'oppose'
              ? 'bg-[#C9C9C9] border-[#C9C9C9] text-white'
              : userVote
              ? 'bg-[#002633] border-[#405b6b] text-[#C9C9C9] cursor-not-allowed'
              : 'bg-[#002633] border-[#C9C9C9] text-[#C9C9C9] hover:bg-[#C9C9C9] hover:text-white'
          }`}
        >
          {userVote === 'oppose' ? '✓ Opposed' : 'Oppose'}
        </button>
      </div>

      {!user && (
        <div className="mt-3 text-xs text-[#C9C9C9]">Log in to record your vote and shift the live tally.</div>
      )}
      {error && <div className="mt-3 text-xs text-[#C9C9C9]">{error}</div>}
      {userVote && <div className="mt-3 text-xs text-[#C9C9C9]">Your vote is locked in.</div>}
    </section>
  )
}
