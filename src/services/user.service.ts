import { poolPromise, sql } from "@/lib/db";

export interface IUser {
    User_ID: number;
    email: string;
    created_at: Date;
}

export interface IWallet {
    Wallet_ID: number;
    User_ID: number;
    address_wallet: string;
    role: 'organizer' | 'customer';
}

export interface IUserSession {
    User_ID: number;
    Wallet_ID: number;
    email: string;
    role: 'organizer' | 'customer';
    address: string;
}

export class UserService {
    /**
     * REGISTER: Create a new user by email.
     */
    static async registerUser(email: string): Promise<number> {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('email', sql.NVarChar, email)
            .query(`
                IF NOT EXISTS (SELECT 1 FROM Users WHERE email = @email)
                BEGIN
                    INSERT INTO Users (email, created_at)
                    VALUES (@email, GETDATE());
                    SELECT SCOPE_IDENTITY() AS id;
                END
                ELSE
                BEGIN
                    SELECT User_ID AS id FROM Users WHERE email = @email;
                END
            `);
        
        return result.recordset[0].id;
    }

    /**
     * LINK WALLET: Link a wallet address to a User ID with a specific role.
     */
    static async linkWallet(userId: number, address: string, role: string): Promise<void> {
        const pool = await poolPromise;
        await pool.request()
            .input('User_ID', sql.Int, userId)
            .input('address_wallet', sql.VarChar, address.toLowerCase())
            .input('role', sql.VarChar, role)
            .query(`
                IF NOT EXISTS (SELECT 1 FROM Wallets WHERE address_wallet = @address_wallet)
                BEGIN
                    INSERT INTO Wallets (User_ID, address_wallet, role)
                    VALUES (@User_ID, @address_wallet, @role);
                END
                ELSE
                BEGIN
                    UPDATE Wallets SET User_ID = @User_ID, role = @role 
                    WHERE address_wallet = @address_wallet;
                END
            `);
    }

    /**
     * LOGIN: Get user and role by wallet address.
     */
    static async getUserByWallet(address: string): Promise<IUserSession | null> {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('address_wallet', sql.VarChar, address.toLowerCase())
            .query(`
                SELECT u.User_ID, w.Wallet_ID, u.email, w.role, w.address_wallet as address
                FROM Wallets w
                JOIN Users u ON w.User_ID = u.User_ID
                WHERE w.address_wallet = @address_wallet
            `);
        
        if (result.recordset.length === 0) return null;
        return result.recordset[0];
    }

    /**
     * CHECK ACCOUNT: Get user info by email.
     */
    static async getUserByEmail(email: string): Promise<IUserSession | null> {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('email', sql.NVarChar, email)
            .query(`
                SELECT u.User_ID, w.Wallet_ID, u.email, w.role, w.address_wallet as address
                FROM Users u
                LEFT JOIN Wallets w ON u.User_ID = w.User_ID
                WHERE u.email = @email
            `);
        
        if (result.recordset.length === 0) return null;
        return result.recordset[0];
    }
}
