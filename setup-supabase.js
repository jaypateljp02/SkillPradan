import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = 'https://kacalbxcxaqjdgxujcqf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImthY2FsYnhjeGFxamRneHVqY3FmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5NzkzNzEsImV4cCI6MjA3OTU1NTM3MX0.Uh1471va9rMIahKAHaSQjyhJIicR3E-FHLbg46cxe2Y';

console.log('🚀 SkillPradan - Automated Supabase Setup\n');
console.log('📋 This script will set up your database automatically\n');

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
    try {
        console.log('1️⃣ Testing Supabase connection...');

        // Test connection by trying to query
        const { data, error } = await supabase.from('users').select('count').limit(1);

        if (error && error.code === '42P01') {
            // Table doesn't exist - this is expected on first run
            console.log('   ⚠️  Tables not found (expected on first setup)');
            console.log('\n2️⃣ Reading SQL schema file...');

            const sqlPath = path.join(__dirname, 'supabase-schema.sql');
            const sqlContent = fs.readFileSync(sqlPath, 'utf8');

            console.log('   ✅ SQL schema loaded');
            console.log('\n❌ IMPORTANT: The Supabase JavaScript client cannot execute raw SQL.');
            console.log('   You need to run the SQL manually in the Supabase dashboard.\n');
            console.log('📋 Here\'s what to do:\n');
            console.log('1. Open: https://supabase.com/dashboard/project/kacalbxcxaqjdgxujcqf/sql/new');
            console.log('2. Copy the contents of: supabase-schema.sql');
            console.log('3. Paste into the SQL Editor');
            console.log('4. Click RUN\n');
            console.log('💡 OR use the Supabase CLI if you have it installed:');
            console.log('   supabase db push\n');

            return false;
        } else if (error) {
            console.log('   ❌ Connection error:', error.message);
            return false;
        } else {
            console.log('   ✅ Connected successfully!');
            console.log('\n2️⃣ Checking if tables exist...');

            // Check for key tables
            const tables = ['users', 'friends', 'direct_messages', 'group_messages', 'posts'];
            let allTablesExist = true;

            for (const table of tables) {
                const { error: tableError } = await supabase.from(table).select('count').limit(1);
                if (tableError) {
                    console.log(`   ❌ Table '${table}' not found`);
                    allTablesExist = false;
                } else {
                    console.log(`   ✅ Table '${table}' exists`);
                }
            }

            if (allTablesExist) {
                console.log('\n✅ SUCCESS! All tables are set up correctly!');
                console.log('🎉 Your database is ready to use!');
                console.log('\n📊 Next steps:');
                console.log('1. Restart your server: npm run dev');
                console.log('2. Look for: "🚀 Using Supabase Storage (Persistent)"');
                console.log('3. Test the features!\n');
                return true;
            } else {
                console.log('\n⚠️  Some tables are missing. Please run the SQL schema.');
                return false;
            }
        }
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        return false;
    }
}

// Run the setup
setupDatabase().then((success) => {
    if (success) {
        console.log('✅ Setup complete!');
        process.exit(0);
    } else {
        console.log('\n📖 For manual setup instructions, see: DO_THIS_NOW.md');
        process.exit(1);
    }
});
