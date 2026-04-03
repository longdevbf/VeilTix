import { NextResponse } from "next/server";
import { EventService } from "@/services/event.service";

export async function GET() {
    try {
        const events = await EventService.getAllEvents();
        return NextResponse.json(events);
    } catch (error) {
        console.error("GET /api/events error:", error);
        return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const id = await EventService.createEvent(body);
        return NextResponse.json({ id, message: "Event created successfully" });
    } catch (error) {
        console.error("POST /api/events error:", error);
        return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
    }
}
