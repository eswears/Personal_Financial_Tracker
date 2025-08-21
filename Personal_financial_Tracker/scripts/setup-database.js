#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '..', '.env.local') });

async function setupDatabase() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.log('⚠️ Supabase credentials not found in .env.local');
        console.log('Please add the following to your .env.local file:');
        console.log('SUPABASE_URL=your_supabase_url');
        console.log('SUPABASE_ANON_KEY=your_anon_key');
        console.log('SUPABASE_SERVICE_KEY=your_service_key (optional)');
        
        // Create sample .env.local if it doesn't exist
        const envPath = path.resolve(__dirname, '..', '.env.local');
        if (!fs.existsSync(envPath)) {
            const envContent = `# Supabase Configuration
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_KEY=your_service_key_here

# AI Configuration
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Server Configuration
PORT=3001
CORS_ORIGIN=http://localhost:3000
`;
            fs.writeFileSync(envPath, envContent);
            console.log('\n✅ Created sample .env.local file. Please update it with your credentials.');
        }
        
        return;
    }

    console.log('🔄 Connecting to Supabase...');
    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
        // Read the schema file
        const schemaPath = path.resolve(__dirname, '..', 'src', 'database', 'schema.sql');
        
        if (!fs.existsSync(schemaPath)) {
            console.error('❌ Schema file not found at:', schemaPath);
            return;
        }

        console.log('✅ Connected to Supabase');
        console.log('📝 Schema file found at:', schemaPath);
        
        // Note: Supabase JS client doesn't support running raw SQL directly
        // You'll need to run the schema.sql file through Supabase dashboard or CLI
        
        console.log('\n📋 To set up the database:');
        console.log('1. Go to your Supabase project dashboard');
        console.log('2. Navigate to the SQL Editor');
        console.log('3. Copy and paste the contents of src/database/schema.sql');
        console.log('4. Run the SQL commands');
        console.log('\nAlternatively, use Supabase CLI:');
        console.log('supabase db push --db-url "your-database-url"');
        
        // Test the connection by trying to fetch categories
        console.log('\n🔍 Testing database connection...');
        const { data, error } = await supabase.from('categories').select('count');
        
        if (error) {
            if (error.message.includes('relation') && error.message.includes('does not exist')) {
                console.log('⚠️ Tables not yet created. Please run the schema.sql file first.');
            } else {
                console.log('⚠️ Database connection test failed:', error.message);
            }
        } else {
            console.log('✅ Database is set up and accessible!');
        }

    } catch (error) {
        console.error('❌ Error setting up database:', error);
    }
}

// Run the setup
setupDatabase();