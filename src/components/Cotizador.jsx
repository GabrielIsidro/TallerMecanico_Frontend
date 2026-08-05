import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { 
  Calculator, 
  Car, 
  Wrench, 
  ShoppingCart, 
  Trash2, 
  ArrowRight,
  CheckCircle,
  Plus
} from 'lucide-react'
import api from '../api/axiosConfig'
import '../styles/Tablas.css'

function Cotizador() {
  const [servicios, setServicios] = useState([]) 
  const [vehiculoId, setVehiculoId] = useState('') 
  const [carrito, setCarrito] = useState([]) 
  const [presupuesto, setPresupuesto] = useState(null) 
  const [gruposExpandidos, setGruposExpandidos] = useState({})
  const [vehiculos, setVehiculos] = useState([])

  useEffect(() => {
    Promise.all([
      api.get('/servicios'),
      api.get('/vehiculos')
    ])
    .then(([resServicios, resVehiculos]) => {
      setServicios(resServicios.data);
      setVehiculos(resVehiculos.data); 
    })
    .catch(err => console.error("Error cargando datos:", err));
  }, [])

  const getPrecioCalculado = (servicio) => {
    if (!vehiculoId) return servicio.precioA || 0; 
    const autoSeleccionado = vehiculos.find(v => v.id.toString() === vehiculoId.toString());
    if (!autoSeleccionado) return servicio.precioA || 0;

    if (autoSeleccionado.categoria === 'CATEGORIA_B') return servicio.precioB || 0;
    if (autoSeleccionado.categoria === 'CATEGORIA_C') return servicio.precioC || 0;
    return servicio.precioA || 0;
  }

  const agregarAlCarrito = (servicio) => {
    if (!vehiculoId) {
        toast.warning("Por favor, selecciona el vehículo primero para calcular el precio exacto.");
        return;
    }
    
    // Forzamos a que sea un número seguro
    const precioAplicado = Number(getPrecioCalculado(servicio)) || 0;
    
    const item = { 
        tipoServicio: { id: servicio.id }, 
        cantidad: 1, 
        nombre: servicio.descripcion, 
        precioEstimado: precioAplicado 
    }
    setCarrito([...carrito, item])
  }

  const quitarDelCarrito = (indexToDelete) => {
    const nuevoCarrito = carrito.filter((_, index) => index !== indexToDelete);
    setCarrito(nuevoCarrito);
  }

  const generarPresupuesto = () => {
    if (!vehiculoId) {
      toast.warning("Por favor, selecciona el vehículo primero.");
      return;
    }
    if (carrito.length === 0) {
      toast.warning("Agrega al menos un servicio al carrito.");
      return;
    }
    
    let descripcionAutomatica = carrito.map(item => item.nombre).join(" + ");
    if (!descripcionAutomatica) descripcionAutomatica = "Varios";

    const orden = {
      vehiculoId: parseInt(vehiculoId),
      descripcion: descripcionAutomatica,
      items: carrito.map(item => ({ tipoServicio: { id: item.tipoServicio.id }, cantidad: 1 }))
    }

    const toastId = toast.loading("Generando cotización...");

    api.post('/ordenes', orden)
    .then(res => {
        setPresupuesto(res.data);
        setCarrito([]); 
        toast.success("¡Cotización generada exitosamente!", { id: toastId });
    }) 
    .catch(err => toast.error("Error al cotizar. Revisa la conexión con el servidor.", { id: toastId }))
  }

  const serviciosAgrupados = servicios.reduce((acumulador, servicio) => {
    if (!servicio.descripcion || servicio.descripcion.trim() === "") return acumulador;
    const nombreGrupo = servicio.grupo ? servicio.grupo.toUpperCase() : "OTROS";
    if (!acumulador[nombreGrupo]) acumulador[nombreGrupo] = []; 
    acumulador[nombreGrupo].push(servicio); 
    return acumulador;
  }, {}); 

  const toggleGrupo = (nombreGrupo) => {
    setGruposExpandidos(prev => ({ ...prev, [nombreGrupo]: !prev[nombreGrupo] }));
  }

  const totalEstimadoCarrito = carrito.reduce((sum, item) => sum + item.precioEstimado, 0);

  return (
    <div className="tb-container">
        <header className="tb-header">
          <div>
            <h1 className="tb-title" style={{ fontSize: '1.8em' }}>
              <div style={{ background: '#eff6ff', padding: '10px', borderRadius: '10px', display: 'flex' }}>
                <Calculator size={26} color="#3b82f6" />
              </div>
              Nuevo Presupuesto
            </h1>
            <p className="tb-subtitle">Selecciona los servicios para armar la cotización oficial.</p>
          </div>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
          
          <div>
            <div className="tb-card">
              <h3 className="tb-title" style={{ color: '#1e40af', marginBottom: '15px', fontSize: '1.2em' }}>
                <Car size={20}/> Selección de Vehículo
              </h3>
              <select 
                value={vehiculoId}
                onChange={(e) => {
                    setVehiculoId(e.target.value);
                    setCarrito([]); 
                    setPresupuesto(null);
                }}
                className="tb-select"
                style={{ cursor: 'pointer', border: '2px solid #3b82f6' }} 
              >
                <option value="">-- Buscar y seleccionar vehículo --</option>
                {vehiculos.map(v => (
                  <option key={v.id} value={v.id}>
                    [{v.patente}] - {v.marca} {v.modelo} {v.cliente ? `(${v.cliente.nombreCliente})` : ''} - {v.categoria}
                  </option>
                ))}
              </select>
            </div>

            <div className="tb-card" style={{ marginTop: '20px' }}>
              <h3 className="tb-title" style={{ color: '#1e40af', marginBottom: '15px', fontSize: '1.2em' }}>
                <Wrench size={20}/> Catálogo de Servicios
              </h3>
              
              <div style={{ maxHeight: '450px', overflowY: 'auto', paddingRight: '10px' }}>
                {Object.keys(serviciosAgrupados).map((nombreGrupo) => (
                    <div key={nombreGrupo} style={{ marginBottom: '10px' }}>
                        <div 
                            onClick={() => toggleGrupo(nombreGrupo)}
                            style={{ backgroundColor: '#f8fafc', padding: '12px 15px', borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 'bold', color: '#1e40af', border: '1px solid #e2e8f0', transition: '0.2s' }}
                        >
                            <span>{nombreGrupo} ({serviciosAgrupados[nombreGrupo].length})</span>
                            <span>{gruposExpandidos[nombreGrupo] ? '🔽' : '▶️'}</span>
                        </div>

                        {gruposExpandidos[nombreGrupo] && (
                            <div style={{ padding: '10px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderTop: 'none', borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px' }}>
                                <table style={{width: '100%'}}>
                                  <tbody>
                                    {serviciosAgrupados[nombreGrupo].map((s) => (
                                      <tr key={s.id} style={{borderBottom: '1px solid #f1f5f9'}}>
                                        <td style={{padding: '10px 5px', color:'#334155'}}>
                                            <div style={{ fontWeight: '500' }}>{s.descripcion}</div>
                                            <div style={{ fontSize: '0.85em', color: '#166534', fontWeight: 'bold' }}>
                                                ${getPrecioCalculado(s).toLocaleString()}
                                            </div>
                                        </td>
                                        <td style={{width: '100px', textAlign: 'right', padding: '10px 5px'}}>
                                          <button className="tb-btn-save" onClick={() => agregarAlCarrito(s)} style={{padding: '6px 12px', fontSize: '0.9em', display: 'flex', alignItems: 'center', gap: '5px', marginLeft: 'auto', background: '#3b82f6'}}>
                                              <Plus size={14}/> Agregar
                                          </button>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="tb-card" style={{ borderTop: '5px solid #3b82f6' }}>
              <h3 className="tb-title" style={{ color: '#1e40af', fontSize: '1.2em' }}>
                <ShoppingCart size={20}/> Resumen
              </h3>
              
              {carrito.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>El carrito está vacío</div>
              ) : (
                <>
                    <ul style={{ listStyle: 'none', padding: 0, maxHeight: '250px', overflowY: 'auto' }}>
                    {carrito.map((item, index) => (
                        <li key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                            <div>
                                <div style={{ fontSize: '0.95em', color:'#334155' }}>{item.nombre}</div>
                                <div style={{ fontSize: '0.85em', color:'#64748b', fontWeight: 'bold' }}>${item.precioEstimado.toLocaleString()}</div>
                            </div>
                            <button className="tb-btn-icon tb-btn-delete" onClick={() => quitarDelCarrito(index)}>
                                <Trash2 size={16}/>
                            </button>
                        </li>
                    ))}
                    </ul>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '2px dashed #cbd5e1', paddingTop: '15px', marginTop: '10px' }}>
                        <span style={{ fontWeight: 'bold', color: '#475569' }}>Total Est.:</span>
                        <span style={{ fontSize: '1.2em', fontWeight: 'bold', color: '#166534' }}>${totalEstimadoCarrito.toLocaleString()}</span>
                    </div>
                </>
              )}

              <div style={{marginTop: '20px'}}>
                  <button className="tb-btn-save" onClick={generarPresupuesto} style={{width: '100%', background: '#3b82f6'}}>
                    COTIZAR AHORA <ArrowRight size={18}/>
                  </button>
              </div>
            </div>
            
            {presupuesto && (
              <div className="tb-card" style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', textAlign:'center', marginTop: '20px' }}>
                <CheckCircle size={40} color="#166534" style={{ margin: '0 auto 10px auto' }} />
                <h2 style={{ color: '#166534', margin: '10px 0' }}>¡Orden Guardada!</h2>
                <h3 style={{ color: '#166534', margin: '10px 0' }}>Total Oficial: ${presupuesto.costoTotal.toLocaleString()}</h3>
                <div style={{ background:'white', padding:'10px', borderRadius:'8px', marginTop:'10px', color: '#333'}}>
                  Orden N°: <strong>#{presupuesto.id}</strong> <br/>
                  Vehículo: <strong>{presupuesto.vehiculo.modelo}</strong> <br/>
                  <small>Categoría: {presupuesto.vehiculo.categoria}</small>
                </div>
              </div>
            )}
          </div>

        </div>
    </div>
  )
}

export default Cotizador
