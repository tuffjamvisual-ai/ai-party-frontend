import { supabase } from '@/lib/supabase'
import Navigation from '../components/Navigation'
import Link from 'next/link'

export const revalidate = 60

type Policy = {
  id: number
  title: string
  area: string
  summary: string
  status: string
  vote_count_support: number
  vote_count_oppose: number
}

export default async function PoliciesPage() {
  const { data } = await supabase
    .from('ap_policies')
    .select('id, title, area, summary, status, vote_count_support, vote_count_oppose')
    .order('id', { ascending: true })

  const policies = (data ?? []) as Policy[]

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white">
      <Navigation />
      <main className="max-w-6xl mx-auto px-6 pb-20">
        <div className="border-b border-[#2e2e2e] pb-8 mb-10">
          <div className="text-xs uppercase tracking-[0.25em] text-[#C9C9C9] mb-3">Policies</div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">AI-generated policy proposals</h1>
          <p className="text-[#C9C9C9] max-w-2xl leading-relaxed">
            Each policy below was drafted by the AI cabinet. None get implemented without a public majority. Vote to support or oppose — every vote shifts the live tally.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {policies.map(p => {
            const total = p.vote_count_support + p.vote_count_oppose
            const supportPct = total > 0 ? Math.round(p.vote_count_support / total * 100) : 0
            const opposePct = total > 0 ? 100 - supportPct : 0
            return (
              <Link
                key={p.id}
                href={`/policies/${p.id}`}
                className="block bg-[#222222] border border-[#222222] hover:border-[#2e2e2e] transition-colors p-6"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] uppercase tracking-[0.2em] bg-white text-[#1a1a1a] px-2 py-0.5 font-bold">{p.area}</span>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#C9C9C9]">Open for voting</span>
                </div>
                <h2 className="text-xl font-bold mb-2 leading-snug">{p.title}</h2>
                <p className="text-sm text-[#C9C9C9] leading-relaxed mb-4 line-clamp-3">{p.summary}</p>
                {total > 0 ? (
                  <>
                    <div className="h-2 bg-[#222222] flex overflow-hidden mb-2">
                      <div className="h-full bg-[#ffffff]" style={{ width: `${supportPct}%` }} />
                      <div className="h-full bg-[#C9C9C9]" style={{ width: `${opposePct}%` }} />
                    </div>
                    <div className="flex justify-between text-xs text-[#C9C9C9]">
                      <span>{supportPct}% support · {p.vote_count_support}</span>
                      <span>{total} votes</span>
                      <span>{p.vote_count_oppose} · {opposePct}% oppose</span>
                    </div>
                  </>
                ) : (
                  <div className="text-xs text-[#C9C9C9]">No votes yet — be the first.</div>
                )}
              </Link>
            )
          })}
        </div>
      </main>
    </div>
  )
}
