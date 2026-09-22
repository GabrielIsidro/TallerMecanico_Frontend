import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOrdenes, getVehiculos, getClientes } from '../api/talleresApi';
import { handleApiError } from '../../../utils/errorHandler';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';
import { useAuth } from '../../../context/AuthContext';
import './Dashboard.css';

import { 
  FileEdit, 
  Car, 
  UserPlus, 
  Wrench, 
  DollarSign, 
  Users, 
  AlertTriangle, 
  TrendingUp, 
  Loader2,
  CheckCircle,
  Hand
} from 'lucide-react';

function Dashboard() {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [estadisticas, setEstadisticas] = useState({
    trabajosPendientes: 0,
    totalFacturado: 0,
    clientesRegistrados: 0,
    vehiculosFlota: 0,
    alertasService: []
  });

  const [datosGrafico, setDatosGrafico] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    const toastId = toast.loading("Sincronizando panel operativo...", {
        icon: <Loader2 className="animate-spin" size={20} />
    });

    const token = localStorage.getItem('token');

    const authHeaders = {
        'Authorization': `Bearer ${token}`
    };

    try {
      const config = { headers: authHeaders };
      const [resOrdenes, resVehiculos, resClientes] = await Promise.all([
        getOrdenes(0, 1000),
        getVehiculos(),
        getClientes(0, 1000)
      ]);

      const ordenes = resOrdenes.data.content || resOrdenes.data || [];
      const vehiculos = resVehiculos.data;
      const clientes = resClientes.data.content || resClientes.data || [];

      const pendientes = ordenes.filter(o => o.estado !== 'FINALIZADO' && o.estado !== 'ENTREGADO').length;
      const facturado = ordenes
        .filter(o => o.estado === 'FINALIZADO' || o.estado === 'ENTREGADO')
        .reduce((sum, o) => sum + (o.costoTotal || 0), 0);

      const alertas = vehiculos.filter(v => {
        if (!v.kilometraje || !v.proximoServiceKm) return false;
        const dif = v.proximoServiceKm - v.kilometraje;
        return dif <= 1000;
      });

      const ultimos5Dias = [];
      for (let i = 4; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          ultimos5Dias.push({
              fechaStr: d.toISOString().split('T')[0],
              name: d.toLocaleDateString('es-AR', { weekday: 'short' }), 
              total: 0
          });
      }

      ordenes.forEach(o => {
          if (o.estado === 'FINALIZADO' || o.estado === 'ENTREGADO') {
              const fechaOrden = new Date(o.fechaIngreso).toISOString().split('T')[0];
              const diaEncontrado = ultimos5Dias.find(d => d.fechaStr === fechaOrden);
              if (diaEncontrado) {
                  diaEncontrado.total += (o.costoTotal || 0);
              }
          }
      });

      setDatosGrafico(ultimos5Dias); 

      setEstadisticas({
        trabajosPendientes: pendientes,
        totalFacturado: facturado,
        clientesRegistrados: clientes.length,
        vehiculosFlota: vehiculos.length,
        alertasService: alertas
      });

      toast.success("Panel actualizado", { id: toastId, duration: 2000 });
    } catch (error) {
      handleApiError(error, "Fallo al cargar el panel operativo", toastId);
    } finally {
      setCargando(false);
    }
  };

  if (cargando) return <div style={{textAlign: 'center', marginTop: '50px', color: '#64748b'}}>Cargando resumen operativos... ⏳</div>;

  return (
    <div style={{ color: '#333' }}>
      
      {/* ALERTA DE SUSCRIPCIÓN */}
      {userProfile && (userProfile.estadoSuscripcion === 'PRUEBA_GRATUITA' || userProfile.estadoSuscripcion === 'VENCIDA') && (
        <div style={{
          background: userProfile.estadoSuscripcion === 'VENCIDA' ? '#fef2f2' : '#eff6ff',
          border: `1px solid ${userProfile.estadoSuscripcion === 'VENCIDA' ? '#fca5a5' : '#bfdbfe'}`,
          padding: '15px 20px',
          borderRadius: '12px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: userProfile.estadoSuscripcion === 'VENCIDA' ? '#b91c1c' : '#1e40af' }}>
            <AlertTriangle size={24} />
            <div>
              <strong style={{ display: 'block', fontSize: '1.1em' }}>
                {userProfile.estadoSuscripcion === 'VENCIDA' ? '¡Tu suscripción ha vencido!' : 'Estás en tu período de prueba gratuita'}
              </strong>
              <span style={{ fontSize: '0.9em' }}>
                Para evitar interrupciones en el servicio, regularizá tu plan.
              </span>
            </div>
          </div>
          <button 
            onClick={() => navigate('/suscripcion')}
            style={{
              background: userProfile.estadoSuscripcion === 'VENCIDA' ? '#ef4444' : '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Ver Planes
          </button>
        </div>
      )}

      {/* CABECERA */}
      <div style={{ marginBottom: '30px' }}>
        <header style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <Hand size={40} color="#fbbf24" className="rotate-[-20deg]" />
          <div>
            <h1 style={{ margin: 0, color: '#1e293b', fontSize: '2.5em' }}>¡Hola, {userProfile?.nombre || 'Administrador'}!</h1>
            <p style={{ color: '#64748b', margin: '5px 0 0 0', fontSize: '1.2em' }}>Este es el resumen operativo de hoy.</p>
          </div>
        </header>
      </div>

      <div className="db-stats-grid">
        <div className="db-stat-card action-card-hover" onClick={() => navigate('/cotizador')} style={{cursor: 'pointer'}}>
          <div className="db-icon-container" style={{ background: '#eff6ff' }}>
              <FileEdit size={24} color="#3b82f6" />
          </div>
          <div className="db-stat-info">
              <strong className="db-stat-title" style={{color: '#1e293b', fontSize: '1.1em'}}>Nueva Cotización</strong>
              <span className="db-stat-title" style={{fontWeight: 'normal'}}>Arma un presupuesto oficial.</span>
          </div>
        </div>
        
        <div className="db-stat-card action-card-hover" onClick={() => navigate('/vehiculos')} style={{cursor: 'pointer'}}>
          <div className="db-icon-container" style={{ background: '#ecfdf5' }}>
              <Car size={24} color="#10b981" />
          </div>
          <div className="db-stat-info">
              <strong className="db-stat-title" style={{color: '#1e293b', fontSize: '1.1em'}}>Registrar Vehículo</strong>
              <span className="db-stat-title" style={{fontWeight: 'normal'}}>Da de alta un auto nuevo.</span>
          </div>
        </div>
        
        <div className="db-stat-card action-card-hover" onClick={() => navigate('/clientes')} style={{cursor: 'pointer'}}>
          <div className="db-icon-container" style={{ background: '#f5f3ff' }}>
              <UserPlus size={24} color="#8b5cf6" />
          </div>
          <div className="db-stat-info">
              <strong className="db-stat-title" style={{color: '#1e293b', fontSize: '1.1em'}}>Dar de alta Cliente</strong>
              <span className="db-stat-title" style={{fontWeight: 'normal'}}>Agrega los datos de contacto.</span>
          </div>
        </div>
      </div>

      <div className="db-stats-grid">
        <div className="card" style={{borderLeft: '5px solid #f59e0b', marginBottom: 0}}>
          <div className="db-stat-title" style={{display: 'flex', alignItems: 'center', gap: '8px'}}><Wrench size={18} /> Autos en Taller</div>
          <div className="db-stat-value">{estadisticas.trabajosPendientes}</div>
          <div style={{color: '#f59e0b', fontSize:'0.85em', fontWeight:'bold', marginTop:'5px'}}>Trabajos en curso</div>
        </div>
        
        <div className="card" style={{borderLeft: '5px solid #10b981', marginBottom: 0}}>
          <div className="db-stat-title" style={{display: 'flex', alignItems: 'center', gap: '8px'}}><DollarSign size={18} /> Facturado (Listos)</div>
          <div className="db-stat-value">${estadisticas.totalFacturado.toLocaleString()}</div>
          <div style={{color: '#10b981', fontSize:'0.85em', fontWeight:'bold', marginTop:'5px'}}>Órdenes finalizadas</div>
        </div>
        
        <div className="card" style={{borderLeft: '5px solid #3b82f6', marginBottom: 0}}>
          <div className="db-stat-title" style={{display: 'flex', alignItems: 'center', gap: '8px'}}><Users size={18} /> Clientes Totales</div>
          <div className="db-stat-value">{estadisticas.clientesRegistrados}</div>
          <div style={{color: '#3b82f6', fontSize:'0.85em', fontWeight:'bold', marginTop:'5px'}}>Registrados en base</div>
        </div>
        
        <div className="card" style={{borderLeft: '5px solid #8b5cf6', marginBottom: 0}}>
          <div className="db-stat-title" style={{display: 'flex', alignItems: 'center', gap: '8px'}}><Car size={18} /> Flota Registrada</div>
          <div className="db-stat-value">{estadisticas.vehiculosFlota}</div>
          <div style={{color: '#8b5cf6', fontSize:'0.85em', fontWeight:'bold', marginTop:'5px'}}>Patentes únicas</div>
        </div>
      </div>

      <div className="db-content-grid">
        <div className="card" style={{ margin: 0, display: 'flex', flexDirection: 'column', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <h3 className="db-card-header" style={{ color: '#1e40af' }}>
              <TrendingUp size={24} color="#2563eb" /> Rendimiento Semanal (Facturación Real)
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.9em', margin: '0 0 20px 0' }}>Ingresos generados en los últimos 5 días.</p>
            
            <div style={{ flex: 1, minHeight: '200px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={datosGrafico}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13, fontWeight: 'bold', textTransform: 'capitalize' }} />
                  <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Facturado']} cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '10px', border: 'none', boxShadow: '0 4px 10px rgba(0,0,0,0.1)'}} />
                  <Bar dataKey="total" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
        </div>
        
        <div className="card" style={{ border: '1px solid #fca5a5', background: '#fff5f5', margin: 0, boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <h3 className="db-card-header" style={{ color: '#b91c1c' }}>
              <AlertTriangle size={24} color="#dc2626" /> Alertas de Service ({estadisticas.alertasService.length})
            </h3>
            <p style={{ color: '#991b1b', margin: '0 0 15px 0', fontSize: '0.9em' }}>Vehículos que requieren atención por kilometraje.</p>

            {estadisticas.alertasService.length === 0 ? (
               <div style={{ padding: '20px', background: 'white', borderRadius: '12px', textAlign: 'center', color: '#166534', fontWeight: 'bold', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                   <CheckCircle size={20} color="#166534"/> ¡Todos los vehículos están al día!
               </div>
            ) : (
              <div style={{ background: 'white', borderRadius: '12px', overflowY: 'auto', maxHeight: '250px', border: '1px solid #fca5a5' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9em' }}>
                  <thead style={{ position: 'sticky', top: 0, background: '#fee2e2' }}>
                    <tr style={{ color: '#991b1b', fontWeight:'bold' }}>
                      <th style={{ padding: '12px 10px', textAlign: 'left' }}>Dueño</th>
                      <th style={{ padding: '12px 10px', textAlign: 'left' }}>Vehículo</th>
                      <th style={{ padding: '12px 10px', textAlign: 'left' }}>KM</th>
                    </tr>
                  </thead>
                  <tbody>
                    {estadisticas.alertasService.map(v => {
                      const dif = v.proximoServiceKm - v.kilometraje;
                      const textoAlerta = dif <= 0 ? "🚨 VENCIDO" : `⚠️ ${dif}km`;
                      return (
                        <tr key={v.id} style={{ borderBottom: '1px solid #fecaca' }}>
                          <td style={{ padding: '10px' }}><strong>{v.cliente ? `${v.cliente.nombreCliente}` : 'Sin dueño'}</strong></td>
                          <td style={{ padding: '10px' }}>{v.patente}</td>
                          <td style={{ padding: '10px', fontWeight: 'bold', color: dif <= 0 ? '#dc2626' : '#b45309' }}>{textoAlerta}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
