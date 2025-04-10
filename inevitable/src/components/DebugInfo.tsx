import { useState } from 'react';
import { supabase } from '../lib/supabase';

export function DebugInfo() {
  const [debugInfo, setDebugInfo] = useState<string>('Click to check connection');
  
  const checkConnection = async () => {
    try {
      setDebugInfo('Checking connection...');
      
      // Check if we can connect to Supabase
      const { data, error } = await supabase
        .from('verification_tokens')
        .select('count')
        .limit(1);
      
      if (error) {
        setDebugInfo(`Connection error: ${error.message}`);
      } else {
        setDebugInfo(`Connected successfully! Data: ${JSON.stringify(data)}`);
        
        // Check environment variables (without revealing them)
        const envInfo = {
          supabaseUrl: !!import.meta.env.VITE_SUPABASE_URL ? 'Defined' : 'Undefined',
          supabaseKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Defined' : 'Undefined'
        };
        
        setDebugInfo(prev => `${prev}\nEnvironment variables: ${JSON.stringify(envInfo)}`);
      }
    } catch (e) {
      setDebugInfo(`Exception: ${e instanceof Error ? e.message : String(e)}`);
    }
  };
  
  return (
    <div style={{ margin: '20px', padding: '10px', border: '1px solid #ccc' }}>
      <button onClick={checkConnection}>Check Supabase Connection</button>
      <pre style={{ whiteSpace: 'pre-wrap', marginTop: '10px' }}>{debugInfo}</pre>
    </div>
  );
}
