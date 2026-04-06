import { NextResponse } from "next/server";
import { EventService } from "@/services/event.service";

export async function GET(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const id = parseInt(params.id);
    if (isNaN(id)) {
        return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    try {
        const event = await EventService.getEventById(id);
        if (!event) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }
        return NextResponse.json(event);
    } catch (error) {
        console.error(`GET /api/events/${id} error:`, error);
        return NextResponse.json({ error: "Failed to fetch event" }, { status: 500 });
    }
}
