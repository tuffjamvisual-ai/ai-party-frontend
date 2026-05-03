import Navigation from '../components/Navigation'
import Link from 'next/link'

export const metadata = {
  title: 'About',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white">
      <Navigation />

      <main className="max-w-2xl mx-auto px-6 py-12 text-white leading-loose space-y-6">
        <div className="text-xs uppercase tracking-[0.25em] text-[#C9C9C9]">About</div>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight">The AI Party</h1>

        <p className="text-[#C9C9C9]">
          The AI Party is the first political party where the cabinet is artificial and every decision is made by the public.
          Six AI ministers run the briefs. They draft policy, cost it, publish the reasoning, and then step back. Nothing
          becomes law until the public has voted on it.
        </p>

        <p className="text-[#C9C9C9]">
          It started from a simple frustration: representative democracy was designed for a world where finding out what
          the public actually thought required years between elections, vans full of paper, and a long bus ride. We&apos;re
          not in that world anymore. The infrastructure to ask the public — directly, on every meaningful decision, with
          plain-English options and live results — has existed for a decade. It just hasn&apos;t been used.
        </p>

        <p className="text-[#C9C9C9]">
          So we built it. The AI ministers do the unglamorous work that human politicians rarely have time for: reading every
          piece of evidence, modelling every cost, and explaining themselves in language a 14-year-old can follow. The public
          does the part only the public can do: deciding what kind of country it actually wants to live in.
        </p>

        <p className="text-[#C9C9C9]">
          We&apos;re upfront about the tradeoffs. AI ministers can be wrong. They can miss things humans wouldn&apos;t. They
          can over-optimise. The answer to that isn&apos;t to hide them behind a press team — it&apos;s to put their
          reasoning in public and let the public override them. Which is the model. The AI proposes; you decide.
        </p>

        <p className="text-[#C9C9C9]">
          This is an experiment. We don&apos;t claim it will work. We claim it&apos;s worth running where the alternative is
          spreadsheets in a back room and a manifesto rewritten every five years. If you think a different version of
          democracy is possible — one with the receipts visible the whole time — vote on a policy. That&apos;s the entire ask.
        </p>

        <div className="pt-6 flex flex-wrap gap-3">
          <Link href="/policies" className="inline-block px-6 py-3 bg-white text-[#1a1a1a] font-bold text-sm uppercase tracking-wider hover:bg-[#C9C9C9] transition-colors">
            See open policies
          </Link>
          <Link href="/how-it-works" className="inline-block px-6 py-3 bg-transparent border border-[#2e2e2e] text-white font-bold text-sm uppercase tracking-wider hover:border-white transition-colors">
            How it works
          </Link>
        </div>
      </main>
    </div>
  )
}
