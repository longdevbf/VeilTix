import { sql, poolPromise } from './src/lib/db.js';

async function alterTable() {
    try {
        console.log('Connecting to db...');
        const pool = await poolPromise;
        console.log('Altering table...');
        await pool.request().query(`ALTER TABLE Events ALTER COLUMN event_image VARCHAR(MAX)`);
        console.log('Success!');
        process.exit(0);
    } catch (e) {
        console.error('Error:', e);
        process.exit(1);
    }
}
alterTable();
