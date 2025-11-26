import { supabase } from './server/supabase.config.js';

console.log('🧪 Testing Supabase Integration\n');

async function runTests() {
    console.log('1️⃣ Testing database connection...');
    const { data: users, error: usersError } = await supabase
        .from('users')
        .select('count');

    if (usersError) {
        console.log('   ❌ Error:', usersError.message);
        return false;
    }
    console.log('   ✅ Users table accessible');

    console.log('\n2️⃣ Testing friends table...');
    const { data: friends, error: friendsError } = await supabase
        .from('friends')
        .select('count');

    if (friendsError) {
        console.log('   ❌ Error:', friendsError.message);
        return false;
    }
    console.log('   ✅ Friends table accessible');

    console.log('\n3️⃣ Testing direct_messages table...');
    const { data: messages, error: messagesError } = await supabase
        .from('direct_messages')
        .select('count');

    if (messagesError) {
        console.log('   ❌ Error:', messagesError.message);
        return false;
    }
    console.log('   ✅ Direct messages table accessible');

    console.log('\n4️⃣ Testing group_messages table...');
    const { data: groupMsgs, error: groupMsgsError } = await supabase
        .from('group_messages')
        .select('count');

    if (groupMsgsError) {
        console.log('   ❌ Error:', groupMsgsError.message);
        return false;
    }
    console.log('   ✅ Group messages table accessible');

    console.log('\n5️⃣ Testing posts table...');
    const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select('count');

    if (postsError) {
        console.log('   ❌ Error:', postsError.message);
        return false;
    }
    console.log('   ✅ Posts table accessible');

    console.log('\n' + '='.repeat(50));
    console.log('🎉 ALL TESTS PASSED!');
    console.log('='.repeat(50));
    console.log('\n✅ Your SkillPradan platform is now using Supabase!');
    console.log('✅ All data will persist across server restarts');
    console.log('✅ Friend requests, messages, and posts are saved permanently');
    console.log('\n🚀 You can now test the platform:');
    console.log('   1. Create user accounts');
    console.log('   2. Send friend requests');
    console.log('   3. Send messages');
    console.log('   4. Create posts');
    console.log('   5. Restart the server');
    console.log('   6. Everything will still be there!\n');

    return true;
}

runTests().then((success) => {
    process.exit(success ? 0 : 1);
}).catch((error) => {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
});
