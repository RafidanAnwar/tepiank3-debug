import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Home';
import Pengujian from './components/Pengujian';
import Profile from './components/Profile';
import PengujianParameter from './components/PengujianParameter';
import PengujianStatus from './components/PengujianStatus';
import PengujianPembayaran from './components/PengujianPembayaran';


// Protected Route Component
function ProtectedRoute({ children }) {
  const isAuthenticated = localStorage.getItem('isAuthenticated');

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/home" element={<Home />} />
      <Route path="/pengujian" element={<Pengujian />} />
      <Route path="/Profile" element={<Profile/>}/>
      {/* <Route
        path="/pengujian"
        element={
          <ProtectedRoute>
            <Pengujian />
          </ProtectedRoute>
        }
      /> */}
      <Route path="/parameter-pengujian" element={<PengujianParameter />}/>
      <Route path="/status-pengujian" element={<PengujianStatus />}/>
      <Route path="/pembayaran-pengujian" element={<PengujianPembayaran />}/>
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;