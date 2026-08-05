import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import './App.css';
import Login from './components/Login';
import PrivateRoute from './components/PrivateRoute';
import DashboardLayout from './components/DashboardLayout';

function App() {
  return (
    <>
      <Toaster richColors position="bottom-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Todas las rutas protegidas irán dentro del DashboardLayout */}
        <Route 
          path="/*" 
          element={
            <PrivateRoute>
              <DashboardLayout />
            </PrivateRoute>
          } 
        />
      </Routes>
    </>
  );
}

export default App;