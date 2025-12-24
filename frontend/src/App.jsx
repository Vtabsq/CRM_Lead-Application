import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { User, XCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Component imports
import Home from './Home';
import EnquiryPage from './EnquiryPage';
import AdmissionRegistration from './AdmissionRegistration';
import BillingSummary from './BillingSummary';
import AnalyticsReport from './AnalyticsReport';
import SchemaEditor from './SchemaEditor';
import ChargeSummary from './ChargeSummary';
import Documents from './Documents';
import NotificationSettings from './NotificationSettings';
import FileManager from './FileManager';
import BedManagement from './BedManagement';
import SearchData from './SearchData';
import InvoiceList from './InvoiceList';
import InvoiceCreateNew from './InvoiceCreateNew';
import InvoicePageNew from './InvoicePageNew';
import InvoiceUpload from './InvoiceUpload';
import InvoiceMonitor from './InvoiceMonitor';
import ServiceCatalog from './ServiceCatalog';
import InvoiceView from './InvoiceView';
import HomeCareList from './HomeCareList';
import HomeCareCreate from './HomeCareCreate';
import HomeCareEdit from './HomeCareEdit';
import HomeCareBillingHistory from './HomeCareBillingHistory';
import HomeCareBillingPreview from './HomeCareBillingPreview';
import PatientAdmissionList from './PatientAdmissionList';
import PatientAdmissionCreate from './PatientAdmissionCreate';
import PatientAdmissionEdit from './PatientAdmissionEdit';
import PatientAdmissionBillingHistory from './PatientAdmissionBillingHistory';
import PatientAdmissionBillingPreview from './PatientAdmissionBillingPreview';
import Sidebar from './Sidebar';
import AIChat from './AIChat';

// Import API configuration
import API_BASE_URL from './config';

export default function App() {
  const [loginUser, setLoginUser] = useState(localStorage.getItem('loginUser') || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [todayDisplay, setTodayDisplay] = useState('');

  useEffect(() => {
    const today = new Date();
    setTodayDisplay(today.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }));
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      const data = await response.json();
      localStorage.setItem('loginUser', username);
      setLoginUser(username);
      setUsername('');
      setPassword('');
    } catch (err) {
      setError('Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('loginUser');
    setLoginUser('');
  };

  if (!loginUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl"
        >
          <div className="text-center space-y-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-r from-blue-500 to-green-500 shadow-lg">
              <User className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
            <p className="text-gray-600">Sign in to access your CRM dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="mt-8 space-y-6">
            {error && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 text-sm text-red-800 bg-red-50 rounded-lg"
              >
                {error}
              </motion.div>
            )}
            
            <div className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                'Sign in'
              )}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-100 flex flex-col">
        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-gradient-to-r from-blue-500 to-green-500 border-b-4 border-green-600 shadow-lg">
          <div className="w-full px-4 py-1.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img
                src="/grand-world-logo.svg"
                alt="Grand World Elder Care"
                className="w-12 h-10 shadow-lg bg-white/90 object-contain p-2 rounded"
              />
              <div>
                <h1 className="text-2xl font-semibold text-white drop-shadow-lg">CRM Lead Application</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 text-xs text-white bg-white/20 px-3 py-1.5 backdrop-blur rounded">
                <div className="h-1.5 w-3 rounded-full bg-green-300 animate-pulse" />
                System Ready
              </div>

              <div className="flex items-center gap-3 bg-white/20 px-4 py-2 backdrop-blur rounded-md">
                <div className="text-white text-sm opacity-90">
                  User: <span className="font-semibold">{loginUser}</span>
                </div>
                <div className="text-white text-sm opacity-90">
                  Date: <span className="font-semibold">{todayDisplay}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleLogout}
                    className="px-4 py-1.5 text-sm font-medium rounded-md transition-all bg-gray-400 hover:bg-red-500 text-white shadow-md"
                  >
                    <XCircle className="w-4 h-4 inline mr-1" />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex-1 w-full px-4 py-4 flex gap-4 overflow-hidden">
          {/* Sidebar */}
          <Sidebar />

          {/* Content */}
          <div className="flex-1 w-full overflow-y-auto">
            <AnimatePresence mode="wait">
              <Routes location={useLocation()} key={useLocation().pathname}>
                <Route path="/" element={<Navigate to="/home" replace />} />
                <Route path="/home" element={<Home />} />
                <Route path="/enquiries" element={<EnquiryPage />} />
                <Route path="/admission" element={<AdmissionRegistration generateMemberId={() => `MID-${Date.now()}-${Math.floor(Math.random() * 1000)}`} />} />
                <Route path="/billing-summary" element={<BillingSummary />} />
                <Route path="/analysis" element={<AnalyticsReport />} />
                <Route path="/schema" element={<SchemaEditor />} />
                <Route path="/charge-summary" element={<ChargeSummary />} />
                <Route path="/documents" element={<Documents />} />
                <Route path="/notifications" element={<NotificationSettings />} />
                <Route path="/file-manager" element={<FileManager />} />
                <Route path="/bed-availability" element={<BedManagement />} />
                <Route path="/search" element={<SearchData />} />
                <Route path="/invoice" element={<InvoiceList />} />
                <Route path="/invoice/create" element={<InvoiceCreateNew />} />
                <Route path="/invoice/new" element={<InvoicePageNew />} />
                <Route path="/invoice/upload" element={<InvoiceUpload />} />
                <Route path="/invoice/monitor" element={<InvoiceMonitor />} />
                <Route path="/service-catalog" element={<ServiceCatalog />} />
                <Route path="/invoice/view/:id" element={<InvoiceView />} />
                <Route path="/homecare/clients" element={<HomeCareList />} />
                <Route path="/homecare/create" element={<HomeCareCreate />} />
                <Route path="/homecare/edit/:patientName" element={<HomeCareEdit />} />
                <Route path="/homecare/billing-history/:patientName" element={<HomeCareBillingHistory />} />
                <Route path="/homecare/billing-preview" element={<HomeCareBillingPreview />} />
                <Route path="/patientadmission/clients" element={<PatientAdmissionList />} />
                <Route path="/patientadmission/create" element={<PatientAdmissionCreate />} />
                <Route path="/patientadmission/edit/:patientName" element={<PatientAdmissionEdit />} />
                <Route path="/patientadmission/billing-history/:patientName" element={<PatientAdmissionBillingHistory />} />
                <Route path="/patientadmission/billing-preview" element={<PatientAdmissionBillingPreview />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AnimatePresence>
          </div>
        </div>

        {/* AI Chat Overlay */}
        <AIChat />
      </div>
    </BrowserRouter>
  );
}
