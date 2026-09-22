import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import './assets/styles/global.css';
import Login from './features/auth/components/Login';
import RecuperarPassword from './features/auth/components/RecuperarPassword';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';

function App() {
  return (
    <>
      <Toaster richColors position="bottom-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/recuperar-password" element={<RecuperarPassword />} />
        
        {/* Todas las rutas protegidas irán dentro del DashboardLayout */}
        <Route 
          path="/*" 
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </>
  );
}

export default App;
