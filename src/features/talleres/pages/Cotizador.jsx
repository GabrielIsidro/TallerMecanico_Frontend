import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { 
  Calculator, 
  Car, 
  Wrench, 
  ShoppingCart, 
  Trash2, 
  ArrowRight,
  CheckCircle,
  Plus,
  ClipboardList,
  MessageSquare,
  Edit2,
  AlertTriangle
} from 'lucide-react'
import { getServicios, getVehiculos, createOrden } from '../api/talleresApi';
import { handleApiError } from '../../../utils/errorHandler';
import { useAuth } from '../../../context/AuthContext';


function Cotizador() {
  const { userProfile, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const esSoloLectura = !isSuperAdmin() && (userProfile?.estadoSuscripcion === 'VENCIDA' || userProfile?.estadoSuscripcion === 'SUSPENDIDA');

  const [servicios, setServicios] = useState([]) 
  const [vehiculoId, setVehiculoId] = useState('') 
  const [carrito, setCarrito] = useState([]) 
  const [presupuesto, setPresupuesto] = useState(null) 
  const [gruposExpandidos, setGruposExpandidos] = useState({})
  const [vehiculos, setVehiculos] = useState([])

    // Simplificado para el ingreso rápido

  useEffect(() => {
    Promise.all([
      getServicios(),
      getVehiculos()
    ])
    .then(([resServicios, resVehiculos]) => {
      setServicios(resServicios.data);
      setVehiculos(resVehiculos.data); 
    })
    .catch(err => {
      console.error("Error cargando datos:", err);
      handleApiError(err, "Error cargando servicios y vehículos");
    });
  }, [])

  const agregarAlCarrito = (servicio) => {
    if (!vehiculoId) {
        toast.warning("Por favor, selecciona el vehículo primero.");
        return;
    }
    
    const precioAplicado = Number(servicio.precioSugerido) || 0;
    
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

  const actualizarPrecioCarrito = (index, nuevoPrecio) => {
    const nuevoCarrito = [...carrito];
    nuevoCarrito[index].precioEstimado = Number(nuevoPrecio);
    setCarrito(nuevoCarrito);
  }

    const [descripcionIngreso, setDescripcionIngreso] = useState('');
    const [kilometraje, setKilometraje] = useState('');

  const generarPresupuesto = () => {
    if (esSoloLectura) {
      toast.warning("Tu suscripción ha vencido (Modo Solo Lectura). Regularizá tu plan para crear nuevos ingresos.", { duration: 4000 });
      return;
    }
    if (!vehiculoId) {
      toast.warning("Por favor, selecciona el vehículo primero.");
      return;
    }

    
    let descripcionAutomatica = carrito.map(item => item.nombre).join(" + ");
    if (!descripcionAutomatica) descripcionAutomatica = "Varios";

    const orden = {
      vehiculoId: parseInt(vehiculoId),
      descripcion: descripcionIngreso || descripcionAutomatica,
      kilometraje: kilometraje ? parseInt(kilometraje) : null,
      observacionesMecanico: '',
      observacionesCliente: '',
      checklist: '{}',
      items: carrito.map(item => ({ 
          tipoServicio: { id: item.tipoServicio.id }, 
          cantidad: 1, 
          precioUnitario: parseFloat(item.precioEstimado) 
      }))
    }

    const toastId = toast.loading("Generando cotización / orden...");

    createOrden(orden)
    .then(res => {
        setPresupuesto(res.data);
        setCarrito([]); 
        setDescripcionIngreso('');
        setKilometraje('');
        toast.success("¡Ingreso creado exitosamente!", { id: toastId });
    }) 
    .catch(err => {
        console.error("Error al crear orden:", err);
        handleApiError(err, "Error al crear la orden de trabajo", toastId);
    })
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
              Nuevo Ingreso
            </h1>
          </div>
        </header>

        {/* BANNER SOLO LECTURA */}
        {esSoloLectura && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fca5a5',
            color: '#b91c1c',
            padding: '12px 18px',
            borderRadius: '10px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertTriangle size={20} />
              <span><strong>Modo Solo Lectura:</strong> Tu suscripción ha vencido. No se pueden generar nuevos ingresos de vehículos.</span>
            </div>
            <button 
              onClick={() => navigate('/suscripcion')}
              style={{
                background: '#ef4444',
                color: 'white',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Regularizar Plan
            </button>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.3fr', gap: '30px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* SELECCIÓN DE VEHÍCULO */}
            <div className="tb-card">
              <h3 className="tb-title" style={{ color: '#1e40af', marginBottom: '15px', fontSize: '1.2em' }}>
                <Car size={20}/> 1. Selección de Vehículo
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
                    [{v.patente}] - {v.marca} {v.modelo} {v.cliente ? `(${v.cliente.nombreCliente})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* DATOS DE INGRESO */}
            <div className="tb-card">
              <h3 className="tb-title" style={{ color: '#1e40af', marginBottom: '15px', fontSize: '1.2em' }}>
                <MessageSquare size={20}/> 2. Datos del Ingreso
              </h3>
              <div style={{ padding: '0 20px 20px 20px' }}>
                  <label className="tb-label">Motivo de Ingreso / Falla:</label>
                  <textarea 
                      value={descripcionIngreso}
                      onChange={(e) => setDescripcionIngreso(e.target.value)}
                      className="tb-input" 
                      style={{ minHeight: '100px', border: '2px solid #cbd5e1', resize: 'vertical', marginBottom: '15px' }}
                      placeholder="Ej: Pierde aceite, hace ruido al frenar, service de 10.000km..."
                  />
                  <label className="tb-label">Kilometraje Actual (KM):</label>
                  <input 
                      type="number"
                      value={kilometraje}
                      onChange={(e) => setKilometraje(e.target.value)}
                      className="tb-input"
                      placeholder="Ej: 150000"
                      style={{ border: '1px solid #cbd5e1', width: '50%' }}
                  />
              </div>
            </div>

            {/* CATALOGO */}
            <div className="tb-card">
              <h3 className="tb-title" style={{ color: '#1e40af', marginBottom: '15px', fontSize: '1.2em' }}>
                <Wrench size={20}/> 3. Servicios guardados (Opcional)
              </h3>
              
              <div style={{ maxHeight: '350px', overflowY: 'auto', paddingRight: '10px' }}>
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
                                            <div style={{ fontSize: '0.85em', color: '#64748b' }}>
                                                Sug: ${Number(s.precioSugerido || 0).toLocaleString()}
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
            <div className="tb-card" style={{ borderTop: '5px solid #3b82f6', position: 'sticky', top: '20px' }}>
              <h3 className="tb-title" style={{ color: '#1e40af', fontSize: '1.2em' }}>
                <ShoppingCart size={20}/> 4. Servicios guardados
              </h3>
              
              {carrito.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>Agrega servicios a la orden</div>
              ) : (
                <>
                    <ul style={{ listStyle: 'none', padding: 0, maxHeight: '350px', overflowY: 'auto' }}>
                    {carrito.map((item, index) => (
                        <li key={index} style={{ padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                <div style={{ fontSize: '0.95em', color:'#334155', fontWeight: 'bold' }}>{item.nombre}</div>
                                <button className="tb-btn-icon tb-btn-delete" style={{ padding: '4px', background: 'transparent', color: '#ef4444' }} onClick={() => quitarDelCarrito(index)}>
                                    <Trash2 size={16}/>
                                </button>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <span style={{ fontSize: '0.9em', color: '#64748b' }}>Precio: $</span>
                                <input 
                                    type="number"
                                    value={item.precioEstimado}
                                    onChange={(e) => actualizarPrecioCarrito(index, e.target.value)}
                                    style={{ padding: '4px 8px', border: '1px solid #94a3b8', borderRadius: '4px', width: '100px', fontWeight: 'bold', color: '#166534' }}
                                />
                                <Edit2 size={14} color="#94a3b8"/>
                            </div>
                        </li>
                    ))}
                    </ul>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '2px dashed #cbd5e1', paddingTop: '15px', marginTop: '10px' }}>
                        <span style={{ fontWeight: 'bold', color: '#475569' }}>Total:</span>
                        <span style={{ fontSize: '1.4em', fontWeight: 'bold', color: '#166534' }}>${totalEstimadoCarrito.toLocaleString()}</span>
                    </div>
                </>
              )}

              <div style={{marginTop: '20px'}}>
                  <button 
                    className="tb-btn-save" 
                    onClick={generarPresupuesto} 
                    disabled={esSoloLectura}
                    style={{
                      width: '100%', 
                      background: esSoloLectura ? '#94a3b8' : '#10b981', 
                      padding: '12px',
                      cursor: esSoloLectura ? 'not-allowed' : 'pointer'
                    }}
                  >
                    REGISTRAR INGRESO <ArrowRight size={18}/>
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
                  Vehículo: <strong>{presupuesto.vehiculo.modelo}</strong>
                </div>
              </div>
            )}
          </div>

        </div>
    </div>
  )
}

export default Cotizador
