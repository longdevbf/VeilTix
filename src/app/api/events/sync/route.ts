import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const {
      walletAddress,
      eventId,
      name,
      image,
      location,
      description,
      time,        // unix timestamp (seconds)
      totalTickets,
      price,       // wei as string
    } = await req.json();

    if (!walletAddress || eventId === undefined || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Find or create wallet + user
    let wallet = await prisma.wallet.findUnique({
      where: { address_wallet: walletAddress },
    });

    if (!wallet) {
      const email = `user_${walletAddress.substring(0, 8)}@veiltix.local`;
      let user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        user = await prisma.user.create({ data: { email } });
      }
      wallet = await prisma.wallet.create({
        data: { address_wallet: walletAddress, user_id: user.user_id, role: 'organizer' },
      });
    }

    const eventBigId = BigInt(eventId);
    const startTime = new Date(Number(time) * 1000);
    const endTime = new Date(Number(time) * 1000 + 86400 * 1000); // +1 day default

    // Upsert event (idempotent — safe to call multiple times)
    const event = await prisma.event.upsert({
      where: { event_id: eventBigId },
      update: {
        title: name,
        description: description || null,
        image: image || null,
        location: location || null,
        start_time: startTime,
        end_time: endTime,
        price: price ? price.toString() : '0',
        total_tickets: Number(totalTickets) || 0,
        status: 'active',
      },
      create: {
        event_id: eventBigId,
        wallet_id: wallet.wallet_id,
        title: name,
        description: description || null,
        image: image || null,
        location: location || null,
        start_time: startTime,
        end_time: endTime,
        price: price ? price.toString() : '0',
        total_tickets: Number(totalTickets) || 0,
        sold_tickets: 0,
        contract_address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || null,
        status: 'active',
      },
    });

    // Upsert a default TicketTier ("Standard") for this event
    const existingTier = await prisma.ticketTier.findFirst({
      where: { event_id: eventBigId, tier: 'Standard' },
    });

    if (!existingTier) {
      await prisma.ticketTier.create({
        data: {
          event_id: eventBigId,
          tier: 'Standard',
          price: price ? parseFloat(price) / 1e18 : 0,
          max_supply: Number(totalTickets) || 0,
        },
      });
    }

    return NextResponse.json({ success: true, event_id: event.event_id.toString() });
  } catch (error: any) {
    console.error('Event sync error:', error);
    return NextResponse.json({ error: 'Internal Server Error', detail: error.message }, { status: 500 });
  }
}
