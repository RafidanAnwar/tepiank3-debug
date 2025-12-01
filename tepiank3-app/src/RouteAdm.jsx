import { Routes, Route, Navigate } from 'react-router-dom';
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


// Protected Route Component
function ProtectedRoute({ children }) {
  try {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    const userRole = localStorage.getItem('userRole');

    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }

    // Check if user has admin role
    if (userRole !== 'ADMIN' && userRole !== 'admin') {
      return <Navigate to="/home" replace />;
    }

    return children;
  } catch (error) {
    console.error('Error accessing localStorage:', error);
    return <Navigate to="/login" replace />;
  }
}

function Adm() {
  return (
    <Routes>
      <Route path="/HomeAdm" element={<ProtectedRoute><HomeAdm/></ProtectedRoute>}/>
      <Route path="/Worksheet" element={<ProtectedRoute><Worksheet/></ProtectedRoute>}/>
      <Route path="/Cluster" element={<ProtectedRoute><Cluster/></ProtectedRoute>}/>
      <Route path="/ClusterForm" element={<ProtectedRoute><ClusterForm/></ProtectedRoute>}/>
      <Route path="/ClusterForm/:id" element={<ProtectedRoute><ClusterForm /></ProtectedRoute>} />
      <Route path="/JenisPengujian" element={<ProtectedRoute><JenisPengujian/></ProtectedRoute>}/>
      <Route path="/JenisPengujianForm" element={<ProtectedRoute><JenisPengujianForm/></ProtectedRoute>}/>
      <Route path="/JenisPengujianForm/:id" element={<ProtectedRoute><JenisPengujianForm/></ProtectedRoute>}/>
      <Route path="/User" element={<ProtectedRoute><User/></ProtectedRoute>}/>
      <Route path="/Personalisasi" element={<ProtectedRoute><Personalisasi/></ProtectedRoute>}/>
      <Route path="/PersonalisasiForm" element={<ProtectedRoute><PersonalisasiForm/></ProtectedRoute>}/>
      <Route path="/PersonalisasiForm/:id" element={<ProtectedRoute><PersonalisasiForm/></ProtectedRoute>}/>
      <Route path="/Parameter" element={<ProtectedRoute><Parameter/></ProtectedRoute>}/>
      <Route path="/ParameterForm" element={<ProtectedRoute><ParameterForm/></ProtectedRoute>}/>
      <Route path="/ParameterForm/:id" element={<ProtectedRoute><ParameterForm/></ProtectedRoute>}/>
      <Route path="/Peralatan" element={<ProtectedRoute><Peralatan/></ProtectedRoute>}/>
      <Route path="/PeralatanForm" element={<ProtectedRoute><PeralatanForm/></ProtectedRoute>}/>
      <Route path="/PeralatanForm/:id" element={<ProtectedRoute><PeralatanForm/></ProtectedRoute>}/>
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default Adm;