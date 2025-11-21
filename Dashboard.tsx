import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Users, FileText } from 'lucide-react';
import EmployeeList from './EmployeeList';
import DocumentList from './DocumentList';

export default function Dashboard() {
  const { signOut, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'employees' | 'documents'>('employees');

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Employee Document Management System
              </h1>
              <p className="text-sm text-gray-600">{user?.email}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('employees')}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium text-sm transition ${
                  activeTab === 'employees'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                <Users className="w-5 h-5" />
                Manage Employee
              </button>
              <button
                onClick={() => setActiveTab('documents')}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium text-sm transition ${
                  activeTab === 'documents'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                <FileText className="w-5 h-5" />
                Manage File
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'employees' ? <EmployeeList /> : <DocumentList />}
          </div>
        </div>
      </div>
    </div>
  );
}
