import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Settings, Save, Eye, EyeOff, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

const MODELS = [
  { id: 'meta-llama/llama-3.1-8b-instruct:free', name: 'Llama 3.1 8B (Free)', cost: 'Free' },
  { id: 'google/gemini-flash-1.5:free', name: 'Gemini Flash 1.5 (Free)', cost: 'Free' },
  { id: 'google/gemini-flash-1.5', name: 'Gemini Flash 1.5', cost: '~$0.075/1M tokens' },
  { id: 'google/gemini-pro-1.5', name: 'Gemini Pro 1.5', cost: '~$1.25/1M tokens' },
  { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', cost: '~$0.15/1M tokens' },
  { id: 'openai/gpt-4o', name: 'GPT-4o', cost: '~$2.50/1M tokens' },
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', cost: '~$3/1M tokens' },
  { id: 'meta-llama/llama-3.1-70b-instruct', name: 'Llama 3.1 70B', cost: '~$0.35/1M tokens' },
];

export function SettingsDialog() {
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('meta-llama/llama-3.1-8b-instruct:free');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

  useEffect(() => {
    // Load settings from localStorage
    const savedKey = localStorage.getItem('openrouter_api_key');
    const savedModel = localStorage.getItem('openrouter_model');
    if (savedKey) {
      setApiKey(savedKey);
    }
    if (savedModel) {
      setModel(savedModel);
    }
  }, []);

  const handleSave = () => {
    if (apiKey.trim()) {
      localStorage.setItem('openrouter_api_key', apiKey.trim());
      localStorage.setItem('openrouter_model', model);
      toast.success('Settings saved successfully!');
      setIsOpen(false);
    } else {
      localStorage.removeItem('openrouter_api_key');
      localStorage.setItem('openrouter_model', model);
      toast.success('Settings saved (using free model)');
      setIsOpen(false);
    }
    // Dispatch custom event to update UI
    window.dispatchEvent(new Event('settingsUpdated'));
  };

  const handleClear = () => {
    setApiKey('');
    setModel('meta-llama/llama-3.1-8b-instruct:free');
    localStorage.removeItem('openrouter_api_key');
    localStorage.setItem('openrouter_model', 'meta-llama/llama-3.1-8b-instruct:free');
    setTestResult(null);
    toast.success('Settings cleared');
  };

  const handleTest = async () => {
    if (!apiKey.trim()) {
      toast.error('Please enter an API key first');
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey.trim()}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://finflow-app.com',
          'X-Title': 'FinFlow',
        },
        body: JSON.stringify({
          model: model,
          messages: [{ role: 'user', content: 'Hello!' }],
          max_tokens: 10,
        }),
      });

      if (response.ok) {
        setTestResult('success');
        toast.success('API key is valid! ✓');
      } else {
        const error = await response.json();
        setTestResult('error');
        toast.error(`API key test failed: ${error.error?.message || 'Invalid key'}`);
      }
    } catch (error) {
      setTestResult('error');
      toast.error('Connection error. Please try again.');
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Chatbot Settings</DialogTitle>
          <DialogDescription>
            Configure your OpenRouter API key to use your own credits and choose any model.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="api-key">OpenRouter API Key</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="api-key"
                  type={showApiKey ? 'text' : 'password'}
                  placeholder="sk-or-v1-..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Get your API key from{' '}
              <a
                href="https://openrouter.ai/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                openrouter.ai/keys
              </a>
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="model">AI Model</Label>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger id="model">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MODELS.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name} - {m.cost}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              Select the AI model for your chatbot. Free models work without an API key.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-900 mb-2">💡 Tips:</p>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• <strong>No API key?</strong> Free models work without credits</li>
              <li>• <strong>Have $10 credits?</strong> Try GPT-4o Mini for best value</li>
              <li>• <strong>Best quality?</strong> GPT-4o or Claude 3.5 Sonnet</li>
              <li>• Your API key is stored locally and never shared</li>
            </ul>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleTest} 
              variant="outline" 
              disabled={!apiKey.trim() || isTesting}
              className="flex-1"
            >
              {isTesting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : testResult === 'success' ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                  Valid
                </>
              ) : testResult === 'error' ? (
                <>
                  <XCircle className="w-4 h-4 mr-2 text-red-600" />
                  Invalid
                </>
              ) : (
                'Test API Key'
              )}
            </Button>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave} className="flex-1 bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </Button>
            <Button onClick={handleClear} variant="outline">
              Clear
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
