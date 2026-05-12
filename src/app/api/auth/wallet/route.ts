import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { address } = await req.json();
    if (!address) return NextResponse.json({ error: 'Address is required' }, { status: 400 });

    let wallet = await prisma.wallet.findUnique({
      where: { address_wallet: address },
      include: { user: true },
    });

    if (!wallet) {
      // Use same email format as worker for deduplication
      const email = `user_${address.substring(0, 8).toLowerCase()}@veiltix.local`;
      let user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        user = await prisma.user.create({
          data: {
            email,
            username: `user_${address.slice(2, 8)}`,
          },
        });
      }

      wallet = await prisma.wallet.create({
        data: { address_wallet: address, user_id: user.user_id, role: 'user' },
        include: { user: true },
      });

      return NextResponse.json({
        user: {
          user_id: wallet.user.user_id.toString(),
          email: wallet.user.email,
          username: wallet.user.username,
          image: wallet.user.image,
          description: wallet.user.description,
          created_at: wallet.user.created_at,
        },
        wallet: {
          wallet_id: wallet.wallet_id.toString(),
          address_wallet: wallet.address_wallet,
          role: wallet.role,
        },
        isNew: true,
      }, { status: 201 });
    }

    return NextResponse.json({
      user: {
        user_id: wallet.user.user_id.toString(),
        email: wallet.user.email,
        username: wallet.user.username,
        image: wallet.user.image,
        description: wallet.user.description,
        created_at: wallet.user.created_at,
      },
      wallet: {
        wallet_id: wallet.wallet_id.toString(),
        address_wallet: wallet.address_wallet,
        role: wallet.role,
      },
      isNew: false,
    }, { status: 200 });
  } catch (error: any) {
    console.error('Wallet auth error:', error);
    if (error?.code === 'P2002') {
      // Concurrent creation race — retry read
      const wallet = await prisma.wallet.findUnique({
        where: { address_wallet: (await req.json().catch(() => ({}))).address },
        include: { user: true },
      }).catch(() => null);
      if (wallet) {
        return NextResponse.json({ user: wallet.user, wallet, isNew: false });
      }
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
