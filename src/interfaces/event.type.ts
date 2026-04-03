export interface IEvent {
    Event_ID: number;
    Wallet_ID: number;
    title: string;
    description: string;
    location: string;
    start_time: string | Date;
    end_time: string | Date;
    contract_address?: string;
    status: string;
    event_image?: string;
    minPrice?: number; // Calculated field
}

export interface ITicketTier {
    Ticket_Tier_ID: number;
    Event_ID: number;
    tier: string;
    price: number;
    max_supply: number;
}

export interface IEventDetail extends IEvent {
    tiers: ITicketTier[];
}
