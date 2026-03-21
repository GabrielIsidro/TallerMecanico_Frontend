import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { 
  Users, 
  Search, 
  Edit, 
  Trash2, 
  Plus, 
  CheckCircle,
  Clock3
} from 'lucide-react'

function Clientes({ setSeccionActiva }) {
  const [clientes, setClientes] = useState([])
  const [modoEdicion, setModoEdicion] = useState(false)
  const [idEditar, setIdEditar] = useState(null)
  const [busqueda, setBusqueda] = useState('')

  const [nuevoCliente, setNuevoCliente] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    direccion: '',
    email: ''
  })

  useEffect(() => {
    cargarClientes()
  }, [])

  const cargarClientes = () => {
    fetch('http://localhost:8080/api/clientes')
      .then(res => res.json())
      .then(data => setClientes(data))
      .catch(err => {
        toast.error("Error al conectar con el servidor.");
      })
  }

  const manejarGuardado = () => {
    if(!nuevoCliente.nombre || !nuevoCliente.apellido) {
        toast.warning("Por favor completa Nombre y Apellido");
        return;
    }

    const url = modoEdicion ? `http://localhost:8080/api/clientes/${idEditar}` : 'http://localhost:8080/api/clientes';
    const metodo = modoEdicion ? 'PUT' : 'POST';
    const toastId = toast.loading(modoEdicion ? "Actualizando cliente..." : "Registrando cliente...");

    fetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoCliente)
    })
    .then(async (res) => {
        if (!res.ok) throw new Error("Error del servidor");
        toast.success(modoEdicion ? "Cliente actualizado correctamente." : "Cliente registrado con éxito.", { id: toastId });
        terminarEdicion();
        cargarClientes();
    })
    .catch(err => {
        toast.error("Hubo un error al guardar el cliente.", { id: toastId });
    });
  }

  const iniciarEdicion = (cliente) => {
    setModoEdicion(true);
    setIdEditar(cliente.id);
    setNuevoCliente(cliente)
  }

  const eliminarCliente = (id) => {
    if(!confirm("¿Estás seguro de que deseas borrar este cliente? Se perderán sus datos operativos.")) return;
    
    fetch(`http://localhost:8080/api/clientes/${id}`, { method: 'DELETE' })
    .then((res) => {
        if (!res.ok) throw new Error("Error al borrar");
        toast.success("Cliente eliminado del sistema.");
        cargarClientes();
    })
    .catch(err => {
        toast.error("No se puede borrar. Revisa que no tenga autos o facturas asociadas.");
    })
  }

  const terminarEdicion = () => {
    setModoEdicion(false);
    setIdEditar(null);
    setNuevoCliente({ nombre: '', apellido: '', telefono: '', direccion: '', email: '' });
  }

  const clientesFiltrados = clientes.filter(c => {
      const termino = busqueda.toLowerCase();
      const idString = c.id.toString();
      const nombreCompleto = `${c.nombre} ${c.apellido}`.toLowerCase();
      const telefono = (c.telefono || '').toLowerCase();
      return idString.includes(termino) || nombreCompleto.includes(termino) || telefono.includes(termino);
  });

  const inputStyle = { padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: 'white', color: '#333', width: '100%', boxSizing: 'border-box' }

  return (
    <div style={{ color: '#333' }}>
      <h1 style={{ color: '#1e293b', marginTop: 0 }}>Gestión de Clientes</h1>
      
      <div className="card" style={{ background: modoEdicion ? '#fff7ed' : '#eef2ff', border: modoEdicion ? '2px solid #fdba74' : '1px solid #c7d2fe', padding: '20px' }}>
        <h3 style={{ marginTop: 0, color: modoEdicion ? '#c2410c' : '#1e40af', display: 'flex', alignItems: 'center', gap: '8px' }}>
          {modoEdicion ? <Edit size={20}/> : <Plus size={20}/>}
          {modoEdicion ? 'Actualizar Cliente' : 'Registrar Nuevo Cliente'}
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <div><label style={{fontSize:'0.85em', fontWeight:'bold'}}>Nombre</label><input value={nuevoCliente.nombre} onChange={e => setNuevoCliente({...nuevoCliente, nombre: e.target.value})} style={inputStyle} /></div>
          {/* AQUÍ ESTABA EL ERROR (nuevoAuto -> nuevoCliente) */}
          <div><label style={{fontSize:'0.85em', fontWeight:'bold'}}>Apellido</label><input value={nuevoCliente.apellido} onChange={e => setNuevoCliente({...nuevoCliente, apellido: e.target.value})} style={inputStyle} /></div>
          <div><label style={{fontSize:'0.85em', fontWeight:'bold'}}>Teléfono</label><input placeholder="Ej: 11 1234 5678" value={nuevoCliente.telefono} onChange={e => setNuevoCliente({...nuevoCliente, telefono: e.target.value})} style={inputStyle} /></div>
          <div><label style={{fontSize:'0.85em', fontWeight:'bold'}}>Email</label><input placeholder="Ej: nestor@taller.com" value={nuevoCliente.email} onChange={e => setNuevoCliente({...nuevoCliente, email: e.target.value})} style={inputStyle} /></div>
          <div style={{gridColumn: '1 / -1'}}><label style={{fontSize:'0.85em', fontWeight:'bold'}}>Dirección (Opcional)</label><input value={nuevoCliente.direccion} onChange={e => setNuevoCliente({...nuevoCliente, direccion: e.target.value})} style={inputStyle} /></div>

          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button className="btn" onClick={manejarGuardado} style={{ backgroundColor: modoEdicion ? '#f97316' : '#2563eb', color: 'white', flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                <CheckCircle size={18} color="white"/>
                {modoEdicion ? 'Actualizar Cliente' : 'Guardar Cliente'}
              </button>
              {modoEdicion && <button className="btn" onClick={terminarEdicion} style={{ backgroundColor: '#94a3b8', color: 'white', flex: 1 }}>Cancelar</button>}
          </div>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ margin: 0, color: '#1e40af' }}>👥 Cartera de Clientes</h3>
            
            <div style={{ position: 'relative', width: '300px' }}>
                <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                    type="text" 
                    placeholder="Buscar por ID, nombre o teléfono..." 
                    value={busqueda}
                    onChange={e => setBusqueda(e.target.value)}
                    style={{ ...inputStyle, paddingLeft: '35px', border: '2px solid #3b82f6' }}
                />
            </div>
        </div>

        {clientesFiltrados.length === 0 ? <p style={{textAlign:'center', color:'#888'}}>No se encontraron clientes.</p> : (
            <div style={{overflowX: 'auto'}}>
                <table style={{ width: '100%', minWidth: '950px' }}>
                <thead>
                    <tr style={{ color: '#64748b', borderBottom: '2px solid #eee' }}>
                        <th style={{ textAlign: 'left', padding: '10px', width: '60px' }}>ID</th>
                        <th style={{ textAlign: 'left', padding: '10px' }}>Cliente</th>
                        <th style={{ textAlign: 'left', padding: '10px' }}>Teléfono</th>
                        <th style={{ textAlign: 'left', padding: '10px' }}>Email</th>
                        <th style={{ textAlign: 'left', padding: '10px' }}>Dirección</th>
                        <th style={{ textAlign: 'right', padding: '10px' }}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {clientesFiltrados.map(c => (
                    <tr key={c.id} style={{ borderBottom: '1px solid #eee', color: '#333' }}>
                        <td style={{ padding: '10px', fontWeight: 'bold', color: '#2563eb', fontSize: '1.1em' }}>{c.id}</td>
                        <td style={{ padding: '10px' }}>
                            <strong>👤 {c.nombre} {c.apellido}</strong>
                        </td>
                        <td style={{ padding: '10px' }}>
                            📞 {c.telefono || <span style={{color:'#999'}}>Sin teléfono</span>}
                        </td>
                        <td style={{ padding: '10px' }}>
                            📧 {c.email || <span style={{color:'#999'}}>Sin email</span>}
                        </td>
                        <td style={{ padding: '10px', fontSize: '0.9em', color: '#475569' }}>
                            📍 {c.direccion || '-'}
                        </td>
                        <td style={{ padding: '10px', textAlign: 'right' }}>
                            <button className="btn" style={{ background: '#f59e0b', color: 'white', marginRight: '5px', padding: '6px' }} onClick={() => iniciarEdicion(c)} title="Editar">
                                <Edit size={16} color="white"/>
                            </button>
                            <button className="btn" style={{ background: '#3b82f6', color: 'white', marginRight: '5px', padding: '6px' }} onClick={() => setSeccionActiva && setSeccionActiva('historial')} title="Ver Historial">
                                <Clock3 size={16} color="white"/>
                            </button>
                            <button className="btn" style={{ background: '#ef4444', color: 'white', padding: '6px' }} onClick={() => eliminarCliente(c.id)} title="Borrar">
                                <Trash2 size={16} color="white"/>
                            </button>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
        )}
      </div>
    </div>
  )
}

export default Clientes