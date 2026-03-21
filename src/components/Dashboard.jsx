import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner'; // <--- NUEVO: Importamos toast

// ---> NUEVO: Importamos los íconos profesionales (Vectoriales)
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

// Recibimos setSeccionActiva por props para la navegación
function Dashboard({ setSeccionActiva }) {
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
    // ---> NUEVO: Mostrar toast de "cargando" profesional
    const toastId = toast.loading("Sincronizando panel operativo...", {
        icon: <Loader2 className="animate-spin" size={20} />
    });

    try {
      const [resOrdenes, resVehiculos, resClientes] = await Promise.all([
        fetch('http://localhost:8080/api/ordenes'),
        fetch('http://localhost:8080/api/vehiculos'),
        fetch('http://localhost:8080/api/clientes')
      ]);

      const ordenes = await resOrdenes.json();
      const vehiculos = await resVehiculos.json();
      const clientes = await resClientes.json();

      const pendientes = ordenes.filter(o => o.estado !== 'FINALIZADO' && o.estado !== 'ENTREGADO').length;
      const facturado = ordenes
        .filter(o => o.estado === 'FINALIZADO' || o.estado === 'ENTREGADO')
        .reduce((sum, o) => sum + (o.costoTotal || 0), 0);

      const alertas = vehiculos.filter(v => {
        if (!v.kilometraje || !v.proximoServiceKm) return false;
        const dif = v.proximoServiceKm - v.kilometraje;
        return dif <= 1000;
      });

      // Lógica de datos para el gráfico (últimos 5 días)
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

      setCargando(false);
      
      // ---> NUEVO: Actualizar el toast a "completado"
      toast.success("Panel actualizado", { id: toastId, duration: 2000 });

    } catch (error) {
      console.error("Error cargando el Dashboard:", error);
      setCargando(false);
      
      // ---> NUEVO: Mostrar toast de error si falla la red
      toast.error("Fallo la conexión con el servidor", { id: toastId });
    }
  };

  // --- ESTILOS REUTILIZABLES (CSS in JS) ---
  const tarjetaStyle = {
    background: 'white', padding: '20px', borderRadius: '12px', 
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
    border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'center'
  };

  // Nuevo estilo para tarjetas de acción (Quick Actions)
  const actionCardStyle = {
    background: '#ffffff', padding: '20px', borderRadius: '12px', cursor: 'pointer',
    border: '1px solid #cbd5e1', boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
    display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '10px',
    transition: '0.2s transform, 0.2s box-shadow', color: '#1e293b'
  };

  // Estilo para el header de las tarjetas KPI
  const kpiHeaderStyle = {
    color: '#64748b', fontWeight: 'bold', fontSize: '0.9em', textTransform: 'uppercase', 
    letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '8px'
  };

  // Estilo para el valor principal de las tarjetas KPI
  const kpiValueStyle = {
    fontSize: '2.5em', fontWeight: 'bold', color: '#1e293b', marginTop: '10px', lineHeight: '1'
  };

  if (cargando) return <div style={{textAlign: 'center', marginTop: '50px', color: '#64748b'}}>Cargando resumen operativos... ⏳</div>;

  return (
    <div style={{ color: '#333' }}>
      
      {/* CABECERA */}
      <div style={{ marginBottom: '30px' }}>
        <header style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          {/* ---> NUEVO: Ícono profesional de saludo */}
          <Hand size={40} color="#fbbf24" className="rotate-[-20deg]" />
          <div>
            <h1 style={{ margin: 0, color: '#1e293b', fontSize: '2.5em' }}>¡Hola, Nestor!</h1>
            <p style={{ color: '#64748b', margin: '5px 0 0 0', fontSize: '1.2em' }}>Este es el resumen operativo de hoy en Taller El Pato.</p>
          </div>
        </header>
      </div>

      {/* --- NUEVO: GRILLA DE ACCIONES RÁPIDAS (RESEÑADAS) --- */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={actionCardStyle} onClick={() => setSeccionActiva('cotizador')} className="action-card-hover">
          <div style={{ display:'flex', alignItems:'center', gap:'10px'}}>
              <FileEdit size={24} color="#3b82f6" style={{ background: '#eff6ff', padding: '10px', borderRadius: '10px'}} />
              <strong style={{fontSize:'1.1em'}}>Nueva Cotización</strong>
          </div>
          <p style={{margin:0, fontSize:'0.9em', color: '#64748b'}}>Arma un presupuesto oficial y calcula precios dinámicos.</p>
        </div>
        
        <div style={actionCardStyle} onClick={() => setSeccionActiva('vehiculos')} className="action-card-hover">
          <div style={{ display:'flex', alignItems:'center', gap:'10px'}}>
              <Car size={24} color="#10b981" style={{ background: '#ecfdf5', padding: '10px', borderRadius: '10px'}} />
              <strong style={{fontSize:'1.1em'}}>Registrar Vehículo</strong>
          </div>
          <p style={{margin:0, fontSize:'0.9em', color: '#64748b'}}>Da de alta un auto nuevo y asocia los datos técnicos.</p>
        </div>
        
        <div style={actionCardStyle} onClick={() => setSeccionActiva('clientes')} className="action-card-hover">
          <div style={{ display:'flex', alignItems:'center', gap:'10px'}}>
              <UserPlus size={24} color="#8b5cf6" style={{ background: '#f5f3ff', padding: '10px', borderRadius: '10px'}} />
              <strong style={{fontSize:'1.1em'}}>Dar de alta Cliente</strong>
          </div>
          <p style={{margin:0, fontSize:'0.9em', color: '#64748b'}}>Agrega los datos de contacto del dueño del auto.</p>
        </div>
      </div>

      {/* GRILLA DE ESTADÍSTICAS (KPIs RESEÑADOS) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{...tarjetaStyle, borderLeft: '5px solid #f59e0b'}}>
          <div style={kpiHeaderStyle}><Wrench size={18} /> Autos en Taller</div>
          <div style={kpiValueStyle}>{estadisticas.trabajosPendientes}</div>
          <div style={{color: '#f59e0b', fontSize:'0.85em', fontWeight:'bold', marginTop:'5px'}}>Trabajos en curso</div>
        </div>
        
        <div style={{...tarjetaStyle, borderLeft: '5px solid #10b981'}}>
          <div style={kpiHeaderStyle}><DollarSign size={18} /> Facturado (Listos)</div>
          <div style={kpiValueStyle}>${estadisticas.totalFacturado.toLocaleString()}</div>
          <div style={{color: '#10b981', fontSize:'0.85em', fontWeight:'bold', marginTop:'5px'}}>Órdenes finalizadas</div>
        </div>
        
        <div style={{...tarjetaStyle, borderLeft: '5px solid #3b82f6'}}>
          <div style={kpiHeaderStyle}><Users size={18} /> Clientes Totales</div>
          <div style={kpiValueStyle}>{estadisticas.clientesRegistrados}</div>
          <div style={{color: '#3b82f6', fontSize:'0.85em', fontWeight:'bold', marginTop:'5px'}}>Registrados en base</div>
        </div>
        
        <div style={{...tarjetaStyle, borderLeft: '5px solid #8b5cf6'}}>
          <div style={kpiHeaderStyle}><Car size={18} /> Flota Registrada</div>
          <div style={kpiValueStyle}>{estadisticas.vehiculosFlota}</div>
          <div style={{color: '#8b5cf6', fontSize:'0.85em', fontWeight:'bold', marginTop:'5px'}}>Patentes únicas</div>
        </div>
      </div>

      {/* ZONA INFERIOR: Dos columnas */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        
        {/* OPORTUNIDADES DE SERVICE (RESEÑADO) */}
        <div className="card" style={{ border: '1px solid #fca5a5', background: '#fff5f5', margin: 0, boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <h3 style={{ marginTop: 0, color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '10px' }}>
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
                      <th style={{ padding: '12px 10px', textAlign: 'left' }}>Vehículo (Patente)</th>
                      <th style={{ padding: '12px 10px', textAlign: 'left' }}>Estado de KM</th>
                    </tr>
                  </thead>
                  <tbody>
                    {estadisticas.alertasService.map(v => {
                      const dif = v.proximoServiceKm - v.kilometraje;
                      const textoAlerta = dif <= 0 ? "🚨 ¡VENCIDO!" : `⚠️ Faltan ${dif}km`;
                      return (
                        <tr key={v.id} style={{ borderBottom: '1px solid #fecaca' }}>
                          <td style={{ padding: '10px' }}><strong>{v.cliente ? `${v.cliente.nombre}` : 'Sin dueño'}</strong></td>
                          <td style={{ padding: '10px' }}>{v.modelo} ({v.patente})</td>
                          <td style={{ padding: '10px', fontWeight: 'bold', color: dif <= 0 ? '#dc2626' : '#b45309' }}>{textoAlerta}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* GRÁFICO (placeholder) - Asegurando que encaje con el diseño premium */}
          <div className="card" style={{ margin: 0, display: 'flex', flexDirection: 'column', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <h3 style={{ marginTop: 0, color: '#1e40af', display: 'flex', alignItems: 'center', gap: '10px' }}>
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

      </div>
    </div>
  )
}

export default Dashboard