import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { eventId, txHash, walletAddress, tokenId } = await req.json();
    console.log(`[BUY] eventId=${eventId} txHash=${txHash} wallet=${walletAddress} tokenId=${tokenId}`);

    if (eventId == null || !txHash || !walletAddress) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // ── Idempotency: if tx already recorded return early ─────────────────────
    const existing = await prisma.transactionHistory.findUnique({ where: { tx_hash: txHash } });
    if (existing) {
      console.log(`[BUY] tx_hash already exists, returning cached result`);
      const payment = await prisma.payment.findFirst({ where: { tx_hash: txHash } });
      const order = payment ? await prisma.order.findUnique({ where: { order_id: payment.order_id } }) : null;
      return NextResponse.json({
        success: true,
        order_id: order?.order_id?.toString() ?? null,
        history_id: existing.id.toString(),
        cached: true,
      });
    }

    // ── Find or create wallet ─────────────────────────────────────────────────
    let wallet = await prisma.wallet.findUnique({ where: { address_wallet: walletAddress } });
    if (!wallet) {
      const email = `user_${walletAddress.substring(0, 8).toLowerCase()}@veiltix.local`;
      let user = await prisma.user.findUnique({ where: { email } });
      if (!user) user = await prisma.user.create({ data: { email } });
      wallet = await prisma.wallet.create({
        data: { address_wallet: walletAddress, user_id: user.user_id, role: 'user' },
      });
    }

    // ── Find event ────────────────────────────────────────────────────────────
    const event = await prisma.event.findUnique({
      where: { event_id: BigInt(eventId) },
      include: { ticket_tiers: true },
    });
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // ── Ensure TicketTier exists ──────────────────────────────────────────────
    let tier = event.ticket_tiers[0] ?? null;
    if (!tier) {
      const priceRose = event.price ? parseFloat(event.price.toString()) / 1e18 : 0;
      tier = await prisma.ticketTier.create({
        data: { event_id: event.event_id, tier: 'Standard', price: priceRose, max_supply: event.total_tickets || 0 },
      });
    }

    const amountRose = event.price ? parseFloat(event.price.toString()) / 1e18 : 0;

    // ── Atomic DB writes ──────────────────────────────────────────────────────
    const result = await prisma.$transaction(async (tx) => {
      const history = await tx.transactionHistory.create({
        data: {
          wallet_id: wallet!.wallet_id,
          event_id: event.event_id,
          tx_hash: txHash,
          type: 'BUY_TICKET',
          status: 'SUCCESS',
          amount: amountRose,
        },
      });

      const order = await tx.order.create({
        data: { wallet_id: wallet!.wallet_id, event_id: event.event_id, total_amount: amountRose },
      });

      await tx.orderItem.create({
        data: { order_id: order.order_id, ticket_tier_id: tier!.ticket_tier_id, quantity: 1, unit_price: amountRose },
      });

      await tx.payment.create({
        data: { order_id: order.order_id, status: 'SUCCESS', tx_hash: txHash },
      });

      // sold_tickets only incremented once (guard is the TransactionHistory unique check above)
      await tx.event.update({
        where: { event_id: event.event_id },
        data: { sold_tickets: { increment: 1 } },
      });

      // Upsert Ticket record (worker may or may not have created it yet)
      if (tokenId != null) {
        await tx.ticket.upsert({
          where: { ticket_id: BigInt(tokenId) },
          update: { owner_wallet: walletAddress, tx_hash: txHash },
          create: {
            ticket_id: BigInt(tokenId),
            tier_id: tier!.ticket_tier_id,
            event_id: event.event_id,
            status: 'valid',
            owner_wallet: walletAddress,
            tx_hash: txHash,
          },
        });
      }

      return { order_id: order.order_id.toString(), history_id: history.id.toString() };
    });

    console.log(`[BUY] ✓ order_id=${result.order_id}`);
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error('[BUY] ✗', error?.message ?? error);
    if (error?.code === 'P2002') {
      // Unique constraint — tx was already processed by worker concurrently
      return NextResponse.json({ success: true, cached: true });
    }
    return NextResponse.json({ error: 'Internal Server Error', detail: error.message }, { status: 500 });
  }
}
