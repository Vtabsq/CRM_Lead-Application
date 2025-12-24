import React, { useState, useMemo } from 'react';
import axios from 'axios';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { User, XCircle, Loader2, ShieldCheck, Lock, Activity, CheckCircle2, Sparkles, Clock3 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

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

const LOGIN_STATS = [
  { label: 'Monthly Admissions Processed', value: '1.2K+' },
  { label: 'Decision Center Uptime', value: '99.9%' },
  { label: 'Avg. Response Velocity', value: '2.3s' }
];

const LOGIN_FEATURES = [
  'Unified admissions + home care workspace',
  'Role-aware governance & change tracking',
  'Instant sync with Google Sheets data lake'
];

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
      <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
        <div className="login-aurora" />
        <div className="login-aurora delay-150" />
        <div className="login-grid" />
        <div className="relative z-10 flex min-h-screen flex-col items-center justify-center gap-10 px-6 py-12 lg:flex-row lg:items-stretch">
          <div className="w-full max-w-3xl space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-semibold tracking-widest uppercase text-emerald-200">
              <ShieldCheck className="h-4 w-4" />
              Trusted Healthcare CRM Suite
            </div>
            <div className="space-y-6">
              <h1 className="text-4xl font-semibold leading-tight text-white md:text-5xl">
                Intelligent lead orchestration for <span className="text-emerald-300">home care&nbsp;&amp; admissions.</span>
              </h1>
              <p className="text-lg text-white/80 md:text-xl">
                Elevate every conversation with real-time visibility, AI-assisted forecasts, and dependable governance—all wrapped in a secure corporate workspace.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {LOGIN_STATS.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-white/15 bg-white/10 px-4 py-5 shadow-lg shadow-black/20 backdrop-blur"
                >
                  <p className="text-3xl font-semibold text-white">{stat.value}</p>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-white/70">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
            <div className="rounded-3xl border border-white/15 bg-white/5 p-6 shadow-2xl shadow-black/30 backdrop-blur">
              <div className="mb-4 flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.3em] text-white/60">
                <Activity className="h-4 w-4 text-emerald-300" />
                Platform Intelligence Layer
              </div>
              <ul className="space-y-3 text-sm text-white/85">
                {LOGIN_FEATURES.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <span className="rounded-full bg-emerald-500/20 p-1.5 text-emerald-200">
                      <CheckCircle2 className="h-4 w-4" />
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="w-full max-w-md">
            <div className="rounded-[32px] border border-white/60 bg-white/95 shadow-2xl shadow-emerald-900/40 backdrop-blur-xl">
              <div className="border-b border-slate-100 px-8 py-6">
                <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">
                  Login
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-slate-900">CRM Control Center</h3>
                <p className="mt-3 flex items-center gap-2 text-sm font-medium text-emerald-600">
                  <Lock className="h-4 w-4" />
                  Encrypted sessions with adaptive security
                </p>
              </div>

              <div className="px-8 py-8">
                {loginError && (
                  <div className="mb-4 flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm font-medium text-red-800">
                    <XCircle className="h-5 w-5" />
                    {loginError}
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Username</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={loginUser}
                        onChange={(e) => setLoginUser(e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-12 text-slate-900 shadow-inner placeholder-slate-400 transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                        placeholder="Enter your corporate ID"
                        required
                        autoComplete="username"
                      />
                      <User className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Password</label>
                    <div className="relative">
                      <input
                        type="password"
                        value={loginPass}
                        onChange={(e) => setLoginPass(e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-12 text-slate-900 shadow-inner placeholder-slate-400 transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                        placeholder="••••••••"
                        required
                        autoComplete="current-password"
                      />
                      <Lock className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                    <div className="flex items-center gap-2">
                      <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      ISO 27001 compliant workspace
                    </div>
                    <a href="mailto:support@grandworld.com" className="text-emerald-600 hover:text-emerald-500">
                      Contact Support
                    </a>
                  </div>

                  <button
                    type="submit"
                    disabled={loginLoading}
                    className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-emerald-500 to-green-500 py-3 text-base font-semibold text-white shadow-lg shadow-emerald-900/30 transition hover:shadow-2xl disabled:opacity-70"
                  >
                    <span className="relative z-10">
                      {loginLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Securing Session...
                        </span>
                      ) : (
                        'Launch Workspace'
                      )}
                    </span>
                    <span className="absolute inset-0 bg-white/10 opacity-0 transition group-hover:opacity-100" />
                  </button>
                </form>

                <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 text-xs text-slate-500">
                  By signing in you agree to the Grand World Security Policy and CRM Usage Guidelines.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <AppShell
        loginUser={loginUser}
        todayDisplay={todayDisplay}
        handleLogout={handleLogout}
      />
    </BrowserRouter>
  );
}

const AppShell = ({ loginUser, todayDisplay, handleLogout }) => {
  const location = useLocation();

  const renderWithMotion = (element) => (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="h-full"
    >
      {element}
    </motion.div>
  );

  return (
    <div className="app-surface min-h-screen text-slate-100 relative overflow-hidden">
      <div className="app-glow app-glow--one" />
      <div className="app-glow app-glow--two" />

      <header className="app-header">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center border border-white/10 shadow-lg shadow-emerald-900/30">
              <Sparkles className="h-6 w-6 text-emerald-300" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-white/60">Grand World</p>
              <h1 className="text-2xl font-semibold text-white">CRM Intelligence Workspace</h1>
            </div>
          </div>
          <div className="flex gap-3 text-xs text-white/80">
            <div className="badge badge--primary">
              <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
              System ready
            </div>
            <div className="badge badge--primary">
              <Clock3 className="h-4 w-4" />
              {todayDisplay}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-white/10 rounded-2xl px-4 py-2 backdrop-blur border border-white/10">
          <div className="text-sm">
            <p className="text-white/60 text-xs">Signed in as</p>
            <p className="text-white font-semibold">{loginUser || 'Operations'}</p>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 px-4 py-2 text-sm font-semibold shadow-lg shadow-rose-900/30 transition hover:shadow-xl"
          >
            <XCircle className="h-4 w-4" />
            Logout
          </button>
        </div>
      </header>

      <main className="app-main">
        <Sidebar />
        <section className="app-content">
          <div className="app-content__inner">
            <AnimatePresence mode="wait">
              <Routes location={location} key={location.pathname}>
                <Route path="/" element={<Navigate to="/home" replace />} />
                <Route path="/home" element={renderWithMotion(<Home />)} />
                <Route path="/enquiries" element={renderWithMotion(<EnquiryPage />)} />
                <Route
                  path="/admission"
                  element={renderWithMotion(
                    <AdmissionRegistration generateMemberId={() => `MID-${Date.now()}-${Math.floor(Math.random() * 1000)}`} />
                  )}
                />
                <Route path="/billing-summary" element={renderWithMotion(<BillingSummary />)} />
                <Route path="/analysis" element={renderWithMotion(<AnalyticsReport />)} />
                <Route path="/schema" element={renderWithMotion(<SchemaEditor />)} />
                <Route path="/charge-summary" element={renderWithMotion(<ChargeSummary />)} />
                <Route path="/documents" element={renderWithMotion(<Documents />)} />
                <Route path="/notifications" element={renderWithMotion(<NotificationSettings />)} />
                <Route path="/file-manager" element={renderWithMotion(<FileManager />)} />
                <Route path="/bed-availability" element={renderWithMotion(<BedManagement />)} />
                <Route path="/search" element={renderWithMotion(<SearchData />)} />
                <Route path="/invoice" element={renderWithMotion(<InvoiceList />)} />
                <Route path="/invoice/create" element={renderWithMotion(<InvoiceCreateNew />)} />
                <Route path="/invoice/new" element={renderWithMotion(<InvoicePageNew />)} />
                <Route path="/invoice/upload" element={renderWithMotion(<InvoiceUpload />)} />
                <Route path="/invoice/monitor" element={renderWithMotion(<InvoiceMonitor />)} />
                <Route path="/service-catalog" element={renderWithMotion(<ServiceCatalog />)} />
                <Route path="/invoice/view/:id" element={renderWithMotion(<InvoiceView />)} />
                <Route path="/homecare/clients" element={renderWithMotion(<HomeCareList />)} />
                <Route path="/homecare/create" element={renderWithMotion(<HomeCareCreate />)} />
                <Route path="/homecare/edit/:patientName" element={renderWithMotion(<HomeCareEdit />)} />
                <Route path="/homecare/billing-history/:patientName" element={renderWithMotion(<HomeCareBillingHistory />)} />
                <Route path="/homecare/billing-preview" element={renderWithMotion(<HomeCareBillingPreview />)} />
                <Route path="/patientadmission/clients" element={renderWithMotion(<PatientAdmissionList />)} />
                <Route path="/patientadmission/create" element={renderWithMotion(<PatientAdmissionCreate />)} />
                <Route path="/patientadmission/edit/:patientName" element={renderWithMotion(<PatientAdmissionEdit />)} />
                <Route path="/patientadmission/billing-history/:patientName" element={renderWithMotion(<PatientAdmissionBillingHistory />)} />
                <Route path="/patientadmission/billing-preview" element={renderWithMotion(<PatientAdmissionBillingPreview />)} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AnimatePresence>
          </div>
        </section>
      </main>

      <AIChat />
    </div>
  );
};

export default App;
