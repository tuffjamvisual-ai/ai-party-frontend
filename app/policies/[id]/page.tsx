import { supabase } from '@/lib/supabase'
import Navigation from '../../components/Navigation'
import PolicyVote from './PolicyVote'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const revalidate = 60

type Policy = {
  id: number
  title: string
  area: string
  summary: string
  status: string
  support_arguments: string[]
  oppose_arguments: string[]
  vote_count_support: number
  vote_count_oppose: number
  proposer: { id: number; role: string; name: string } | null
}

export default async function PolicyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const { data, error } = await supabase
    .from('ap_policies')
    .select('id, title, area, summary, status, support_arguments, oppose_arguments, vote_count_support, vote_count_oppose, proposer:ap_members!proposed_by(id, role, name)')
    .eq('id', id)
    .single()

  if (error || !data) notFound()

  const policy = data as unknown as Policy

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white">
      <Navigation />
      <main className="max-w-3xl mx-auto px-6 pb-20">
        <Link href="/policies" className="text-xs text-[#9a9a9a] hover:text-white tracking-wider uppercase">← All policies</Link>

        <div className="border-b border-[#333] pb-8 mt-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[10px] uppercase tracking-[0.2em] bg-white text-black px-2 py-0.5 font-bold">{policy.area}</span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#9a9a9a]">Open for voting</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-4 leading-tight">{policy.title}</h1>
          {policy.proposer && (
            <div className="text-sm text-[#9a9a9a]">
              Proposed by <span className="text-white font-semibold">{policy.proposer.name}</span> · {policy.proposer.role}
            </div>
          )}
        </div>

        <section className="mb-10">
          <div className="text-xs uppercase tracking-[0.25em] text-[#9a9a9a] mb-3">Plain English summary</div>
          <p className="text-[#dddddd] text-lg leading-relaxed">{policy.summary}</p>
        </section>

        <PolicyVote
          policyId={policy.id}
          initialSupport={policy.vote_count_support}
          initialOppose={policy.vote_count_oppose}
        />

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
          <div className="bg-[#0f1d0f] border border-[#2a4a2a] p-6">
            <div className="text-xs uppercase tracking-[0.2em] text-[#7ec973] font-bold mb-3">Arguments to support</div>
            <ul className="space-y-3">
              {policy.support_arguments.map((arg, i) => (
                <li key={i} className="text-sm text-[#cfe7c9] leading-relaxed flex gap-3">
                  <span className="text-[#7ec973] font-bold">+</span>
                  <span>{arg}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-[#1d0f0f] border border-[#4a2a2a] p-6">
            <div className="text-xs uppercase tracking-[0.2em] text-[#e07b7b] font-bold mb-3">Arguments to oppose</div>
            <ul className="space-y-3">
              {policy.oppose_arguments.map((arg, i) => (
                <li key={i} className="text-sm text-[#e7c9c9] leading-relaxed flex gap-3">
                  <span className="text-[#e07b7b] font-bold">−</span>
                  <span>{arg}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
    </div>
  )
}
