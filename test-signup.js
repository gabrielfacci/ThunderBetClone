// Teste de cadastro direto com Supabase
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kgpmvqfehzkeyrtexdkb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtncG12cWZlaHprZXlydGV4ZGtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4NjMwNjUsImV4cCI6MjA2NTQzOTA2NX0.Bz3XSiSsdSSRVJoH6YxQx48T0DoHACY28wrv-X43ff4';

console.log('URL:', supabaseUrl);
console.log('Key exists:', !!supabaseKey);

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSignup() {
  try {
    const testEmail = 'usuario.teste@exemplo.com';
    const testPassword = 'senha123456';
    const testName = 'Usuario Teste';
    
    console.log('Testando cadastro com:', testEmail);
    
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
      console.error('Erro no teste:', error);
    } else {
      console.log('Teste bem-sucedido:', data);
    }
    
  } catch (err) {
    console.error('Erro geral:', err);
  }
}

testSignup();