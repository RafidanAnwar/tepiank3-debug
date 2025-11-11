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
  const isAuthenticated = localStorage.getItem('isAuthenticated');

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function Adm() {
  return (
    <Routes>
      <Route path="/HomeAdm" element={<HomeAdm/>}/>
      <Route path="/Worksheet" element={<Worksheet/>}/>
      <Route path="/Cluster" element={<Cluster/>}/>
      <Route path="/ClusterForm" element={<ClusterForm/>}/>
      <Route path="/ClusterForm/:id" element={<ClusterForm />} />
      <Route path="/JenisPengujian" element={<JenisPengujian/>}/>
      <Route path="/JenisPengujianForm" element={<JenisPengujianForm/>}/>
      <Route path="/JenisPengujianForm/:id" element={<JenisPengujianForm/>}/>
      <Route path="/User" element={<User/>}/>
      <Route path="/Personalisasi" element={<Personalisasi/>}/>
      <Route path="/PersonalisasiForm" element={<PersonalisasiForm/>}/>
      <Route path="/PersonalisasiForm/:id" element={<PersonalisasiForm/>}/>
      <Route path="/Parameter" element={<Parameter/>}/>
      <Route path="/ParameterForm" element={<ParameterForm/>}/>
      <Route path="/ParameterForm/:id" element={<ParameterForm/>}/>
      <Route path="/Peralatan" element={<Peralatan/>}/>
      <Route path="/PeralatanForm" element={<PeralatanForm/>}/>
      <Route path="/PeralatanForm/:id" element={<PeralatanForm/>}/>

      {/* <Route
        path="/pengujian"
        element={
          <ProtectedRoute>
            <Pengujian />
          </ProtectedRoute>
        }
      /> */}
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default Adm;