const sql = require('mssql/msnodesqlv8');
const connectionString = 'Driver={ODBC Driver 17 for SQL Server};Server=DESKTOP-21ISSDL;Database=VeilTixDB;Trusted_Connection=yes;';

async function test() {
    try {
        const pool = await new sql.ConnectionPool({
            connectionString: connectionString,
            driver: 'msnodesqlv8'
        }).connect();

        const result = await pool.request().query(`
            SELECT e.*, 
                   (SELECT MIN(price) FROM Ticket_Tiers tt WHERE tt.Event_ID = e.Event_ID) as minPrice
            FROM Events e
            WHERE e.status IN ('active', 'published')
        `);
        console.log(result.recordset);
        process.exit(0);
    } catch(e) {
        console.error("LỖI:", e);
        process.exit(1);
    }
}
test();
