import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

// Middleware
app.use('*', cors());
app.use('*', logger(console.log));

// Create Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Helper function to verify user
async function verifyUser(authHeader: string | null) {
  if (!authHeader) {
    return null;
  }
  const token = authHeader.split(' ')[1];
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    return null;
  }
  return user.id;
}

// ==================== TRANSACTIONS ====================

// Get all transactions for a user
app.get('/make-server-355f0d62/transactions', async (c) => {
  const userId = await verifyUser(c.req.header('Authorization'));
  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const transactions = await kv.get(`user:${userId}:transactions`) || [];
    return c.json({ transactions });
  } catch (error) {
    console.log(`Error fetching transactions: ${error}`);
    return c.json({ error: 'Failed to fetch transactions' }, 500);
  }
});

// Add a new transaction
app.post('/make-server-355f0d62/transactions', async (c) => {
  const userId = await verifyUser(c.req.header('Authorization'));
  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const body = await c.req.json();
    const { name, amount, category, date } = body;

    const transactions = await kv.get(`user:${userId}:transactions`) || [];
    const newTransaction = {
      id: Date.now().toString(),
      name,
      amount,
      category,
      date: date || new Date().toISOString().split('T')[0],
    };

    transactions.push(newTransaction);
    await kv.set(`user:${userId}:transactions`, transactions);

    return c.json({ transaction: newTransaction });
  } catch (error) {
    console.log(`Error adding transaction: ${error}`);
    return c.json({ error: 'Failed to add transaction' }, 500);
  }
});

// ==================== LOANS ====================

// Get all loans for a user
app.get('/make-server-355f0d62/loans', async (c) => {
  const userId = await verifyUser(c.req.header('Authorization'));
  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const loans = await kv.get(`user:${userId}:loans`) || [];
    return c.json({ loans });
  } catch (error) {
    console.log(`Error fetching loans: ${error}`);
    return c.json({ error: 'Failed to fetch loans' }, 500);
  }
});

// Create a new loan application
app.post('/make-server-355f0d62/loans', async (c) => {
  const userId = await verifyUser(c.req.header('Authorization'));
  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const body = await c.req.json();
    const { amount, duration, purpose } = body;

    const loans = await kv.get(`user:${userId}:loans`) || [];
    const newLoan = {
      id: Date.now().toString(),
      type: purpose || 'Personal Loan',
      amount: parseFloat(amount),
      balance: parseFloat(amount),
      interestRate: 5.5, // Default interest rate
      dueDate: new Date(Date.now() + duration * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    };

    loans.push(newLoan);
    await kv.set(`user:${userId}:loans`, loans);

    return c.json({ loan: newLoan });
  } catch (error) {
    console.log(`Error creating loan: ${error}`);
    return c.json({ error: 'Failed to create loan' }, 500);
  }
});

// ==================== CHAT ====================

// Get chat history
app.get('/make-server-355f0d62/chat/history', async (c) => {
  const userId = await verifyUser(c.req.header('Authorization'));
  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const messages = await kv.get(`user:${userId}:chat`) || [];
    return c.json({ messages });
  } catch (error) {
    console.log(`Error fetching chat history: ${error}`);
    return c.json({ error: 'Failed to fetch chat history' }, 500);
  }
});

// Send message to chatbot (OpenRouter integration)
app.post('/make-server-355f0d62/chat', async (c) => {
  const userId = await verifyUser(c.req.header('Authorization'));
  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const body = await c.req.json();
    const { message, apiKey: userApiKey, model: userModel } = body;

    // Get chat history
    const chatHistory = await kv.get(`user:${userId}:chat`) || [];

    // Get user's financial data for context
    const transactions = await kv.get(`user:${userId}:transactions`) || [];
    const loans = await kv.get(`user:${userId}:loans`) || [];

    // Create context for the AI
    const systemPrompt = `You are FinFlow Assistant, a helpful AI financial advisor. You help users manage their finances, understand their spending, and make informed financial decisions. 

User's Financial Summary:
- Total Transactions: ${transactions.length}
- Active Loans: ${loans.length}

Be helpful, concise, and professional. Provide actionable financial advice when appropriate.`;

    // Prepare messages for OpenRouter
    const messages = [
      { role: 'system', content: systemPrompt },
      ...chatHistory.slice(-10).map((msg: any) => ({
        role: msg.role === 'bot' ? 'assistant' : 'user',
        content: msg.content,
      })),
      { role: 'user', content: message },
    ];

    // Use user-provided API key if available, otherwise use server key
    const openRouterKey = userApiKey || Deno.env.get('OPENROUTER_API_KEY');
    if (!openRouterKey) {
      console.log('OpenRouter API key not found');
      return c.json({ error: 'OpenRouter API key not configured. Please add your API key in Settings.' }, 500);
    }

    // Use user-provided model if available, otherwise use default
    const model = userModel || 'meta-llama/llama-3.1-8b-instruct:free';

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://finflow-app.com',
        'X-Title': 'FinFlow',
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`OpenRouter API error: ${response.status} - ${errorText}`);
      return c.json({ error: 'Failed to get response from AI' }, 500);
    }

    const data = await response.json();
    const botMessage = data.choices[0].message.content;

    // Save messages to history
    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    };

    const botMsg = {
      id: (Date.now() + 1).toString(),
      role: 'bot',
      content: botMessage,
      timestamp: new Date().toISOString(),
    };

    chatHistory.push(userMsg, botMsg);
    await kv.set(`user:${userId}:chat`, chatHistory);

    return c.json({ message: botMsg });
  } catch (error) {
    console.log(`Error in chat endpoint: ${error}`);
    return c.json({ error: 'Failed to process chat message' }, 500);
  }
});

// ==================== DOCUMENTS ====================

// Get all documents for a user
app.get('/make-server-355f0d62/documents', async (c) => {
  const userId = await verifyUser(c.req.header('Authorization'));
  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const documents = await kv.get(`user:${userId}:documents`) || [];
    return c.json({ documents });
  } catch (error) {
    console.log(`Error fetching documents: ${error}`);
    return c.json({ error: 'Failed to fetch documents' }, 500);
  }
});

// Upload a document (stores metadata, actual file would go to Supabase Storage in production)
app.post('/make-server-355f0d62/documents', async (c) => {
  const userId = await verifyUser(c.req.header('Authorization'));
  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const body = await c.req.json();
    const { name, size } = body;

    const documents = await kv.get(`user:${userId}:documents`) || [];
    const newDocument = {
      id: Date.now().toString(),
      name,
      size,
      uploadDate: new Date().toISOString(),
    };

    documents.push(newDocument);
    await kv.set(`user:${userId}:documents`, documents);

    return c.json({ document: newDocument });
  } catch (error) {
    console.log(`Error uploading document: ${error}`);
    return c.json({ error: 'Failed to upload document' }, 500);
  }
});

// Delete a document
app.delete('/make-server-355f0d62/documents/:id', async (c) => {
  const userId = await verifyUser(c.req.header('Authorization'));
  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const docId = c.req.param('id');
    const documents = await kv.get(`user:${userId}:documents`) || [];
    const updatedDocuments = documents.filter((doc: any) => doc.id !== docId);
    await kv.set(`user:${userId}:documents`, updatedDocuments);

    return c.json({ success: true });
  } catch (error) {
    console.log(`Error deleting document: ${error}`);
    return c.json({ error: 'Failed to delete document' }, 500);
  }
});

// ==================== AUTH ====================

// Sign up
app.post('/make-server-355f0d62/signup', async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, name } = body;

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      email_confirm: true, // Auto-confirm since email server isn't configured
    });

    if (error) {
      console.log(`Signup error: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ user: data.user });
  } catch (error) {
    console.log(`Error during signup: ${error}`);
    return c.json({ error: 'Failed to create user' }, 500);
  }
});

// Health check
app.get('/make-server-355f0d62/health', (c) => {
  return c.json({ status: 'ok', message: 'FinFlow backend is running' });
});

Deno.serve(app.fetch);
