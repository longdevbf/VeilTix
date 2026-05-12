import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get('address');
  if (!address) return NextResponse.json({ error: 'Address required' }, { status: 400 });

  try {
    const wallet = await prisma.wallet.findUnique({
      where: { address_wallet: address },
    });
    if (!wallet) return NextResponse.json([]);

    const orders = await prisma.order.findMany({
      where: { wallet_id: wallet.wallet_id },
      include: {
        event: {
          select: {
            event_id: true,
            title: true,
            image: true,
            start_time: true,
            location: true,
            status: true,
          },
        },
        order_items: {
          include: {
            ticket_tier: {
              select: { tier: true, price: true },
            },
          },
        },
        payments: {
          select: { tx_hash: true, status: true },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    const tickets = orders.map((order) => ({
      order_id: order.order_id.toString(),
      event_id: order.event_id.toString(),
      event_title: order.event.title,
      event_image: order.event.image,
      event_date: order.event.start_time,
      event_location: order.event.location,
      event_status: order.event.status,
      total_amount: order.total_amount.toString(),
      created_at: order.created_at,
      items: order.order_items.map((item) => ({
        tier: item.ticket_tier.tier,
        quantity: item.quantity,
        unit_price: item.unit_price.toString(),
      })),
      tx_hash: order.payments[0]?.tx_hash ?? null,
      payment_status: order.payments[0]?.status ?? 'PENDING',
    }));

    return NextResponse.json(tickets);
  } catch (error) {
    console.error('Tickets fetch error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
