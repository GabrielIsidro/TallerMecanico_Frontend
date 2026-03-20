import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts'
// ---> NUEVO: Importamos todos los íconos necesarios para el Dashboard
import { 
  FileEdit, 
  Car, 
  UserPlus, 
  Wrench, 
  DollarSign, 
  Users, 
  AlertTriangle, 
  TrendingUp, 
  CheckCircle 
} from 'lucide-react'

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
    } catch (error) {
      console.error("Error cargando el Dashboard:", error);
      setCargando(false);
    }
  };

  const tarjetaStyle = {
    background: 'white', padding: '20px', borderRadius: '12px', 
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0',
    display: 'flex', flexDirection: 'column', justifyContent: 'center'
  };

  const btnRapidoStyle = {
    background: 'white', border: '1px solid #cbd5e1', padding: '10px 15px', 
    borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', color: '#334155',
    display: 'flex', alignItems: 'center', gap: '8px', transition: '0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
  };

  // Estilo reutilizable para los títulos de las tarjetas KPI (alinea ícono y texto)
  const tituloKpiStyle = {
    display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', 
    fontWeight: 'bold', fontSize: '0.9em', textTransform: 'uppercase'
  };

  if (cargando) return <div style={{textAlign: 'center', marginTop: '50px', color: '#64748b'}}>Cargando resumen... ⏳</div>;

  return (
    <div style={{ color: '#333' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' }}>
        <header>
          <h1 style={{ margin: 0, color: '#1e293b', fontSize: '2.2em' }}>¡Hola, Nestor!</h1>
          <p style={{ color: '#64748b', margin: '5px 0 0 0', fontSize: '1.1em' }}>Acá tenés el resumen operativo de hoy.</p>
        </header>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button style={btnRapidoStyle} onClick={() => setSeccionActiva('cotizador')} onMouseOver={e => e.currentTarget.style.borderColor = '#3b82f6'} onMouseOut={e => e.currentTarget.style.borderColor = '#cbd5e1'}>
            <FileEdit size={18} color="#3b82f6" /> Nuevo Presupuesto
          </button>
          <button style={btnRapidoStyle} onClick={() => setSeccionActiva('vehiculos')} onMouseOver={e => e.currentTarget.style.borderColor = '#10b981'} onMouseOut={e => e.currentTarget.style.borderColor = '#cbd5e1'}>
            <Car size={18} color="#10b981" /> Ingresar Vehículo
          </button>
          <button style={btnRapidoStyle} onClick={() => setSeccionActiva('clientes')} onMouseOver={e => e.currentTarget.style.borderColor = '#8b5cf6'} onMouseOut={e => e.currentTarget.style.borderColor = '#cbd5e1'}>
            <UserPlus size={18} color="#8b5cf6" /> Alta Cliente
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{...tarjetaStyle, borderBottom: '4px solid #f59e0b'}}>
          <div style={tituloKpiStyle}>
            <Wrench size={18} /> Autos en Taller
          </div>
          <div style={{ fontSize: '2.5em', fontWeight: 'bold', color: '#1e293b', marginTop: '10px' }}>{estadisticas.trabajosPendientes}</div>
        </div>
        <div style={{...tarjetaStyle, borderBottom: '4px solid #10b981'}}>
          <div style={tituloKpiStyle}>
            <DollarSign size={18} /> Facturado (Listos)
          </div>
          <div style={{ fontSize: '2.2em', fontWeight: 'bold', color: '#166534', marginTop: '10px' }}>${estadisticas.totalFacturado.toLocaleString()}</div>
        </div>
        <div style={{...tarjetaStyle, borderBottom: '4px solid #3b82f6'}}>
          <div style={tituloKpiStyle}>
            <Users size={18} /> Clientes Totales
          </div>
          <div style={{ fontSize: '2.5em', fontWeight: 'bold', color: '#1e293b', marginTop: '10px' }}>{estadisticas.clientesRegistrados}</div>
        </div>
        <div style={{...tarjetaStyle, borderBottom: '4px solid #8b5cf6'}}>
          <div style={tituloKpiStyle}>
            <Car size={18} /> Flota Registrada
          </div>
          <div style={{ fontSize: '2.5em', fontWeight: 'bold', color: '#1e293b', marginTop: '10px' }}>{estadisticas.vehiculosFlota}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card" style={{ border: '1px solid #fecaca', background: '#fff5f5', margin: 0, flex: 1 }}>
            <h3 style={{ marginTop: 0, color: '#991b1b', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertTriangle size={22} color="#991b1b" /> Oportunidades de Service ({estadisticas.alertasService.length})
            </h3>
            <p style={{ color: '#7f1d1d', margin: '0 0 15px 0', fontSize: '0.85em' }}>Vehículos cerca del límite o vencidos.</p>

            {estadisticas.alertasService.length === 0 ? (
               <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '20px', background: 'white', borderRadius: '8px', color: '#166534', fontWeight: 'bold' }}>
                   ¡Todos los vehículos están al día! <CheckCircle size={20} />
               </div>
            ) : (
              <div style={{ background: 'white', borderRadius: '8px', overflowY: 'auto', maxHeight: '250px', border: '1px solid #fca5a5' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9em' }}>
                  <thead style={{ position: 'sticky', top: 0, background: '#fee2e2' }}>
                    <tr style={{ color: '#991b1b' }}>
                      <th style={{ padding: '10px', textAlign: 'left' }}>Cliente</th>
                      <th style={{ padding: '10px', textAlign: 'left' }}>Vehículo</th>
                      <th style={{ padding: '10px', textAlign: 'left' }}>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {estadisticas.alertasService.map(v => {
                      const dif = v.proximoServiceKm - v.kilometraje;
                      const textoAlerta = dif <= 0 ? "¡VENCIDO!" : `Faltan ${dif}km`;
                      return (
                        <tr key={v.id} style={{ borderBottom: '1px solid #fecaca' }}>
                          <td style={{ padding: '10px' }}><strong>{v.cliente ? `${v.cliente.nombre}` : 'Sin dueño'}</strong></td>
                          <td style={{ padding: '10px' }}>{v.modelo} ({v.patente})</td>
                          <td style={{ padding: '10px', fontWeight: 'bold', color: dif <= 0 ? '#ef4444' : '#f59e0b' }}>{textoAlerta}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card" style={{ margin: 0, flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ marginTop: 0, color: '#1e40af', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={22} color="#1e40af" /> Rendimiento Semanal
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.85em', margin: '0 0 20px 0' }}>Ingresos reales de los últimos 5 días.</p>
            
            <div style={{ flex: 1, minHeight: '200px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={datosGrafico}>
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 13, fontWeight: 'bold', textTransform: 'capitalize' }} 
                  />
                  <Tooltip 
                    formatter={(value) => [`$${value.toLocaleString()}`, 'Facturado']}
                    cursor={{fill: '#f1f5f9'}}
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 10px rgba(0,0,0,0.1)'}}
                  />
                  <Bar dataKey="total" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default Dashboard