import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = BigInt(params.id);
    const tiers = await prisma.ticketTier.findMany({
      where: { event_id: eventId },
      orderBy: { contract_tier_index: 'asc' },
    });

    return NextResponse.json({
      tiers: tiers.map(t => ({
        ticket_tier_id: t.ticket_tier_id.toString(),
        tier: t.tier,
        price: t.price.toString(),
        max_supply: t.max_supply,
        contract_tier_index: t.contract_tier_index,
      })),
    });
  } catch (error: any) {
    console.error('Get tiers error:', error);
    return NextResponse.json({ error: 'Internal Server Error', detail: error.message }, { status: 500 });
  }
}
