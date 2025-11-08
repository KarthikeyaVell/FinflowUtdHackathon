import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface Transaction {
  id: string;
  name: string;
  amount: number;
  category: 'Investments' | 'Entertainment' | 'Food' | 'Online Purchases';
  date: string;
}

const transactions: Transaction[] = [
  { id: '1', name: 'Stock Purchase - AAPL', amount: -1250.00, category: 'Investments', date: '2025-11-07' },
  { id: '2', name: 'Netflix Subscription', amount: -15.99, category: 'Entertainment', date: '2025-11-06' },
  { id: '3', name: 'Whole Foods Market', amount: -87.32, category: 'Food', date: '2025-11-06' },
  { id: '4', name: 'Amazon Order #12345', amount: -45.99, category: 'Online Purchases', date: '2025-11-05' },
  { id: '5', name: 'Starbucks Coffee', amount: -6.75, category: 'Food', date: '2025-11-05' },
  { id: '6', name: 'Spotify Premium', amount: -9.99, category: 'Entertainment', date: '2025-11-04' },
  { id: '7', name: 'ETF Purchase - VOO', amount: -500.00, category: 'Investments', date: '2025-11-03' },
  { id: '8', name: 'Restaurant - The Grove', amount: -125.50, category: 'Food', date: '2025-11-02' },
  { id: '9', name: 'Amazon Order #12344', amount: -32.99, category: 'Online Purchases', date: '2025-11-01' },
  { id: '10', name: 'Movie Tickets', amount: -28.00, category: 'Entertainment', date: '2025-10-31' },
];

const COLORS = {
  Investments: '#3b82f6',
  Entertainment: '#8b5cf6',
  Food: '#10b981',
  'Online Purchases': '#f59e0b',
};

export function HomePage() {
  // Calculate spending by category
  const categoryTotals = transactions.reduce((acc, transaction) => {
    const amount = Math.abs(transaction.amount);
    acc[transaction.category] = (acc[transaction.category] || 0) + amount;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(categoryTotals).map(([name, value]) => ({
    name,
    value: Number(value.toFixed(2)),
  }));

  return (
    <div className="p-8">
      {/* Title Bar */}
      <div className="mb-8">
        <h1 className="text-gray-900">FinFlow Dashboard</h1>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transactions Section */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <p className="text-gray-900">{transaction.name}</p>
                      <p className="text-gray-500 text-sm mt-1">{transaction.category}</p>
                    </div>
                    <p
                      className={`${
                        transaction.amount < 0 ? 'text-red-600' : 'text-green-600'
                      }`}
                    >
                      {transaction.amount < 0 ? '-' : '+'}${Math.abs(transaction.amount).toFixed(2)}
                    </p>
                  </div>
                  <p className="text-gray-400 text-sm">
                    {new Date(transaction.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Spending Overview Section */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Spending Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => `$${value.toFixed(2)}`}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => <span className="text-gray-700">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4">
              {Object.entries(categoryTotals).map(([category, total]) => (
                <div key={category} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[category as keyof typeof COLORS] }}
                    />
                    <p className="text-gray-600 text-sm">{category}</p>
                  </div>
                  <p className="text-gray-900">${total.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
