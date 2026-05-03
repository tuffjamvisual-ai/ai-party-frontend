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
    <section className="bg-[#0d0d0d] border border-[#333] p-6">
      <div className="text-xs uppercase tracking-[0.25em] text-[#9a9a9a] mb-4">Cast your vote</div>

      {total > 0 && (
        <>
          <div className="h-3 bg-[#222] flex overflow-hidden mb-2">
            <div className="h-full bg-[#4a8a3a] transition-all" style={{ width: `${supportPct}%` }} />
            <div className="h-full bg-[#8a3a3a] transition-all" style={{ width: `${opposePct}%` }} />
          </div>
          <div className="flex justify-between text-xs text-[#9a9a9a] mb-5">
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
              ? 'bg-[#4a8a3a] border-[#4a8a3a] text-white'
              : userVote
              ? 'bg-[#1a1a1a] border-[#333] text-[#666] cursor-not-allowed'
              : 'bg-[#1a1a1a] border-[#4a8a3a] text-[#7ec973] hover:bg-[#4a8a3a] hover:text-white'
          }`}
        >
          {userVote === 'support' ? '✓ Supported' : 'Support'}
        </button>
        <button
          onClick={() => handleVote('oppose')}
          disabled={!!userVote || submitting}
          className={`py-3 font-bold text-sm uppercase tracking-wider transition-colors border ${
            userVote === 'oppose'
              ? 'bg-[#8a3a3a] border-[#8a3a3a] text-white'
              : userVote
              ? 'bg-[#1a1a1a] border-[#333] text-[#666] cursor-not-allowed'
              : 'bg-[#1a1a1a] border-[#8a3a3a] text-[#e07b7b] hover:bg-[#8a3a3a] hover:text-white'
          }`}
        >
          {userVote === 'oppose' ? '✓ Opposed' : 'Oppose'}
        </button>
      </div>

      {!user && (
        <div className="mt-3 text-xs text-[#9a9a9a]">Log in to record your vote and shift the live tally.</div>
      )}
      {error && <div className="mt-3 text-xs text-[#e07b7b]">{error}</div>}
      {userVote && <div className="mt-3 text-xs text-[#9a9a9a]">Your vote is locked in.</div>}
    </section>
  )
}
