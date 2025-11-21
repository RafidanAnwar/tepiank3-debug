import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Home from './components/Home';
import Pengujian from './components/Pengujian';
import Profile from './components/Profile';
import PengujianParameter from './components/PengujianParameter';
import PengujianStatus from './components/PengujianStatus';
import PengujianPembayaran from './components/PengujianPembayaran';
import ProtectedRoute from './components/ProtectedRoute';

import HomeAdm from './admin/HomeAdm';
import Worksheet from './admin/Worksheet';
import Cluster from './admin/Cluster';
import ClusterForm from './admin/ClusterForm';
import JenisPengujian from './admin/jenisPengujian';
import JenisPengujianForm from './admin/jenisPengujianForm';
import User from './admin/User';
import Personalisasi from './admin/Personalisasi';
import PersonalisasiForm from './admin/PersonalisasiForm';
import Parameter from './admin/Parameter';
import ParameterForm from './admin/ParameterForm';
import Peralatan from './admin/Peralatan';
import PeralatanForm from './admin/PeralatanForm';
import { ContextProvider } from './Context/ContextApi';
import { useContext } from 'react';
import { ContextApi } from './Context/ContextApi';


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
      <AppRoutes />
    </ContextProvider>
  );
}

export default App;
