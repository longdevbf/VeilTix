
const sql = require('mssql/msnodesqlv8');

const connectionString = 'Driver={ODBC Driver 17 for SQL Server};Server=DESKTOP-21ISSDL;Database=VeilTixDB;Trusted_Connection=yes;';

async function testConnection() {
    try {
        console.log('Connecting to SQL Server...');
        const pool = await new sql.ConnectionPool({
            connectionString: connectionString,
            driver: 'msnodesqlv8'
        }).connect();
        console.log('✅ Connected successfully!');
        
        const result = await pool.request().query('SELECT name FROM sys.databases WHERE name = \'VeilTixDB\'');
        console.log('Database check result:', result.recordset);
        
        await pool.close();
    } catch (err) {
        console.error('❌ Connection failed:', err);
    }
}

testConnection();
