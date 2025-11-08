import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Progress } from './ui/progress';
import { Upload, FileText, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface ActiveLoan {
  id: string;
  type: string;
  amount: number;
  balance: number;
  interestRate: number;
  dueDate: string;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  uploadDate: Date;
}

const activeLoans: ActiveLoan[] = [
  {
    id: '1',
    type: 'Personal Loan',
    amount: 10000,
    balance: 6500,
    interestRate: 5.5,
    dueDate: '2026-03-15',
  },
  {
    id: '2',
    type: 'Auto Loan',
    amount: 25000,
    balance: 18750,
    interestRate: 3.9,
    dueDate: '2027-06-20',
  },
];

export function LoansPage() {
  const [loanAmount, setLoanAmount] = useState('');
  const [loanDuration, setLoanDuration] = useState('');
  const [loanPurpose, setLoanPurpose] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([
    {
      id: '1',
      name: 'Income_Statement_2024.pdf',
      size: 245000,
      uploadDate: new Date('2025-11-05'),
    },
    {
      id: '2',
      name: 'Tax_Return_2024.pdf',
      size: 1024000,
      uploadDate: new Date('2025-11-06'),
    },
  ]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newFiles: UploadedFile[] = Array.from(files).map((file, index) => ({
        id: Date.now().toString() + index,
        name: file.name,
        size: file.size,
        uploadDate: new Date(),
      }));
      setUploadedFiles([...uploadedFiles, ...newFiles]);
    }
  };

  const handleRemoveFile = (id: string) => {
    setUploadedFiles(uploadedFiles.filter((file) => file.id !== id));
  };

  const handleStartApplication = () => {
    alert('Loan application started! Amount: $' + loanAmount + ', Duration: ' + loanDuration + ' months, Purpose: ' + loanPurpose);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-gray-900">Loan Management</h1>
      </div>

      <div className="space-y-6">
        {/* Loan Initiation Section */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Loan Initiation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="loan-amount">Loan Amount ($)</Label>
                <Input
                  id="loan-amount"
                  type="number"
                  placeholder="Enter amount"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="loan-duration">Loan Duration (months)</Label>
                <Input
                  id="loan-duration"
                  type="number"
                  placeholder="Enter duration"
                  value={loanDuration}
                  onChange={(e) => setLoanDuration(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="loan-purpose">Loan Purpose</Label>
                <Select value={loanPurpose} onValueChange={setLoanPurpose}>
                  <SelectTrigger id="loan-purpose" className="mt-1.5">
                    <SelectValue placeholder="Select purpose" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="auto">Auto</SelectItem>
                    <SelectItem value="home">Home Improvement</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleStartApplication}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Start Loan Application
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Loan Progress Section */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Loan Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {activeLoans.map((loan) => {
                const progress = ((loan.amount - loan.balance) / loan.amount) * 100;
                return (
                  <div key={loan.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-gray-900">{loan.type}</h3>
                        <p className="text-gray-500 text-sm mt-1">
                          Original Amount: ${loan.amount.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-900">
                          ${loan.balance.toLocaleString()}
                        </p>
                        <p className="text-gray-500 text-sm mt-1">Remaining</p>
                      </div>
                    </div>
                    <Progress value={progress} className="mb-4" />
                    <div className="flex justify-between text-sm">
                      <div>
                        <p className="text-gray-500">Interest Rate</p>
                        <p className="text-gray-900">{loan.interestRate}%</p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-500">Due Date</p>
                        <p className="text-gray-900">
                          {new Date(loan.dueDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-500">Progress</p>
                        <p className="text-green-600">{progress.toFixed(1)}% paid</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Loan Documents Section */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Loan Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Upload Area */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-700 mb-2">
                  Drag and drop files here, or click to select
                </p>
                <p className="text-gray-500 text-sm mb-4">
                  Supports PDF, DOC, DOCX, JPG, PNG (Max 10MB)
                </p>
                <label htmlFor="file-upload">
                  <Button variant="outline" className="cursor-pointer" asChild>
                    <span>Upload File</span>
                  </Button>
                  <input
                    id="file-upload"
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
              </div>

              {/* Uploaded Files List */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-gray-700">Uploaded Files</h3>
                  {uploadedFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="text-gray-900 text-sm">{file.name}</p>
                          <p className="text-gray-500 text-xs">
                            {formatFileSize(file.size)} • Uploaded{' '}
                            {file.uploadDate.toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveFile(file.id)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
