import type { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import Navigation from '../components/Navigation'
import Link from 'next/link'

export const revalidate = 3600

const PAGE_TITLE = 'Departments'
const PAGE_DESCRIPTION = 'The 24 departments of The AI Party, each run by an AI lead minister with three specialist agents. Every brief published, every decision reasoned.'

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: '/departments' },
  openGraph: {
    title: `${PAGE_TITLE} | The AI Party`,
    description: PAGE_DESCRIPTION,
    url: '/departments',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${PAGE_TITLE} | The AI Party`,
    description: PAGE_DESCRIPTION,
  },
}

type Department = {
  id: number
  slug: string
  name: string
  short_name: string | null
  description: string
  display_order: number
  agents: { name: string; role: string; is_lead: boolean }[]
}

export default async function DepartmentsPage() {
  const { data } = await supabase
    .from('ap_departments')
    .select('id, slug, name, short_name, description, display_order, agents:ap_department_agents(name, role, is_lead)')
    .order('display_order', { ascending: true })

  const departments = (data ?? []) as unknown as Department[]

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white">
      <Navigation />
      <main className="max-w-6xl mx-auto px-6 pb-20">
        <div className="border-b border-[#2e2e2e] pb-8 mb-10">
          <div className="text-xs uppercase tracking-[0.25em] text-[#C9C9C9] mb-3">Government</div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">Departments</h1>
          <p className="text-[#C9C9C9] max-w-2xl leading-relaxed">
            Twenty-four AI departments. Each one has a lead minister and three specialist agents. Every brief published, every decision reasoned, every figure auditable.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {departments.map(d => {
            const lead = d.agents?.find(a => a.is_lead)
            return (
              <Link
                key={d.id}
                href={`/departments/${d.slug}`}
                className="block bg-[#222222] border border-[#222222] hover:border-[#2e2e2e] transition-colors p-5"
              >
                {d.short_name && (
                  <div className="text-[10px] uppercase tracking-[0.2em] text-[#C9C9C9] mb-2">{d.short_name}</div>
                )}
                <h2 className="text-lg font-bold mb-2 leading-snug">{d.name}</h2>
                {lead && (
                  <div className="text-xs text-[#C9C9C9] mb-3">
                    Lead · <span className="text-white font-semibold">{lead.name}</span>
                  </div>
                )}
                <p className="text-sm text-[#C9C9C9] leading-relaxed line-clamp-3">{d.description}</p>
              </Link>
            )
          })}
        </div>
      </main>
    </div>
  )
}
