import sql from 'mssql/msnodesqlv8';
import 'dotenv/config';

const connectionString = process.env.DB_CONNECTION_STRING;

if (!connectionString) {
    throw new Error('❌ Missing DB_CONNECTION_STRING in .env');
}

const sqlConfig: any = {
    connectionString,
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