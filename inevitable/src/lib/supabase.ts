import { createClient } from '@supabase/supabase-js';


const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create the base Supabase client
const baseClient = createClient(supabaseUrl, supabaseAnonKey);

// Create a wrapper that adds auth headers to all requests
const supabase = {
  ...baseClient,
  auth: baseClient.auth,
  
  // Override the from method to add auth headers
  from(table: string) {
    console.log(`Accessing table: ${table}`);
    const query = baseClient.from(table);
    
    // Create a proxy to intercept method calls
    return new Proxy(query, {
      get(target, prop, receiver) {
        // Get the original method
        const originalMethod = Reflect.get(target, prop, receiver);
        
        // If it's not a function, just return it
        if (typeof originalMethod !== 'function') {
          return originalMethod;
        }
        
        // Return a wrapped function that adds headers
        return function(...args: any[]) {
          // Call the original method
          const result = originalMethod.apply(target, args);
          
          // If the result has a 'headers' method (like select, insert, etc.)
          if (result && typeof result.headers === 'function') {
            // Get auth data from localStorage
            const walletAddress = localStorage.getItem('walletAddress');
            const verificationToken = localStorage.getItem('verificationToken');
            
            console.log(`Adding headers for ${table}.${String(prop)}:`);
            if (walletAddress) {
              console.log(`- Wallet address: ${walletAddress}`);
            }
            if (verificationToken) {
              console.log(`- Verification token: ${verificationToken.substring(0, 10)}...`);
            }
            
            // Store the original headers method
            const originalHeaders = result.headers;
            
            // Override the headers method
            result.headers = function(additionalHeaders = {}) {
              const authHeaders: Record<string, string> = {};
              if (walletAddress) authHeaders['x-wallet-address'] = walletAddress;
              if (verificationToken) authHeaders['x-wallet-verification'] = verificationToken;
              
              // Call the original headers method with combined headers
              return originalHeaders.call(result, {
                ...authHeaders,
                ...additionalHeaders
              });
            };
          }
          
          return result;
        };
      }
    });
  },
  
  // Override storage to add auth headers
  storage: {
    ...baseClient.storage,
    from(bucket: string) {
      const storageClient = baseClient.storage.from(bucket);
      
      // Add auth headers to upload requests
      const originalUpload = storageClient.upload;
      
      // Create a new upload method that adds headers
      const uploadWithAuth = function(path: string, fileBody: any, options?: any) {
        const walletAddress = localStorage.getItem('walletAddress');
        const verificationToken = localStorage.getItem('verificationToken');
        
        const headers: Record<string, string> = {};
        if (walletAddress) headers['x-wallet-address'] = walletAddress;
        if (verificationToken) headers['x-wallet-verification'] = verificationToken;
        
        return originalUpload.call(storageClient, path, fileBody, {
          ...options,
          headers: {
            ...options?.headers,
            ...headers
          }
        });
      };
      
      // Replace the original upload method
      storageClient.upload = uploadWithAuth;
      
      return storageClient;
    }
  }
};

export { supabase };
