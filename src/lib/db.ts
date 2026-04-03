import sql from 'mssql/msnodesqlv8';

const sqlConfig = {
    database: process.env.DB_NAME as string,
    server: process.env.DB_SERVER as string,
    driver: 'msnodesqlv8',
    options: {
        trustedConnection: true, // Quan trọng: Bật chế độ Windows Authentication
        trustServerCertificate: true,
    },
};

const globalForSql = global as unknown as { sqlPoolPromise: Promise<sql.ConnectionPool> };

const poolPromise =
    globalForSql.sqlPoolPromise ||
    new sql.ConnectionPool(sqlConfig)
        .connect()
        .then((pool) => {
            console.log('✅ Đã kết nối tới SQL Server (VeilTixDB) bằng Windows Auth');
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