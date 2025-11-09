import { useState, useEffect } from 'react';
import { Phone, Send, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { chatAPI } from '../utils/api';
import { SettingsDialog } from './SettingsDialog';

interface Message {
  id: string;
  role: 'user' | 'bot';
  content: string;
  timestamp: string | Date;
}

export function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [currentModel, setCurrentModel] = useState('Llama 3.1 8B (Free)');

  // Load chat history on mount and listen for settings changes
  useEffect(() => {
    loadChatHistory();
    updateModelDisplay();

    // Listen for storage changes to update model display
    const handleStorageChange = () => {
      updateModelDisplay();
    };
    window.addEventListener('storage', handleStorageChange);
    // Also listen for custom event when settings dialog closes
    window.addEventListener('settingsUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('settingsUpdated', handleStorageChange);
    };
  }, []);

  const updateModelDisplay = () => {
    const model = localStorage.getItem('openrouter_model') || 'meta-llama/llama-3.1-8b-instruct:free';
    const modelNames: Record<string, string> = {
      'meta-llama/llama-3.1-8b-instruct:free': 'Llama 3.1 8B (Free)',
      'google/gemini-flash-1.5:free': 'Gemini Flash 1.5 (Free)',
      'google/gemini-flash-1.5': 'Gemini Flash 1.5',
      'google/gemini-pro-1.5': 'Gemini Pro 1.5',
      'openai/gpt-4o-mini': 'GPT-4o Mini',
      'openai/gpt-4o': 'GPT-4o',
      'anthropic/claude-3.5-sonnet': 'Claude 3.5 Sonnet',
      'meta-llama/llama-3.1-70b-instruct': 'Llama 3.1 70B',
    };
    setCurrentModel(modelNames[model] || 'Llama 3.1 8B (Free)');
  };

  const loadChatHistory = async () => {
    try {
      const response = await chatAPI.getHistory();
      if (response.messages && response.messages.length > 0) {
        setMessages(response.messages);
      } else {
        // Set initial welcome message if no history
        setMessages([
          {
            id: '1',
            role: 'bot',
            content: 'Hello! I\'m your FinFlow AI assistant. How can I help you with your finances today?',
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
      // Set initial welcome message on error
      setMessages([
        {
          id: '1',
          role: 'bot',
          content: 'Hello! I\'m your FinFlow AI assistant. How can I help you with your finances today?',
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsFetching(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue;
    setInputValue('');
    setIsLoading(true);

    // Add user message to UI immediately
    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newUserMessage]);

    try {
      // Get API key from localStorage if available
      const apiKey = localStorage.getItem('openrouter_api_key') || undefined;
      const model = localStorage.getItem('openrouter_model') || undefined;

      // Call backend to get AI response
      const response = await chatAPI.sendMessage(userMessage, apiKey, model);
      
      // Add bot response
      setMessages((prev) => [...prev, response.message]);
    } catch (error) {
      console.error('Failed to send message:', error);
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: 'Sorry, I encountered an error. Please check your API key in Settings or try again later.',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
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
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-gray-900">Chat History</h2>
        </div>
        <div className="mb-4">
          <SettingsDialog />
        </div>
        <div className="mb-4 p-3 bg-white rounded-lg border border-gray-200">
          <p className="text-xs text-gray-500 mb-1">Current Model:</p>
          <p className="text-sm text-gray-900">{currentModel}</p>
        </div>
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
            {isFetching ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            ) : (
              <>
                {messages.map((message) => {
                  const timestamp = typeof message.timestamp === 'string' 
                    ? new Date(message.timestamp) 
                    : message.timestamp;
                  
                  return (
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
                          {timestamp.toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-2xl px-4 py-3">
                      <Loader2 className="w-5 h-5 text-gray-600 animate-spin" />
                    </div>
                  </div>
                )}
              </>
            )}
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
                disabled={isLoading}
                className="rounded-full h-9 w-9 flex-shrink-0 bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
