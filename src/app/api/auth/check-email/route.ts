import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/services/user.service';

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();
        if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 });

        const user = await UserService.getUserByEmail(email);
        
        if (!user) {
            return NextResponse.json({ exists: false, error: 'Account not found. Please register first.' }, { status: 404 });
        }

        return NextResponse.json({ exists: true, role: user.role });
    } catch (err) {
        console.error('Check Email Error:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
