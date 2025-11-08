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
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-blue-600">FinFlow</h1>
        </div>
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => setCurrentPage(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
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
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {currentPage === 'home' && <HomePage />}
        {currentPage === 'chatbot' && <ChatbotPage />}
        {currentPage === 'loans' && <LoansPage />}
      </main>
    </div>
  );
}
