import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const address = searchParams.get('address');

    if (!address) return NextResponse.json({ error: 'Address is required' }, { status: 400 });

    const wallet = await prisma.wallet.findUnique({
      where: { address_wallet: address },
      include: { user: true },
    });

    if (!wallet) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const user = wallet.user;
    return NextResponse.json({
      user_id: user.user_id.toString(),
      username: user.username,
      email: user.email,
      image: user.image,
      description: user.description,
      created_at: user.created_at,
    });
  } catch (error: any) {
    console.error('Profile GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { address, username, image, description } = body;

    if (!address) return NextResponse.json({ error: 'Address is required' }, { status: 400 });

    const wallet = await prisma.wallet.findUnique({
      where: { address_wallet: address },
    });

    if (!wallet) return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });

    const updatedUser = await prisma.user.update({
      where: { user_id: wallet.user_id },
      data: {
        username: username !== undefined ? username : undefined,
        image: image !== undefined ? image : undefined,
        description: description !== undefined ? description : undefined,
      },
    });

    return NextResponse.json({
      user_id: updatedUser.user_id.toString(),
      username: updatedUser.username,
      image: updatedUser.image,
      description: updatedUser.description,
    });
  } catch (error: any) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
