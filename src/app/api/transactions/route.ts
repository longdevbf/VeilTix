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

    const histories = await prisma.transactionHistory.findMany({
      where: { wallet_id: wallet.wallet_id },
      include: {
        event: { select: { title: true } },
      },
      orderBy: { created_at: 'desc' },
    });

    return NextResponse.json(
      histories.map((h) => ({
        id: h.id.toString(),
        type: h.type,
        status: h.status,
        amount: h.amount?.toString() ?? null,
        tx_hash: h.tx_hash,
        event_title: h.event?.title ?? null,
        created_at: h.created_at,
      }))
    );
  } catch (error) {
    console.error('Transaction history fetch error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
