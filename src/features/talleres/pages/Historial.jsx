import { useEffect, useState, Fragment } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { 
  History, 
  Search, 
  Car, 
  User, 
  Wrench,
  CreditCard,
  Download,
  ChevronLeft,
  ChevronRight,
  ClipboardList
} from 'lucide-react'
import { getClientes, createCliente, updateCliente, deleteCliente, getVehiculos, createVehiculo, updateVehiculo, deleteVehiculo, getServicios, createServicio, updateServicio, deleteServicio, importServicios, getOrdenes, createOrden, updateOrden, updateEstadoOrden, updatePagoOrden, getOrdenPdf, getRepuestos, createRepuesto, updateRepuesto, deleteRepuesto, getEquipo, createMiembroEquipo, deleteMiembroEquipo, getMiPerfil, updateMiPerfil } from '../api/talleresApi';


function Historial() {
  const [ordenes, setOrdenes] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [cargando, setCargando] = useState(true)
  const navigate = useNavigate()
  
  // Para tablero Kanban traemos un lote más grande (ej: 100)
  const [paginaActual, setPaginaActual] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [totalElementos, setTotalElementos] = useState(0);
  const size = 100;

  useEffect(() => {
    cargarOrdenes(paginaActual, size)
  }, [paginaActual])

  const cargarOrdenes = (page = 0, size = 100) => {
    setCargando(true)
    getOrdenes(page, size)
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

  const cambiarEstado = (orden, nuevoEstado) => {
    const toastId = toast.loading("Actualizando estado...");
    
    updateEstadoOrden(orden.id, nuevoEstado)
    .then(() => {
        toast.success(`Estado cambiado a: ${nuevoEstado.replace('_', ' ')}`, { id: toastId });
        cargarOrdenes(paginaActual, size); 
    })
    .catch((err) => {
        toast.error("Fallo al cambiar estado.", { id: toastId });
    });
  }

  const cambiarPago = (orden, nuevaFormaPago) => {
    const toastId = toast.loading("Actualizando pago...");
    
    updatePagoOrden(orden.id, nuevaFormaPago)
    .then(() => {
        toast.success(`Pago actualizado exitosamente`, { id: toastId });
        cargarOrdenes(paginaActual, size); 
    })
    .catch((err) => {
        toast.error("Fallo al registrar pago.", { id: toastId });
    });
  }

  const descargarPDF = (orden) => {
    const toastId = toast.loading("Generando PDF...");
    
    getOrdenPdf(orden.id)
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

  const abrirProcesador = (id) => {
    navigate(`/ordenes/${id}`);
  }

  const ordenesFiltradas = ordenes.filter(o => {
    if (!o || !o.vehiculo) return false;
    const termino = busqueda.toLowerCase()
    const idString = o.id.toString()
    const patente = (o.vehiculo.patente || '').toLowerCase()
    const nombreCliente = o.vehiculo.cliente ? o.vehiculo.cliente.nombreCliente.toLowerCase() : ''
    
    return idString.includes(termino) || patente.includes(termino) || nombreCliente.includes(termino)
  })

  // Agrupamos en las 3 columnas
  const activas = ordenesFiltradas.filter(o => o.estado === 'PENDIENTE' || o.estado === 'EN_REPARACION');
  const finalizadas = ordenesFiltradas.filter(o => o.estado === 'FINALIZADO');
  const entregadas = ordenesFiltradas.filter(o => o.estado === 'ENTREGADO');

  const renderCard = (o) => {
    const colorBorde = o.estado === 'PENDIENTE' ? '#f59e0b' : 
                       o.estado === 'EN_REPARACION' ? '#3b82f6' : 
                       o.estado === 'FINALIZADO' ? '#8b5cf6' : '#10b981';

    return (
        <div key={o.id} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '15px', marginBottom: '15px', border: '1px solid #e2e8f0', borderLeft: `5px solid ${colorBorde}`, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontWeight: 'bold', color: '#1e293b', fontSize: '1.1em' }}>#{o.id} - {o.vehiculo?.patente || 'S/P'}</span>
                <span style={{ fontSize: '0.85em', color: '#64748b' }}>{new Date(o.fechaIngreso).toLocaleDateString('es-AR')}</span>
            </div>
            
            <div style={{ fontSize: '0.9em', color: '#475569', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <Car size={16}/> {o.vehiculo?.marca} {o.vehiculo?.modelo}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <User size={16}/> {o.vehiculo?.cliente ? o.vehiculo.cliente.nombreCliente : 'Sin dueño'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', fontStyle: 'italic', color: '#64748b' }}>
                    <ClipboardList size={16}/> {o.descripcion?.length > 30 ? o.descripcion.substring(0, 30) + '...' : (o.descripcion || 'Sin descripción')}
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <select 
                        value={o.estado || 'PENDIENTE'} 
                        onChange={(e) => cambiarEstado(o, e.target.value)}
                        style={{ padding: '4px 8px', borderRadius: '6px', fontWeight: 'bold', fontSize: '0.8em', cursor: 'pointer', outline: 'none', backgroundColor: '#f8fafc', color: colorBorde, border: `1px solid ${colorBorde}` }}
                    >
                        <option value="PENDIENTE">PENDIENTE</option>
                        <option value="EN_REPARACION">EN REPARACIÓN</option>
                        <option value="FINALIZADO">FINALIZADO</option>
                        <option value="ENTREGADO">ENTREGADO</option>
                    </select>

                    <select 
                        value={o.formaPago || 'PENDIENTE'} 
                        onChange={(e) => cambiarPago(o, e.target.value)}
                        style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '0.8em', cursor: 'pointer', outline: 'none', backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1' }}
                    >
                        <option value="PENDIENTE">Pago PEND.</option>
                        <option value="EFECTIVO">Efectivo</option>
                        <option value="TRANSFERENCIA">Transferencia</option>
                        <option value="MERCADO_PAGO">Mercado Pago</option>
                        <option value="TARJETA_DEBITO">Débito</option>
                        <option value="TARJETA_CREDITO">Crédito</option>
                    </select>
                </div>

                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 'bold', color: '#166534', fontSize: '1.1em', marginBottom: '8px' }}>
                        ${(o.costoTotal || 0).toLocaleString()}
                    </div>
                    <div style={{ display: 'flex', gap: '5px', justifyContent: 'flex-end' }}>
                        <button onClick={() => descargarPDF(o)} className="tb-btn-icon tb-btn-delete" title="Descargar PDF" style={{ padding: '6px' }}>
                            <Download size={16} />
                        </button>
                        <button onClick={() => abrirProcesador(o.id)} className="tb-btn-icon" title="Procesar Orden" style={{ background: '#e2e8f0', color: '#475569', padding: '6px' }}>
                            <Wrench size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
  };

  return (
    <div className="tb-container">
      
      <div className="tb-header">
          <div>
              <h1 className="tb-title" style={{ fontSize: '1.8em' }}>
                  <div style={{ background: '#eff6ff', padding: '10px', borderRadius: '10px', display: 'flex' }}>
                    <History size={26} color="#3b82f6" />
                  </div>
                  Órdenes de Trabajo
                  <span style={{ fontSize: '0.6em', color: '#64748b', marginLeft: '10px', fontWeight: 'normal' }}>
                    ({totalElementos} total)
                  </span>
              </h1>
              <p className="tb-subtitle">Gestioná el estado de los vehículos en el taller (Tablero Kanban).</p>
          </div>
          
          <div style={{ position: 'relative', width: '300px' }}>
              <Search size={18} className="tb-filter-icon" />
              <input 
                type="text" 
                placeholder="Buscar por patente, ID..." 
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                className="tb-input"
                style={{ paddingLeft: '35px', border: '2px solid #3b82f6' }}
              />
          </div>
      </div>

      {cargando ? (
          <div className="tb-loading">Cargando tablero...</div>
      ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', minHeight: '600px', overflowX: 'auto' }}>
              
              {/* COLUMNA 1: ACTIVAS */}
              <div style={{ backgroundColor: '#f8fafc', borderRadius: '12px', padding: '15px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e40af', margin: '0 0 15px 0', borderBottom: '2px solid #bfdbfe', paddingBottom: '10px' }}>
                      <Wrench size={20}/> Activas ({activas.length})
                  </h3>
                  <div style={{ flex: 1, overflowY: 'auto' }}>
                      {activas.length === 0 ? <p style={{ color: '#94a3b8', textAlign: 'center', fontStyle: 'italic' }}>Sin órdenes activas</p> : activas.map(renderCard)}
                  </div>
              </div>

              {/* COLUMNA 2: FINALIZADAS */}
              <div style={{ backgroundColor: '#f0fdf4', borderRadius: '12px', padding: '15px', border: '1px solid #bbf7d0', display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#166534', margin: '0 0 15px 0', borderBottom: '2px solid #86efac', paddingBottom: '10px' }}>
                      <Car size={20}/> Finalizadas ({finalizadas.length})
                  </h3>
                  <div style={{ flex: 1, overflowY: 'auto' }}>
                      {finalizadas.length === 0 ? <p style={{ color: '#94a3b8', textAlign: 'center', fontStyle: 'italic' }}>Sin órdenes listas</p> : finalizadas.map(renderCard)}
                  </div>
              </div>

              {/* COLUMNA 3: ENTREGADAS (HISTORIAL) */}
              <div style={{ backgroundColor: '#f1f5f9', borderRadius: '12px', padding: '15px', border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', margin: '0 0 15px 0', borderBottom: '2px solid #94a3b8', paddingBottom: '10px' }}>
                      <History size={20}/> Entregadas / Historial ({entregadas.length})
                  </h3>
                  <div style={{ flex: 1, overflowY: 'auto' }}>
                      {entregadas.length === 0 ? <p style={{ color: '#94a3b8', textAlign: 'center', fontStyle: 'italic' }}>Sin historial</p> : entregadas.map(renderCard)}
                  </div>
              </div>

          </div>
      )}

      {/* Paginación global para el tablero */}
      {totalPaginas > 1 && !cargando && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginTop: '30px', paddingBottom: '20px' }}>
          <button 
            onClick={() => setPaginaActual(prev => Math.max(0, prev - 1))}
            disabled={paginaActual === 0}
            style={{ padding: '8px 12px', background: paginaActual === 0 ? '#e2e8f0' : '#3b82f6', color: paginaActual === 0 ? '#94a3b8' : 'white', border: 'none', borderRadius: '8px', cursor: paginaActual === 0 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center' }}
          >
            <ChevronLeft size={18} />
          </button>
          <span style={{ fontWeight: 'bold', color: '#475569' }}>
            Página {paginaActual + 1} de {totalPaginas} (Lotes de 100)
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
  )
}

export default Historial
