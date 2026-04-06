const { poolPromise } = require('./src/lib/db.js');

async function test() {
    try {
        console.log("Waiting for pool...");
        const pool = await poolPromise;
        console.log("Pool ready! Querying...");
        const result = await pool.request().query("SELECT @@VERSION as v");
        console.log(result.recordset);
        process.exit(0);
    } catch(e) {
        console.error(e);
        process.exit(1);
    }
}
test();
