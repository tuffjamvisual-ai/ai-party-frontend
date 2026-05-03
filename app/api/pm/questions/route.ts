import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Public Q&A intake. Anyone can ask the AI PM a question; OpenClaw picks
// up unanswered rows and posts replies via /api/pm/answer.

export const dynamic = 'force-dynamic'

const MAX_QUESTION_LENGTH = 2000

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const question = typeof (body as { question?: unknown })?.question === 'string'
    ? ((body as { question: string }).question).trim()
    : ''

  if (!question) {
    return NextResponse.json({ error: 'question is required' }, { status: 400 })
  }
  if (question.length > MAX_QUESTION_LENGTH) {
    return NextResponse.json(
      { error: `question must be ${MAX_QUESTION_LENGTH} characters or fewer` },
      { status: 400 },
    )
  }

  const { data, error } = await supabase
    .from('ap_public_questions')
    .insert({ question })
    .select('id, question, asked_at, answered, answer, answered_at')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ question: data }, { status: 201 })
}
