import { Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';

// Context
import { ContextProvider, ContextApi } from './context/ContextApi';
import { CartProvider } from './context/CartContext';

// Routes
import ProtectedRoute from './routes/ProtectedRoute';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// User Pages
import Home from './pages/user/Home';
import Pengujian from './pages/user/Pengujian';
import Profile from './pages/user/Profile';
import PengujianParameter from './pages/user/PengujianParameter';
import PengujianStatus from './pages/user/PengujianStatus';
import PengujianPembayaran from './pages/user/PengujianPembayaran';
import Cart from './pages/user/Cart';
import TransactionHistory from './pages/user/TransactionHistory';

// Admin Pages
import HomeAdm from './pages/admin/HomeAdm';
import Worksheet from './pages/admin/Worksheet';
import WorksheetDetail from './pages/admin/WorksheetDetail';
import Cluster from './pages/admin/Cluster';
import ClusterForm from './pages/admin/ClusterForm';
import JenisPengujian from './pages/admin/jenisPengujian';
import JenisPengujianForm from './pages/admin/jenisPengujianForm';
import User from './pages/admin/User';
import Personalisasi from './pages/admin/Personalisasi';
import PersonalisasiForm from './pages/admin/PersonalisasiForm';
import Parameter from './pages/admin/Parameter';
import ParameterForm from './pages/admin/ParameterForm';
import Peralatan from './pages/admin/Peralatan';
import PeralatanForm from './pages/admin/PeralatanForm';

// Auto redirect component
function AutoRedirect() {
  const { user, isAuthenticated, loading } = useContext(ContextApi);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    // Redirect based on user role
    if (user.role === 'ADMIN') {
      return <Navigate to="/HomeAdm" replace />;
    } else {
      return <Navigate to="/home" replace />;
    }
  }

  return <Navigate to="/login" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      {/* Protected User Routes */}
      <Route path="/home" element={
        <ProtectedRoute>
          <Home />
        </ProtectedRoute>
      } />
      <Route path="/pengujian" element={
        <ProtectedRoute>
          <Pengujian />
        </ProtectedRoute>
      } />
      <Route path="/Profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />
      <Route path="/parameter-pengujian" element={
        <ProtectedRoute>
          <PengujianParameter />
        </ProtectedRoute>
      } />
      {/* Alias route for reversed URL pattern */}
      <Route path="/pengujian-parameter" element={
        <ProtectedRoute>
          <PengujianParameter />
        </ProtectedRoute>
      } />
      <Route path="/status-pengujian" element={
        <ProtectedRoute>
          <PengujianStatus />
        </ProtectedRoute>
      } />
      <Route path="/pembayaran-pengujian" element={
        <ProtectedRoute>
          <PengujianPembayaran />
        </ProtectedRoute>
      } />
      <Route path="/cart" element={
        <ProtectedRoute>
          <Cart />
        </ProtectedRoute>
      } />
      <Route path="/transactions" element={
        <ProtectedRoute>
          <TransactionHistory />
        </ProtectedRoute>
      } />

      {/* Protected Admin Routes */}
      <Route path="/HomeAdm" element={
        <ProtectedRoute adminOnly>
          <HomeAdm />
        </ProtectedRoute>
      } />
      <Route path="/Worksheet" element={
        <ProtectedRoute adminOnly>
          <Worksheet />
        </ProtectedRoute>
      } />
      <Route path="/Worksheet/:id" element={
        <ProtectedRoute adminOnly>
          <WorksheetDetail />
        </ProtectedRoute>
      } />
      <Route path="/Cluster" element={
        <ProtectedRoute adminOnly>
          <Cluster />
        </ProtectedRoute>
      } />
      <Route path="/ClusterForm" element={
        <ProtectedRoute adminOnly>
          <ClusterForm />
        </ProtectedRoute>
      } />
      <Route path="/ClusterForm/:id" element={
        <ProtectedRoute adminOnly>
          <ClusterForm />
        </ProtectedRoute>
      } />
      <Route path="/JenisPengujian" element={
        <ProtectedRoute adminOnly>
          <JenisPengujian />
        </ProtectedRoute>
      } />
      <Route path="/JenisPengujianForm" element={
        <ProtectedRoute adminOnly>
          <JenisPengujianForm />
        </ProtectedRoute>
      } />
      <Route path="/JenisPengujianForm/:id" element={
        <ProtectedRoute adminOnly>
          <JenisPengujianForm />
        </ProtectedRoute>
      } />
      <Route path="/User" element={
        <ProtectedRoute adminOnly>
          <User />
        </ProtectedRoute>
      } />
      <Route path="/Personalisasi" element={
        <ProtectedRoute adminOnly>
          <Personalisasi />
        </ProtectedRoute>
      } />
      <Route path="/PersonalisasiForm" element={
        <ProtectedRoute adminOnly>
          <PersonalisasiForm />
        </ProtectedRoute>
      } />
      <Route path="/PersonalisasiForm/:id" element={
        <ProtectedRoute adminOnly>
          <PersonalisasiForm />
        </ProtectedRoute>
      } />
      <Route path="/Parameter" element={
        <ProtectedRoute adminOnly>
          <Parameter />
        </ProtectedRoute>
      } />
      <Route path="/ParameterForm" element={
        <ProtectedRoute adminOnly>
          <ParameterForm />
        </ProtectedRoute>
      } />
      <Route path="/ParameterForm/:id" element={
        <ProtectedRoute adminOnly>
          <ParameterForm />
        </ProtectedRoute>
      } />
      <Route path="/Peralatan" element={
        <ProtectedRoute adminOnly>
          <Peralatan />
        </ProtectedRoute>
      } />
      <Route path="/PeralatanForm" element={
        <ProtectedRoute adminOnly>
          <PeralatanForm />
        </ProtectedRoute>
      } />
      <Route path="/PeralatanForm/:id" element={
        <ProtectedRoute adminOnly>
          <PeralatanForm />
        </ProtectedRoute>
      } />

      {/* Default redirect */}
      <Route path="/" element={<AutoRedirect />} />
    </Routes>
  );
}

function App() {
  return (
    <ContextProvider>
      <CartProvider>
        <AppRoutes />
      </CartProvider>
    </ContextProvider>
  );
}

export default App;
