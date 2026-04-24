const sql = require('mssql/msnodesqlv8');
require('dotenv').config({ path: '.env.local' });

async function testConnection() {
    const connectionString = process.env.DB_CONNECTION_STRING || process.env.DATABASE_URL;
    console.log('Testing connection with string:', connectionString);
    
    if (!connectionString) {
        console.error('❌ Missing connection string in .env.local');
        return;
    }

    try {
        const pool = await new sql.ConnectionPool({
            connectionString,
            driver: 'msnodesqlv8'
        }).connect();
        
        console.log('✅ Connection successful!');
        
        const result = await pool.request().query('SELECT TOP 1 * FROM Users');
        console.log('✅ Query successful! Found users:', result.recordset.length);
        
        await pool.close();
    } catch (err) {
        console.error('❌ Connection failed:', err);
    }
}

testConnection();
