const { Client } = require('pg');

const client = new Client({
  host: 'aws-0-ap-southeast-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  user: 'postgres.rrpbwyiobezgesameexo',
  password: '@Colenao123@',
});

async function run() {
  try {
    await client.connect();
    console.log('Connected!');
    
    // Check create_prescription functions
    const res = await client.query(`
      SELECT proname, pg_get_function_arguments(oid)
      FROM pg_proc
      WHERE proname = 'create_prescription';
    `);
    
    if (res.rows.length > 0) {
      console.log('Functions found:');
      res.rows.forEach(r => console.log(`${r.proname}(${r.pg_get_function_arguments})`));
    } else {
      console.log('Function not found.');
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

run();
