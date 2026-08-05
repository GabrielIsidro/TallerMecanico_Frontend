import { useEffect, useState, Fragment } from 'react'
import { toast } from 'sonner'
import { 
  History, 
  Search, 
  ChevronDown,
  ChevronUp,
  Car, 
  User, 
  Receipt,
  Wrench,
  CreditCard,
  Download,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import api from '../api/axiosConfig'
import '../styles/Tablas.css'

function Historial() {
  const [ordenes, setOrdenes] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [cargando, setCargando] = useState(true)
  const [filaExpandida, setFilaExpandida] = useState(null)
  
  // Estados de paginación
  const [paginaActual, setPaginaActual] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [totalElementos, setTotalElementos] = useState(0);
  const size = 10;

  useEffect(() => {
    cargarOrdenes(paginaActual, size)
  }, [paginaActual])

  const cargarOrdenes = (page = 0, size = 10) => {
    setCargando(true)
    api.get(`/ordenes?page=${page}&size=${size}`)
      .then(res => {
        setOrdenes(res.data.content || [])
        setTotalPaginas(res.data.totalPages || 0)
        setTotalElementos(res.data.totalElements || 0)
        setCargando(false)
      })
      .catch(err => {
        setCargando(false)
        toast.error("Error al cargar el historial desde el servidor.");
      })
  }

  const calcularPrecioItem = (servicio, categoria) => {
      if (!servicio) return 0;
      if (categoria === 'CATEGORIA_B') return servicio.precioB || 0;
      if (categoria === 'CATEGORIA_C') return servicio.precioC || 0;
      return servicio.precioA || 0; 
  }

  const cambiarEstado = (orden, nuevoEstado) => {
    const toastId = toast.loading("Actualizando estado...");
    
    api.patch(`/ordenes/${orden.id}/estado?estado=${nuevoEstado}`)
    .then(() => {
        toast.success(`Estado cambiado a: ${nuevoEstado.replace('_', ' ')}`, { id: toastId });
        cargarOrdenes(paginaActual, size); 
    })
    .catch((err) => {
        toast.error("Fallo al cambiar estado. Revisá si el backend está corriendo.", { id: toastId });
    });
  }

  const cambiarPago = (orden, nuevaFormaPago) => {
    const toastId = toast.loading("Actualizando forma de pago...");
    
    api.patch(`/ordenes/${orden.id}/pago?formaPago=${nuevaFormaPago}`)
    .then(() => {
        toast.success(`Pago registrado como: ${nuevaFormaPago.replace('_', ' ')}`, { id: toastId });
        cargarOrdenes(paginaActual, size); 
    })
    .catch((err) => {
        toast.error("Fallo al registrar pago.", { id: toastId });
    });
  }

  const descargarPDF = (orden) => {
    const toastId = toast.loading("Generando PDF...");
    
    api.get(`/ordenes/${orden.id}/pdf`, { responseType: 'blob' })
    .then(response => {
        const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Orden_Trabajo_${orden.id}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        toast.success("PDF descargado correctamente", { id: toastId });
    })
    .catch(err => {
        console.error(err);
        toast.error("Error al generar el PDF", { id: toastId });
    });
  }

  const toggleFila = (id) => {
    if (filaExpandida === id) {
        setFilaExpandida(null);
    } else {
        setFilaExpandida(id);
    }
  }

  const ordenesFiltradas = ordenes.filter(o => {
    if (!o || !o.vehiculo) return false;
    const termino = busqueda.toLowerCase()
    const idString = o.id.toString()
    const patente = (o.vehiculo.patente || '').toLowerCase()
    const nombreCliente = o.vehiculo.cliente ? o.vehiculo.cliente.nombreCliente.toLowerCase() : ''
    
    return idString.includes(termino) || patente.includes(termino) || nombreCliente.includes(termino)
  })

  const getColorEstado = (estado) => {
      switch(estado) {
          case 'PENDIENTE': return '#f59e0b'; 
          case 'EN_REPARACION': return '#3b82f6'; 
          case 'FINALIZADO': return '#8b5cf6'; 
          case 'ENTREGADO': return '#10b981'; 
          default: return '#64748b'; 
      }
  }

  return (
    <div className="tb-container">
      
      <div className="tb-header">
          <div>
              <h1 className="tb-title" style={{ fontSize: '1.8em' }}>
                  <div style={{ background: '#eff6ff', padding: '10px', borderRadius: '10px', display: 'flex' }}>
                    <History size={26} color="#3b82f6" />
                  </div>
                  Historial Operativo
                  <span style={{ fontSize: '0.6em', color: '#64748b', marginLeft: '10px', fontWeight: 'normal' }}>
                    ({totalElementos} total)
                  </span>
              </h1>
              <p className="tb-subtitle">Revisá todos los trabajos, cambiá estados e imprimí facturas.</p>
          </div>
          
          <div style={{ position: 'relative', width: '300px' }}>
              <Search size={18} className="tb-filter-icon" />
              <input 
                type="text" 
                placeholder="Buscar en esta página..." 
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                className="tb-input"
                style={{ paddingLeft: '35px', border: '2px solid #3b82f6' }}
              />
          </div>
      </div>

      <div className="tb-card" style={{ padding: '0', overflow: 'hidden' }}>
        {cargando ? (
            <div className="tb-loading">Cargando registros...</div>
        ) : ordenesFiltradas.length === 0 ? (
            <div className="tb-loading">No se encontraron órdenes.</div>
        ) : (
            <div className="tb-table-wrapper">
                <table className="tb-table" style={{ minWidth: '1050px' }}>
                    <thead className="tb-thead">
                        <tr>
                            <th className="tb-th">ID</th>
                            <th className="tb-th">Fecha</th>
                            <th className="tb-th">Vehículo / Dueño</th>
                            <th className="tb-th">ESTADO</th>
                            <th className="tb-th">PAGO</th>
                            <th className="tb-th" style={{ textAlign: 'right' }}>Total Exacto</th>
                            <th className="tb-th" style={{ textAlign: 'center', width: '120px' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ordenesFiltradas.map(o => {
                            const categoria = o.vehiculo?.categoria;
                            const totalReal = o.items && o.items.length > 0 
                                ? o.items.reduce((sum, item) => sum + calcularPrecioItem(item.tipoServicio, categoria), 0) 
                                : (o.costoTotal || 0);

                            return (
                            <Fragment key={o.id}>
                                <tr className="tb-tr" style={{ background: filaExpandida === o.id ? '#f0fdf4' : 'white', transition: '0.2s background' }}>
                                    <td className="tb-td tb-td-id" style={{ fontSize: '1.1em' }}>#{o.id}</td>
                                    <td className="tb-td tb-td-muted">{new Date(o.fechaIngreso).toLocaleDateString('es-AR')}</td>
                                    <td className="tb-td">
                                        <div className="tb-td-primary" style={{ display: 'inline' }}>{o.vehiculo?.patente || 'S/P'} - {o.vehiculo?.marca}</div>
                                        <div className="tb-td-muted" style={{ fontSize: '0.85em' }}>👤 {o.vehiculo?.cliente ? o.vehiculo.cliente.nombreCliente : 'Sin dueño'}</div>
                                    </td>
                                    
                                    <td className="tb-td">
                                        <select 
                                            value={o.estado || 'PENDIENTE'} 
                                            onChange={(e) => cambiarEstado(o, e.target.value)}
                                            style={{ 
                                                padding: '6px 10px', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.85em', cursor: 'pointer', outline: 'none',
                                                backgroundColor: 'white', color: getColorEstado(o.estado), border: `2px solid ${getColorEstado(o.estado)}`
                                            }}
                                        >
                                            <option value="PENDIENTE">PENDIENTE</option>
                                            <option value="EN_REPARACION">EN REPARACIÓN</option>
                                            <option value="FINALIZADO">FINALIZADO</option>
                                            <option value="ENTREGADO">ENTREGADO</option>
                                        </select>
                                    </td>

                                    <td className="tb-td">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <CreditCard size={16} color="#475569" />
                                            <select 
                                                value={o.formaPago || 'PENDIENTE'} 
                                                onChange={(e) => cambiarPago(o, e.target.value)}
                                                style={{ 
                                                    padding: '6px', borderRadius: '8px', fontSize: '0.85em', cursor: 'pointer', outline: 'none',
                                                    backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1'
                                                }}
                                            >
                                                <option value="PENDIENTE">Pendiente</option>
                                                <option value="EFECTIVO">Efectivo 💵</option>
                                                <option value="TRANSFERENCIA">Transferencia 🏦</option>
                                                <option value="MERCADO_PAGO">Mercado Pago 📱</option>
                                                <option value="TARJETA_DEBITO">Débito 💳</option>
                                                <option value="TARJETA_CREDITO">Crédito 💳</option>
                                            </select>
                                        </div>
                                    </td>

                                    <td className="tb-td" style={{ textAlign: 'right', fontWeight: 'bold', color: '#166534', fontSize: '1.1em' }}>
                                        ${totalReal.toLocaleString()}
                                    </td>

                                    <td className="tb-td" style={{ textAlign: 'center' }}>
                                        <div className="tb-actions">
                                          <button 
                                              onClick={() => descargarPDF(o)}
                                              className="tb-btn-icon tb-btn-delete"
                                              title="Descargar PDF"
                                          >
                                              <Download size={18} />
                                          </button>
                                          
                                          <button 
                                              onClick={() => toggleFila(o.id)}
                                              className="tb-btn-icon"
                                              title="Ver Detalle de Ítems"
                                              style={{ background: filaExpandida === o.id ? '#166534' : '#e2e8f0', color: filaExpandida === o.id ? 'white' : '#475569' }}
                                          >
                                              {filaExpandida === o.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                          </button>
                                        </div>
                                    </td>
                                </tr>

                                {filaExpandida === o.id && (
                                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid #cbd5e1' }}>
                                        <td colSpan="7" style={{ padding: '0' }}>
                                            <div style={{ padding: '20px 30px', display: 'flex', gap: '40px' }}>
                                                
                                                <div style={{ flex: '1', borderRight: '1px solid #cbd5e1', paddingRight: '20px' }}>
                                                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 0, color: '#1e40af' }}>
                                                        <Receipt size={18} /> Info Técnica
                                                    </h4>
                                                    <div style={{ display: 'grid', gap: '10px', fontSize: '0.9em', color: '#475569', marginTop: '15px' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Car size={16}/> <strong>Motor:</strong> {o.vehiculo?.numeroMotor || 'N/A'}</div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Car size={16}/> <strong>Chasis:</strong> {o.vehiculo?.numeroChasis || 'N/A'}</div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><User size={16}/> <strong>Teléfono:</strong> {o.vehiculo?.cliente?.telefono || 'N/A'}</div>
                                                    </div>
                                                </div>

                                                <div style={{ flex: '2' }}>
                                                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 0, color: '#334155' }}>
                                                        <Wrench size={18} /> Trabajos Facturados (Ítems)
                                                    </h4>
                                                    
                                                    {(!o.items || o.items.length === 0) ? (
                                                        <p className="tb-td-muted" style={{ fontSize: '0.9em' }}>No hay detalle de ítems cargados.</p>
                                                    ) : (
                                                        <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '10px' }}>
                                                            {o.items.map((item, idx) => {
                                                                const precioCalculado = calcularPrecioItem(item.tipoServicio, categoria);
                                                                return (
                                                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: idx !== o.items.length -1 ? '1px dashed #cbd5e1' : 'none' }}>
                                                                        <span style={{ color: '#334155', fontSize: '0.95em' }}>{item.tipoServicio?.descripcion || 'Servicio'}</span>
                                                                        <span style={{ fontWeight: 'bold', color: '#166534' }}>${precioCalculado.toLocaleString()}</span>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>

                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </Fragment>
                        )})}
                    </tbody>
                </table>
                
                {/* Paginación */}
                {totalPaginas > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginTop: '20px', paddingBottom: '20px' }}>
                    <button 
                      onClick={() => setPaginaActual(prev => Math.max(0, prev - 1))}
                      disabled={paginaActual === 0}
                      style={{ padding: '8px 12px', background: paginaActual === 0 ? '#e2e8f0' : '#3b82f6', color: paginaActual === 0 ? '#94a3b8' : 'white', border: 'none', borderRadius: '8px', cursor: paginaActual === 0 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center' }}
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <span style={{ fontWeight: 'bold', color: '#475569' }}>
                      Página {paginaActual + 1} de {totalPaginas}
                    </span>
                    <button 
                      onClick={() => setPaginaActual(prev => Math.min(totalPaginas - 1, prev + 1))}
                      disabled={paginaActual === totalPaginas - 1}
                      style={{ padding: '8px 12px', background: paginaActual === totalPaginas - 1 ? '#e2e8f0' : '#3b82f6', color: paginaActual === totalPaginas - 1 ? '#94a3b8' : 'white', border: 'none', borderRadius: '8px', cursor: paginaActual === totalPaginas - 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center' }}
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                )}
            </div>
        )}
      </div>

    </div>
  )
}

export default Historial
