import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/listings?status=active&seller=0x...
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') ?? 'active';
  const sellerAddress = searchParams.get('seller') ?? undefined;

  try {
    const listings = await prisma.listing.findMany({
      where: {
        status,
        ...(sellerAddress ? { seller_wallet: { equals: sellerAddress, mode: 'insensitive' } } : {}),
      },
      orderBy: { created_at: 'desc' },
      include: {
        event: { select: { title: true, image: true, location: true, start_time: true } },
      },
    });

    return NextResponse.json(
      listings.map((l) => ({
        listing_id: l.listing_id.toString(),
        contract_listing_id: l.contract_listing_id.toString(),
        token_id: l.token_id.toString(),
        event_id: l.event_id.toString(),
        event_name: l.event.title,
        event_image: l.event.image,
        event_location: l.event.location,
        event_date: l.event.start_time,
        seller_wallet: l.seller_wallet,
        price: l.price.toString(),
        status: l.status,
        buyer_wallet: l.buyer_wallet,
        list_tx_hash: l.list_tx_hash,
        sold_tx_hash: l.sold_tx_hash,
        created_at: l.created_at,
        sold_at: l.sold_at,
      }))
    );
  } catch (err) {
    console.error('[GET /api/listings]', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/listings — create listing in DB immediately after listTicket tx confirms
// Body: { contractListingId, tokenId, eventId, sellerWallet, priceWei, txHash }
export async function POST(req: Request) {
  try {
    const { contractListingId, tokenId, eventId, sellerWallet, priceWei, txHash } = await req.json();

    if (contractListingId == null || tokenId == null || !sellerWallet || !priceWei) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const lid = BigInt(contractListingId);
    const tid = BigInt(tokenId);
    const eid = BigInt(eventId ?? 0);

    // Resolve eventId from Ticket if not provided
    let resolvedEventId = eid;
    if (!eventId || eid === BigInt(0)) {
      const ticket = await prisma.ticket.findUnique({ where: { ticket_id: tid } });
      if (ticket) resolvedEventId = ticket.event_id;
    }

    // Upsert listing (idempotent — worker may also write this)
    const listing = await prisma.listing.upsert({
      where: { contract_listing_id: lid },
      update: {
        status: 'active',
        seller_wallet: sellerWallet,
        price: priceWei,
        list_tx_hash: txHash ?? null,
      },
      create: {
        contract_listing_id: lid,
        token_id: tid,
        event_id: resolvedEventId,
        seller_wallet: sellerWallet,
        price: priceWei,
        status: 'active',
        list_tx_hash: txHash ?? null,
      },
    });

    // Mark ticket as listed
    await prisma.ticket.update({
      where: { ticket_id: tid },
      data: { status: 'listed' },
    });

    return NextResponse.json({ success: true, listing_id: listing.listing_id.toString() });
  } catch (err: any) {
    console.error('[POST /api/listings]', err);
    if (err?.code === 'P2025') {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal Server Error', detail: err.message }, { status: 500 });
  }
}

// PATCH /api/listings — update listing status (sold / cancelled)
// Body: { contractListingId, status, buyerWallet?, soldTxHash? }
export async function PATCH(req: Request) {
  try {
    const { contractListingId, status, buyerWallet, soldTxHash } = await req.json();

    if (contractListingId == null || !status) {
      return NextResponse.json({ error: 'Missing contractListingId or status' }, { status: 400 });
    }

    const lid = BigInt(contractListingId);

    const listing = await prisma.listing.findUnique({ where: { contract_listing_id: lid } });
    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    await prisma.listing.update({
      where: { contract_listing_id: lid },
      data: {
        status,
        ...(buyerWallet ? { buyer_wallet: buyerWallet } : {}),
        ...(soldTxHash ? { sold_tx_hash: soldTxHash } : {}),
        ...(status === 'sold' ? { sold_at: new Date() } : {}),
      },
    });

    // Update ticket status based on outcome
    if (status === 'sold' && buyerWallet) {
      await prisma.ticket.update({
        where: { ticket_id: listing.token_id },
        data: { status: 'valid', owner_wallet: buyerWallet },
      });
    } else if (status === 'cancelled') {
      await prisma.ticket.update({
        where: { ticket_id: listing.token_id },
        data: { status: 'valid' },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[PATCH /api/listings]', err);
    return NextResponse.json({ error: 'Internal Server Error', detail: err.message }, { status: 500 });
  }
}
