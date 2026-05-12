/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  useReadContract,
  useWriteContract,
  usePublicClient,
} from "wagmi";
import { VEILTIX_ABI, CONTRACT_ADDRESS } from "@/config/contract";

export function useVeilTix() {
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();

  // ==================== WRITE FUNCTIONS ====================

  const createEvent = async (
    name: string,
    image: string,
    location: string,
    description: string,
    time: bigint,
    totalTickets: bigint,
    price: bigint,
    transferable: boolean,
    refundable: boolean,
    refundDeadline: bigint,
    maxPerUser: bigint
  ) => {
    try {
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: VEILTIX_ABI,
        functionName: "createEvent",
        args: [name, image, location, description, time, totalTickets, price, transferable, refundable, refundDeadline, maxPerUser],
      });
      const receipt = await publicClient?.waitForTransactionReceipt({ hash });
      return { hash, receipt };
    } catch (error: any) {
      console.error("Lỗi createEvent:", error.message);
      throw error;
    }
  };

  const buyTicket = async (eventId: number, ticketType: number, value: bigint) => {
    try {
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: VEILTIX_ABI,
        functionName: "buyTicket",
        args: [BigInt(eventId), ticketType],
        value: value,
      });
      const receipt = await publicClient?.waitForTransactionReceipt({ hash });
      return { hash, receipt };
    } catch (error: any) {
      console.error("Lỗi buyTicket:", error.message);
      throw error;
    }
  };

  const cancelEvent = async (eventId: number) => {
    try {
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: VEILTIX_ABI,
        functionName: "cancelEvent",
        args: [BigInt(eventId)],
      });
      const receipt = await publicClient?.waitForTransactionReceipt({ hash });
      return { hash, receipt };
    } catch (error: any) {
      console.error("Lỗi cancelEvent:", error.message);
      throw error;
    }
  };

  const transferTicket = async (to: string, tokenId: number) => {
    try {
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: VEILTIX_ABI,
        functionName: "transferTicket",
        args: [to, BigInt(tokenId)],
      });
      const receipt = await publicClient?.waitForTransactionReceipt({ hash });
      return { hash, receipt };
    } catch (error: any) {
      console.error("Lỗi transferTicket:", error.message);
      throw error;
    }
  };

  const refundTicket = async (tokenId: number) => {
    try {
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: VEILTIX_ABI,
        functionName: "refundTicket",
        args: [BigInt(tokenId)],
      });
      const receipt = await publicClient?.waitForTransactionReceipt({ hash });
      return { hash, receipt };
    } catch (error: any) {
      console.error("Lỗi refundTicket:", error.message);
      throw error;
    }
  };

  /**
   * List a ticket for sale on the marketplace.
   * Requires event to have transferable=true.
   */
  const listTicket = async (tokenId: number, priceWei: bigint) => {
    try {
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: VEILTIX_ABI,
        functionName: "listTicket",
        args: [BigInt(tokenId), priceWei],
      });
      const receipt = await publicClient?.waitForTransactionReceipt({ hash });
      return { hash, receipt };
    } catch (error: any) {
      console.error("Lỗi listTicket:", error.message);
      throw error;
    }
  };

  /**
   * Buy a ticket from the marketplace by listingId.
   * value must be >= listing.price.
   */
  const buyListedTicket = async (listingId: number, priceWei: bigint) => {
    try {
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: VEILTIX_ABI,
        functionName: "buyListedTicket",
        args: [BigInt(listingId)],
        value: priceWei,
      });
      const receipt = await publicClient?.waitForTransactionReceipt({ hash });
      return { hash, receipt };
    } catch (error: any) {
      console.error("Lỗi buyListedTicket:", error.message);
      throw error;
    }
  };

  /**
   * Cancel an active listing (only seller can cancel).
   */
  const cancelListing = async (listingId: number) => {
    try {
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: VEILTIX_ABI,
        functionName: "cancelListing",
        args: [BigInt(listingId)],
      });
      const receipt = await publicClient?.waitForTransactionReceipt({ hash });
      return { hash, receipt };
    } catch (error: any) {
      console.error("Lỗi cancelListing:", error.message);
      throw error;
    }
  };

  /**
   * Check-in a ticket (mark as used).
   * Callable by event organizer or backend verifier.
   */
  const checkInTicket = async (tokenId: number) => {
    try {
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: VEILTIX_ABI,
        functionName: "checkInTicket",
        args: [BigInt(tokenId)],
      });
      const receipt = await publicClient?.waitForTransactionReceipt({ hash });
      return { hash, receipt };
    } catch (error: any) {
      console.error("Lỗi checkInTicket:", error.message);
      throw error;
    }
  };

  // ==================== READ FUNCTIONS ====================

  const getNextEventId = () => {
    const { data, isLoading, error, refetch } = useReadContract({
      address: CONTRACT_ADDRESS,
      abi: VEILTIX_ABI,
      functionName: "nextEventId",
    });
    return { data, isLoading, error, refetch };
  };

  const getNextTokenId = () => {
    const { data, isLoading, error, refetch } = useReadContract({
      address: CONTRACT_ADDRESS,
      abi: VEILTIX_ABI,
      functionName: "nextTokenId",
    });
    return { data, isLoading, error, refetch };
  };

  const getNextListingId = () => {
    const { data, isLoading, error, refetch } = useReadContract({
      address: CONTRACT_ADDRESS,
      abi: VEILTIX_ABI,
      functionName: "nextListingId",
    });
    return { data, isLoading, error, refetch };
  };

  const getEvent = (eventId: number) => {
    const { data, isLoading, error, refetch } = useReadContract({
      address: CONTRACT_ADDRESS,
      abi: VEILTIX_ABI,
      functionName: "events",
      args: [BigInt(eventId)],
      query: { enabled: eventId >= 0 },
    });
    return { data, isLoading, error, refetch };
  };

  const getEventFull = (eventId: number) => {
    const { data, isLoading, error, refetch } = useReadContract({
      address: CONTRACT_ADDRESS,
      abi: VEILTIX_ABI,
      functionName: "getEvent",
      args: [BigInt(eventId)],
      query: { enabled: eventId >= 0 },
    });
    return { data, isLoading, error, refetch };
  };

  const getEventStats = (eventId: number) => {
    const { data, isLoading, error, refetch } = useReadContract({
      address: CONTRACT_ADDRESS,
      abi: VEILTIX_ABI,
      functionName: "getEventStats",
      args: [BigInt(eventId)],
      query: { enabled: eventId >= 0 },
    });
    return { data, isLoading, error, refetch };
  };

  const getTicket = (tokenId: number) => {
    const { data, isLoading, error, refetch } = useReadContract({
      address: CONTRACT_ADDRESS,
      abi: VEILTIX_ABI,
      functionName: "getTicket",
      args: [BigInt(tokenId)],
      query: { enabled: tokenId >= 0 },
    });
    return { data, isLoading, error, refetch };
  };

  const getTicketDirect = (tokenId: number) => {
    const { data, isLoading, error, refetch } = useReadContract({
      address: CONTRACT_ADDRESS,
      abi: VEILTIX_ABI,
      functionName: "tickets",
      args: [BigInt(tokenId)],
      query: { enabled: tokenId >= 0 },
    });
    return { data, isLoading, error, refetch };
  };

  const getEventRules = (eventId: number) => {
    const { data, isLoading, error, refetch } = useReadContract({
      address: CONTRACT_ADDRESS,
      abi: VEILTIX_ABI,
      functionName: "eventRules",
      args: [BigInt(eventId)],
      query: { enabled: eventId >= 0 },
    });
    return { data, isLoading, error, refetch };
  };

  const getTicketsBought = (userAddress: string, eventId: number) => {
    const { data, isLoading, error, refetch } = useReadContract({
      address: CONTRACT_ADDRESS,
      abi: VEILTIX_ABI,
      functionName: "ticketsBought",
      args: [userAddress, BigInt(eventId)],
      query: { enabled: !!userAddress && eventId >= 0 },
    });
    return { data, isLoading, error, refetch };
  };

  const getListing = (listingId: number) => {
    const { data, isLoading, error, refetch } = useReadContract({
      address: CONTRACT_ADDRESS,
      abi: VEILTIX_ABI,
      functionName: "getListing",
      args: [BigInt(listingId)],
      query: { enabled: listingId >= 0 },
    });
    return { data, isLoading, error, refetch };
  };

  const getOwnerOf = (tokenId: number) => {
    const { data, isLoading, error, refetch } = useReadContract({
      address: CONTRACT_ADDRESS,
      abi: VEILTIX_ABI,
      functionName: "ownerOf",
      args: [BigInt(tokenId)],
      query: { enabled: tokenId >= 0 },
    });
    return { data, isLoading, error, refetch };
  };

  /**
   * Fetch all TicketListed events from blockchain.
   * Returns array of { listingId, tokenId, seller, price }
   */
  const fetchAllListings = async () => {
    if (!publicClient) return [];
    try {
      const logs = await publicClient.getLogs({
        address: CONTRACT_ADDRESS,
        event: {
          type: "event",
          name: "TicketListed",
          inputs: [
            { indexed: true, name: "listingId", type: "uint256" },
            { indexed: true, name: "tokenId", type: "uint256" },
            { indexed: true, name: "seller", type: "address" },
            { indexed: false, name: "price", type: "uint256" },
          ],
        },
        fromBlock: BigInt(0),
        toBlock: "latest",
      });
      return logs.map((log: any) => ({
        listingId: Number(log.args.listingId),
        tokenId: Number(log.args.tokenId),
        seller: log.args.seller as string,
        price: log.args.price as bigint,
      }));
    } catch (error) {
      console.error("fetchAllListings error:", error);
      return [];
    }
  };

  /**
   * Fetch tickets owned by a wallet address from TicketPurchased events.
   */
  const fetchMyTickets = async (address: string) => {
    if (!publicClient || !address) return [];
    try {
      const logs = await publicClient.getLogs({
        address: CONTRACT_ADDRESS,
        event: {
          type: "event",
          name: "TicketPurchased",
          inputs: [
            { indexed: true, name: "tokenId", type: "uint256" },
            { indexed: true, name: "eventId", type: "uint256" },
            { indexed: true, name: "buyer", type: "address" },
            { indexed: false, name: "ticketType", type: "uint8" },
          ],
        },
        args: { buyer: address as `0x${string}` },
        fromBlock: BigInt(0),
        toBlock: "latest",
      });
      return logs.map((log: any) => ({
        tokenId: Number(log.args.tokenId),
        eventId: Number(log.args.eventId),
        ticketType: Number(log.args.ticketType),
      }));
    } catch (error) {
      console.error("fetchMyTickets error:", error);
      return [];
    }
  };

  return {
    // Write functions
    createEvent,
    buyTicket,
    cancelEvent,
    transferTicket,
    refundTicket,
    listTicket,
    buyListedTicket,
    cancelListing,
    checkInTicket,

    // Read functions (hook-based)
    getNextEventId,
    getNextTokenId,
    getNextListingId,
    getEvent,
    getEventFull,
    getEventStats,
    getTicket,
    getTicketDirect,
    getEventRules,
    getTicketsBought,
    getListing,
    getOwnerOf,

    // Async fetch functions (event-log based)
    fetchAllListings,
    fetchMyTickets,

    // Public client access
    publicClient,
  };
}
