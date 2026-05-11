require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function testAnonAccess() {
  console.log('🔍 Testing anon access to public.patients...');
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  try {
    const { data, error } = await supabase.from('patients').select('*').limit(1);
    
    if (error) {
      console.log('✅ Correctly blocked! Error:', error.message);
    } else {
      console.log('🚨 SECURITY RISK: Anon can still see data!', data);
    }
  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
  }
}

testAnonAccess();
