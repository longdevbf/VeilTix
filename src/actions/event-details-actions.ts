"use server"

import { prisma } from "@/lib/prisma"

export async function getEventById(id: number) {
  try {
    const dbEvent = await prisma.event.findUnique({
      where: { event_id: BigInt(id) },
      include: {
        ticket_tiers: true,
        tickets: true,
      },
    })

    if (!dbEvent) return null;

    // Serialize BigInt safely for client components
    return {
      ...dbEvent,
      event_id: dbEvent.event_id.toString(),
      wallet_id: dbEvent.wallet_id.toString(),
      price: dbEvent.price ? dbEvent.price.toString() : null,
      ticket_tiers: dbEvent.ticket_tiers.map((tier) => ({
        ...tier,
        ticket_tier_id: tier.ticket_tier_id.toString(),
        event_id: tier.event_id.toString(),
        price: tier.price.toString(),
      })),
      tickets: dbEvent.tickets.map((ticket) => ({
        ...ticket,
        ticket_id: ticket.ticket_id.toString(),
        tier_id: ticket.tier_id.toString(),
        event_id: ticket.event_id.toString(),
      })),
    }
  } catch (error) {
    console.error(`Error fetching event ${id}:`, error)
    throw new Error("Failed to fetch event from database")
  }
}
