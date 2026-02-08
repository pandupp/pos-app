import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';


import Login from '@/pages/Login';
import POSPage from '@/pages/POS';
import InvoicePage from '@/pages/Invoice';
import SettingsPage from '@/pages/Settings';
import ItemsPage from '@/pages/Items'; 
import ReportsPage from '@/pages/Reports';

// --- DUMMY PAGES (Sisa Dashboard aja) ---
const Dashboard = () => <div className="p-8 text-center text-slate-400 font-bold text-xl">Dashboard Statistik (Segera Hadir)</div>;

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Halaman Full Screen */}
          <Route path="/login" element={<Login />} />
          <Route path="/invoice" element={<InvoicePage />} />

          {/* Halaman Dalam Layout */}
          <Route element={<DashboardLayout />}>
             <Route path="/" element={<Navigate to="/pos" replace />} />
             
             <Route path="/dashboard" element={<Dashboard />} />
             <Route path="/pos" element={<POSPage />} />
             <Route path="/items" element={<ItemsPage />} />
             
             {}
             <Route path="/reports" element={<ReportsPage />} />
             
             <Route path="/settings" element={<SettingsPage />} /> 
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;