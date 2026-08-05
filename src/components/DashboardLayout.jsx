import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom'
import { toast } from 'sonner'
import api from '../api/axiosConfig'
import {
  LayoutDashboard,
  FileText,
  Car,
  History,
  Users,
  Wrench,
  PackageSearch,
  UserCircle,
  LogOut,
  ShieldCheck,
  User,
  CreditCard,
  UserPlus
} from 'lucide-react'

import { useAuth } from '../context/AuthContext'

import Dashboard from './Dashboard'
import Cotizador from './Cotizador'
import Vehiculos from './Vehiculos'
import Historial from './Historial'
import Clientes from './Clientes'
import Servicios from './Servicios'
import SuperAdmin from './SuperAdmin'
import MiPerfil from './MiPerfil'
import Suscripcion from './Suscripcion'
import Inventario from './Inventario'
import Equipo from './Equipo'
import '../styles/Dashboard.css'

function DashboardLayout() {
  const { logout, userProfile, isSuperAdmin, isMecanico } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuPerfilAbierto, setMenuPerfilAbierto] = useState(false);

  const esSuperAdminVal = isSuperAdmin();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if(urlParams.get('mp_simulation') === 'success') {
        const planId = urlParams.get('planId') || '';
        
        // Simular webhook local llamando al backend para que realmente procese la suscripción simulada
        api.post('/suscripciones/webhook', { data: { id: 'simulado' }, planId: planId })
          .then(() => {
             toast.success("¡Pago acreditado con éxito! Gracias por suscribirte.");
             // Limpiar URL para que no vuelva a saltar si recarga
             window.history.replaceState({}, document.title, "/");
             
             // Recargar la ventana completa para que se refresque el perfil y las rutas (Inventario, etc)
             setTimeout(() => {
               window.location.reload();
             }, 2000);
          })
          .catch(e => {
             console.error("Error en webhook simulado", e);
             toast.error("Error al procesar el pago simulado.");
          });
    }
  }, []);

  const isActive = (path) => {
    return location.pathname === path || (path === '/' && location.pathname === '/');
  };

  const menuItems = esSuperAdminVal ? [] : [
    { path: '/', name: 'Inicio', icon: LayoutDashboard },
    { path: '/cotizador', name: 'Cotizador', icon: FileText },
    { path: '/vehiculos', name: 'Vehículos', icon: Car },
    { path: '/historial', name: 'Historial', icon: History },
    { path: '/clientes', name: 'Clientes', icon: Users },
    { path: '/servicios', name: 'Servicios', icon: Wrench },
    { path: '/inventario', name: 'Inventario', icon: PackageSearch, adminOnly: true, proOnly: true },
    { path: '/equipo', name: 'Mi Equipo', icon: UserPlus, adminOnly: true, proOnly: true },
    { path: '/suscripcion', name: 'Mi Suscripción', icon: CreditCard, adminOnly: true },
  ];

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="logo">
          <Wrench size={24} color="#fbbf24" style={{ marginRight: '10px' }} />
          TuTaller SaaS
        </div>
        <nav>
          {menuItems.map((item) => {
              if (item.adminOnly && isMecanico()) return null;
              if (item.proOnly && userProfile?.tipoPlan !== 'PRO') return null;
              
              return (
                <div 
                  key={item.path}
                  className={`menu-item ${isActive(item.path) ? 'active' : ''}`} 
                  onClick={() => navigate(item.path)}
                >
                  <item.icon size={20} /> {item.name}
                </div>
              )
          })}

          {esSuperAdminVal && (
            <div
              className={`menu-item ${isActive('/') ? 'active' : ''} dl-menu-admin`}
              onClick={() => navigate('/')}
            >
              <ShieldCheck size={20} color="#8b5cf6" />
              SaaS Admin
            </div>
          )}

        </nav>
      </aside>

      <main className="main-content">
        <div className="dl-header-container">
          <div
            onClick={() => setMenuPerfilAbierto(!menuPerfilAbierto)}
            className={`dl-profile-btn ${menuPerfilAbierto ? 'open' : ''}`}
          >
            <UserCircle size={26} color="#3b82f6" />
            <div className="dl-profile-info">
              <span className="dl-profile-name">
                {userProfile ? `${userProfile.nombre} ${userProfile.apellido}` : (esSuperAdminVal ? 'Administrador Root' : 'Dueño del Taller')}
              </span>
              <span className="dl-profile-email">
                {userProfile?.email || 'cargando...'}
              </span>
            </div>
            <Wrench size={16} color="#94a3b8" className={`dl-profile-icon ${menuPerfilAbierto ? 'open' : ''}`} />
          </div>

          {menuPerfilAbierto && (
            <div className="dl-dropdown-menu">
              <div
                onClick={() => {
                  navigate('/perfil');
                  setMenuPerfilAbierto(false);
                }}
                className="dl-dropdown-item"
              >
                <User size={18} color="#64748b" />
                Mi Perfil y Seguridad
              </div>

              <div className="dl-dropdown-divider"></div>

              <div
                onClick={() => {
                  logout();
                  setMenuPerfilAbierto(false);
                  navigate('/login');
                }}
                className="dl-dropdown-item dl-dropdown-item-danger"
              >
                <LogOut size={18} color="#ef4444" />
                Cerrar Sesión
              </div>
            </div>
          )}

          {menuPerfilAbierto && (
            <div
              onClick={() => setMenuPerfilAbierto(false)}
              className="dl-overlay"
            ></div>
          )}
        </div>

        <Routes>
          <Route path="/" element={esSuperAdminVal ? <SuperAdmin /> : <Dashboard />} />
          
          {!esSuperAdminVal && (
            <>
              <Route path="/cotizador" element={isMecanico() ? <Navigate to="/" /> : <Cotizador />} />
              <Route path="/vehiculos" element={<Vehiculos />} />
              <Route path="/historial" element={<Historial />} />
              <Route path="/clientes" element={<Clientes />} />
              <Route path="/servicios" element={<Servicios />} />
              <Route path="/inventario" element={isMecanico() ? <Navigate to="/" /> : <Inventario />} />
              <Route path="/equipo" element={isMecanico() ? <Navigate to="/" /> : <Equipo />} />
              <Route path="/suscripcion" element={isMecanico() ? <Navigate to="/" /> : <Suscripcion />} />
            </>
          )}

          <Route path="/perfil" element={<MiPerfil />} />
        </Routes>
      </main>
    </div>
  )
}

export default DashboardLayout;
