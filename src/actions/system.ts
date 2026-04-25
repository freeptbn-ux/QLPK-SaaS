'use server';

import { Client } from 'pg';
import path from 'path';
import fs from 'fs/promises';

export async function runDatabaseMigration() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const dbPassword = process.env.DB_PASSWORD;

  if (!supabaseUrl || !dbPassword) {
    return { 
      success: false, 
      error: 'Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc DB_PASSWORD trong .env.local' 
    };
  }

  const projectId = supabaseUrl.split('//')[1].split('.')[0];
  const connectionString = `postgresql://postgres:${dbPassword}@db.${projectId}.supabase.co:5432/postgres`;

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    const migrations = [
      '002_create_prescription_rpc.sql',
      '006_merge_patients_rpc.sql'
    ];

    for (const file of migrations) {
      const sqlPath = path.join(process.cwd(), 'supabase', 'migrations', file);
      const sql = await fs.readFile(sqlPath, 'utf8');
      console.log(`🚀 Running migration: ${file}`);
      await client.query(sql);
    }

    // Also drop the unique constraint to allow mock data creation
    console.log('🚀 Dropping unique constraint for testing...');
    await client.query('DROP INDEX IF EXISTS idx_patients_unique_person;');

    await client.end();
    return { success: true };
  } catch (error) {
    console.error('Migration failed:', error);
    try { await client.end(); } catch { }
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: message };
  }
}
