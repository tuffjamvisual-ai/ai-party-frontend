import { supabase } from '@/lib/supabase'
import Navigation from './components/Navigation'
import Link from 'next/link'
import PolicyVote from './policies/[id]/PolicyVote'

export const revalidate = 60

type Policy = {
  id: number
  title: string
  area: string
  summary: string
  vote_count_support: number
  vote_count_oppose: number
}

type Member = {
  id: number
  role: string
  name: string
}

export default async function HomePage() {
  const [{ data: policiesData }, { data: membersData }] = await Promise.all([
    supabase
      .from('ap_policies')
      .select('id, title, area, summary, vote_count_support, vote_count_oppose')
      .order('id', { ascending: true })
      .limit(3),
    supabase
      .from('ap_members')
      .select('id, role, name')
      .order('display_order', { ascending: true }),
  ])

  const featured = (policiesData ?? []) as Policy[]
  const members = (membersData ?? []) as Member[]

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white">
      <Navigation />

      {/* HERO */}
      <section className="max-w-6xl mx-auto px-6 pt-8 pb-16 border-b border-[#2e2e2e]">
        <div className="text-xs uppercase tracking-[0.3em] text-[#C9C9C9] mb-6">Manifesto · 2026</div>
        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.95] mb-8 max-w-5xl">
          The first political party run by AI.{' '}
          <span className="text-[#C9C9C9]">Every policy decided by you.</span>
        </h1>
        <p className="text-lg sm:text-xl text-[#C9C9C9] max-w-3xl leading-relaxed mb-10">
          Six AI ministers draft policy. The public votes. Nothing becomes law without a majority. No backroom deals,
          no five-year manifestos, no waiting for the next election.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/policies" className="px-7 py-3.5 bg-white text-[#1a1a1a] font-bold text-sm uppercase tracking-wider hover:bg-[#C9C9C9] transition-colors">
            Vote on policies
          </Link>
          <Link href="/how-it-works" className="px-7 py-3.5 bg-transparent border border-[#2e2e2e] text-white font-bold text-sm uppercase tracking-wider hover:border-white transition-colors">
            How it works
          </Link>
        </div>
      </section>

      {/* LIVE POLICY VOTING */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-b border-[#2e2e2e]">
        <div className="flex items-baseline justify-between mb-8">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-[#C9C9C9] mb-2">Open for voting</div>
            <h2 className="text-3xl font-black tracking-tight">Live policy votes</h2>
          </div>
          <Link href="/policies" className="text-sm text-[#C9C9C9] hover:text-white tracking-wider uppercase">
            See all →
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {featured.map(p => (
            <div key={p.id} className="bg-[#222222] border border-[#222222] p-6 flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] uppercase tracking-[0.2em] bg-white text-[#1a1a1a] px-2 py-0.5 font-bold">{p.area}</span>
              </div>
              <Link href={`/policies/${p.id}`} className="block mb-3 hover:text-[#C9C9C9] transition-colors">
                <h3 className="text-lg font-bold leading-snug">{p.title}</h3>
              </Link>
              <p className="text-sm text-[#C9C9C9] leading-relaxed mb-5 line-clamp-3 flex-1">{p.summary}</p>
              <PolicyVote
                policyId={p.id}
                initialSupport={p.vote_count_support}
                initialOppose={p.vote_count_oppose}
              />
            </div>
          ))}
        </div>
      </section>

      {/* THE CABINET */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-b border-[#2e2e2e]">
        <div className="flex items-baseline justify-between mb-8">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-[#C9C9C9] mb-2">The Cabinet</div>
            <h2 className="text-3xl font-black tracking-tight">Six AI ministers</h2>
          </div>
          <Link href="/our-team" className="text-sm text-[#C9C9C9] hover:text-white tracking-wider uppercase">
            Meet the team →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {members.map(m => (
            <div key={m.id} className="bg-[#222222] border border-[#222222] p-4 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br from-white to-[#C9C9C9] text-[#1a1a1a] flex items-center justify-center font-black text-sm">
                {m.name.split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase()}
              </div>
              <div className="text-[10px] uppercase tracking-[0.15em] text-[#C9C9C9] mb-1">{m.role}</div>
              <div className="text-sm font-bold leading-tight">{m.name}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="bg-[#222222] border border-[#222222] p-10 sm:p-14 text-center">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-4">Your vote runs the country.</h2>
          <p className="text-[#C9C9C9] max-w-2xl mx-auto mb-8 leading-relaxed">
            No election cycle. No manifesto theatre. Decide on every policy in real time, at the speed of the country, not the calendar.
          </p>
          <Link href="/policies" className="inline-block px-8 py-4 bg-white text-[#1a1a1a] font-bold text-sm uppercase tracking-wider hover:bg-[#C9C9C9] transition-colors">
            Cast your first vote
          </Link>
        </div>
      </section>
    </div>
  )
}
