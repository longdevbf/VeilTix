import { ethers } from "ethers";
import express from "express";
import cors from "cors";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8082;
const RPC_URL = process.env.RPC_URL || "https://testnet.sapphire.oasis.dev";
const WS_URL = process.env.WS_URL || "wss://testnet.sapphire.oasis.dev/ws";
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || "0x11c8a82B00efF4EdD7583474A4bAe5D54F75f515";

import VeilTixABI from "./config/VeilTix.json";
const ABI = VeilTixABI.abi;

// ─── WebSocket provider with auto-reconnect ──────────────────────────────────
let provider: ethers.WebSocketProvider;
let contract: ethers.Contract;

function createProvider() {
  provider = new ethers.WebSocketProvider(WS_URL);
  contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

  provider.websocket.addEventListener("close", () => {
    console.warn("[WORKER] WebSocket closed, reconnecting in 5s...");
    setTimeout(() => {
      startListener();
    }, 5000);
  });
}

// ─── REST API ─────────────────────────────────────────────────────────────────

app.get("/health", (_req, res) => {
  res.json({ status: "ok", contract: CONTRACT_ADDRESS });
});

app.get("/api/events", async (_req, res) => {
  try {
    const events = await prisma.event.findMany({
      orderBy: { event_id: "desc" },
      include: { ticket_tiers: true },
    });
    res.json(events.map((e) => ({
      ...e,
      event_id: e.event_id.toString(),
      wallet_id: e.wallet_id.toString(),
      price: e.price?.toString() ?? null,
    })));
  } catch (err) {
    console.error("[API /events]", err);
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

app.get("/api/listings", async (_req, res) => {
  try {
    const listings = await prisma.listing.findMany({
      where: { status: "active" },
      orderBy: { created_at: "desc" },
    });
    res.json(listings.map((l) => ({
      ...l,
      listing_id: l.listing_id.toString(),
      contract_listing_id: l.contract_listing_id.toString(),
      token_id: l.token_id.toString(),
      event_id: l.event_id.toString(),
      price: l.price.toString(),
    })));
  } catch (err) {
    console.error("[API /listings]", err);
    res.status(500).json({ error: "Failed to fetch listings" });
  }
});

// ─── Helper: find or create user + wallet ────────────────────────────────────
async function findOrCreateWallet(address: string, role = "user") {
  let wallet = await prisma.wallet.findUnique({ where: { address_wallet: address } });
  if (!wallet) {
    const email = `user_${address.slice(2, 10).toLowerCase()}@veiltix.local`;
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({ data: { email } });
    }
    wallet = await prisma.wallet.create({
      data: { address_wallet: address, user_id: user.user_id, role },
    });
    console.log(`[WALLET] Created wallet_id=${wallet.wallet_id} for ${address}`);
  }
  return wallet;
}

// ─── Helper: ensure TicketTier exists ────────────────────────────────────────
async function ensureTicketTier(eventId: bigint, priceWei: string, totalTickets: number) {
  let tier = await prisma.ticketTier.findFirst({ where: { event_id: eventId, tier: "Standard" } });
  if (!tier) {
    const priceRose = Number(priceWei) / 1e18;
    tier = await prisma.ticketTier.create({
      data: { event_id: eventId, tier: "Standard", price: priceRose, max_supply: totalTickets },
    });
  }
  return tier;
}

// ─── Helper: safe upsert TransactionHistory ──────────────────────────────────
async function upsertTxHistory(params: {
  walletId: bigint;
  eventId: bigint | null;
  txHash: string;
  type: string;
  amountWei: string;
  status: string;
}) {
  const amountRose = Number(params.amountWei) / 1e18;
  await prisma.transactionHistory.upsert({
    where: { tx_hash: params.txHash },
    update: { status: params.status },
    create: {
      wallet_id: params.walletId,
      event_id: params.eventId ?? undefined,
      tx_hash: params.txHash,
      type: params.type,
      amount: amountRose,
      status: params.status,
    },
  });
}

// ─── Event Listeners ─────────────────────────────────────────────────────────

async function startListener() {
  createProvider();
  console.log(`[WORKER] Listening on contract ${CONTRACT_ADDRESS}`);

  // ── 1. EventCreated ──────────────────────────────────────────────────────
  contract.on("EventCreated", async (
    eventId, organizer, name, image, location, description, time, totalTickets, price, event
  ) => {
    const txHash: string = event?.log?.transactionHash ?? "";
    console.log(`[EventCreated] id=${eventId} name="${name}" tx=${txHash}`);
    try {
      const wallet = await findOrCreateWallet(organizer, "organizer");
      const eid = BigInt(eventId.toString());
      const priceStr = price?.toString() ?? "0";

      await prisma.event.upsert({
        where: { event_id: eid },
        update: {
          title: name, description, image, location,
          start_time: new Date(Number(time) * 1000),
          end_time: new Date(Number(time) * 1000 + 86400 * 1000),
          price: priceStr, total_tickets: Number(totalTickets), status: "active",
        },
        create: {
          event_id: eid, wallet_id: wallet.wallet_id, title: name,
          description, image, location,
          start_time: new Date(Number(time) * 1000),
          end_time: new Date(Number(time) * 1000 + 86400 * 1000),
          price: priceStr, total_tickets: Number(totalTickets), sold_tickets: 0,
          contract_address: CONTRACT_ADDRESS, status: "active",
        },
      });

      await ensureTicketTier(eid, priceStr, Number(totalTickets));
      console.log(`[EventCreated] ✓ event_id=${eid} synced`);
    } catch (err: any) {
      console.error(`[EventCreated] ✗`, err?.message ?? err);
    }
  });

  // ── 2. TicketPurchased ───────────────────────────────────────────────────
  contract.on("TicketPurchased", async (tokenId, eventId, buyer, ticketType, event) => {
    const txHash: string = event?.log?.transactionHash ?? "";
    console.log(`[TicketPurchased] token=${tokenId} event=${eventId} buyer=${buyer} tx=${txHash}`);
    try {
      const eid = BigInt(eventId.toString());
      const tid = BigInt(tokenId.toString());

      // 1. Ensure event & wallet exist
      const eventRecord = await prisma.event.findUnique({ where: { event_id: eid } });
      if (!eventRecord) {
        console.error(`[TicketPurchased] Event ${eventId} not in DB, skipping`);
        return;
      }
      const wallet = await findOrCreateWallet(buyer, "user");
      const tier = await ensureTicketTier(eid, eventRecord.price?.toString() ?? "0", eventRecord.total_tickets ?? 0);

      // 2. Upsert Ticket (idempotent)
      await prisma.ticket.upsert({
        where: { ticket_id: tid },
        update: { owner_wallet: buyer, tx_hash: txHash },
        create: {
          ticket_id: tid, tier_id: tier.ticket_tier_id,
          event_id: eid, status: "valid",
          owner_wallet: buyer, tx_hash: txHash,
        },
      });

      // 3. Increment sold_tickets on event (only if tx is new)
      const existingTx = await prisma.transactionHistory.findUnique({ where: { tx_hash: txHash } });
      if (!existingTx) {
        await prisma.event.update({
          where: { event_id: eid },
          data: { sold_tickets: { increment: 1 } },
        });
      }

      // 4. Create Order + OrderItem + Payment (idempotent via tx_hash on Payment)
      const existingPayment = await prisma.payment.findFirst({ where: { tx_hash: txHash } });
      if (!existingPayment) {
        const priceRose = Number(eventRecord.price?.toString() ?? "0") / 1e18;
        const order = await prisma.order.create({
          data: {
            wallet_id: wallet.wallet_id, event_id: eid,
            total_amount: priceRose,
          },
        });
        await prisma.orderItem.create({
          data: { order_id: order.order_id, ticket_tier_id: tier.ticket_tier_id, quantity: 1, unit_price: priceRose },
        });
        await prisma.payment.create({
          data: { order_id: order.order_id, status: "SUCCESS", tx_hash: txHash },
        });
      }

      // 5. TransactionHistory
      if (txHash) {
        await upsertTxHistory({
          walletId: wallet.wallet_id, eventId: eid,
          txHash, type: "BUY_TICKET",
          amountWei: eventRecord.price?.toString() ?? "0",
          status: "SUCCESS",
        });
      }

      console.log(`[TicketPurchased] ✓ token=${tokenId} synced`);
    } catch (err: any) {
      console.error(`[TicketPurchased] ✗`, err?.message ?? err);
    }
  });

  // ── 3. TicketCheckedIn ───────────────────────────────────────────────────
  contract.on("TicketCheckedIn", async (tokenId, event) => {
    const txHash: string = event?.log?.transactionHash ?? "";
    console.log(`[TicketCheckedIn] token=${tokenId} tx=${txHash}`);
    try {
      const tid = BigInt(tokenId.toString());

      await prisma.ticket.update({
        where: { ticket_id: tid },
        data: { status: "used" },
      });

      // Update QrCode used_at if exists
      await prisma.qrCode.updateMany({
        where: { ticket_id: tid, used_at: null },
        data: { used_at: new Date() },
      });

      console.log(`[TicketCheckedIn] ✓ token=${tokenId} marked used`);
    } catch (err: any) {
      console.error(`[TicketCheckedIn] ✗`, err?.message ?? err);
    }
  });

  // ── 4. TicketListed ──────────────────────────────────────────────────────
  contract.on("TicketListed", async (listingId, tokenId, seller, price, event) => {
    const txHash: string = event?.log?.transactionHash ?? "";
    console.log(`[TicketListed] listing=${listingId} token=${tokenId} seller=${seller} tx=${txHash}`);
    try {
      const lid = BigInt(listingId.toString());
      const tid = BigInt(tokenId.toString());
      const priceStr = price?.toString() ?? "0";

      // Get event_id from ticket in DB
      const ticket = await prisma.ticket.findUnique({ where: { ticket_id: tid } });
      const eid = ticket?.event_id ?? BigInt(0);

      // Upsert listing
      await prisma.listing.upsert({
        where: { contract_listing_id: lid },
        update: { status: "active", price: priceStr, seller_wallet: seller, list_tx_hash: txHash },
        create: {
          contract_listing_id: lid, token_id: tid, event_id: eid,
          seller_wallet: seller, price: priceStr,
          status: "active", list_tx_hash: txHash,
        },
      });

      // Mark ticket as listed
      await prisma.ticket.update({
        where: { ticket_id: tid },
        data: { status: "listed" },
      });

      // TransactionHistory for seller
      const sellerWallet = await findOrCreateWallet(seller, "user");
      if (txHash) {
        await upsertTxHistory({
          walletId: sellerWallet.wallet_id, eventId: eid,
          txHash, type: "TICKET_LISTED",
          amountWei: priceStr, status: "SUCCESS",
        });
      }

      console.log(`[TicketListed] ✓ listing=${listingId} synced`);
    } catch (err: any) {
      console.error(`[TicketListed] ✗`, err?.message ?? err);
    }
  });

  // ── 5. ListingSold ───────────────────────────────────────────────────────
  contract.on("ListingSold", async (listingId, tokenId, buyer, price, event) => {
    const txHash: string = event?.log?.transactionHash ?? "";
    console.log(`[ListingSold] listing=${listingId} token=${tokenId} buyer=${buyer} tx=${txHash}`);
    try {
      const lid = BigInt(listingId.toString());
      const tid = BigInt(tokenId.toString());
      const priceStr = price?.toString() ?? "0";

      // Update listing
      await prisma.listing.update({
        where: { contract_listing_id: lid },
        data: { status: "sold", buyer_wallet: buyer, sold_tx_hash: txHash, sold_at: new Date() },
      });

      // Update ticket owner
      await prisma.ticket.update({
        where: { ticket_id: tid },
        data: { status: "valid", owner_wallet: buyer },
      });

      // TransactionHistory for buyer
      const listing = await prisma.listing.findUnique({ where: { contract_listing_id: lid } });
      const buyerWallet = await findOrCreateWallet(buyer, "user");
      if (txHash) {
        await upsertTxHistory({
          walletId: buyerWallet.wallet_id, eventId: listing?.event_id ?? null,
          txHash, type: "BUY_LISTED_TICKET",
          amountWei: priceStr, status: "SUCCESS",
        });
      }

      // TransactionHistory for seller
      if (listing && txHash) {
        const sellerWallet = await findOrCreateWallet(listing.seller_wallet, "user");
        await upsertTxHistory({
          walletId: sellerWallet.wallet_id, eventId: listing.event_id,
          txHash: txHash + "_sell", type: "SELL_TICKET",
          amountWei: priceStr, status: "SUCCESS",
        });
      }

      console.log(`[ListingSold] ✓ listing=${listingId} sold to ${buyer}`);
    } catch (err: any) {
      console.error(`[ListingSold] ✗`, err?.message ?? err);
    }
  });

  // ── 6. ListingCancelled ──────────────────────────────────────────────────
  contract.on("ListingCancelled", async (listingId, event) => {
    const txHash: string = event?.log?.transactionHash ?? "";
    console.log(`[ListingCancelled] listing=${listingId} tx=${txHash}`);
    try {
      const lid = BigInt(listingId.toString());

      const listing = await prisma.listing.findUnique({ where: { contract_listing_id: lid } });
      if (!listing) {
        console.warn(`[ListingCancelled] listing ${listingId} not in DB`);
        return;
      }

      await prisma.listing.update({
        where: { contract_listing_id: lid },
        data: { status: "cancelled" },
      });

      // Restore ticket status to valid
      await prisma.ticket.update({
        where: { ticket_id: listing.token_id },
        data: { status: "valid" },
      });

      console.log(`[ListingCancelled] ✓ listing=${listingId} cancelled`);
    } catch (err: any) {
      console.error(`[ListingCancelled] ✗`, err?.message ?? err);
    }
  });
}

app.listen(PORT, () => {
  console.log(`[WORKER] API running on http://localhost:${PORT}`);
  startListener();
});
