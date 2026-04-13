
const sql = require('mssql/msnodesqlv8');

const connectionString = 'Driver={ODBC Driver 17 for SQL Server};Server=DESKTOP-21ISSDL;Database=VeilTixDB;Trusted_Connection=yes;';

async function testQuery() {
    try {
        console.log('Connecting to SQL Server...');
        const pool = await new sql.ConnectionPool({
            connectionString: connectionString,
            driver: 'msnodesqlv8'
        }).connect();
        console.log('✅ Connected successfully!');
        
        console.log('Checking table WalletUsers...');
        const result = await pool.request().query('SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = \'WalletUsers\'');
        console.log('Table existence:', result.recordset.length > 0 ? 'Yes' : 'No');
        
        if (result.recordset.length > 0) {
            console.log('Querying WalletUsers columns...');
            const columns = await pool.request().query('SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = \'WalletUsers\'');
            console.log('Columns:', columns.recordset);
            
            console.log('Attempting to run the query from the API...');
            const address = '0x1234567890123456789012345678901234567890';
            const checkQuery = await pool.request()
                .input('walletAddress', sql.NVarChar(255), address)
                .query('SELECT Id, WalletAddress, CreatedAt FROM WalletUsers WHERE WalletAddress = @walletAddress');
            console.log('Check query successful. Data length:', checkQuery.recordset.length);
        } else {
             console.log('Creating table WalletUsers...');
             await pool.request().query(`
                CREATE TABLE WalletUsers (
                    Id INT IDENTITY(1,1) PRIMARY KEY,
                    WalletAddress NVARCHAR(255) NOT NULL UNIQUE,
                    CreatedAt DATETIME DEFAULT GETDATE()
                )
             `);
             console.log('Table created successfully.');
        }

        await pool.close();
    } catch (err) {
        console.error('❌ Error:', err);
    }
}

testQuery();
