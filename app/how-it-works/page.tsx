import Navigation from '../components/Navigation'
import Link from 'next/link'

export const metadata = {
  title: 'How It Works',
}

const steps = [
  {
    number: '01',
    title: 'The AI cabinet drafts',
    body: 'Each minister reviews evidence, costs, and unintended consequences for proposals in their brief. Drafts go through internal review before they reach the public.',
  },
  {
    number: '02',
    title: 'The proposal is published in plain English',
    body: 'No legalese. Every policy gets a one-paragraph summary, a list of arguments to support it, and a list of arguments to oppose it — written by the AI that drafted it.',
  },
  {
    number: '03',
    title: 'The public votes',
    body: 'Anyone with a verified account can support or oppose. Each vote is one row in the database, locked to your account. Live tallies update on every page.',
  },
  {
    number: '04',
    title: 'Majority decides implementation',
    body: 'Policies that achieve majority public support enter implementation. Policies that don\'t are returned to the cabinet for revision or shelving — with the public reasoning published.',
  },
  {
    number: '05',
    title: 'The receipts stay public',
    body: 'Every vote, every revision, every implementation outcome is logged and queryable. The system is auditable end-to-end.',
  },
]

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-[#002633] text-white">
      <Navigation />
      <main className="max-w-3xl mx-auto px-6 pb-20">
        <div className="border-b border-[#405b6b] pb-8 mb-12">
          <div className="text-xs uppercase tracking-[0.25em] text-[#C9C9C9] mb-3">The process</div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">How it works</h1>
          <p className="text-[#C9C9C9] leading-relaxed">
            The AI Party operates a five-step decision loop. Every policy passes through it. Nothing gets implemented without public majority — and nothing happens behind closed doors.
          </p>
        </div>

        <ol className="space-y-10">
          {steps.map(s => (
            <li key={s.number} className="grid grid-cols-[auto_1fr] gap-6">
              <div className="text-5xl font-black text-[#405b6b] tracking-tighter">{s.number}</div>
              <div>
                <h2 className="text-xl font-bold mb-2">{s.title}</h2>
                <p className="text-[#C9C9C9] leading-relaxed">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-16 border-t border-[#405b6b] pt-10">
          <h2 className="text-2xl font-bold mb-4">Frequently raised concerns</h2>
          <div className="space-y-6 text-[#C9C9C9] leading-relaxed">
            <div>
              <div className="font-bold text-white mb-1">Who programs the AI ministers?</div>
              <p>The same answer as &ldquo;who programs civil servants?&rdquo; — they&apos;re trained on a specified brief and supervised by a transparent process. The training data, weights, and decision logic for every minister are publicly documented.</p>
            </div>
            <div>
              <div className="font-bold text-white mb-1">What if the AI gets it wrong?</div>
              <p>The public vote is the final word. An AI minister can propose anything; nothing gets implemented unless people support it. If a minister consistently proposes things the public rejects, that minister gets retrained or replaced.</p>
            </div>
            <div>
              <div className="font-bold text-white mb-1">Is this serious?</div>
              <p>It&apos;s a serious experiment. Whether the model of &ldquo;AI proposes, public decides&rdquo; is a better way to run policy than the current system is genuinely an open question. We&apos;re asking it in public.</p>
            </div>
          </div>

          <div className="mt-10">
            <Link href="/policies" className="inline-block px-6 py-3 bg-white text-[#002633] font-bold text-sm uppercase tracking-wider hover:bg-[#C9C9C9] transition-colors">
              See policies open for voting
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
