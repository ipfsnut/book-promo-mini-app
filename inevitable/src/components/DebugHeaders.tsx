import { useState } from 'react';
import { supabase } from '../lib/supabase';

export function DebugHeaders() {
  const [result, setResult] = useState<string>('Click to test headers');
  
  const testHeaders = async () => {
    try {
      setResult('Testing headers...');
      
      // Get values from localStorage
      const walletAddress = localStorage.getItem('walletAddress');
      const verificationToken = localStorage.getItem('verificationToken');
      
      setResult(`LocalStorage values:\n- Wallet: ${walletAddress || 'not set'}\n- Token: ${verificationToken ? 'set' : 'not set'}`);
      
      // Create headers object for fetch
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || ''}`,
      };
      
      if (walletAddress) headers['x-wallet-address'] = walletAddress;
      if (verificationToken) headers['x-wallet-verification'] = verificationToken;
      
      // Test direct fetch to verify headers are working
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(
        `${supabaseUrl}/rest/v1/verification_tokens?select=count`,
        { 
          method: 'GET',
          headers
        }
      );
      
      const responseData = await response.json();
      setResult(prev => `${prev}\n\nDirect fetch response: ${JSON.stringify(responseData)}`);
      
      // Now try to insert a test token with direct fetch
      const testToken = {
        wallet_address: walletAddress || 'test-wallet',
        token: 'test-token-' + new Date().getTime(),
        created_at: new Date().toISOString()
      };
      
      const insertResponse = await fetch(
        `${supabaseUrl}/rest/v1/verification_tokens`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify([testToken])
        }
      );
      
      if (!insertResponse.ok) {
        setResult(prev => `${prev}\n\nInsert error: ${insertResponse.status} ${insertResponse.statusText}`);
        const errorText = await insertResponse.text();
        setResult(prev => `${prev}\n${errorText}`);
      } else {
        const insertData = await insertResponse.json();
        setResult(prev => `${prev}\n\nInsert success: ${JSON.stringify(insertData)}`);
      }
      
      // Now try using the supabase client directly
      setResult(prev => `${prev}\n\nTesting with Supabase client...`);
      
      const { data, error } = await supabase
        .from('verification_tokens')
        .select('count')
        .limit(1);
      
      if (error) {
        setResult(prev => `${prev}\nSelect error: ${error.message}`);
      } else {
        setResult(prev => `${prev}\nSelect success: ${JSON.stringify(data)}`);
      }
      
      // Try insert with supabase client
      const { data: insertClientData, error: insertClientError } = await supabase
        .from('verification_tokens')
        .insert([testToken])
        .select();
      
      if (insertClientError) {
        setResult(prev => `${prev}\nInsert client error: ${insertClientError.message}`);
      } else {
        setResult(prev => `${prev}\nInsert client success: ${JSON.stringify(insertClientData)}`);
      }
      
    } catch (e) {
      setResult(`Exception: ${e instanceof Error ? e.message : String(e)}`);
    }
  };
  
  return (
    <div style={{ margin: '20px', padding: '10px', border: '1px solid #ccc' }}>
      <button onClick={testHeaders}>Test Headers</button>
      <pre style={{ whiteSpace: 'pre-wrap', marginTop: '10px' }}>{result}</pre>
    </div>
  );
}
