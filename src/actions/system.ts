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
    
    const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations');
    const files = await fs.readdir(migrationsDir);
    const sqlFiles = files
      .filter(f => f.endsWith('.sql'))
      .sort();

    const results: { file: string; success: boolean; error?: string }[] = [];

    for (const file of sqlFiles) {
      const sqlPath = path.join(migrationsDir, file);
      const sql = await fs.readFile(sqlPath, 'utf8');
      
      try {
        console.log(`🚀 Running migration: ${file}`);
        await client.query(sql);
        results.push({ file, success: true });
      } catch (err) {
        console.error(`❌ Migration failed for ${file}:`, err);
        results.push({ 
          file, 
          success: false, 
          error: err instanceof Error ? err.message : String(err) 
        });
      }
    }

    await client.end();
    
    const failed = results.filter(r => !r.success);
    return { 
      success: failed.length === 0, 
      results,
      summary: `${results.length} files processed, ${failed.length} failed.`
    };
  } catch (error) {
    console.error('Migration runner failed:', error);
    try { await client.end(); } catch { }
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: message };
  }
}
