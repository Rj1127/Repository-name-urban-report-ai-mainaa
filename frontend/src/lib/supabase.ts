// 🚨 This is a mocked Supabase client. 
// It was created to fix the Vite "Failed to resolve import" white screen errors
// because the React components still contain Supabase queries. 
// 
// Since you have migrated to MySQL, you should gradually replace the 'supabase.from()' 
// calls in your Dasbhoard components with standard `fetch('http://localhost:5000/api/...')` 
// requests to your Node.js backend.

const mockResponse = { data: [], error: null };

const createMockChain = (tableName: string) => {
  const chainable: any = {
    select: () => chainable,
    insert: () => chainable,
    update: () => chainable,
    upsert: () => chainable,
    delete: () => chainable,
    eq: () => chainable,
    neq: () => chainable,
    in: () => chainable,
    order: () => chainable,
    limit: () => chainable,
    single: () => chainable,
    // When the chain is awaited, return the mockResponse
    then: (resolve: any) => {
      // Basic mock data based on table to prevent frontend crashes
      let mockData: any = [];
      if (tableName === 'profiles') mockData = [{ id: 1, name: 'Test User' }];
      if (tableName === 'complaints') mockData = [];
      resolve({ data: mockData, error: null });
    }
  };
  return chainable;
};

export const supabase = {
  from: (table: string) => createMockChain(table),
  storage: {
    from: () => ({
      upload: async () => ({ data: { path: 'mock.jpg' }, error: null }),
      createSignedUrl: async () => ({ data: { signedUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=400' }, error: null }),
    })
  },
  functions: {
    invoke: async (funcName: string) => {
      if (funcName === 'analyze-image') {
        return { 
          data: { detected_issue: 'pothole', confidence_score: 0.95, description: 'Mock AI Detection' }, 
          error: null 
        };
      }
      if (funcName === 'verify-resolution') {
        return {
          data: { work_done_percentage: 100, assessment: 'Looks resolved (Mocked)', is_fake: false },
          error: null
        }
      }
      return { data: null, error: null };
    }
  },
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
  }
};
