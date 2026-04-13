import { NextResponse } from "next/server";
import { UserService } from "@/services/user.service";

export async function POST(req: Request) {
    try {
        const { email, role, address } = await req.json();
        
        if (!email || !role || !address) {
            return NextResponse.json({ error: "Email, role, and wallet address are required" }, { status: 400 });
        }

        // 1. Register User (Email)
        const userId = await UserService.registerUser(email);

        // 2. Link Wallet
        await UserService.linkWallet(userId, address, role);

        return NextResponse.json({ 
            success: true, 
            user: { email, role, address },
            message: "Registration successful" 
        });
    } catch (error) {
        console.error("Registration API error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
