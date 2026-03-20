import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { 
  Edit, 
  Trash2, 
  Plus, 
  UploadCloud, 
  HelpCircle, 
  Tag, 
  Info,
  CheckCircle
} from 'lucide-react'

function Servicios() {
  const [servicios, setServicios] = useState([]) 
  const [modoEdicion, setModoEdicion] = useState(false)
  const [idEditar, setIdEditar] = useState(null)
  const [filtroGrupo, setFiltroGrupo] = useState('TODOS')

  const [nuevoServicio, setNuevoServicio] = useState({
    grupo: 'OTROS', descripcion: '', precioA: '', precioB: '', precioC: '' 
  })

  const [archivoCSV, setArchivoCSV] = useState(null)
  const [subiendoArchivo, setSubiendoArchivo] = useState(false)
  const [mostrarAyuda, setMostrarAyuda] = useState(false)

  useEffect(() => {
    cargarServicios() 
  }, [])

  const cargarServicios = () => {
    fetch('http://localhost:8080/api/servicios')
      .then(res => res.json())
      .then(data => setServicios(data))
      .catch(err => console.error(err))
  }

  const manejarGuardado = () => {
    if(!nuevoServicio.descripcion || !nuevoServicio.precioA) {
        toast.warning("Por favor completa la Descripción y al menos el Precio Base");
        return;
    }

    const servicioAEnviar = {
        ...nuevoServicio,
        precioA: parseFloat(nuevoServicio.precioA) || 0,
        precioB: parseFloat(nuevoServicio.precioB) || 0,
        precioC: parseFloat(nuevoServicio.precioC) || 0
    };

    const url = modoEdicion ? `http://localhost:8080/api/servicios/${idEditar}` : 'http://localhost:8080/api/servicios';
    const metodo = modoEdicion ? 'PUT' : 'POST';
    const toastId = toast.loading(modoEdicion ? "Actualizando precio..." : "Guardando servicio...");

    fetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(servicioAEnviar)
    })
    .then(async (res) => {
        if (!res.ok) throw new Error("Error en el servidor");
        toast.success(modoEdicion ? "¡Precio actualizado!" : "¡Servicio agregado al catálogo!", { id: toastId });
        terminarEdicion();
        cargarServicios(); 
    })
    .catch(err => {
        toast.error("Fallo al guardar. Revisa la conexión.", { id: toastId });
    });
  }

  const manejarSubidaMasiva = () => {
    if (!archivoCSV) {
      toast.warning("Por favor, selecciona un archivo CSV primero.");
      return;
    }

    setSubiendoArchivo(true);
    const toastId = toast.loading("Procesando archivo CSV...");

    const formData = new FormData();
    formData.append("file", archivoCSV); 

    fetch('http://localhost:8080/api/servicios/importar', { 
      method: 'POST',
      body: formData
    })
    .then(async (res) => {
        if (!res.ok) throw new Error("Error procesando archivo");
        toast.success("¡Carga masiva completada con éxito!", { id: toastId });
        setArchivoCSV(null); 
        document.getElementById('input-csv').value = ''; 
        cargarServicios(); 
    })
    .catch(err => {
        toast.error("Error en la carga masiva. Revisa el formato del archivo.", { id: toastId });
    })
    .finally(() => {
        setSubiendoArchivo(false);
    });
  }

  const iniciarEdicion = (servicio) => {
    setModoEdicion(true);
    setIdEditar(servicio.id);
    setNuevoServicio({
        grupo: servicio.grupo || 'OTROS', 
        descripcion: servicio.descripcion,
        precioA: servicio.precioA || 0,
        precioB: servicio.precioB || 0,
        precioC: servicio.precioC || 0
    })
  }

  const eliminarServicio = (id) => {
    if(!confirm("¿Estás seguro de borrar este servicio del catálogo?")) return;
    fetch(`http://localhost:8080/api/servicios/${id}`, { method: 'DELETE' })
    .then(() => {
        toast.success("Servicio eliminado.");
        cargarServicios();
    })
  }

  const terminarEdicion = () => {
    setModoEdicion(false);
    setIdEditar(null);
    setNuevoServicio({ grupo: 'OTROS', descripcion: '', precioA: '', precioB: '', precioC: '' });
  }
  
  const gruposDisponibles = ['TODOS', ...new Set(servicios.map(s => s.grupo).filter(Boolean))];
  const serviciosFiltrados = filtroGrupo === 'TODOS' ? servicios : servicios.filter(s => s.grupo === filtroGrupo);

  const inputStyle = { padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: 'white', color: '#333', width: '100%', boxSizing: 'border-box' }
  const modalStyle = { position: 'fixed', top: '0', left: '0', width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }

  return (
    <div style={{ color: '#333' }}>
      <h1 style={{ color: '#1e293b', marginTop: 0 }}>Catálogo de Servicios y Precios</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '20px' }}>
        
        <div className="card" style={{ background: modoEdicion ? '#fff7ed' : '#eef2ff', border: modoEdicion ? '2px solid #fdba74' : '1px solid #c7d2fe', padding: '20px', margin: 0 }}>
          <h3 style={{ marginTop: 0, color: modoEdicion ? '#c2410c' : '#1e40af', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {modoEdicion ? <Edit size={20}/> : <Plus size={20}/>}
            {modoEdicion ? 'Actualizar Precio' : 'Carga Manual (1x1)'}
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr 1fr 1fr 1fr', gap: '15px' }}>
            <div style={{gridColumn: '1 / 3'}}><label style={{fontSize:'0.85em', fontWeight:'bold'}}>Categoría</label><input value={nuevoServicio.grupo} onChange={e => setNuevoServicio({...nuevoServicio, grupo: e.target.value.toUpperCase()})} style={inputStyle} /></div>
            <div style={{gridColumn: '1 / 6'}}><label style={{fontSize:'0.85em', fontWeight:'bold'}}>Descripción del Trabajo</label><input placeholder="Ej: Cambio de pastillas" value={nuevoServicio.descripcion} onChange={e => setNuevoServicio({...nuevoServicio, descripcion: e.target.value})} style={inputStyle} /></div>
            <div><label style={{fontSize:'0.85em', fontWeight:'bold', color: '#166534'}}>Precio A</label><input type="number" value={nuevoServicio.precioA} onChange={e => setNuevoServicio({...nuevoServicio, precioA: e.target.value})} style={{...inputStyle, border: '2px solid #bbf7d0'}} /></div>
            <div><label style={{fontSize:'0.85em', fontWeight:'bold', color: '#b45309'}}>Precio B</label><input type="number" value={nuevoServicio.precioB} onChange={e => setNuevoServicio({...nuevoServicio, precioB: e.target.value})} style={{...inputStyle, border: '2px solid #fde047'}} /></div>
            <div><label style={{fontSize:'0.85em', fontWeight:'bold', color: '#6b21a8'}}>Precio C</label><input type="number" value={nuevoServicio.precioC} onChange={e => setNuevoServicio({...nuevoServicio, precioC: e.target.value})} style={{...inputStyle, border: '2px solid #d8b4fe'}} /></div>

            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button className="btn" onClick={manejarGuardado} style={{ backgroundColor: modoEdicion ? '#f97316' : '#2563eb', color: 'white', flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle size={18}/> {modoEdicion ? 'Guardar Cambios' : 'Agregar al Catálogo'}
                </button>
                {modoEdicion && <button className="btn" onClick={terminarEdicion} style={{ backgroundColor: '#94a3b8', color: 'white', flex: 1 }}>Cancelar</button>}
            </div>
          </div>
        </div>

        <div className="card" style={{ border: '2px dashed #94a3b8', background: '#f8fafc', padding: '20px', margin: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' }}>
          <button 
            onClick={() => setMostrarAyuda(true)}
            style={{ position: 'absolute', top: '15px', right: '15px', background: '#e2e8f0', color: '#334155', border: 'none', borderRadius: '20px', padding: '5px 10px', fontSize: '0.8em', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
          >
            <HelpCircle size={14}/> Ayuda
          </button>

          <h3 style={{ marginTop: 0, color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UploadCloud size={22}/> Carga Masiva
          </h3>
          <p style={{ fontSize: '0.85em', color: '#64748b', marginBottom: '15px' }}>
            Sube tu planilla de precios actualizada en formato <strong>.CSV</strong>
          </p>
          
          <input type="file" id="input-csv" accept=".csv" onChange={(e) => setArchivoCSV(e.target.files[0])} style={{ marginBottom: '15px', fontSize: '0.9em' }} />
          
          <button 
            className="btn" 
            onClick={manejarSubidaMasiva} 
            disabled={subiendoArchivo || !archivoCSV}
            style={{ backgroundColor: archivoCSV ? '#10b981' : '#cbd5e1', color: 'white', width: '100%', cursor: archivoCSV ? 'pointer' : 'not-allowed', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
          >
            <UploadCloud size={18}/> {subiendoArchivo ? 'Procesando...' : 'Subir y Actualizar'}
          </button>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Tag size={20} color="#3b82f6"/> Lista de Precios
            </h3>
            <select value={filtroGrupo} onChange={(e) => setFiltroGrupo(e.target.value)} style={{ padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                {gruposDisponibles.map((grupo, idx) => <option key={idx} value={grupo}>{grupo}</option>)}
            </select>
        </div>

        {serviciosFiltrados.length === 0 ? <p style={{textAlign:'center', color:'#888'}}>No hay servicios en esta categoría.</p> : (
            <div style={{overflowX: 'auto', maxHeight: '500px', overflowY: 'auto'}}>
                <table style={{ width: '100%', minWidth: '850px' }}>
                <thead style={{ position: 'sticky', top: 0, background: 'white', zIndex: 1 }}>
                    <tr style={{ color: '#64748b', borderBottom: '2px solid #eee' }}>
                        <th style={{ textAlign: 'left', padding: '10px' }}>Categoría</th>
                        <th style={{ textAlign: 'left', padding: '10px' }}>Descripción</th>
                        <th style={{ textAlign: 'right', padding: '10px' }}>Precio A</th>
                        <th style={{ textAlign: 'right', padding: '10px' }}>Precio B</th>
                        <th style={{ textAlign: 'right', padding: '10px' }}>Precio C</th>
                        <th style={{ textAlign: 'right', padding: '10px' }}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {serviciosFiltrados.map(s => (
                    <tr key={s.id} style={{ borderBottom: '1px solid #eee', color: '#333' }}>
                        <td style={{ padding: '10px' }}><span style={{ fontWeight:'bold', color:'#3b82f6', fontSize:'0.85em' }}>{s.grupo}</span></td>
                        <td style={{ padding: '10px' }}>{s.descripcion}</td>
                        <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold', color: '#166534' }}>${s.precioA ? s.precioA.toLocaleString() : '0'}</td>
                        <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold', color: '#b45309' }}>${s.precioB ? s.precioB.toLocaleString() : '0'}</td>
                        <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold', color: '#6b21a8' }}>${s.precioC ? s.precioC.toLocaleString() : '0'}</td>
                        <td style={{ padding: '10px', textAlign: 'right' }}>
                            <button className="btn" style={{ background: '#f59e0b', color: 'white', marginRight: '5px', padding: '6px' }} onClick={() => iniciarEdicion(s)}><Edit size={16}/></button>
                            <button className="btn" style={{ background: '#ef4444', color: 'white', padding: '6px' }} onClick={() => eliminarServicio(s.id)}><Trash2 size={16}/></button>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
        )}
      </div>

      {mostrarAyuda && (
        <div style={modalStyle} onClick={() => setMostrarAyuda(false)}>
            <div style={{ background: 'white', padding: '30px', borderRadius: '12px', width: '600px', maxWidth: '95%', position: 'relative', color: '#333' }} onClick={e => e.stopPropagation()}>
                <button onClick={() => setMostrarAyuda(false)} style={{ position:'absolute', top:'15px', right:'15px', background:'none', border:'none', fontSize:'20px', cursor:'pointer' }}>✖</button>
                <h2 style={{ marginTop: 0, color: '#1e40af', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Info size={24}/> ¿Cómo armar el archivo?
                </h2>
                <p>Armá una tabla en Excel con exactamente 5 columnas en la primera fila:</p>
                <code style={{ background: '#f1f5f9', padding: '5px', borderRadius: '4px', color: '#c2410c', fontWeight: 'bold', display: 'block', textAlign: 'center', marginBottom: '15px' }}>Grupo | Descripcion | PrecioA | PrecioB | PrecioC</code>
                <p>Luego guardalo como <strong>CSV (delimitado por comas)</strong> y subilo.</p>
                <div style={{ textAlign: 'center', marginTop: '25px' }}>
                    <button className="btn btn-primary" onClick={() => setMostrarAyuda(false)}>¡Entendido!</button>
                </div>
            </div>
        </div>
      )}
    </div>
  )
}

export default Servicios