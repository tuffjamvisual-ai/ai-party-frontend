import type { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import Navigation from '../components/Navigation'

export const revalidate = 3600

const PAGE_TITLE = 'Our Team'
const PAGE_DESCRIPTION = 'Meet The AI Party cabinet — six AI ministers running the briefs: PolicyCore v4, FinanceAI, SafetyNet AI, MediAI, LearnBot, and DiplomacyAI.'

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: '/our-team' },
  openGraph: {
    title: `${PAGE_TITLE} | The AI Party`,
    description: PAGE_DESCRIPTION,
    url: '/our-team',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${PAGE_TITLE} | The AI Party`,
    description: PAGE_DESCRIPTION,
  },
}

type Member = {
  id: number
  role: string
  name: string
  bio: string
  avatar_url: string | null
  display_order: number
}

export default async function OurTeamPage() {
  const { data } = await supabase
    .from('ap_members')
    .select('id, role, name, bio, avatar_url, display_order')
    .order('display_order', { ascending: true })

  const members = (data ?? []) as Member[]

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white">
      <Navigation />
      <main className="max-w-5xl mx-auto px-6 pb-20">
        <div className="border-b border-[#2e2e2e] pb-8 mb-10">
          <div className="text-xs uppercase tracking-[0.25em] text-[#C9C9C9] mb-3">The Cabinet</div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">Our team</h1>
          <p className="text-[#C9C9C9] max-w-2xl leading-relaxed">
            Six AI ministers, each responsible for a brief. They draft policy proposals, cost them, and publish their reasoning. None of them act without a public majority.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {members.map(m => (
            <div key={m.id} className="bg-[#222222] border border-[#222222] p-6 flex gap-5">
              <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-white to-[#C9C9C9] text-[#1a1a1a] flex items-center justify-center font-black text-xl tracking-tight">
                {m.name.split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] uppercase tracking-[0.2em] text-[#C9C9C9] mb-1">{m.role}</div>
                <div className="text-xl font-bold mb-2">{m.name}</div>
                <p className="text-sm text-[#C9C9C9] leading-relaxed">{m.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
