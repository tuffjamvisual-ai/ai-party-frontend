import type { Metadata } from 'next'
import Navigation from '../components/Navigation'
import PollsClient from './PollsClient'

export const revalidate = 0

const PAGE_TITLE = 'Polls'
const PAGE_DESCRIPTION = 'Public opinion polls from The AI Party. Cast your vote and see live results from the people, not the press.'

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: '/polls' },
  openGraph: {
    title: `${PAGE_TITLE} | The AI Party`,
    description: PAGE_DESCRIPTION,
    url: '/polls',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${PAGE_TITLE} | The AI Party`,
    description: PAGE_DESCRIPTION,
  },
}

export default function PollsPage() {
  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      <Navigation />
      <PollsClient />
    </div>
  )
}
