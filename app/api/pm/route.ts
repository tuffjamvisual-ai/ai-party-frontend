import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Live-data feed for the AI Prime Minister persona (consumed by OpenClaw).
// Public, no auth — read-only aggregate of public policy data.

export const dynamic = 'force-dynamic'

type PolicyRow = {
  id: number
  title: string
  area: string
  summary: string
  status: string
  vote_count_support: number
  vote_count_oppose: number
  created_at: string
}

type PolicySnapshot = {
  id: number
  title: string
  area: string
  summary: string
  status: string
  votes: { support: number; oppose: number; total: number }
  percentages: { support: number; oppose: number }
  passed: boolean
  created_at: string
}

function snapshot(row: PolicyRow): PolicySnapshot {
  const support = row.vote_count_support
  const oppose = row.vote_count_oppose
  const total = support + oppose
  const supportPct = total > 0 ? Math.round((support / total) * 100) : 0
  const opposePct = total > 0 ? 100 - supportPct : 0
  return {
    id: row.id,
    title: row.title,
    area: row.area,
    summary: row.summary,
    status: row.status,
    votes: { support, oppose, total },
    percentages: { support: supportPct, oppose: opposePct },
    passed: total > 0 && supportPct > 50,
    created_at: row.created_at,
  }
}

function buildSummary(policies: PolicySnapshot[]): string {
  const totalVotes = policies.reduce((sum, p) => sum + p.votes.total, 0)
  const passed = policies.filter(p => p.passed).length
  const date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

  const voted = policies.filter(p => p.votes.total > 0)
  const popular = voted.length
    ? [...voted].sort((a, b) => b.percentages.support - a.percentages.support)[0]
    : null
  const controversial = voted.length
    ? [...voted].sort((a, b) => Math.abs(a.percentages.support - 50) - Math.abs(b.percentages.support - 50))[0]
    : null

  const parts: string[] = []
  parts.push(`As of ${date}, the AI Party has ${policies.length} policy proposals open for public voting, with ${totalVotes.toLocaleString()} votes cast across all of them.`)
  if (passed > 0) {
    parts.push(`${passed} of ${policies.length} have achieved majority support so far.`)
  }
  if (popular) {
    parts.push(`The most popular is "${popular.title}" (${popular.percentages.support}% support, ${popular.votes.total} votes).`)
  }
  if (controversial && controversial.id !== popular?.id) {
    parts.push(`The most controversial is "${controversial.title}" — currently ${controversial.percentages.support}% support, ${controversial.percentages.oppose}% oppose.`)
  }
  parts.push(`The AI Party operates on the principle that AI ministers propose and the public decides; nothing is implemented without majority public support.`)
  return parts.join(' ')
}

export async function GET() {
  const { data, error } = await supabase
    .from('ap_policies')
    .select('id, title, area, summary, status, vote_count_support, vote_count_oppose, created_at')
    .order('id', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const rows = (data ?? []) as PolicyRow[]
  const policies = rows.map(snapshot)
  const totalVotes = policies.reduce((sum, p) => sum + p.votes.total, 0)
  const policiesPassed = policies.filter(p => p.passed).length

  const voted = policies.filter(p => p.votes.total > 0)
  const mostPopular = voted.length
    ? [...voted].sort((a, b) => b.percentages.support - a.percentages.support)[0]
    : null
  const mostControversial = voted.length
    ? [...voted].sort((a, b) => Math.abs(a.percentages.support - 50) - Math.abs(b.percentages.support - 50))[0]
    : null
  const latestFive = [...policies]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)

  return NextResponse.json({
    generated_at: new Date().toISOString(),
    stats: {
      total_policies: policies.length,
      total_votes: totalVotes,
      policies_passed: policiesPassed,
    },
    policies,
    most_popular: mostPopular,
    most_controversial: mostControversial,
    latest_5: latestFive,
    summary: buildSummary(policies),
  })
}
