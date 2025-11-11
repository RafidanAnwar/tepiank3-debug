import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Home';
import Pengujian from './components/Pengujian';
import Profile from './components/Profile';
import PengujianParameter from './components/PengujianParameter';
import PengujianStatus from './components/PengujianStatus';
import PengujianPembayaran from './components/PengujianPembayaran';

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
import { ContextApi } from './Context/ContextApi';
import { useState } from 'react';


// Protected Route Component
function ProtectedRoute({ children }) {
  const isAuthenticated = localStorage.getItem('isAuthenticated');

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  const [user, setUser] = useState(null);

  return (
    <ContextApi.Provider
      value={
        {
          user,
          setUser,
        }
      }>

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="/pengujian" element={<Pengujian />} />
        <Route path="/Profile" element={<Profile />} />
        {/* <Route
        path="/pengujian"
        element={
          <ProtectedRoute>
            <Pengujian />
          </ProtectedRoute>
        }
      /> */}
        <Route path="/parameter-pengujian" element={<PengujianParameter />} />
        <Route path="/status-pengujian" element={<PengujianStatus />} />
        <Route path="/pembayaran-pengujian" element={<PengujianPembayaran />} />
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/HomeAdm" element={<HomeAdm />} />
        <Route path="/Worksheet" element={<Worksheet />} />
        <Route path="/Cluster" element={<Cluster />} />
        <Route path="/ClusterForm" element={<ClusterForm />} />
        <Route path="/ClusterForm/:id" element={<ClusterForm />} />
        <Route path="/JenisPengujian" element={<JenisPengujian />} />
        <Route path="/JenisPengujianForm" element={<JenisPengujianForm />} />
        <Route path="/JenisPengujianForm/:id" element={<JenisPengujianForm />} />
        <Route path="/User" element={<User />} />
        <Route path="/Personalisasi" element={<Personalisasi />} />
        <Route path="/PersonalisasiForm" element={<PersonalisasiForm />} />
        <Route path="/PersonalisasiForm/:id" element={<PersonalisasiForm />} />
        <Route path="/Parameter" element={<Parameter />} />
        <Route path="/ParameterForm" element={<ParameterForm />} />
        <Route path="/ParameterForm/:id" element={<ParameterForm />} />
        <Route path="/Peralatan" element={<Peralatan />} />
        <Route path="/PeralatanForm" element={<PeralatanForm />} />
        <Route path="/PeralatanForm/:id" element={<PeralatanForm />} />

      </Routes>
    </ContextApi.Provider>
  );
}

export default App;