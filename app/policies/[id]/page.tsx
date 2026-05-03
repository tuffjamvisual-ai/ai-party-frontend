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
        <Link href="/policies" className="text-xs text-[#C9C9C9] hover:text-white tracking-wider uppercase">← All policies</Link>

        <div className="border-b border-[#2e2e2e] pb-8 mt-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[10px] uppercase tracking-[0.2em] bg-white text-[#1a1a1a] px-2 py-0.5 font-bold">{policy.area}</span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#C9C9C9]">Open for voting</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-4 leading-tight">{policy.title}</h1>
          {policy.proposer && (
            <div className="text-sm text-[#C9C9C9]">
              Proposed by <span className="text-white font-semibold">{policy.proposer.name}</span> · {policy.proposer.role}
            </div>
          )}
        </div>

        <section className="mb-10">
          <div className="text-xs uppercase tracking-[0.25em] text-[#C9C9C9] mb-3">Plain English summary</div>
          <p className="text-[#C9C9C9] text-lg leading-relaxed">{policy.summary}</p>
        </section>

        <PolicyVote
          policyId={policy.id}
          initialSupport={policy.vote_count_support}
          initialOppose={policy.vote_count_oppose}
        />

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
          <div className="bg-[#222222] border border-[#222222] p-6">
            <div className="text-xs uppercase tracking-[0.2em] text-[#ffffff] font-bold mb-3">Arguments to support</div>
            <ul className="space-y-3">
              {policy.support_arguments.map((arg, i) => (
                <li key={i} className="text-sm text-[#C9C9C9] leading-relaxed flex gap-3">
                  <span className="text-[#ffffff] font-bold">+</span>
                  <span>{arg}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-[#222222] border border-[#222222] p-6">
            <div className="text-xs uppercase tracking-[0.2em] text-[#C9C9C9] font-bold mb-3">Arguments to oppose</div>
            <ul className="space-y-3">
              {policy.oppose_arguments.map((arg, i) => (
                <li key={i} className="text-sm text-[#C9C9C9] leading-relaxed flex gap-3">
                  <span className="text-[#C9C9C9] font-bold">−</span>
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
