// Test script to validate Supabase authentication configuration
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://kgpmvqfehzkeyrtexdkb.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseKey) {
  console.error('❌ VITE_SUPABASE_ANON_KEY not found');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuth() {
  console.log('🔍 Testing Supabase Authentication System...\n');
  
  // Test 1: Basic connection
  console.log('1. Testing Supabase connection...');
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.log('❌ Connection failed:', error.message);
      return;
    }
    console.log('✅ Supabase connection successful');
  } catch (err) {
    console.log('❌ Connection error:', err.message);
    return;
  }

  // Test 2: Sign up with test email
  console.log('\n2. Testing user registration...');
  const testEmail = 'teste-auth-' + Date.now() + '@gmail.com';
  const testPassword = 'senha123';
  const testName = 'Usuário Teste';

  try {
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: testName
        }
      }
    });

    if (error) {
      console.log('❌ Registration failed:', error.message);
      
      if (error.message.includes('email_address_invalid')) {
        console.log('\n🔧 SOLUTION NEEDED:');
        console.log('Go to Supabase Dashboard > Authentication > Email Settings');
        console.log('Add "gmail.com" to allowed domains OR disable domain restrictions');
        return;
      }
      
      if (error.message.includes('signup_disabled')) {
        console.log('\n🔧 SOLUTION NEEDED:');
        console.log('Go to Supabase Dashboard > Authentication > Settings');
        console.log('Enable user signups');
        return;
      }
      
      return;
    }

    console.log('✅ User registration successful');
    console.log('User ID:', data.user?.id);
    console.log('Email:', data.user?.email);
    console.log('Session created:', !!data.session);

    if (!data.session) {
      console.log('\n⚠️  No session created immediately - email confirmation required');
      
      // Test 3: Try auto-login
      console.log('\n3. Testing auto-login after registration...');
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword
      });

      if (loginError) {
        console.log('❌ Auto-login failed:', loginError.message);
        
        if (loginError.message.includes('Email not confirmed')) {
          console.log('\n🔧 SOLUTION NEEDED:');
          console.log('Go to Supabase Dashboard > Authentication > Email Settings');
          console.log('Uncheck "User must confirm their email address"');
        }
        return;
      }

      console.log('✅ Auto-login successful');
      console.log('Session created:', !!loginData.session);
    }

    // Test 4: Sign out
    console.log('\n4. Testing sign out...');
    const { error: signOutError } = await supabase.auth.signOut();
    
    if (signOutError) {
      console.log('❌ Sign out failed:', signOutError.message);
      return;
    }
    
    console.log('✅ Sign out successful');

  } catch (err) {
    console.log('❌ Test failed with exception:', err.message);
  }

  console.log('\n🎉 Authentication system test completed!');
}

testAuth();