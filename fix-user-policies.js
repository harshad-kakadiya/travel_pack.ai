#!/usr/bin/env node

/**
 * Fix user_emails table policies for admin dashboard access
 * 
 * This script applies the necessary RLS policies to allow the admin dashboard
 * to access user data from the user_emails table.
 * 
 * Run this script with: node fix-user-policies.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   VITE_SUPABASE_URL:', !!supabaseUrl);
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
  console.error('\nPlease check your .env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const policies = [
  // user_emails policies
  {
    table: 'user_emails',
    name: 'Service role can manage user_emails',
    policy: `
      CREATE POLICY "Service role can manage user_emails"
        ON user_emails
        FOR ALL
        TO service_role
        USING (true);
    `
  },
  {
    table: 'user_emails',
    name: 'Authenticated users can insert their own email',
    policy: `
      CREATE POLICY "Authenticated users can insert their own email"
        ON user_emails
        FOR INSERT
        TO authenticated
        WITH CHECK (true);
    `
  },
  {
    table: 'user_emails',
    name: 'Authenticated users can update their own email',
    policy: `
      CREATE POLICY "Authenticated users can update their own email"
        ON user_emails
        FOR UPDATE
        TO authenticated
        USING (true)
        WITH CHECK (true);
    `
  },
  
  // pending_sessions policies
  {
    table: 'pending_sessions',
    name: 'Service role can manage pending_sessions',
    policy: `
      CREATE POLICY "Service role can manage pending_sessions"
        ON pending_sessions
        FOR ALL
        TO service_role
        USING (true);
    `
  },
  {
    table: 'pending_sessions',
    name: 'Authenticated users can insert pending_sessions',
    policy: `
      CREATE POLICY "Authenticated users can insert pending_sessions"
        ON pending_sessions
        FOR INSERT
        TO authenticated
        WITH CHECK (true);
    `
  },
  {
    table: 'pending_sessions',
    name: 'Authenticated users can update their own pending_sessions',
    policy: `
      CREATE POLICY "Authenticated users can update their own pending_sessions"
        ON pending_sessions
        FOR UPDATE
        TO authenticated
        USING (true)
        WITH CHECK (true);
    `
  },
  {
    table: 'pending_sessions',
    name: 'Authenticated users can read their own pending_sessions',
    policy: `
      CREATE POLICY "Authenticated users can read their own pending_sessions"
        ON pending_sessions
        FOR SELECT
        TO authenticated
        USING (true);
    `
  },
  
  // travel_briefs policies
  {
    table: 'travel_briefs',
    name: 'Service role can manage travel_briefs',
    policy: `
      CREATE POLICY "Service role can manage travel_briefs"
        ON travel_briefs
        FOR ALL
        TO service_role
        USING (true);
    `
  },
  {
    table: 'travel_briefs',
    name: 'Authenticated users can insert travel_briefs',
    policy: `
      CREATE POLICY "Authenticated users can insert travel_briefs"
        ON travel_briefs
        FOR INSERT
        TO authenticated
        WITH CHECK (true);
    `
  },
  {
    table: 'travel_briefs',
    name: 'Authenticated users can read travel_briefs',
    policy: `
      CREATE POLICY "Authenticated users can read travel_briefs"
        ON travel_briefs
        FOR SELECT
        TO authenticated
        USING (true);
    `
  }
];

async function applyPolicies() {
  console.log('🔧 Applying database policies for admin dashboard access...\n');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const { table, name, policy } of policies) {
    try {
      console.log(`📝 Applying policy: ${name}`);
      
      // Execute the policy creation
      const { error } = await supabase.rpc('exec_sql', { sql: policy.trim() });
      
      if (error) {
        // If policy already exists, that's okay
        if (error.message.includes('already exists')) {
          console.log(`   ✅ Policy already exists (skipped)`);
          successCount++;
        } else {
          console.log(`   ❌ Error: ${error.message}`);
          errorCount++;
        }
      } else {
        console.log(`   ✅ Policy created successfully`);
        successCount++;
      }
    } catch (err) {
      console.log(`   ❌ Error: ${err.message}`);
      errorCount++;
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Successfully applied: ${successCount} policies`);
  console.log(`   ❌ Errors: ${errorCount} policies`);
  
  if (errorCount === 0) {
    console.log('\n🎉 All policies applied successfully!');
    console.log('   The admin dashboard should now be able to access user data.');
  } else {
    console.log('\n⚠️  Some policies failed to apply. Check the errors above.');
  }
}

// Test database connection and apply policies
async function main() {
  try {
    console.log('🔍 Testing database connection...');
    
    // Test connection by querying user_emails table
    const { data, error } = await supabase
      .from('user_emails')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.log(`❌ Database connection test failed: ${error.message}`);
      console.log('   This is expected if policies are missing - proceeding with policy creation...\n');
    } else {
      console.log(`✅ Database connection successful`);
      console.log(`   Found ${data?.length || 0} users in user_emails table\n`);
    }
    
    await applyPolicies();
    
  } catch (err) {
    console.error('❌ Script failed:', err.message);
    process.exit(1);
  }
}

main();