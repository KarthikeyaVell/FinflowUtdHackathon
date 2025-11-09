import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Progress } from './ui/progress';
import { Upload, FileText, X, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { loansAPI, documentsAPI } from '../utils/api';
import { toast } from 'sonner@2.0.3';

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
  uploadDate: string | Date;
}

export function LoansPage() {
  const [loanAmount, setLoanAmount] = useState('');
  const [loanDuration, setLoanDuration] = useState('');
  const [loanPurpose, setLoanPurpose] = useState('');
  const [activeLoans, setActiveLoans] = useState<ActiveLoan[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // Load loans and documents on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [loansResponse, documentsResponse] = await Promise.all([
        loansAPI.getAll(),
        documentsAPI.getAll(),
      ]);
      setActiveLoans(loansResponse.loans || []);
      setUploadedFiles(documentsResponse.documents || []);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load loan data. Please try again.');
    } finally {
      setIsFetching(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setIsLoading(true);
      try {
        for (const file of Array.from(files)) {
          const response = await documentsAPI.upload({
            name: file.name,
            size: file.size,
          });
          setUploadedFiles((prev) => [...prev, response.document]);
        }
        toast.success('Documents uploaded successfully');
      } catch (error) {
        console.error('Failed to upload documents:', error);
        toast.error('Failed to upload documents. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleRemoveFile = async (id: string) => {
    try {
      await documentsAPI.delete(id);
      setUploadedFiles(uploadedFiles.filter((file) => file.id !== id));
      toast.success('Document removed');
    } catch (error) {
      console.error('Failed to remove document:', error);
      toast.error('Failed to remove document. Please try again.');
    }
  };

  const handleStartApplication = async () => {
    if (!loanAmount || !loanDuration || !loanPurpose) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      const response = await loansAPI.create({
        amount: loanAmount,
        duration: loanDuration,
        purpose: loanPurpose,
      });
      
      setActiveLoans([...activeLoans, response.loan]);
      setLoanAmount('');
      setLoanDuration('');
      setLoanPurpose('');
      toast.success('Loan application created successfully!');
    } catch (error) {
      console.error('Failed to create loan:', error);
      toast.error('Failed to create loan application. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Start Loan Application'
                )}
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
            {isFetching ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            ) : activeLoans.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No active loans. Create a loan application to get started.
              </p>
            ) : (
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
            )}
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
                            {new Date(file.uploadDate).toLocaleDateString('en-US', {
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
