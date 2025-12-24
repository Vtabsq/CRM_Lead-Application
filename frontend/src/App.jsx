import React, { useState, useMemo } from 'react';
import axios from 'axios';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { User, XCircle, Loader2 } from 'lucide-react';

// Components
import Sidebar from './Sidebar';
import EnquiryPage from './EnquiryPage';
import AdmissionRegistration from './AdmissionRegistration';
import BillingSummary from "./BillingSummary"; // Ensure export default
import AnalyticsReport from "./AnalysisReport"; // user used AnalysisReport.jsx but imported as AnalyticsReport previously, staying consistent with filename if possible
import SchemaEditor from './SchemaEditor';
import ChargeSummary from './ChargeSummary';
import Documents from './Documents';
import NotificationSettings from './NotificationSettings';
import FileManager from './FileManager';  // Ensure this exists
import BedManagement from './BedManagement';
import SearchData from './SearchData';
import AIChat from './AIChat';
import Home from './Home';


// Invoice Module
import InvoiceList from './Invoice/InvoiceList';
import InvoiceCreate from './Invoice/InvoiceCreate';
import InvoiceCreateNew from './Invoice/InvoiceCreateNew';
import InvoiceView from './Invoice/InvoiceView';
import InvoicePageNew from './Invoice/InvoicePageNew';
import InvoiceUpload from './Invoice/InvoiceUpload';
import InvoiceMonitor from './Invoice/InvoiceMonitor';
import ServiceCatalog from './components/ServiceCatalog';

// Home Care Module
import HomeCareList from './HomeCare/HomeCareList';
import HomeCareBillingHistory from './HomeCare/HomeCareBillingHistory';
import HomeCareBillingPreview from './HomeCare/HomeCareBillingPreview';
import HomeCareCreate from './HomeCare/HomeCareCreate';
import HomeCareEdit from './HomeCare/HomeCareEdit';

// Patient Admission Module
import PatientAdmissionList from './PatientAdmission/PatientAdmissionList';
import PatientAdmissionBillingHistory from './PatientAdmission/PatientAdmissionBillingHistory';
import PatientAdmissionBillingPreview from './PatientAdmission/PatientAdmissionBillingPreview';
import PatientAdmissionCreate from './PatientAdmission/PatientAdmissionCreate';
import PatientAdmissionEdit from './PatientAdmission/PatientAdmissionEdit';


// Import API configuration
import API_BASE_URL from './config';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const todayDisplay = useMemo(() => {
    return new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoginLoading(true);
      setLoginError('');

      if (!loginUser.trim() || !loginPass.trim()) {
        setLoginError('Please enter both username and password');
        setLoginLoading(false);
        return;
      }

      const response = await axios.post(`${API_BASE_URL}/login`, {
        User_name: loginUser.trim(),
        Password: loginPass.trim()
      });

      if (response.data?.status === 'ok') {
        setIsAuthenticated(true);
        setLoginError('');
      } else {
        setLoginError('Invalid username or password');
      }
    } catch (err) {
      let errorMessage = 'Login failed. Please try again.';
      if (err.response?.status === 401) {
        errorMessage = 'Invalid username or password';
      } else if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      }
      setLoginError(errorMessage);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setLoginUser('');
    setLoginPass('');
    setLoginError('');
  };

  // Render Login Screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full border-t-8 border-green-400">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-br from-blue-100 to-green-100 p-4 rounded-full shadow-md">
              <User className="w-12 h-12 text-blue-600" />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-800 text-center mb-2">Welcome Back</h2>
          <p className="text-gray-500 text-center mb-8">Sign in to access CRM Dashboard</p>

          {loginError && (
            <div className="mb-4 bg-red-50 text-red-700 px-4 py-3 rounded-lg border border-red-200 flex items-center">
              <XCircle className="w-5 h-5 mr-2" />
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
              <input
                type="text"
                value={loginUser}
                onChange={(e) => setLoginUser(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                placeholder="Enter your username"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                placeholder="Enter your password"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white font-bold py-3 rounded-lg hover:from-blue-700 hover:to-green-700 transition-all shadow-lg transform hover:-translate-y-0.5"
            >
              {loginLoading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin mr-2" />
                  Signing In...
                </div>
              ) : (
                'Login'
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Main App Structure
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
          {/* New Router-based Sidebar (No props needed) */}
          <Sidebar />

          {/* Content */}
          <div className="flex-1 w-full overflow-y-auto">
            <Routes>
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

              {/* Home Care Routes */}
              <Route path="/homecare/clients" element={<HomeCareList />} />
              <Route path="/homecare/create" element={<HomeCareCreate />} />
              <Route path="/homecare/edit/:patientName" element={<HomeCareEdit />} />
              <Route path="/homecare/billing-history/:patientName" element={<HomeCareBillingHistory />} />
              <Route path="/homecare/billing-preview" element={<HomeCareBillingPreview />} />

              {/* Patient Admission Routes */}
              <Route path="/patientadmission/clients" element={<PatientAdmissionList />} />
              <Route path="/patientadmission/create" element={<PatientAdmissionCreate />} />
              <Route path="/patientadmission/edit/:patientName" element={<PatientAdmissionEdit />} />
              <Route path="/patientadmission/billing-history/:patientName" element={<PatientAdmissionBillingHistory />} />
              <Route path="/patientadmission/billing-preview" element={<PatientAdmissionBillingPreview />} />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>

        {/* AI Chat Overlay */}
        <AIChat />
      </div>
    </BrowserRouter>
  );
}

export default App;
