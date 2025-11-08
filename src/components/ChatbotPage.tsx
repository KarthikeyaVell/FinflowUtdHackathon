import { useState } from 'react';
import { Phone, Send } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';

interface Message {
  id: string;
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

const initialMessages: Message[] = [
  {
    id: '1',
    role: 'bot',
    content: 'Hello! I\'m your FinFlow assistant. How can I help you with your finances today?',
    timestamp: new Date('2025-11-08T10:00:00'),
  },
  {
    id: '2',
    role: 'user',
    content: 'What were my biggest expenses this month?',
    timestamp: new Date('2025-11-08T10:01:00'),
  },
  {
    id: '3',
    role: 'bot',
    content: 'Based on your transaction history, your biggest expenses this month were:\n\n1. Investments: $1,750.00\n2. Food: $219.57\n3. Entertainment: $53.98\n4. Online Purchases: $78.98\n\nYour investment purchases were your largest category of spending.',
    timestamp: new Date('2025-11-08T10:01:30'),
  },
  {
    id: '4',
    role: 'user',
    content: 'Can you help me create a budget?',
    timestamp: new Date('2025-11-08T10:02:00'),
  },
  {
    id: '5',
    role: 'bot',
    content: 'Of course! I\'d be happy to help you create a budget. Let\'s start with these questions:\n\n1. What\'s your monthly take-home income?\n2. What are your fixed expenses (rent, utilities, insurance)?\n3. What are your financial goals for the next 6-12 months?\n\nOnce I have this information, I can suggest a personalized budget plan.',
    timestamp: new Date('2025-11-08T10:02:30'),
  },
];

export function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages([...messages, newUserMessage]);
    setInputValue('');

    // Simulate bot response
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: 'Thank you for your message. I\'m here to help you with your financial questions and provide insights about your spending, savings, and investments.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Optional Left Sidebar for Chat History */}
      <aside className="w-64 bg-gray-50 border-r border-gray-200 p-4 hidden md:block">
        <h2 className="text-gray-900 mb-4">Chat History</h2>
        <div className="space-y-2">
          <div className="p-3 bg-white rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
            <p className="text-gray-900 text-sm">Budget Planning</p>
            <p className="text-gray-500 text-xs mt-1">Today</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
            <p className="text-gray-700 text-sm">Expense Analysis</p>
            <p className="text-gray-400 text-xs mt-1">Yesterday</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
            <p className="text-gray-700 text-sm">Investment Advice</p>
            <p className="text-gray-400 text-xs mt-1">Nov 6</p>
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Messages */}
        <ScrollArea className="flex-1 p-6">
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  <p
                    className={`text-xs mt-2 ${
                      message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-4 bg-white">
          <div className="max-w-3xl mx-auto flex items-center gap-3">
            {/* Phone Button */}
            <Button
              variant="outline"
              size="icon"
              className="rounded-full h-12 w-12 flex-shrink-0 bg-gray-50 hover:bg-gray-100"
            >
              <Phone className="w-5 h-5 text-gray-600" />
            </Button>

            {/* Input Field */}
            <div className="flex-1 flex items-center gap-3 bg-gray-100 rounded-full px-4 py-3">
              <Input
                type="text"
                placeholder="Type your message…"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
              />
              <Button
                onClick={handleSendMessage}
                size="icon"
                className="rounded-full h-9 w-9 flex-shrink-0 bg-blue-600 hover:bg-blue-700"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
