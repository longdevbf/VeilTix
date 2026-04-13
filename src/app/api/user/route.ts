import { NextResponse } from 'next/server';
import { sql, poolPromise } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { address } = await req.json();

    if (!address) {
      return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
    }

    const pool = await poolPromise;

    // Ensure the table exists
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='WalletUsers' and xtype='U')
      CREATE TABLE WalletUsers (
          Id INT IDENTITY(1,1) PRIMARY KEY,
          WalletAddress NVARCHAR(255) NOT NULL UNIQUE,
          CreatedAt DATETIME DEFAULT GETDATE()
      )
    `);

    // Check if the user already exists
    const checkResult = await pool.request()
      .input('walletAddress', sql.NVarChar(255), address)
      .query('SELECT Id, WalletAddress, CreatedAt FROM WalletUsers WHERE WalletAddress = @walletAddress');

    if (checkResult.recordset.length > 0) {
      // User exists, return the user data
      return NextResponse.json({
        message: 'User already exists',
        user: checkResult.recordset[0]
      });
    }

    // User doesn't exist, insert new user
    const insertResult = await pool.request()
      .input('walletAddress', sql.NVarChar(255), address)
      .query(`
        INSERT INTO WalletUsers (WalletAddress) 
        OUTPUT INSERTED.Id, INSERTED.WalletAddress, INSERTED.CreatedAt 
        VALUES (@walletAddress)
      `);

    return NextResponse.json({
      message: 'User created successfully',
      user: insertResult.recordset[0]
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error in POST /api/user:', error);
    try {
      const fs = require('fs');
      const path = require('path');
      fs.appendFileSync(path.join(process.cwd(), 'api_error_log.txt'), `${new Date().toISOString()} - Error: ${error.message}\n${error.stack}\n\n`);
    } catch (e) {}
    return NextResponse.json({ error: error.message || 'Internal server error', details: error.stack }, { status: 500 });
  }
}
