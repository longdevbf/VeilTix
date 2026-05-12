import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/tickets/checkin
// Called by frontend immediately after checkInTicket() tx confirms.
// Body: { tokenId, txHash }
export async function POST(req: Request) {
  try {
    const { tokenId, txHash } = await req.json();
    if (tokenId == null) return NextResponse.json({ error: 'tokenId required' }, { status: 400 });

    const tid = BigInt(tokenId);

    // Check ticket exists
    const ticket = await prisma.ticket.findUnique({ where: { ticket_id: tid } });
    if (!ticket) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });

    if (ticket.status === 'used') {
      return NextResponse.json({ success: true, alreadyUsed: true });
    }

    // Mark used
    await prisma.ticket.update({
      where: { ticket_id: tid },
      data: { status: 'used' },
    });

    // Cancel any active listing for this ticket
    const activeListing = await prisma.listing.findFirst({
      where: { token_id: tid, status: 'active' },
    });
    if (activeListing) {
      await prisma.listing.update({
        where: { listing_id: activeListing.listing_id },
        data: { status: 'cancelled' },
      });
    }

    // Update QrCode used_at
    await prisma.qrCode.updateMany({
      where: { ticket_id: tid, used_at: null },
      data: { used_at: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[POST /api/tickets/checkin]', err);
    return NextResponse.json({ error: 'Internal Server Error', detail: err.message }, { status: 500 });
  }
}
