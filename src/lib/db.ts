import sql from 'mssql/msnodesqlv8';

// Sử dụng Explicit Connection String để tránh lỗi ODBC Driver Manager
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error('Please define the DATABASE_URL environment variable inside .env.local');
}

const sqlConfig: any = {
    connectionString: connectionString,
    // Thông báo cho thư viện mssql biết là dùng driver native
    driver: 'msnodesqlv8'
};

const globalForSql = global as unknown as { sqlPoolPromise: Promise<sql.ConnectionPool> };

const poolPromise =
    globalForSql.sqlPoolPromise ||
    new sql.ConnectionPool(sqlConfig)
        .connect()
        .then((pool) => {
            console.log('✅ Đã kết nối tới SQL Server (VeilTixDB) bằng Windows Auth (msnodesqlv8)');
            return pool;
        })
        .catch((err) => {
            console.error('❌ Lỗi kết nối Database: ', err);
            throw err;
        });

if (process.env.NODE_ENV !== 'production') {
    globalForSql.sqlPoolPromise = poolPromise;
}

export { sql, poolPromise };