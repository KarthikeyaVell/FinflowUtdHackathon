import { useState, useEffect } from 'react';
import { Home, MessageCircle, CreditCard, LogOut } from 'lucide-react';
import { HomePage } from './components/HomePage';
import { ChatbotPage } from './components/ChatbotPage';
import { LoansPage } from './components/LoansPage';
import { AuthPage } from './components/AuthPage';
import { SettingsDialog } from './components/SettingsDialog';
import { Button } from './components/ui/button';
import { createClient, getCurrentUser } from './utils/supabase/client';
import { toast } from 'sonner@2.0.3';
import { Toaster } from './components/ui/sonner';

type PageType = 'home' | 'chatbot' | 'loans';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState('');

  const navItems = [
    { id: 'home' as PageType, label: 'Home', icon: Home },
    { id: 'chatbot' as PageType, label: 'Chatbot', icon: MessageCircle },
    { id: 'loans' as PageType, label: 'Loans', icon: CreditCard },
  ];

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
    
    // Auto-configure OpenRouter API key (run once)
    const apiKeyConfigured = localStorage.getItem('api_key_configured');
    if (!apiKeyConfigured) {
      localStorage.setItem('openrouter_api_key', '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');
      localStorage.setItem('openrouter_model', 'google/gemini-flash-1.5');
      localStorage.setItem('api_key_configured', 'true');
      console.log('✓ OpenRouter API key configured with Gemini Flash 1.5');
    }
  }, []);

  const checkAuth = async () => {
    try {
      const user = await getCurrentUser();
      if (user) {
        setIsAuthenticated(true);
        setUserName(user.user_metadata?.name || user.email || '');
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    checkAuth();
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setUserName('');
    toast.success('Logged out successfully');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <h1 className="text-blue-600 mb-4">FinFlow</h1>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <AuthPage onAuthSuccess={handleAuthSuccess} />
        <Toaster />
      </>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-6 py-4">
          {/* Logo on the left */}
          <h1 className="text-blue-600">FinFlow</h1>

          {/* Navigation buttons in the center */}
          <nav className="absolute left-1/2 transform -translate-x-1/2">
            <ul className="flex items-center gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => setCurrentPage(item.id)}
                      className={`flex items-center gap-2 px-6 py-2.5 rounded-lg transition-colors ${
                        currentPage === item.id
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User menu on the right */}
          <div className="flex items-center gap-3">
            <span className="text-gray-700 text-sm">Hello, {userName}</span>
            {currentPage === 'chatbot' && <SettingsDialog />}
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {currentPage === 'home' && <HomePage />}
        {currentPage === 'chatbot' && <ChatbotPage />}
        {currentPage === 'loans' && <LoansPage />}
      </main>

      <Toaster />
    </div>
  );
}
