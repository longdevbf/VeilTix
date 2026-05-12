import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/tickets/token?address=0x...
// Returns NFT tickets owned by this wallet.
// Strategy 1 (fast): Ticket.owner_wallet = address  (worker keeps this updated)
// Strategy 2 (fallback): find via Order → OrderItem → Ticket for gaps in owner_wallet
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get('address');
  if (!address) return NextResponse.json({ error: 'Address required' }, { status: 400 });

  try {
    // ── Strategy 1: direct owner_wallet lookup ──────────────────────────────
    const directTickets = await prisma.ticket.findMany({
      where: { owner_wallet: { equals: address, mode: 'insensitive' } },
      include: {
        event: { select: { title: true, image: true, location: true, start_time: true } },
        tier: { select: { tier: true } },
      },
      orderBy: { ticket_id: 'desc' },
    });

    const directIds = new Set(directTickets.map((t) => t.ticket_id.toString()));

    // ── Strategy 2: Order-based fallback for tickets without owner_wallet ───
    const wallet = await prisma.wallet.findUnique({ where: { address_wallet: address } });
    let orderTickets: typeof directTickets = [];

    if (wallet) {
      const orders = await prisma.order.findMany({
        where: { wallet_id: wallet.wallet_id },
        select: { event_id: true, order_items: { select: { ticket_tier_id: true } } },
      });

      const tierIds = [...new Set(orders.flatMap((o) => o.order_items.map((i) => i.ticket_tier_id)))];

      if (tierIds.length > 0) {
        const candidates = await prisma.ticket.findMany({
          where: {
            tier_id: { in: tierIds },
            owner_wallet: null,
          },
          include: {
            event: { select: { title: true, image: true, location: true, start_time: true } },
            tier: { select: { tier: true } },
          },
          orderBy: { ticket_id: 'desc' },
        });

        // Backfill owner_wallet in DB for these discovered tickets
        const missingIds = candidates.map((t) => t.ticket_id);
        if (missingIds.length > 0) {
          await prisma.ticket.updateMany({
            where: { ticket_id: { in: missingIds }, owner_wallet: null },
            data: { owner_wallet: address },
          });
        }

        orderTickets = candidates.filter((t) => !directIds.has(t.ticket_id.toString()));
      }
    }

    const allTickets = [...directTickets, ...orderTickets];

    // ── Attach listing info ─────────────────────────────────────────────────
    const tokenIds = allTickets.map((t) => t.ticket_id);
    const listings = tokenIds.length > 0
      ? await prisma.listing.findMany({
          where: { token_id: { in: tokenIds }, status: 'active' },
        })
      : [];
    const listingByToken = new Map(listings.map((l) => [l.token_id.toString(), l]));

    return NextResponse.json(
      allTickets.map((t) => {
        const listing = listingByToken.get(t.ticket_id.toString());
        return {
          token_id: t.ticket_id.toString(),
          event_id: t.event_id.toString(),
          event_name: t.event.title,
          event_image: t.event.image,
          event_location: t.event.location,
          event_date: t.event.start_time,
          tier: t.tier.tier,
          status: t.status,
          owner_wallet: t.owner_wallet,
          tx_hash: t.tx_hash,
          listing: listing
            ? {
                listing_id: listing.listing_id.toString(),
                contract_listing_id: listing.contract_listing_id.toString(),
                price: listing.price.toString(),
                status: listing.status,
              }
            : null,
        };
      })
    );
  } catch (err) {
    console.error('[GET /api/tickets/token]', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
