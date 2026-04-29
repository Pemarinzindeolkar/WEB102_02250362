require('dotenv').config();
const supabase = require('./src/lib/supabase');

async function test() {
  console.log('Testing Supabase connection...');
  console.log('URL:', process.env.SUPABASE_URL);
  
  // Test listing buckets
  const { data, error } = await supabase.storage.listBuckets();
  
  if (error) {
    console.error('Error:', error.message);
  } else {
    console.log('✅ Connected to Supabase!');
    console.log('Available buckets:', data.map(b => b.name));
  }
}

test();
