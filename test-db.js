const sql = require('mssql');

const sqlConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    server: process.env.DB_SERVER,
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000,
    },
    options: {
        encrypt: false,
        trustServerCertificate: true,
    },
};

async function testConnection() {
    try {
        console.log('🔄 Đang thử kết nối tới SQL Server...');
        console.log('Server:', sqlConfig.server);
        console.log('Database:', sqlConfig.database);
        console.log('User:', sqlConfig.user);
        
        let pool = await sql.connect(sqlConfig);
        console.log('✅ Kết nối thành công!');
        
        let result = await pool.request().query('SELECT @@VERSION AS [version]');
        console.log('💾 SQL Server Version:', result.recordset[0].version);
        
        await pool.close();
        process.exit(0);
    } catch (err) {
        console.error('❌ Lỗi kết nối Database:', err.message);
        console.error(err);
        process.exit(1);
    }
}

testConnection();
