import { useEffect, useState } from 'react'
import { toast } from 'sonner' // <--- 1. IMPORTAMOS TOAST

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
    fetch('http://localhost:8080/api/vehiculos')
      .then(res => res.json())
      .then(data => setVehiculos(data))
      .catch(err => console.error(err))
  }

  const cargarClientes = () => {
    fetch('http://localhost:8080/api/clientes')
      .then(res => res.json())
      .then(data => setClientes(data))
      .catch(err => console.error(err))
  }

  const manejarGuardado = () => {
    if(!nuevoAuto.patente || !nuevoAuto.modelo) {
        // <--- REEMPLAZO DE ALERT POR TOAST DE ADVERTENCIA --->
        toast.warning("Por favor completa Patente y Modelo");
        return;
    }

    const autoAEnviar = {
        ...nuevoAuto,
        kilometraje: nuevoAuto.kilometraje ? parseInt(nuevoAuto.kilometraje) : null,
        proximoServiceKm: nuevoAuto.proximoServiceKm ? parseInt(nuevoAuto.proximoServiceKm) : null,
        anio: parseInt(nuevoAuto.anio) || 2024
    };

    const url = modoEdicion ? `http://localhost:8080/api/vehiculos/${idEditar}` : 'http://localhost:8080/api/vehiculos';
    const metodo = modoEdicion ? 'PUT' : 'POST';

    // Lanzamos un toast de "Cargando" mientras espera a Java
    const toastId = toast.loading(modoEdicion ? "Actualizando vehículo..." : "Guardando vehículo...");

    fetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(autoAEnviar)
    })
    .then(async (res) => {
        if (!res.ok) throw new Error("Error del servidor");
        
        // <--- ACTUALIZAMOS EL TOAST A ÉXITO --->
        toast.success(modoEdicion ? "¡Vehículo actualizado correctamente!" : "¡Vehículo registrado con éxito!", {
            id: toastId, // Le pasamos el ID para que reemplace al de "Cargando..."
        });
        
        terminarEdicion();
        cargarVehiculos();
    })
    .catch(err => {
        // <--- ACTUALIZAMOS EL TOAST A ERROR --->
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
    
    fetch(`http://localhost:8080/api/vehiculos/${id}`, { method: 'DELETE' })
    .then((res) => {
        if (!res.ok) throw new Error("Error al borrar");
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
      if (diferencia <= 0) return <span style={{ background: '#fee2e2', color: '#991b1b', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.85em' }}>🚨 ¡VENCIDO!</span>;
      if (diferencia <= 1000) return <span style={{ background: '#fef3c7', color: '#b45309', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.85em' }}>⚠️ Falta ({diferencia} km)</span>;
      return <span style={{ background: '#dcfce7', color: '#166534', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.85em' }}>✅ Al día</span>;
  }

  const vehiculosFiltrados = vehiculos.filter(v => {
      const termino = busqueda.toLowerCase();
      const idString = v.id.toString();
      const patente = (v.patente || '').toLowerCase();
      const nombreCliente = v.cliente ? `${v.cliente.nombre} ${v.cliente.apellido}`.toLowerCase() : '';
      return idString.includes(termino) || patente.includes(termino) || nombreCliente.includes(termino);
  });

  const inputStyle = { padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: 'white', color: '#333', width: '100%', boxSizing: 'border-box' }

  const modalStyle = {
    position: 'fixed', top: '0', left: '0', width: '100%', height: '100%',
    backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
  }

  return (
    <div style={{ color: '#333' }}>
      <h1 style={{ color: '#1e293b', marginTop: 0 }}>Gestión de Vehículos</h1>
      
      {/* FORMULARIO */}
      <div className="card" style={{ background: modoEdicion ? '#fff7ed' : '#eef2ff', border: modoEdicion ? '2px solid #fdba74' : '1px solid #c7d2fe', padding: '20px' }}>
        <h3 style={{ marginTop: 0, color: modoEdicion ? '#c2410c' : '#1e40af' }}>{modoEdicion ? '✏️ Editar' : '➕ Nuevo Auto'}</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <div style={{ gridColumn: '1 / -1' }}>
              <label style={{display:'block', marginBottom:'5px', fontWeight:'bold', fontSize:'0.9em'}}>👤 Dueño del Auto:</label>
              <select style={inputStyle} value={nuevoAuto.cliente ? nuevoAuto.cliente.id : ""} onChange={handleClienteChange}>
                  <option value="">-- Seleccionar Cliente --</option>
                  {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre} {c.apellido}</option>)}
              </select>
          </div>

          <div><label style={{fontSize:'0.85em', fontWeight:'bold'}}>Patente</label><input value={nuevoAuto.patente} onChange={e => setNuevoAuto({...nuevoAuto, patente: e.target.value})} style={inputStyle} /></div>
          <div><label style={{fontSize:'0.85em', fontWeight:'bold'}}>Marca</label><input value={nuevoAuto.marca} onChange={e => setNuevoAuto({...nuevoAuto, marca: e.target.value})} style={inputStyle} /></div>
          <div><label style={{fontSize:'0.85em', fontWeight:'bold'}}>Modelo</label><input value={nuevoAuto.modelo} onChange={e => setNuevoAuto({...nuevoAuto, modelo: e.target.value})} style={inputStyle} /></div>
          <div>
              <label style={{fontSize:'0.85em', fontWeight:'bold', display: 'flex', alignItems: 'center', gap: '8px'}}>
                  Categoría
                  <button 
                    onClick={() => setMostrarAyudaCat(true)} 
                    style={{ background:'#3b82f6', color:'white', border:'none', borderRadius:'50%', width:'18px', height:'18px', fontSize:'11px', cursor:'pointer', display:'flex', justifyContent:'center', alignItems:'center', fontWeight:'bold' }} 
                    title="Ver referencias de ATAIA"
                  >
                    ?
                  </button>
              </label>
              <select value={nuevoAuto.categoria} onChange={e => setNuevoAuto({...nuevoAuto, categoria: e.target.value})} style={inputStyle}>
                <option value="CATEGORIA_A">Cat. A (Base)</option>
                <option value="CATEGORIA_B">Cat. B (Full)</option>
                <option value="CATEGORIA_C">Cat. C (Alta Gama/4x4)</option>
              </select>
          </div>

          <div style={{ borderTop: '1px dashed #cbd5e1', gridColumn: '1 / -1', margin: '10px 0', paddingTop: '10px' }}>
              <strong style={{color: '#475569'}}>📝 Tarjeta Verde y Control de Service</strong>
          </div>

          <div><label style={{fontSize:'0.85em', fontWeight:'bold'}}>N° Motor</label><input placeholder="Ej: FMB123..." value={nuevoAuto.numeroMotor} onChange={e => setNuevoAuto({...nuevoAuto, numeroMotor: e.target.value})} style={inputStyle} /></div>
          <div><label style={{fontSize:'0.85em', fontWeight:'bold'}}>N° Chasis / VIN</label><input placeholder="Ej: 8AD123..." value={nuevoAuto.numeroChasis} onChange={e => setNuevoAuto({...nuevoAuto, numeroChasis: e.target.value})} style={inputStyle} /></div>
          <div><label style={{fontSize:'0.85em', fontWeight:'bold'}}>KM Actual</label><input type="number" placeholder="Ej: 150000" value={nuevoAuto.kilometraje} onChange={e => setNuevoAuto({...nuevoAuto, kilometraje: e.target.value})} style={inputStyle} /></div>
          <div><label style={{fontSize:'0.85em', fontWeight:'bold', color: '#1d4ed8'}}>Próximo Service (KM)</label><input type="number" placeholder="Ej: 160000" value={nuevoAuto.proximoServiceKm} onChange={e => setNuevoAuto({...nuevoAuto, proximoServiceKm: e.target.value})} style={{...inputStyle, border: '2px solid #93c5fd', backgroundColor: '#eff6ff'}} /></div>

          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button className="btn" onClick={manejarGuardado} style={{ backgroundColor: modoEdicion ? '#f97316' : '#2563eb', color: 'white', flex: 1 }}>{modoEdicion ? 'Actualizar Vehículo' : 'Guardar Vehículo'}</button>
              {modoEdicion && <button className="btn" onClick={terminarEdicion} style={{ backgroundColor: '#94a3b8', color: 'white', flex: 1 }}>Cancelar</button>}
          </div>
        </div>
      </div>

      {/* TABLA CON BUSCADOR */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ margin: 0 }}>🚗 Flota Actual</h3>
            
            <input 
                type="text" 
                placeholder="🔍 Buscar por ID, patente o dueño..." 
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                style={{ ...inputStyle, width: '300px', border: '2px solid #3b82f6' }}
            />
        </div>

        {vehiculosFiltrados.length === 0 ? <p style={{textAlign:'center', color:'#888'}}>No se encontraron vehículos.</p> : (
            <div style={{overflowX: 'auto'}}>
                <table style={{ width: '100%', minWidth: '950px' }}>
                <thead>
                    <tr style={{ color: '#64748b', borderBottom: '2px solid #eee' }}>
                        <th style={{ textAlign: 'left', padding: '10px', width: '60px' }}>ID</th>
                        <th style={{ textAlign: 'left', padding: '10px' }}>Dueño</th>
                        <th style={{ textAlign: 'left', padding: '10px' }}>Vehículo</th>
                        <th style={{ textAlign: 'left', padding: '10px' }}>Control de KM</th>
                        <th style={{ textAlign: 'left', padding: '10px' }}>Datos Técnicos</th>
                        <th style={{ textAlign: 'right', padding: '10px' }}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {vehiculosFiltrados.map(v => (
                    <tr key={v.id} style={{ borderBottom: '1px solid #eee', color: '#333' }}>
                        <td style={{ padding: '10px', fontWeight: 'bold', color: '#2563eb', fontSize: '1.1em' }}>{v.id}</td>
                        <td style={{ padding: '10px' }}>
                            {v.cliente ? <strong>👤 {v.cliente.nombre} {v.cliente.apellido}</strong> : <span style={{ color:'#999' }}>Sin asignar</span>}
                            {v.cliente && v.cliente.telefono && <div style={{fontSize:'0.8em', color:'#64748b'}}>📞 {v.cliente.telefono}</div>}
                        </td>
                        <td style={{ padding: '10px' }}>
                            <div style={{ background: '#1e293b', color: 'white', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold', fontSize:'0.85em', display: 'inline-block', marginBottom: '4px' }}>{v.patente}</div>
                            <div style={{ fontSize: '0.9em' }}>{v.marca} {v.modelo}</div>
                        </td>
                        <td style={{ padding: '10px' }}>
                            <div style={{ marginBottom: '5px' }}>
                                {v.kilometraje ? <span><strong>Actual:</strong> {v.kilometraje.toLocaleString()} km</span> : <span style={{ color: '#94a3b8', fontSize: '0.85em' }}>Sin datos de KM</span>}
                            </div>
                            {calcularEstadoService(v.kilometraje, v.proximoServiceKm)}
                        </td>
                        <td style={{ padding: '10px', fontSize: '0.85em', color: '#475569' }}>
                            <div><strong>Motor:</strong> {v.numeroMotor || '-'}</div>
                            <div><strong>Chasis:</strong> {v.numeroChasis || '-'}</div>
                        </td>
                        <td style={{ padding: '10px', textAlign: 'right' }}>
                            <button className="btn" style={{ background: '#f59e0b', color: 'white', marginRight: '5px', padding: '5px 10px' }} onClick={() => iniciarEdicion(v)}>✏️</button>
                            <button className="btn" style={{ background: '#ef4444', color: 'white', padding: '5px 10px' }} onClick={() => eliminarVehiculo(v.id)}>🗑️</button>
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
        <div style={modalStyle} onClick={() => setMostrarAyudaCat(false)}>
            <div 
                style={{ background: 'white', padding: '30px', borderRadius: '12px', width: '650px', maxWidth: '95%', position: 'relative', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', color: '#333' }} 
                onClick={e => e.stopPropagation()} 
            >
                <button onClick={() => setMostrarAyudaCat(false)} style={{ position:'absolute', top:'15px', right:'15px', background:'none', border:'none', fontSize:'20px', cursor:'pointer', color: '#64748b' }}>✖</button>
                
                <h2 style={{ marginTop: 0, color: '#1e40af', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>
                    📘 Referencia de Categorías (ATAIA)
                </h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
                    
                    <div style={{ padding: '15px', background: '#ecfdf5', borderLeft: '5px solid #10b981', borderRadius: '6px' }}>
                        <h4 style={{ margin: '0 0 8px 0', color: '#065f46', fontSize: '1.1em' }}>VEHÍCULOS CATEGORÍA A</h4>
                        <p style={{ margin: '0 0 5px 0', fontSize: '0.9em', color: '#064e3b' }}>
                            <strong>Tipo de Auto:</strong> Vehículos pequeños a medianos sin equipamiento (Base) con motor nafta o Diesel 8 válvulas.
                        </p>
                        <p style={{ margin: 0, fontSize: '0.9em', color: '#064e3b' }}>
                            <strong>Servicios que abarca:</strong> Reparación y mantenimiento de tren delantero y trasero, amortiguadores, sistema de embragues, sistemas de frenos.
                        </p>
                    </div>

                    <div style={{ padding: '15px', background: '#fffbeb', borderLeft: '5px solid #f59e0b', borderRadius: '6px' }}>
                        <h4 style={{ margin: '0 0 8px 0', color: '#b45309', fontSize: '1.1em' }}>VEHÍCULOS CATEGORÍA B</h4>
                        <p style={{ margin: '0 0 5px 0', fontSize: '0.9em', color: '#78350f' }}>
                            <strong>Tipo de Auto:</strong> Vehículos medianos equipamiento full con motor nafta o Diesel 16v.
                        </p>
                        <p style={{ margin: 0, fontSize: '0.9em', color: '#78350f' }}>
                            <strong>Servicios que abarca:</strong> Reparación y mantenimiento de motores con sus accesorios periféricos, sistema de refrigeración y lubricación, sistemas de transmisión.
                        </p>
                    </div>

                    <div style={{ padding: '15px', background: '#f5f3ff', borderLeft: '5px solid #8b5cf6', borderRadius: '6px' }}>
                        <h4 style={{ margin: '0 0 8px 0', color: '#5b21b6', fontSize: '1.1em' }}>VEHÍCULOS CATEGORÍA C</h4>
                        <p style={{ margin: '0 0 5px 0', fontSize: '0.9em', color: '#4c1d95' }}>
                            <strong>Tipo de Auto:</strong> Vehículos de alta gama y pick up 4x4.
                        </p>
                        <p style={{ margin: 0, fontSize: '0.9em', color: '#4c1d95' }}>
                            <strong>Servicios que abarca:</strong> Diagnóstico, reparación y mantenimiento de sistemas gestión electrónica, sistemas de alimentación de combustible, sistemas de seguridad activa y pasiva, sistemas de confort.
                        </p>
                    </div>

                </div>

                <div style={{ textAlign: 'center', marginTop: '25px' }}>
                    <button className="btn btn-primary" onClick={() => setMostrarAyudaCat(false)} style={{ padding: '10px 30px' }}>¡Entendido!</button>
                </div>
            </div>
        </div>
      )}

    </div>
  )
}

export default Vehiculos