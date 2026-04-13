import { poolPromise, sql } from "@/lib/db";
import { IEvent, IEventDetail, ITicketTier } from "@/interfaces/event.type";

export class EventService {
    /**
     * Get all events with their minimum ticket price.
     */
    static async getAllEvents(): Promise<IEvent[]> {
        const pool = await poolPromise;
        const result = await pool.request().query<IEvent>(`
            SELECT e.*, 
                   (SELECT MIN(price) FROM Ticket_Tiers tt WHERE tt.Event_ID = e.Event_ID) as minPrice
            FROM Events e
            WHERE e.status IN ('active', 'published')
        `);
        return result.recordset;
    }

    /**
     * Get a single event by its ID, including all ticket tiers.
     */
    static async getEventById(id: number): Promise<IEventDetail | null> {
        const pool = await poolPromise;
        
        // Fetch Event details
        const eventResult = await pool.request()
            .input('Event_ID', sql.Int, id)
            .query<IEvent>(`
                SELECT * FROM Events WHERE Event_ID = @Event_ID
            `);

        if (eventResult.recordset.length === 0) return null;

        const event = eventResult.recordset[0];

        // Fetch Ticket Tiers for this event
        const tiersResult = await pool.request()
            .input('Event_ID', sql.Int, id)
            .query<ITicketTier>(`
                SELECT * FROM Ticket_Tiers WHERE Event_ID = @Event_ID
            `);

        return {
            ...event,
            tiers: tiersResult.recordset
        };
    }

    /**
     * Create a new event with multiple ticket tiers.
     */
    static async createEvent(eventData: Partial<IEventDetail>): Promise<number> {
        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);
        
        try {
            if (!eventData.Wallet_ID) {
                throw new Error("Missing Wallet_ID. User must be logged in.");
            }

            // Ensure dates are actual Date objects for the driver
            const startTime = eventData.start_time ? new Date(eventData.start_time) : new Date();
            const endTime = eventData.end_time ? new Date(eventData.end_time) : new Date();

            await transaction.begin();
            const request = new sql.Request(transaction);
            
            const result = await request
                .input('Wallet_ID', sql.Int, eventData.Wallet_ID)
                .input('title', sql.NVarChar, eventData.title)
                .input('description', sql.NVarChar(sql.MAX), eventData.description)
                .input('location', sql.NVarChar, eventData.location)
                .input('start_time', sql.DateTime2, startTime)
                .input('end_time', sql.DateTime2, endTime)
                .input('contract_address', sql.VarChar, eventData.contract_address)
                .input('status', sql.VarChar, eventData.status || 'active')
                .input('event_image', sql.NVarChar(sql.MAX), eventData.event_image)
                .input('is_online', sql.Bit, eventData.is_online ? 1 : 0)
                .input('latitude', sql.Decimal(9, 6), eventData.latitude)
                .input('longitude', sql.Decimal(10, 7), eventData.longitude)
                .query(`
                    INSERT INTO Events (Wallet_ID, title, description, location, start_time, end_time, contract_address, status, event_image, is_online, latitude, longitude)
                    VALUES (@Wallet_ID, @title, @description, @location, @start_time, @end_time, @contract_address, @status, @event_image, @is_online, @latitude, @longitude);
                    SELECT SCOPE_IDENTITY() AS id;
                `);
            
            if (!result.recordset || result.recordset.length === 0) {
                throw new Error("Failed to retrieve new Event ID");
            }
            
            const eventId = result.recordset[0].id;

            // Insert Ticket Tiers
            if (eventData.tiers && eventData.tiers.length > 0) {
                for (const tier of eventData.tiers) {
                    await new sql.Request(transaction)
                        .input('Event_ID', sql.Int, eventId)
                        .input('tier', sql.NVarChar, tier.tier)
                        .input('price', sql.Decimal(18, 8), parseFloat(tier.price.toString()))
                        .input('max_supply', sql.Int, parseInt(tier.max_supply.toString()))
                        .query(`
                            INSERT INTO Ticket_Tiers (Event_ID, tier, price, max_supply)
                            VALUES (@Event_ID, @tier, @price, @max_supply)
                        `);
                }
            }

            await transaction.commit();
            return eventId;
        } catch (err) {
            console.error("FATAL Database Transaction Error:", err);
            if (transaction) {
                try { await transaction.rollback(); } catch(e) { /* ignore rollback error if tx not started */ }
            }
            throw err;
        }
    }
}
