const sql = require('mssql/msnodesqlv8');

const connectionString = 'Driver={ODBC Driver 17 for SQL Server};Server=DESKTOP-21ISSDL;Database=VeilTixDB;Trusted_Connection=yes;';

const sqlConfig = {
    connectionString: connectionString,
    driver: 'msnodesqlv8'
};

async function checkDb() {
  try {
    const pool = await new sql.ConnectionPool(sqlConfig).connect();
    
    // Check if table exists
    const tableCheck = await pool.request().query("SELECT * FROM sysobjects WHERE name='Users' and xtype='U'");
    if (tableCheck.recordset.length === 0) {
        console.log('Table "Users" does not exist yet.');
        process.exit(0);
    }
    
    const result = await pool.request().query('SELECT * FROM Users');
    console.log('Users in DB:', result.recordset);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

checkDb();
