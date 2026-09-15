import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { 
  Wrench, 
  ShoppingCart, 
  Trash2, 
  CheckCircle,
  Plus,
  ClipboardList,
  MessageSquare,
  Edit2,
  Save,
  ArrowLeft,
  Car
} from 'lucide-react'
import { getClientes, createCliente, updateCliente, deleteCliente, getVehiculos, createVehiculo, updateVehiculo, deleteVehiculo, getServicios, createServicio, updateServicio, deleteServicio, importServicios, getOrdenes, createOrden, updateOrden, updateEstadoOrden, updatePagoOrden, getOrdenPdf, getRepuestos, createRepuesto, updateRepuesto, deleteRepuesto, getEquipo, createMiembroEquipo, deleteMiembroEquipo, getMiPerfil, updateMiPerfil } from '../api/talleresApi';


function ProcesarOrden() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [orden, setOrden] = useState(null)
  const [servicios, setServicios] = useState([]) 
  const [carrito, setCarrito] = useState([]) 
  const [gruposExpandidos, setGruposExpandidos] = useState({})
  
  // Nuevos estados
  const [observacionesCliente, setObservacionesCliente] = useState('');
  const [observacionesMecanico, setObservacionesMecanico] = useState('');
  const [kilometraje, setKilometraje] = useState('');

  const [checklist, setChecklist] = useState({
    exterior: [
        { id: 'limpiaParabrisas', label: 'Limpia Parabrisas', estado: 'B', obs: '' },
        { id: 'luces', label: 'Luces Ext.', estado: 'B', obs: '' },
        { id: 'puertas', label: 'Puertas/Cerraduras', estado: 'B', obs: '' }
    ],
    motor: [
        { id: 'aceite', label: 'Aceite', estado: 'B', obs: '' },
        { id: 'filtros', label: 'Filtros', estado: 'B', obs: '' },
        { id: 'correas', label: 'Correas', estado: 'B', obs: '' },
        { id: 'fluidos', label: 'Fluidos', estado: 'B', obs: '' },
        { id: 'bateria', label: 'Batería', estado: 'B', obs: '' }
    ],
    interna: [
        { id: 'bocina', label: 'Bocina', estado: 'B', obs: '' },
        { id: 'aireCalefaccion', label: 'Aire / Calefacción', estado: 'B', obs: '' },
        { id: 'frenoMano', label: 'Freno de Mano', estado: 'B', obs: '' },
        { id: 'lucesTablero', label: 'Luces Tablero', estado: 'B', obs: '' }
    ],
    gomasYBajo: [
        { id: 'gomas', label: 'Gomas', estado: 'B', obs: '' },
        { id: 'fuelles', label: 'Fuelles', estado: 'B', obs: '' },
        { id: 'perdidas', label: 'Pérdidas', estado: 'B', obs: '' },
        { id: 'escape', label: 'Escape', estado: 'B', obs: '' },
        { id: 'suspension', label: 'Suspensión', estado: 'B', obs: '' }
    ]
  });

  useEffect(() => {
    Promise.all([
      getOrdenes(), 
      getServicios()
    ])
    .then(([resOrdenes, resServicios]) => {
      const todasLasOrdenes = resOrdenes.data.content || [];
      const ordenEncontrada = todasLasOrdenes.find(o => o.id === parseInt(id));
      
      setServicios(resServicios.data);

      if (ordenEncontrada) {
          cargarDatosOrden(ordenEncontrada);
      } else {
          toast.error("No se encontró la orden en el historial actual.");
      }
    })
    .catch(err => console.error("Error cargando datos:", err));
  }, [id])

  const cargarDatosOrden = (ordenDb) => {
      setOrden(ordenDb);
      setObservacionesMecanico(ordenDb.observacionesMecanico || '');
      setObservacionesCliente(ordenDb.observacionesCliente || '');
      setKilometraje(ordenDb.vehiculo?.kilometraje || '');
      
      if (ordenDb.checklist && ordenDb.checklist.length > 5) {
          try {
              setChecklist(JSON.parse(ordenDb.checklist));
          } catch(e) { console.error("Error parseando checklist", e) }
      }

      if (ordenDb.items) {
          const carritoCargado = ordenDb.items.map(item => ({
              tipoServicio: { id: item.tipoServicio.id },
              cantidad: item.cantidad,
              nombre: item.tipoServicio.descripcion,
              precioEstimado: item.precioUnitario || item.subtotal || 0
          }));
          setCarrito(carritoCargado);
      }
  }

  const agregarAlCarrito = (servicio) => {
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

  const handleChecklistChange = (seccion, idx, campo, valor) => {
    setChecklist(prev => {
        const nuevo = { ...prev };
        nuevo[seccion][idx][campo] = valor;
        return nuevo;
    });
  }

  const guardarCambios = (finalizar = false) => {
    
    let descripcionAutomatica = carrito.map(item => item.nombre).join(" + ");
    if (!descripcionAutomatica) descripcionAutomatica = orden.descripcion;

    const ordenActualizada = {
      descripcion: descripcionAutomatica,
      observacionesMecanico: observacionesMecanico,
      observacionesCliente: observacionesCliente,
      checklist: JSON.stringify(checklist),
      kilometraje: kilometraje ? parseInt(kilometraje) : null,
      items: carrito.map(item => ({ 
          tipoServicio: { id: item.tipoServicio.id }, 
          cantidad: 1, 
          precioUnitario: parseFloat(item.precioEstimado) 
      }))
    }

    const toastId = toast.loading("Guardando orden...");

    updateOrden(id, ordenActualizada)
    .then(res => {
        toast.success("¡Orden actualizada exitosamente!", { id: toastId });
        if (finalizar) {
            updateEstadoOrden(id, "FINALIZADO")
            .then(() => {
                toast.success("¡Orden marcada como FINALIZADA!");
                navigate('/historial');
            });
        } else {
            setOrden(res.data);
        }
    }) 
    .catch(err => toast.error("Error al guardar. Revisa la conexión con el servidor.", { id: toastId }))
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

  const renderChecklistSection = (seccionName, title) => {
      return (
          <div style={{ marginBottom: '15px' }}>
              <h4 style={{ color: '#475569', margin: '5px 0', borderBottom: '1px solid #e2e8f0', paddingBottom: '3px' }}>{title}</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                  {checklist[seccionName].map((item, idx) => (
                      <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9em' }}>
                          <span style={{ width: '130px', fontWeight: '500', color: '#334155' }}>{item.label}</span>
                          <div style={{ display: 'flex', gap: '2px' }}>
                              <button onClick={() => handleChecklistChange(seccionName, idx, 'estado', 'B')} style={{ padding: '2px 8px', background: item.estado === 'B' ? '#22c55e' : '#f1f5f9', color: item.estado === 'B' ? 'white' : '#64748b', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>B</button>
                              <button onClick={() => handleChecklistChange(seccionName, idx, 'estado', 'M')} style={{ padding: '2px 8px', background: item.estado === 'M' ? '#ef4444' : '#f1f5f9', color: item.estado === 'M' ? 'white' : '#64748b', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>M</button>
                              <button onClick={() => handleChecklistChange(seccionName, idx, 'estado', 'NA')} style={{ padding: '2px 8px', background: item.estado === 'NA' ? '#94a3b8' : '#f1f5f9', color: item.estado === 'NA' ? 'white' : '#64748b', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85em' }}>N/A</button>
                          </div>
                          <input 
                              type="text" 
                              placeholder="Obs..." 
                              value={item.obs}
                              onChange={(e) => handleChecklistChange(seccionName, idx, 'obs', e.target.value)}
                              style={{ flex: 1, padding: '4px 8px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.9em', color: '#334155' }}
                          />
                      </div>
                  ))}
              </div>
          </div>
      )
  }

  if (!orden) return <div className="tb-loading">Cargando orden...</div>;

  return (
    <div className="tb-container">
        <header className="tb-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button className="tb-btn-icon" onClick={() => navigate('/historial')} style={{ background: '#f1f5f9', padding: '10px' }}>
                <ArrowLeft size={24} color="#64748b" />
            </button>
            <div>
              <h1 className="tb-title" style={{ fontSize: '1.8em' }}>
                <div style={{ background: '#f59e0b', padding: '10px', borderRadius: '10px', display: 'flex' }}>
                  <Wrench size={26} color="white" />
                </div>
                Procesando Orden #{orden.id}
              </h1>
              <p className="tb-subtitle">
                  Vehículo: <strong>{orden.vehiculo?.marca} {orden.vehiculo?.modelo} ({orden.vehiculo?.patente})</strong> - Motivo: {orden.descripcion}
              </p>
            </div>
          </div>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.3fr', gap: '30px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* CATALOGO */}
            <div className="tb-card">
              <h3 className="tb-title" style={{ color: '#1e40af', marginBottom: '15px', fontSize: '1.2em' }}>
                <Wrench size={20}/> 1. Trabajos Realizados (Servicios / Repuestos)
              </h3>
              
              <div style={{ maxHeight: '250px', overflowY: 'auto', paddingRight: '10px' }}>
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

            {/* OBSERVACIONES */}
            <div className="tb-card">
              <h3 className="tb-title" style={{ color: '#1e40af', marginBottom: '15px', fontSize: '1.2em' }}>
                <MessageSquare size={20}/> 2. Complicaciones y Recomendaciones
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                      <label className="tb-label" style={{ color: '#b91c1c' }}>Para el Mecánico (Privadas)</label>
                      <textarea 
                          value={observacionesMecanico}
                          onChange={(e) => setObservacionesMecanico(e.target.value)}
                          className="tb-input" 
                          style={{ minHeight: '120px', border: '2px solid #fca5a5', background: '#fef2f2', resize: 'vertical', color: '#1e293b' }}
                          placeholder="Notas internas, complicaciones, uso de repuestos propios del taller..."
                      />
                  </div>
                  <div>
                      <label className="tb-label" style={{ color: '#1d4ed8' }}>Para el Cliente (Públicas)</label>
                      <textarea 
                          value={observacionesCliente}
                          onChange={(e) => setObservacionesCliente(e.target.value)}
                          className="tb-input" 
                          style={{ minHeight: '120px', border: '2px solid #93c5fd', background: '#eff6ff', resize: 'vertical', color: '#1e293b' }}
                          placeholder="Recomendaciones para el próximo service, advertencias generales..."
                      />
                  </div>
              </div>
            </div>

            {/* CHECKLIST */}
            <div className="tb-card">
              <h3 className="tb-title" style={{ color: '#1e40af', marginBottom: '15px', fontSize: '1.2em' }}>
                <ClipboardList size={20}/> 3. Hoja de Inspección (Checklist Final)
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                      {renderChecklistSection('exterior', 'Exterior')}
                      {renderChecklistSection('motor', 'Parte Motor')}
                  </div>
                  <div>
                      {renderChecklistSection('interna', 'Parte Interna')}
                      {renderChecklistSection('gomasYBajo', 'Gomas y Bajo')}
                  </div>
              </div>
            </div>
          </div>

          <div>
            <div className="tb-card" style={{ borderTop: '5px solid #f59e0b', position: 'sticky', top: '20px' }}>
              <h3 className="tb-title" style={{ color: '#1e40af', fontSize: '1.2em' }}>
                <ShoppingCart size={20}/> Resumen de Orden
              </h3>
              
              <div style={{ marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid #f1f5f9' }}>
                  <label className="tb-label" style={{ fontSize: '0.9em', color: '#475569' }}>Actualizar Kilometraje:</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '5px' }}>
                      <input 
                          type="number" 
                          value={kilometraje}
                          onChange={(e) => setKilometraje(e.target.value)}
                          className="tb-input"
                          placeholder="Ej: 150000"
                          style={{ padding: '6px 10px', fontSize: '0.95em' }}
                      />
                      <span style={{ color: '#64748b', fontSize: '0.9em', fontWeight: 'bold' }}>KM</span>
                  </div>
              </div>
              
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

              <div style={{marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px'}}>
                  <button className="tb-btn-save" onClick={() => guardarCambios(false)} style={{width: '100%', background: '#3b82f6', padding: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                    <Save size={18} style={{marginRight: '8px'}}/> GUARDAR AVANCE
                  </button>
                  <button className="tb-btn-save" onClick={() => guardarCambios(true)} style={{width: '100%', background: '#10b981', padding: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                    <CheckCircle size={18} style={{marginRight: '8px'}}/> FINALIZAR ORDEN
                  </button>
              </div>
            </div>
          </div>

        </div>
    </div>
  )
}

export default ProcesarOrden
