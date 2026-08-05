import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Info, 
  HelpCircle, 
  CheckCircle,
  FileText,
  AlertTriangle,
  Car
} from 'lucide-react'
import api from '../api/axiosConfig'
import '../styles/Tablas.css'

function Vehiculos() {
  const [vehiculos, setVehiculos] = useState([])
  const [clientes, setClientes] = useState([])
  const [modoEdicion, setModoEdicion] = useState(false)
  const [idEditar, setIdEditar] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const [mostrarAyudaCat, setMostrarAyudaCat] = useState(false)

  const [nuevoAuto, setNuevoAuto] = useState({
    patente: '',
    modelo: '',
    marca: '',
    anio: 2024,
    categoria: 'CATEGORIA_A',
    numeroMotor: '',
    numeroChasis: '',
    kilometraje: '',
    proximoServiceKm: '',
    cliente: null
  })

  useEffect(() => {
    cargarVehiculos()
    cargarClientes()
  }, [])

  const cargarVehiculos = () => {
    api.get('/vehiculos')
      .then(res => setVehiculos(res.data))
      .catch(err => {
        toast.error("Error al conectar con el servidor. Revisa si el Back está prendido.");
      })
  }

  const cargarClientes = () => {
    api.get('/clientes?size=1000')
      .then(res => setClientes(res.data.content || res.data || []))
      .catch(err => console.error(err))
  }

  const manejarGuardado = () => {
    if(!nuevoAuto.patente || !nuevoAuto.modelo) {
        toast.warning("Por favor completa Patente y Modelo");
        return;
    }

    const autoAEnviar = {
        ...nuevoAuto,
        kilometraje: nuevoAuto.kilometraje ? parseInt(nuevoAuto.kilometraje) : null,
        proximoServiceKm: nuevoAuto.proximoServiceKm ? parseInt(nuevoAuto.proximoServiceKm) : null,
        anio: parseInt(nuevoAuto.anio) || 2024
    };

    const url = modoEdicion ? `/vehiculos/${idEditar}` : '/vehiculos';
    const request = modoEdicion ? api.put(url, autoAEnviar) : api.post(url, autoAEnviar);

    const toastId = toast.loading(modoEdicion ? "Actualizando vehículo..." : "Registrando vehículo...");

    request
    .then(() => {
        toast.success(modoEdicion ? "Vehículo actualizado correctamente." : "Vehículo registrado con éxito.", { id: toastId });
        terminarEdicion();
        cargarVehiculos();
    })
    .catch(err => {
        toast.error("Hubo un error al guardar el vehículo.", { id: toastId });
    });
  }

  const iniciarEdicion = (auto) => {
    setModoEdicion(true);
    setIdEditar(auto.id);
    setNuevoAuto({
        patente: auto.patente,
        modelo: auto.modelo,
        marca: auto.marca,
        anio: auto.anio,
        categoria: auto.categoria,
        numeroMotor: auto.numeroMotor || '',
        numeroChasis: auto.numeroChasis || '', 
        kilometraje: auto.kilometraje || '',
        proximoServiceKm: auto.proximoServiceKm || '',
        cliente: auto.cliente
    })
  }

  const eliminarVehiculo = (id) => {
    if(!confirm("¿Estás seguro de que deseas borrar este vehículo?")) return;
    
    api.delete(`/vehiculos/${id}`)
    .then(() => {
        toast.success("Vehículo eliminado del sistema.");
        cargarVehiculos();
    })
    .catch(err => {
        toast.error("No se puede borrar. Revisa que no tenga historial asociado.");
    })
  }

  const terminarEdicion = () => {
    setModoEdicion(false);
    setIdEditar(null);
    setNuevoAuto({ patente: '', modelo: '', marca: '', anio: 2024, categoria: 'CATEGORIA_A', numeroMotor: '', numeroChasis: '', kilometraje: '', proximoServiceKm: '', cliente: null });
  }

  const handleClienteChange = (e) => {
      const idSeleccionado = e.target.value;
      if (idSeleccionado === "") {
          setNuevoAuto({ ...nuevoAuto, cliente: null });
      } else {
          setNuevoAuto({ ...nuevoAuto, cliente: { id: parseInt(idSeleccionado) } });
      }
  }

  const calcularEstadoService = (kmActual, kmProximo) => {
      if (!kmActual || !kmProximo) return null;
      const diferencia = kmProximo - kmActual;
      if (diferencia <= 0) return <span className="tb-badge tb-badge-danger" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <AlertTriangle size={14}/> ¡VENCIDO!</span>;
      if (diferencia <= 1000) return <span className="tb-badge tb-badge-warning">
          ⚠️ Faltan {diferencia} km</span>;
      return <span className="tb-badge tb-badge-success" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <CheckCircle size={14}/> Al día</span>;
  }

  const vehiculosFiltrados = vehiculos.filter(v => {
      const termino = busqueda.toLowerCase();
      const idString = v.id.toString();
      const patente = (v.patente || '').toLowerCase();
      const nombreCliente = v.cliente ? v.cliente.nombreCliente.toLowerCase() : '';
      return idString.includes(termino) || patente.includes(termino) || nombreCliente.includes(termino);
  });

  return (
    <div className="tb-container">
      <div className="tb-header">
        <h1 className="tb-title" style={{ fontSize: '1.8em' }}>
          <div style={{ background: '#ecfdf5', padding: '10px', borderRadius: '10px', display: 'flex' }}>
            <Car size={26} color="#10b981" />
          </div>
          Gestión de Vehículos
        </h1>
      </div>
      
      {/* FORMULARIO */}
      <div className="tb-card" style={{ background: modoEdicion ? '#fff7ed' : '#ffffff', border: modoEdicion ? '2px solid #fdba74' : '1px solid #e2e8f0', padding: '20px', marginBottom: '25px' }}>
        <h3 className="tb-title" style={{ color: modoEdicion ? '#c2410c' : '#1e40af', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', marginBottom: '20px', fontSize: '1.2em' }}>
          {modoEdicion ? <Edit size={20}/> : <Plus size={20}/>}
          {modoEdicion ? 'Actualizar Vehículo' : 'Registrar Nuevo Auto'}
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <div style={{ gridColumn: '1 / -1' }}>
              <label className="tb-label">👤 Dueño del Auto:</label>
              <select className="tb-select" value={nuevoAuto.cliente ? nuevoAuto.cliente.id : ""} onChange={handleClienteChange}>
                  <option value="">-- Seleccionar Cliente --</option>
                  {clientes.map(c => <option key={c.id} value={c.id}>{c.nombreCliente}</option>)}
              </select>
          </div>

          <div><label className="tb-label">Patente</label><input value={nuevoAuto.patente} onChange={e => setNuevoAuto({...nuevoAuto, patente: e.target.value})} className="tb-input" /></div>
          <div><label className="tb-label">Marca</label><input value={nuevoAuto.marca} onChange={e => setNuevoAuto({...nuevoAuto, marca: e.target.value})} className="tb-input" /></div>
          <div><label className="tb-label">Modelo</label><input value={nuevoAuto.modelo} onChange={e => setNuevoAuto({...nuevoAuto, modelo: e.target.value})} className="tb-input" /></div>
          <div>
              <label className="tb-label" style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                  Categoría
                  <button 
                    type="button"
                    onClick={() => setMostrarAyudaCat(true)} 
                    style={{ background:'#3b82f6', color:'white', border:'none', borderRadius:'50%', width:'18px', height:'18px', fontSize:'11px', cursor:'pointer', display:'flex', justifyContent:'center', alignItems:'center', fontWeight:'bold' }} 
                    title="Ver referencias de ATAIA"
                  >
                    <HelpCircle size={12} color="white"/>
                  </button>
              </label>
              <select value={nuevoAuto.categoria} onChange={e => setNuevoAuto({...nuevoAuto, categoria: e.target.value})} className="tb-select">
                <option value="CATEGORIA_A">Cat. A (Base)</option>
                <option value="CATEGORIA_B">Cat. B (Full)</option>
                <option value="CATEGORIA_C">Cat. C (Alta Gama/4x4)</option>
              </select>
          </div>

          <div style={{ borderTop: '1px dashed #cbd5e1', gridColumn: '1 / -1', margin: '10px 0', paddingTop: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={18} color="#475569" />
              <strong style={{color: '#475569'}}>Tarjeta Verde y Control de Service</strong>
          </div>

          <div><label className="tb-label">N° Motor</label><input placeholder="Ej: FMB123..." value={nuevoAuto.numeroMotor} onChange={e => setNuevoAuto({...nuevoAuto, numeroMotor: e.target.value})} className="tb-input" /></div>
          <div><label className="tb-label">N° Chasis / VIN</label><input placeholder="Ej: 8AD123..." value={nuevoAuto.numeroChasis} onChange={e => setNuevoAuto({...nuevoAuto, numeroChasis: e.target.value})} className="tb-input" /></div>
          <div><label className="tb-label">KM Actual</label><input type="number" placeholder="Ej: 150000" value={nuevoAuto.kilometraje} onChange={e => setNuevoAuto({...nuevoAuto, kilometraje: e.target.value})} className="tb-input" /></div>
          <div><label className="tb-label" style={{color: '#1d4ed8'}}>Próximo Service (KM)</label><input type="number" placeholder="Ej: 160000" value={nuevoAuto.proximoServiceKm} onChange={e => setNuevoAuto({...nuevoAuto, proximoServiceKm: e.target.value})} className="tb-input" style={{border: '2px solid #93c5fd', backgroundColor: '#eff6ff'}} /></div>

          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button onClick={manejarGuardado} className="tb-btn-save" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', backgroundColor: modoEdicion ? '#f97316' : '#10b981' }}>
                <CheckCircle size={18} color="white"/>
                {modoEdicion ? 'Actualizar Vehículo' : 'Guardar Vehículo'}
              </button>
              {modoEdicion && <button onClick={terminarEdicion} className="tb-btn-cancel" style={{ flex: 1 }}>Cancelar</button>}
          </div>
        </div>
      </div>

      {/* TABLA CON BUSCADOR PROFESIONAL */}
      <div className="tb-card" style={{ padding: '25px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 className="tb-title" style={{ fontSize: '1.2em' }}>🚗 Flota Registrada</h3>
            
            <div style={{ position: 'relative', width: '300px' }}>
                <Search size={18} className="tb-filter-icon" />
                <input 
                    type="text" 
                    placeholder="Buscar patente, ID o dueño..." 
                    value={busqueda}
                    onChange={e => setBusqueda(e.target.value)}
                    className="tb-input"
                    style={{ paddingLeft: '38px', border: '2px solid #3b82f6' }}
                />
            </div>
        </div>

        {vehiculosFiltrados.length === 0 ? <p className="tb-loading">No se encontraron vehículos.</p> : (
            <div className="tb-table-wrapper">
                <table className="tb-table">
                <thead className="tb-thead">
                    <tr>
                        <th className="tb-th" style={{ width: '60px' }}>ID</th>
                        <th className="tb-th">Dueño</th>
                        <th className="tb-th">Vehículo</th>
                        <th className="tb-th">Control de KM</th>
                        <th className="tb-th">Datos Técnicos</th>
                        <th className="tb-th" style={{ textAlign: 'right' }}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {vehiculosFiltrados.map(v => (
                    <tr key={v.id} className="tb-tr">
                        <td className="tb-td tb-td-id" style={{ fontSize: '1.1em' }}>{v.id}</td>
                        <td className="tb-td">
                            {v.cliente ? <strong className="tb-td-primary" style={{ display: 'inline' }}>{v.cliente.nombreCliente}</strong> : <span className="tb-td-muted">Sin asignar</span>}
                            {v.cliente && v.cliente.telefono && <div className="tb-td-muted" style={{fontSize:'0.8em'}}>📞 {v.cliente.telefono}</div>}
                        </td>
                        <td className="tb-td">
                            <div style={{ background: '#1e293b', color: 'white', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold', fontSize:'0.85em', display: 'inline-block', marginBottom: '4px' }}>{v.patente}</div>
                            <div style={{ fontSize: '0.9em' }}>{v.marca} {v.modelo} <span className="tb-td-muted">({v.categoria.replace('CATEGORIA_','')})</span></div>
                        </td>
                        <td className="tb-td">
                            <div style={{ marginBottom: '5px' }}>
                                {v.kilometraje ? <span><strong>Actual:</strong> {v.kilometraje.toLocaleString()} km</span> : <span className="tb-td-muted" style={{ fontSize: '0.85em' }}>Sin datos de KM</span>}
                            </div>
                            {calcularEstadoService(v.kilometraje, v.proximoServiceKm)}
                        </td>
                        <td className="tb-td tb-td-muted" style={{ fontSize: '0.85em' }}>
                            <div><strong>Motor:</strong> {v.numeroMotor || '-'}</div>
                            <div><strong>Chasis:</strong> {v.numeroChasis || '-'}</div>
                        </td>
                        <td className="tb-td" style={{ textAlign: 'right' }}>
                            <div className="tb-actions" style={{ justifyContent: 'flex-end' }}>
                              <button className="tb-btn-icon" style={{ background: '#f59e0b', color: 'white' }} onClick={() => iniciarEdicion(v)} title="Editar">
                                  <Edit size={16} color="white"/>
                              </button>
                              <button className="tb-btn-icon tb-btn-delete" style={{ background: '#ef4444', color: 'white' }} onClick={() => eliminarVehiculo(v.id)} title="Borrar">
                                  <Trash2 size={16} color="white"/>
                              </button>
                            </div>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
        )}
      </div>

      {/* MODAL REFERENCIA ATAIA */}
      {mostrarAyudaCat && (
        <div className="tb-modal-overlay" onClick={() => setMostrarAyudaCat(false)}>
            <div className="tb-modal-content" onClick={e => e.stopPropagation()} style={{ width: '650px', maxWidth: '95%', position: 'relative' }}>
                <button onClick={() => setMostrarAyudaCat(false)} style={{ position:'absolute', top:'15px', right:'15px', background:'none', border:'none', fontSize:'20px', cursor:'pointer', color: '#64748b' }}>✖</button>
                
                <h2 className="tb-modal-header" style={{ color: '#1e40af', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>
                    <Info size={24} color="#1e40af"/> Referencia de Categorías (ATAIA)
                </h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
                    
                    <div style={{ padding: '15px', background: '#ecfdf5', borderLeft: '5px solid #10b981', borderRadius: '6px' }}>
                        <h4 style={{ margin: '0 0 8px 0', color: '#065f46', fontSize: '1.1em' }}>VEHÍCULOS CATEGORÍA A</h4>
                        <p style={{ margin: '0 0 5px 0', fontSize: '0.9em', color: '#064e3b' }}>
                            <strong>Tipo de Auto:</strong> Vehículos pequeños a medianos sin equipamiento (Base) con motor nafta o Diesel 8 válvulas.
                        </p>
                    </div>

                    <div style={{ padding: '15px', background: '#fffbeb', borderLeft: '5px solid #f59e0b', borderRadius: '6px' }}>
                        <h4 style={{ margin: '0 0 8px 0', color: '#b45309', fontSize: '1.1em' }}>VEHÍCULOS CATEGORÍA B</h4>
                        <p style={{ margin: '0 0 5px 0', fontSize: '0.9em', color: '#78350f' }}>
                            <strong>Tipo de Auto:</strong> Vehículos medianos equipamiento full con motor nafta o Diesel 16v.
                        </p>
                    </div>

                    <div style={{ padding: '15px', background: '#f5f3ff', borderLeft: '5px solid #8b5cf6', borderRadius: '6px' }}>
                        <h4 style={{ margin: '0 0 8px 0', color: '#5b21b6', fontSize: '1.1em' }}>VEHÍCULOS CATEGORÍA C</h4>
                        <p style={{ margin: '0 0 5px 0', fontSize: '0.9em', color: '#4c1d95' }}>
                            <strong>Tipo de Auto:</strong> Vehículos de alta gama y pick up 4x4.
                        </p>
                    </div>

                </div>

                <div className="tb-modal-actions" style={{ justifyContent: 'center', marginTop: '25px' }}>
                    <button className="tb-btn-save" onClick={() => setMostrarAyudaCat(false)} style={{ padding: '10px 30px', background: '#3b82f6' }}>¡Entendido!</button>
                </div>
            </div>
        </div>
      )}

    </div>
  )
}

export default Vehiculos
