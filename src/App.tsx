import { useState } from 'react';
import { Home, MessageCircle, CreditCard } from 'lucide-react';
import { HomePage } from './components/HomePage';
import { ChatbotPage } from './components/ChatbotPage';
import { LoansPage } from './components/LoansPage';

type PageType = 'home' | 'chatbot' | 'loans';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('home');

  const navItems = [
    { id: 'home' as PageType, label: 'Home', icon: Home },
    { id: 'chatbot' as PageType, label: 'Chatbot', icon: MessageCircle },
    { id: 'loans' as PageType, label: 'Loans', icon: CreditCard },
  ];

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

          {/* Empty div for layout balance */}
          <div className="w-20"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {currentPage === 'home' && <HomePage />}
        {currentPage === 'chatbot' && <ChatbotPage />}
        {currentPage === 'loans' && <LoansPage />}
      </main>
    </div>
  );
}
