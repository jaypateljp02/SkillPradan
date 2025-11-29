// Script to create an admin user in Supabase
import { createClient } from '@supabase/supabase-js';
import { createHash, randomBytes } from 'crypto';
import 'dotenv/config';

// Hash password function (same as in your app)
function hashPassword(password) {
    const salt = randomBytes(16).toString("hex");
    const hash = createHash("sha256")
        .update(password + salt)
        .digest("hex");
    return `${hash}:${salt}`;
}

async function createAdminUser() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.error('❌ Missing Supabase credentials in .env file');
        console.log('Please set SUPABASE_URL and SUPABASE_SERVICE_KEY (or SUPABASE_ANON_KEY) in your .env file');
        process.exit(1);
    }

    console.log('🔄 Connecting to Supabase...');
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Admin credentials
    const adminUsername = 'admin';
    const adminPassword = 'adminpass';
    const hashedPassword = hashPassword(adminPassword);

    try {
        // Check if admin already exists
        console.log('🔍 Checking if admin user exists...');
        const { data: existingUser } = await supabase
            .from('users')
            .select('*')
            .eq('username', adminUsername)
            .single();

        if (existingUser) {
            console.log('⚠️  Admin user already exists!');
            console.log('Updating to ensure admin privileges...');

            const { error: updateError } = await supabase
                .from('users')
                .update({ isAdmin: true })
                .eq('username', adminUsername);

            if (updateError) {
                console.error('❌ Error updating admin user:', updateError);
                process.exit(1);
            }

            console.log('✅ Admin user updated successfully!');
        } else {
            // Create new admin user
            console.log('➕ Creating new admin user...');
            const { data, error } = await supabase
                .from('users')
                .insert([
                    {
                        username: adminUsername,
                        password: hashedPassword,
                        name: 'Admin User',
                        email: 'admin@example.com',
                        university: 'Admin University',
                        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
                        isAdmin: true,
                        points: 0,
                        level: 1
                    }
                ])
                .select();

            if (error) {
                console.error('❌ Error creating admin user:', error);
                process.exit(1);
            }

            console.log('✅ Admin user created successfully!');
        }

        console.log('\n📝 Admin Login Credentials:');
        console.log('   Username: admin');
        console.log('   Password: adminpass');
        console.log('\n🌐 You can now login at: http://localhost:5000/auth');

    } catch (error) {
        console.error('❌ Unexpected error:', error);
        process.exit(1);
    }
}

createAdminUser();
