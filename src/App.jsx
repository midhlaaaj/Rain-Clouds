import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import SignIn from './pages/SignIn';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import SalesDashboard from './pages/SalesDashboard';
import Diagnostics from './pages/Diagnostics';
import PaymentSuccess from './pages/PaymentSuccess';
import PDFReaderPage from './pages/PDFReaderPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const { loading } = useAuth();
  const location = useLocation();
  const isHome = location.pathname === '/';
  const isSuccess = location.pathname === '/success';
  const isAuthPage = location.pathname === '/signin' || location.pathname === '/signup';

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <>
      <Header darkText={!isHome && !isAuthPage && !isSuccess} />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignIn />} />
          <Route path="/success" element={<PaymentSuccess />} />
          <Route
            path="/read"
            element={
              <ProtectedRoute>
                <PDFReaderPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminPanel />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/sales"
            element={
              <ProtectedRoute adminOnly>
                <SalesDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/diagnostics"
            element={
              <ProtectedRoute adminOnly>
                <Diagnostics />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      {!isAuthPage && <Footer />}
    </>
  );
}

export default App;
