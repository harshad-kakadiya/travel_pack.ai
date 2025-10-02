#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 TravelBrief.ai Admin Dashboard Setup');
console.log('=====================================\n');

// Check if .env.local already exists
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  console.log('⚠️  .env.local already exists. Backing up to .env.local.backup');
  fs.copyFileSync(envPath, path.join(process.cwd(), '.env.local.backup'));
}

// Create .env.local template
const envContent = `# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# Admin Configuration
VITE_ADMIN_PASSWORD=admin123

# Stripe Configuration (optional)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_SECRET_KEY=sk_test_your_key_here

# Supabase Service Role (optional)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
`;

fs.writeFileSync(envPath, envContent);

console.log('✅ Created .env.local file');
console.log('\n📝 Next steps:');
console.log('1. Open .env.local and replace the placeholder values with your actual Supabase credentials');
console.log('2. Get your Supabase URL and keys from: https://app.supabase.com/project/YOUR_PROJECT/settings/api');
console.log('3. Run the database migration in Supabase SQL editor (see ADMIN_DASHBOARD_SETUP.md)');
console.log('4. Restart your development server: npm run dev');
console.log('5. Navigate to /admin and use password "admin123" to login');
console.log('\n🔗 For detailed setup instructions, see ADMIN_DASHBOARD_SETUP.md');