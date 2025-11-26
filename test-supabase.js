import { testSupabaseConnection } from './server/supabase.config.js';

console.log('🔍 Testing Supabase connection...\n');

testSupabaseConnection().then((connected) => {
    if (connected) {
        console.log('\n✅ SUCCESS! Supabase is connected and ready to use.');
        console.log('📊 You can now restart your server with: npm run dev');
        console.log('🎉 Your data will persist across server restarts!');
    } else {
        console.log('\n❌ FAILED! Supabase connection could not be established.');
        console.log('📋 Please check:');
        console.log('   1. Did you run the SQL schema in Supabase SQL Editor?');
        console.log('   2. Are the credentials correct in server/supabase.config.ts?');
        console.log('   3. Is your internet connection working?');
        console.log('\n📖 See SETUP_INSTRUCTIONS.md for help.');
    }
    process.exit(connected ? 0 : 1);
}).catch((error) => {
    console.error('\n❌ ERROR:', error.message);
    console.log('📖 See SETUP_INSTRUCTIONS.md for troubleshooting.');
    process.exit(1);
});
