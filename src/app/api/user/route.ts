import { NextResponse } from 'next/server';
import { UserService } from '@/services/user.service';

export async function POST(req: Request) {
  try {
    const { address } = await req.json();

    if (!address) {
      return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
    }

    // Use UserService to get or implicitly handle user logic
    // For now, we reuse getUserByWallet. If it doesn't exist, we might need a way to link it.
    // However, the current flow is: Register (Email) -> Login (Wallet).
    const user = await UserService.getUserByWallet(address);

    if (!user) {
       // If wallet is not linked, we return a message. 
       // In this system, account linking happens during the Join/Login flow.
       return NextResponse.json({ error: 'Wallet not linked' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'User found',
      user: user
    });

  } catch (error: any) {
    console.error('Error in POST /api/user:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { userId, username, avatar_url } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    await UserService.updateProfile(userId, username, avatar_url);

    return NextResponse.json({
      message: 'Profile updated successfully',
      success: true
    });

  } catch (error: any) {
    console.error('Error in PUT /api/user:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
