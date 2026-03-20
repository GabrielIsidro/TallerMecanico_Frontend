import { useState } from 'react'
import { Toaster } from 'sonner'
import './App.css'

// ---> NUEVO: Importamos los íconos de Lucide React
import { 
  LayoutDashboard, 
  FileText, 
  Car, 
  History, 
  Users, 
  Wrench,
  UserCircle 
} from 'lucide-react'

import Dashboard from './components/Dashboard' 
import Cotizador from './components/Cotizador'
import Vehiculos from './components/Vehiculos'
import Historial from './components/Historial'
import Clientes from './components/Clientes'
import Servicios from './components/Servicios'

function App() {
  const [seccionActiva, setSeccionActiva] = useState('dashboard')

  return (
    <div className="dashboard-layout">
      
      <Toaster richColors position="bottom-right" />

      {/* --- BARRA LATERAL (SIDEBAR) --- */}
      <aside className="sidebar">
        <div className="logo">
          {/* Le podemos poner el ícono de llave inglesa al logo también */}
          <Wrench size={28} color="#fbbf24" /> 
          Taller El Pato
        </div>
        <nav>
          
          <div 
            className={`menu-item ${seccionActiva === 'dashboard' ? 'active' : ''}`}
            onClick={() => setSeccionActiva('dashboard')}
          >
            {/* Reemplazamos el emoji por el componente del ícono. 
                size={20} es un tamaño ideal para menús. */}
            <LayoutDashboard size={20} />
            Inicio
          </div>

          <div 
            className={`menu-item ${seccionActiva === 'cotizador' ? 'active' : ''}`}
            onClick={() => setSeccionActiva('cotizador')}
          >
            <FileText size={20} />
            Cotizador
          </div>
          
          <div 
            className={`menu-item ${seccionActiva === 'vehiculos' ? 'active' : ''}`}
            onClick={() => setSeccionActiva('vehiculos')}
          >
            <Car size={20} />
            Vehículos
          </div>

          <div 
            className={`menu-item ${seccionActiva === 'historial' ? 'active' : ''}`}
            onClick={() => setSeccionActiva('historial')}
          >
            <History size={20} />
            Historial
          </div>

          <div 
            className={`menu-item ${seccionActiva === 'clientes' ? 'active' : ''}`}
            onClick={() => setSeccionActiva('clientes')}
          >
            <Users size={20} />
            Clientes
          </div>

          <div 
            className={`menu-item ${seccionActiva === 'servicios' ? 'active' : ''}`}
            onClick={() => setSeccionActiva('servicios')}
          >
            <Wrench size={20} />
            Servicios
          </div>
        </nav>
      </aside>

      {/* --- ÁREA DE CONTENIDO PRINCIPAL --- */}
      <main className="main-content">
        
        {/* Cabecera / Usuario Logueado */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', padding: '8px 15px', borderRadius: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', fontWeight: 'bold', color: '#334155'}}>
              <UserCircle size={20} color="#3b82f6" />
              Nestor
            </div>
        </div>

        {seccionActiva === 'dashboard' && <Dashboard setSeccionActiva={setSeccionActiva} />}
        {seccionActiva === 'cotizador' && <Cotizador />}
        {seccionActiva === 'vehiculos' && <Vehiculos />}
        {seccionActiva === 'historial' && <Historial />}
        {seccionActiva === 'clientes' && <Clientes />}
        {seccionActiva === 'servicios' && <Servicios />}
        
      </main>
    </div>
  )
}

export default App