import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const { userId, policyId, choice } = await request.json();

  if (!userId || !policyId || !choice) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }
  if (choice !== 'support' && choice !== 'oppose') {
    return NextResponse.json({ error: 'Invalid choice' }, { status: 400 });
  }

  const { data: existing } = await supabase
    .from('ap_policy_votes')
    .select('id')
    .eq('user_id', userId)
    .eq('policy_id', policyId)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: 'Already voted' }, { status: 400 });
  }

  const { error: voteError } = await supabase
    .from('ap_policy_votes')
    .insert({ user_id: userId, policy_id: policyId, choice });

  if (voteError) return NextResponse.json({ error: voteError.message }, { status: 500 });

  const field = choice === 'support' ? 'vote_count_support' : 'vote_count_oppose';

  const { data: policy } = await supabase
    .from('ap_policies')
    .select('vote_count_support, vote_count_oppose')
    .eq('id', policyId)
    .single();

  await supabase
    .from('ap_policies')
    .update({ [field]: ((policy as any)?.[field] ?? 0) + 1 })
    .eq('id', policyId);

  return NextResponse.json({ success: true });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) return NextResponse.json({ votes: {} });

  const { data } = await supabase
    .from('ap_policy_votes')
    .select('policy_id, choice')
    .eq('user_id', userId);

  const votes: Record<number, string> = {};
  (data || []).forEach((v: any) => { votes[v.policy_id] = v.choice; });

  return NextResponse.json({ votes });
}
