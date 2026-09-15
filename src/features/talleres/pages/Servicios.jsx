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
import { getClientes, createCliente, updateCliente, deleteCliente, getVehiculos, createVehiculo, updateVehiculo, deleteVehiculo, getServicios, createServicio, updateServicio, deleteServicio, importServicios, getOrdenes, createOrden, updateOrden, updateEstadoOrden, updatePagoOrden, getOrdenPdf, getRepuestos, createRepuesto, updateRepuesto, deleteRepuesto, getEquipo, createMiembroEquipo, deleteMiembroEquipo, getMiPerfil, updateMiPerfil } from '../api/talleresApi';


function Servicios() {
  const [servicios, setServicios] = useState([])
  const [modoEdicion, setModoEdicion] = useState(false)
  const [idEditar, setIdEditar] = useState(null)
  const [filtroGrupo, setFiltroGrupo] = useState('TODOS')

  const [nuevoServicio, setNuevoServicio] = useState({
    grupo: 'OTROS', descripcion: '', precioSugerido: ''
  })

  const [archivoCSV, setArchivoCSV] = useState(null)
  const [subiendoArchivo, setSubiendoArchivo] = useState(false)
  const [mostrarAyuda, setMostrarAyuda] = useState(false)

  useEffect(() => {
    cargarServicios()
  }, [])

  const cargarServicios = () => {
    getServicios()
      .then(res => setServicios(res.data))
      .catch(err => console.error(err))
  }

  const manejarGuardado = () => {
    if (!nuevoServicio.descripcion || !nuevoServicio.precioSugerido) {
      toast.warning("Por favor completa la Descripción y el Precio Sugerido");
      return;
    }

    const servicioAEnviar = {
      ...nuevoServicio,
      precioSugerido: parseFloat(nuevoServicio.precioSugerido) || 0
    };

    const url = modoEdicion ? `/servicios/${idEditar}` : '/servicios';
    const request = modoEdicion ? updateServicio(modoEdicion ? idEditando : null, servicioAEnviar) : createServicio(servicioAEnviar);
    const toastId = toast.loading(modoEdicion ? "Actualizando precio..." : "Guardando servicio...");

    request
      .then(() => {
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

    importServicios(formData)
      .then(() => {
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
      precioSugerido: servicio.precioSugerido || 0
    })
  }

  const eliminarServicio = (id) => {
    if (!confirm("¿Estás seguro de borrar este servicio del catálogo?")) return;

    deleteServicio(id)
      .then(() => {
        toast.success("Servicio eliminado.");
        cargarServicios();
      })
  }

  const terminarEdicion = () => {
    setModoEdicion(false);
    setIdEditar(null);
    setNuevoServicio({ grupo: 'OTROS', descripcion: '', precioSugerido: '' });
  }

  const gruposDisponibles = ['TODOS', ...new Set(servicios.map(s => s.grupo).filter(Boolean))];
  const serviciosFiltrados = filtroGrupo === 'TODOS' ? servicios : servicios.filter(s => s.grupo === filtroGrupo);

  return (
    <div className="tb-container">
      <div className="tb-header">
        <h1 className="tb-title" style={{ fontSize: '1.8em' }}>
          <div style={{ background: '#f5f3ff', padding: '10px', borderRadius: '10px', display: 'flex' }}>
            <Tag size={26} color="#8b5cf6" />
          </div>
          Catálogo de Servicios y Precios
        </h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '20px' }}>

        <div className="tb-card" style={{ background: modoEdicion ? '#fff7ed' : '#ffffff', border: modoEdicion ? '2px solid #fdba74' : '1px solid #e2e8f0', padding: '20px', margin: 0 }}>
          <h3 className="tb-title" style={{ color: modoEdicion ? '#c2410c' : '#1e40af', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', marginBottom: '20px', fontSize: '1.2em' }}>
            {modoEdicion ? <Edit size={20} /> : <Plus size={20} />}
            {modoEdicion ? 'Actualizar Precio' : 'Carga Manual (1x1)'}
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr 1fr 1fr 1fr', gap: '15px' }}>
            <div style={{ gridColumn: '1 / 3' }}><label className="tb-label">Categoría</label><input value={nuevoServicio.grupo} onChange={e => setNuevoServicio({ ...nuevoServicio, grupo: e.target.value.toUpperCase() })} className="tb-input" /></div>
            <div style={{ gridColumn: '1 / 6' }}><label className="tb-label">Descripción del Trabajo</label><input placeholder="Ej: Cambio de pastillas" value={nuevoServicio.descripcion} onChange={e => setNuevoServicio({ ...nuevoServicio, descripcion: e.target.value })} className="tb-input" /></div>
            <div><label className="tb-label" style={{ color: '#166534' }}>Precio Sug. ($)</label><input type="number" value={nuevoServicio.precioSugerido} onChange={e => setNuevoServicio({ ...nuevoServicio, precioSugerido: e.target.value })} className="tb-input" style={{ border: '2px solid #bbf7d0' }} /></div>

            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button onClick={manejarGuardado} className="tb-btn-save" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', backgroundColor: modoEdicion ? '#f97316' : '#2563eb' }}>
                <CheckCircle size={18} /> {modoEdicion ? 'Guardar Cambios' : 'Agregar al Catálogo'}
              </button>
              {modoEdicion && <button onClick={terminarEdicion} className="tb-btn-cancel" style={{ flex: 1 }}>Cancelar</button>}
            </div>
          </div>
        </div>

        <div className="tb-card" style={{ border: '2px dashed #94a3b8', background: '#f8fafc', padding: '20px', margin: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' }}>
          <button
            onClick={() => setMostrarAyuda(true)}
            style={{ position: 'absolute', top: '15px', right: '15px', background: '#e2e8f0', color: '#334155', border: 'none', borderRadius: '20px', padding: '5px 10px', fontSize: '0.8em', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
          >
            <HelpCircle size={14} /> Ayuda
          </button>

          <h3 className="tb-title" style={{ color: '#334155' }}>
            <UploadCloud size={22} /> Carga Masiva
          </h3>
          <p className="tb-subtitle" style={{ fontSize: '0.85em', marginBottom: '15px' }}>
            Sube tu planilla de precios actualizada en formato <strong>.CSV</strong>
          </p>

          <input type="file" id="input-csv" accept=".csv" onChange={(e) => setArchivoCSV(e.target.files[0])} style={{ marginBottom: '15px', fontSize: '0.9em' }} />

          <button
            onClick={manejarSubidaMasiva}
            disabled={subiendoArchivo || !archivoCSV}
            className="tb-btn-save"
            style={{ backgroundColor: archivoCSV ? '#10b981' : '#cbd5e1', width: '100%', cursor: archivoCSV ? 'pointer' : 'not-allowed', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
          >
            <UploadCloud size={18} /> {subiendoArchivo ? 'Procesando...' : 'Subir y Actualizar'}
          </button>
        </div>
      </div>

      <div className="tb-card" style={{ padding: '25px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 className="tb-title" style={{ fontSize: '1.2em' }}>
            <Tag size={20} color="#3b82f6" /> Lista de Precios
          </h3>
          <select value={filtroGrupo} onChange={(e) => setFiltroGrupo(e.target.value)} className="tb-select" style={{ width: 'auto', padding: '8px' }}>
            {gruposDisponibles.map((grupo, idx) => <option key={idx} value={grupo}>{grupo}</option>)}
          </select>
        </div>

        {serviciosFiltrados.length === 0 ? <p className="tb-loading">No hay servicios en esta categoría.</p> : (
          <div className="tb-table-wrapper" style={{ maxHeight: '500px', overflowY: 'auto' }}>
            <table className="tb-table">
              <thead className="tb-thead" style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                <tr>
                  <th className="tb-th">Categoría</th>
                  <th className="tb-th">Descripción</th>
                  <th className="tb-th" style={{ textAlign: 'right' }}>Precio Sugerido</th>
                  <th className="tb-th" style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {serviciosFiltrados.map(s => (
                  <tr key={s.id} className="tb-tr">
                    <td className="tb-td"><span style={{ fontWeight: 'bold', color: '#3b82f6', fontSize: '0.85em' }}>{s.grupo}</span></td>
                    <td className="tb-td">{s.descripcion}</td>
                    <td className="tb-td" style={{ textAlign: 'right', fontWeight: 'bold', color: '#166534' }}>${s.precioSugerido ? s.precioSugerido.toLocaleString() : '0'}</td>
                    <td className="tb-td" style={{ textAlign: 'right' }}>
                      <div className="tb-actions" style={{ justifyContent: 'flex-end' }}>
                        <button className="tb-btn-icon" style={{ background: '#f59e0b', color: 'white' }} onClick={() => iniciarEdicion(s)}><Edit size={16} /></button>
                        <button className="tb-btn-icon tb-btn-delete" style={{ background: '#ef4444', color: 'white' }} onClick={() => eliminarServicio(s.id)}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {mostrarAyuda && (
        <div className="tb-modal-overlay" onClick={() => setMostrarAyuda(false)}>
          <div className="tb-modal-content" onClick={e => e.stopPropagation()} style={{ width: '600px', maxWidth: '95%', position: 'relative' }}>
            <button onClick={() => setMostrarAyuda(false)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✖</button>
            <h2 className="tb-modal-header" style={{ color: '#1e40af', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>
              <Info size={24} /> ¿Cómo armar el archivo?
            </h2>
            <p>Armá una tabla en Excel con exactamente 3 columnas en la primera fila:</p>
            <code style={{ background: '#f1f5f9', padding: '5px', borderRadius: '4px', color: '#c2410c', fontWeight: 'bold', display: 'block', textAlign: 'center', marginBottom: '15px' }}>Grupo | Descripcion | PrecioSugerido</code>
            <p>Luego guardalo como <strong>CSV (delimitado por comas)</strong> y subilo.</p>
            <div className="tb-modal-actions" style={{ justifyContent: 'center', marginTop: '25px' }}>
              <button className="tb-btn-save" onClick={() => setMostrarAyuda(false)} style={{ background: '#3b82f6' }}>¡Entendido!</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Servicios
