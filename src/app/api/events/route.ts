import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/events?status=active&limit=20&offset=0
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') ?? undefined;
  const organizer = searchParams.get('organizer') ?? undefined; // wallet address of event organizer
  const limit = parseInt(searchParams.get('limit') ?? '50');
  const offset = parseInt(searchParams.get('offset') ?? '0');

  try {
    const events = await prisma.event.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(organizer ? { wallet: { address_wallet: { equals: organizer, mode: 'insensitive' } } } : {}),
      },
      orderBy: { event_id: 'desc' },
      take: limit,
      skip: offset,
      include: {
        ticket_tiers: { select: { tier: true, price: true, max_supply: true } },
      },
    });

    return NextResponse.json(
      events.map((e) => ({
        event_id: e.event_id.toString(),
        wallet_id: e.wallet_id.toString(),
        title: e.title,
        description: e.description,
        image: e.image,
        location: e.location,
        start_time: e.start_time,
        end_time: e.end_time,
        price: e.price?.toString() ?? '0',
        total_tickets: e.total_tickets,
        sold_tickets: e.sold_tickets,
        contract_address: e.contract_address,
        status: e.status,
        ticket_tiers: e.ticket_tiers.map((t) => ({
          tier: t.tier,
          price: t.price.toString(),
          max_supply: t.max_supply,
        })),
      }))
    );
  } catch (err) {
    console.error('[GET /api/events]', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
