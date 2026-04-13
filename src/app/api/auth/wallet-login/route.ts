import { NextResponse } from "next/server";
import { UserService } from "@/services/user.service";

export async function POST(req: Request) {
    try {
        const { address } = await req.json();
        
        if (!address) {
            return NextResponse.json({ error: "Wallet address is required" }, { status: 400 });
        }

        const user = await UserService.getUserByWallet(address);

        if (!user) {
            return NextResponse.json({ 
                success: false, 
                error: "Wallet not registered", 
                code: "NOT_REGISTERED" 
            }, { status: 404 });
        }

        return NextResponse.json({ 
            success: true, 
            user
        });
    } catch (error) {
        console.error("Wallet Login API error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
