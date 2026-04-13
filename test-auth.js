const sql = require('mssql/msnodesqlv8');
const connectionString = 'Driver={ODBC Driver 17 for SQL Server};Server=DESKTOP-21ISSDL;Database=VeilTixDB;Trusted_Connection=yes;';

async function test() {
    try {
        const pool = await new sql.ConnectionPool({ connectionString, driver: 'msnodesqlv8' }).connect();
        
        console.log("1. Testing Registration...");
        const email = "organizer@test.com";
        const email2 = "customer@test.com";
        
        // Mocking the UserService logic
        const res1 = await pool.request().input('email', sql.NVarChar, email).query(`
            IF NOT EXISTS (SELECT 1 FROM Users WHERE email = @email)
            INSERT INTO Users (email, created_at) VALUES (@email, GETDATE());
            SELECT User_ID FROM Users WHERE email = @email;
        `);
        const userId = res1.recordset[0].User_ID;
        console.log("User registered with ID:", userId);

        console.log("2. Linking Wallet...");
        const address = "0x1234567890123456789012345678901234567890";
        await pool.request()
            .input('User_ID', sql.Int, userId)
            .input('address', sql.VarChar, address)
            .input('role', sql.VarChar, 'organizer')
            .query(`
                IF NOT EXISTS (SELECT 1 FROM Wallets WHERE address_wallet = @address)
                INSERT INTO Wallets (User_ID, address_wallet, role) VALUES (@User_ID, @address, @role);
            `);
        console.log("Wallet linked successfully.");

        console.log("3. Testing Login...");
        const loginRes = await pool.request()
            .input('address', sql.VarChar, address)
            .query(`
                SELECT u.email, w.role FROM Wallets w JOIN Users u ON w.User_ID = u.User_ID WHERE w.address_wallet = @address
            `);
        console.log("Login Result:", loginRes.recordset[0]);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

test();
