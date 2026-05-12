"use server"

import { prisma } from "@/lib/prisma"

export async function getEvents() {
  try {
    const events = await prisma.event.findMany({
      orderBy: { event_id: "desc" },
      include: {
        ticket_tiers: true,
        tickets: true,
      },
    })

    // Serialize BigInt safely for client components
    return events.map((event) => ({
      ...event,
      event_id: event.event_id.toString(),
      wallet_id: event.wallet_id.toString(),
      price: event.price ? event.price.toString() : null,
      ticket_tiers: event.ticket_tiers.map((tier) => ({
        ...tier,
        ticket_tier_id: tier.ticket_tier_id.toString(),
        event_id: tier.event_id.toString(),
        price: tier.price.toString(),
      })),
      tickets: event.tickets.map((ticket) => ({
        ...ticket,
        ticket_id: ticket.ticket_id.toString(),
        tier_id: ticket.tier_id.toString(),
        event_id: ticket.event_id.toString(),
      })),
    }))
  } catch (error) {
    console.error("Error fetching events:", error)
    throw new Error("Failed to fetch events from database")
  }
}
