import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Service-to-service endpoint: OpenClaw POSTs an answer for a previously
// stored question. Auth is a shared bearer token (INTERNAL_API_KEY) — the
// same secret already configured in the Vercel project envs.

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const expected = process.env.INTERNAL_API_KEY
  if (!expected) {
    return NextResponse.json({ error: 'Server misconfigured: INTERNAL_API_KEY not set' }, { status: 500 })
  }

  const auth = request.headers.get('authorization') ?? ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null
  if (!token || token !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const questionIdRaw = (body as { question_id?: unknown })?.question_id
  const answerRaw = (body as { answer?: unknown })?.answer
  const questionId = typeof questionIdRaw === 'number'
    ? questionIdRaw
    : typeof questionIdRaw === 'string' && /^\d+$/.test(questionIdRaw)
      ? Number(questionIdRaw)
      : null
  const answer = typeof answerRaw === 'string' ? answerRaw.trim() : ''

  if (questionId === null) {
    return NextResponse.json({ error: 'question_id (positive integer) is required' }, { status: 400 })
  }
  if (!answer) {
    return NextResponse.json({ error: 'answer (non-empty string) is required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('ap_public_questions')
    .update({ answer, answered: true, answered_at: new Date().toISOString() })
    .eq('id', questionId)
    .select('id, question, asked_at, answered, answer, answered_at')
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: 'question not found' }, { status: 404 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ question: data })
}
