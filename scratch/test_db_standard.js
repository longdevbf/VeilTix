
const sql = require('mssql');

// Mock process.env for the test
const config = {
    user: 'sa',
    password: '123',
    server: 'DESKTOP-21ISSDL',
    database: 'VeilTixDB',
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

async function testStandardConnection() {
    try {
        console.log('Connecting to SQL Server via standard tedious driver...');
        await sql.connect(config);
        console.log('✅ Connected successfully!');
        const result = await sql.query('SELECT name FROM sys.databases WHERE name = \'VeilTixDB\'');
        console.log('Database check result:', result.recordset);
        await sql.close();
    } catch (err) {
        console.error('❌ Connection failed:', err);
    }
}

testStandardConnection();
