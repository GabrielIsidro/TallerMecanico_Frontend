import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom'
import { toast } from 'sonner'
import api from '../lib/axiosConfig'
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
  UserPlus,
  Lock
} from 'lucide-react'

import { useAuth } from '../context/AuthContext'
import ProtectedRoute from '../components/ProtectedRoute';
import logoApp from '../assets/images/NuevoLogo.png';

import { simulateWebhook } from '../features/backoffice/api/backofficeApi';

import Dashboard from '../features/talleres/pages/Dashboard'
import Cotizador from '../features/talleres/pages/Cotizador'
import Vehiculos from '../features/talleres/pages/Vehiculos'
import Historial from '../features/talleres/pages/Historial'
import Clientes from '../features/talleres/pages/Clientes'
import Servicios from '../features/talleres/pages/Servicios'
import SuperAdmin from '../features/backoffice/pages/SuperAdmin'
import MiPerfil from '../features/talleres/pages/MiPerfil'
import Suscripcion from '../features/backoffice/pages/Suscripcion'
import Inventario from '../features/talleres/pages/Inventario'
import Equipo from '../features/talleres/pages/Equipo'
import ProcesarOrden from '../features/talleres/pages/ProcesarOrden'
import ModalCambioPasswordObligatorio from '../features/auth/components/ModalCambioPasswordObligatorio'
import '../features/talleres/pages/Dashboard.css'

function DashboardLayout() {
  const { logout, userProfile, isSuperAdmin, isMecanico } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuPerfilAbierto, setMenuPerfilAbierto] = useState(false);

  const esSuperAdminVal = isSuperAdmin();
  const estaSuspendida = !esSuperAdminVal && userProfile?.estadoSuscripcion === 'SUSPENDIDA';
  const estaVencida = !esSuperAdminVal && userProfile?.estadoSuscripcion === 'VENCIDA';

  // Guardia de navegación para estados de suscripción
  useEffect(() => {
    if (estaSuspendida && location.pathname !== '/suscripcion' && location.pathname !== '/perfil') {
      toast.error("Tu taller se encuentra suspendido por falta de pago. Regularizá tu plan para operar.", { id: 'guard-suspendida' });
      navigate('/suscripcion', { replace: true });
    } else if (estaVencida && location.pathname === '/cotizador') {
      toast.warning("En período de gracia (modo solo lectura) no se pueden registrar nuevos ingresos.", { id: 'guard-vencida-cotizador' });
      navigate('/suscripcion', { replace: true });
    }
  }, [estaSuspendida, estaVencida, location.pathname, navigate]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('mp_simulation') === 'success') {
      const planId = urlParams.get('planId') || '';

      // Simular webhook local llamando al backend para que realmente procese la suscripción simulada
      simulateWebhook(planId)
        .then(() => {
          toast.success("¡Pago exitoso! Tu suscripción ha sido activada.");
          setTimeout(() => window.location.href = '/', 2000);
        })
        .catch(err => {
          console.error("Error en simulación", err);
          toast.error("Error al procesar el pago simulado.");
        });
    }
  }, []);

  const isActive = (path) => {
    return location.pathname === path || (path === '/' && location.pathname === '/');
  };

  const menuItems = esSuperAdminVal ? [] : [
    { path: '/', name: 'Inicio', icon: LayoutDashboard },
    { path: '/cotizador', name: 'Nuevo Ingreso', icon: FileText },
    { path: '/vehiculos', name: 'Vehículos', icon: Car },
    { path: '/historial', name: 'Órdenes de Trabajo', icon: History },
    { path: '/clientes', name: 'Clientes', icon: Users },
    { path: '/servicios', name: 'Servicios', icon: Wrench },
    { path: '/inventario', name: 'Inventario', icon: PackageSearch, adminOnly: true, proOnly: true },
    { path: '/equipo', name: 'Mi Equipo', icon: UserPlus, adminOnly: true, proOnly: true },
  ];

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="logo" onClick={() => navigate('/')} title="PatitoFix - Inicio">
          <img 
            src={logoApp} 
            alt="PatitoFix - Gestión Integral para Talleres" 
            className="sidebar-logo-img"
          />
        </div>
        <nav>
          {menuItems.map((item) => {
            if (item.adminOnly && isMecanico()) return null;
            if (item.proOnly && userProfile?.tipoPlan !== 'PRO') return null;

            const bloqueadoPorSuspension = estaSuspendida;
            const bloqueadoPorGracia = estaVencida && item.path === '/cotizador';
            const estaBloqueado = bloqueadoPorSuspension || bloqueadoPorGracia;

            const handleClick = () => {
              if (bloqueadoPorSuspension) {
                toast.error("Tu suscripción está suspendida. Regularizá tu plan para acceder.", { id: 'nav-suspendida' });
                navigate('/suscripcion');
                return;
              }
              if (bloqueadoPorGracia) {
                toast.warning("En período de gracia de solo lectura no se pueden registrar nuevos ingresos. Regularizá tu plan.", { id: 'nav-gracia' });
                navigate('/suscripcion');
                return;
              }
              navigate(item.path);
            };

            return (
              <div
                key={item.path}
                className={`menu-item ${isActive(item.path) ? 'active' : ''}`}
                onClick={handleClick}
                style={estaBloqueado ? { opacity: 0.5, cursor: 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'space-between' } : {}}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <item.icon size={20} /> {item.name}
                </div>
                {estaBloqueado && (
                  <Lock size={15} color={bloqueadoPorSuspension ? '#f59e0b' : '#ef4444'} />
                )}
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

              {!esSuperAdminVal && !isMecanico() && (
                <div
                  onClick={() => {
                    navigate('/suscripcion');
                    setMenuPerfilAbierto(false);
                  }}
                  className="dl-dropdown-item"
                >
                  <CreditCard size={18} color="#64748b" />
                  Mi Suscripción y Planes
                </div>
              )}

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
              <Route path="/cotizador" element={<Cotizador />} />
              <Route path="/ordenes/:id" element={<ProcesarOrden />} />
              <Route path="/vehiculos" element={<Vehiculos />} />
              <Route path="/historial" element={<Historial />} />
              <Route path="/clientes" element={<Clientes />} />
              <Route path="/servicios" element={<Servicios />} />
              <Route
                path="/inventario"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN_TALLER']}>
                    <Inventario />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/equipo"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN_TALLER']}>
                    <Equipo />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/suscripcion"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN_TALLER']}>
                    <Suscripcion />
                  </ProtectedRoute>
                }
              />
            </>
          )}

          <Route path="/perfil" element={<MiPerfil />} />
        </Routes>
      </main>

      {userProfile?.debeCambiarPassword && <ModalCambioPasswordObligatorio />}
    </div>
  )
}

export default DashboardLayout;
