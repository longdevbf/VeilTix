import sql from 'mssql';

const sqlConfig = {
    user: process.env.DB_USER as string,
    password: process.env.DB_PASSWORD as string,
    database: process.env.DB_NAME as string,
    server: process.env.DB_SERVER as string,
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

const globalForSql = global as unknown as { sqlPoolPromise: Promise<sql.ConnectionPool> };

const poolPromise =
    globalForSql.sqlPoolPromise ||
    new sql.ConnectionPool(sqlConfig)
        .connect()
        .then((pool) => {
            console.log('✅ Đã kết nối tới SQL Server (VeilTixDB) bằng tài khoản SA');
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