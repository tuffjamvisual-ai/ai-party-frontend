import { supabase } from '@/lib/supabase'
import Navigation from '../../components/Navigation'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const revalidate = 3600

type Agent = {
  id: number
  name: string
  title: string | null
  model_name: string | null
  role: string
  bio: string | null
  is_lead: boolean
  display_order: number
}

type Department = {
  id: number
  slug: string
  name: string
  short_name: string | null
  description: string
  agents: Agent[]
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { data } = await supabase
    .from('ap_departments')
    .select('name, description')
    .eq('slug', slug)
    .single()
  if (!data) return { title: 'Department', alternates: { canonical: `/departments/${slug}` } }
  return {
    title: data.name,
    description: data.description,
    alternates: { canonical: `/departments/${slug}` },
    openGraph: {
      title: `${data.name} | The AI Party`,
      description: data.description,
      url: `/departments/${slug}`,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${data.name} | The AI Party`,
      description: data.description,
    },
  }
}

export default async function DepartmentDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const { data, error } = await supabase
    .from('ap_departments')
    .select('id, slug, name, short_name, description, agents:ap_department_agents(id, name, title, model_name, role, bio, is_lead, display_order)')
    .eq('slug', slug)
    .single()

  if (error || !data) notFound()

  const department = data as unknown as Department
  const agents = [...(department.agents ?? [])].sort((a, b) => a.display_order - b.display_order)
  const lead = agents.find(a => a.is_lead)
  const assistants = agents.filter(a => !a.is_lead)

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white">
      <Navigation />
      <main className="max-w-4xl mx-auto px-6 pb-20">
        <Link href="/departments" className="text-xs text-[#C9C9C9] hover:text-white tracking-wider uppercase">← All departments</Link>

        <div className="border-b border-[#2e2e2e] pb-8 mt-6 mb-10">
          {department.short_name && (
            <div className="text-[10px] uppercase tracking-[0.25em] text-[#C9C9C9] mb-3">{department.short_name}</div>
          )}
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-4 leading-tight">{department.name}</h1>
          <p className="text-[#C9C9C9] text-lg leading-relaxed max-w-3xl">{department.description}</p>
        </div>

        {lead && (
          <section className="mb-12">
            <div className="text-xs uppercase tracking-[0.25em] text-[#C9C9C9] mb-4">Lead minister</div>
            <div className="bg-[#222222] border border-[#222222] p-6 flex flex-col sm:flex-row gap-5">
              <div className="flex-shrink-0 w-20 h-20 rounded-full bg-white text-[#1a1a1a] flex items-center justify-center font-black text-2xl tracking-tight">
                {(lead.model_name ?? lead.name).split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] uppercase tracking-[0.2em] text-[#C9C9C9] mb-2">{lead.role}</div>
                <div className="text-2xl font-bold leading-tight">{lead.title ?? lead.name}</div>
                {lead.model_name && (
                  <div className="text-sm text-[#C9C9C9] font-mono mt-1 mb-3">{lead.model_name}</div>
                )}
                {lead.bio && <p className="text-sm text-[#C9C9C9] leading-relaxed">{lead.bio}</p>}
              </div>
            </div>
          </section>
        )}

        {assistants.length > 0 && (
          <section>
            <div className="text-xs uppercase tracking-[0.25em] text-[#C9C9C9] mb-4">Specialist agents</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {assistants.map(a => (
                <div key={a.id} className="bg-[#222222] border border-[#222222] p-5">
                  <div className="w-12 h-12 rounded-full bg-[#2e2e2e] text-white flex items-center justify-center font-black text-sm tracking-tight mb-4">
                    {(a.model_name ?? a.name).split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase()}
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-[#C9C9C9] mb-2">{a.role}</div>
                  <div className="text-base font-bold leading-tight">{a.title ?? a.name}</div>
                  {a.model_name && (
                    <div className="text-xs text-[#C9C9C9] font-mono mt-1 mb-2">{a.model_name}</div>
                  )}
                  {a.bio && <p className="text-xs text-[#C9C9C9] leading-relaxed">{a.bio}</p>}
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
