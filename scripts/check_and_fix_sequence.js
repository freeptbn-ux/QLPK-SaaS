require('dotenv').config();
const { Client } = require('pg');

async function main() {
  const client = new Client({
    host: 'db.rrpbwyiobezgesameexo.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: process.env.DB_PASSWORD,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to database!\n');

    // 1. Check max ID in prescriptions_header
    const maxResult = await client.query('SELECT MAX(id) as max_id, COUNT(*) as total FROM prescriptions_header');
    console.log('📊 prescriptions_header stats:');
    console.log(`   Max ID: ${maxResult.rows[0].max_id}`);
    console.log(`   Total rows: ${maxResult.rows[0].total}`);

    // 2. Check current sequence value
    const seqResult = await client.query("SELECT last_value, is_called FROM prescriptions_header_id_seq");
    console.log(`\n🔢 Sequence (prescriptions_header_id_seq):`);
    console.log(`   last_value: ${seqResult.rows[0].last_value}`);
    console.log(`   is_called: ${seqResult.rows[0].is_called}`);

    const maxId = parseInt(maxResult.rows[0].max_id) || 0;
    const seqValue = parseInt(seqResult.rows[0].last_value) || 0;

    // 3. Diagnose
    if (seqValue <= maxId) {
      console.log(`\n🚨 BUG FOUND! Sequence (${seqValue}) <= Max ID (${maxId})`);
      console.log('   Next INSERT will try to use an ID that already exists!');
      
      // 4. Fix: Reset sequence to max_id
      await client.query(`SELECT setval('prescriptions_header_id_seq', $1, true)`, [maxId]);
      console.log(`\n✅ FIXED! Sequence reset to ${maxId} (next ID will be ${maxId + 1})`);

      // 5. Verify
      const verifyResult = await client.query("SELECT last_value, is_called FROM prescriptions_header_id_seq");
      console.log(`\n🔍 Verification:`);
      console.log(`   last_value: ${verifyResult.rows[0].last_value}`);
      console.log(`   is_called: ${verifyResult.rows[0].is_called}`);
      console.log(`   Next INSERT will get ID: ${parseInt(verifyResult.rows[0].last_value) + 1}`);
    } else {
      console.log(`\n✅ Sequence looks OK! Sequence (${seqValue}) > Max ID (${maxId})`);
      console.log('   The issue might be something else...');
    }

    // Also check other sequences while we're at it
    console.log('\n--- Checking all table sequences ---');
    for (const table of ['patients', 'medicines', 'prescription_details']) {
      try {
        const tMax = await client.query(`SELECT MAX(id) as max_id FROM ${table}`);
        const tSeq = await client.query(`SELECT last_value FROM ${table}_id_seq`);
        const mId = parseInt(tMax.rows[0].max_id) || 0;
        const sVal = parseInt(tSeq.rows[0].last_value) || 0;
        const status = sVal <= mId ? '🚨 OUT OF SYNC' : '✅ OK';
        console.log(`   ${table}: max_id=${mId}, sequence=${sVal} ${status}`);

        // Fix if out of sync
        if (sVal <= mId) {
          await client.query(`SELECT setval('${table}_id_seq', $1, true)`, [mId]);
          console.log(`      ↳ FIXED! Reset to ${mId}`);
        }
      } catch (e) {
        console.log(`   ${table}: Could not check (${e.message})`);
      }
    }

    console.log('\n🎉 Done! Try saving the prescription again.');

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await client.end();
  }
}

main();
