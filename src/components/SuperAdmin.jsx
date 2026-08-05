import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Building2, User, Phone, Mail, Plus, ShieldCheck, Trash2 } from 'lucide-react'
import api from '../api/axiosConfig'
import '../styles/SuperAdmin.css'

function SuperAdmin() {
  const [talleres, setTalleres] = useState([])
  const [cargando, setCargando] = useState(true)

  // Estados para el formulario de nuevo taller
  const [nombre, setNombre] = useState('')
  const [titular, setTitular] = useState('')
  const [telefono, setTelefono] = useState('')
  const [emailContacto, setEmailContacto] = useState('')
  const [password, setPassword] = useState('')
  const [nombreAdmin, setNombreAdmin] = useState('')
  const [apellidoAdmin, setApellidoAdmin] = useState('')

  const [tab, setTab] = useState('talleres');
  const [planes, setPlanes] = useState([]);
  const [cargandoPlanes, setCargandoPlanes] = useState(false);
  const [editandoPlan, setEditandoPlan] = useState(null);
  const [nuevoPrecio, setNuevoPrecio] = useState('');

  useEffect(() => {
    cargarTalleres()
    cargarPlanes()
  }, [])

  const cargarPlanes = () => {
    setCargandoPlanes(true)
    api.get('/admin/planes')
      .then(res => {
        setPlanes(res.data)
        setCargandoPlanes(false)
      })
      .catch(err => {
        // Fallback si no está el endpoint admin, intentamos con el normal
        api.get('/planes')
          .then(res => {
             setPlanes(res.data)
             setCargandoPlanes(false)
          })
          .catch(e => {
             console.error(e)
             toast.error("Error al cargar los planes.")
             setCargandoPlanes(false)
          })
      })
  }

  const guardarPrecioPlan = (id) => {
    const toastId = toast.loading("Actualizando plan...");
    api.put(`/planes/admin/${id}`, { precio: nuevoPrecio })
      .then(() => {
        toast.success("Precio actualizado.", { id: toastId });
        setEditandoPlan(null);
        cargarPlanes();
      })
      .catch(e => {
        console.error(e);
        toast.error("Error al actualizar precio.", { id: toastId });
      });
  }

  const toggleEstadoPlan = (id, estadoActual) => {
    const toastId = toast.loading("Cambiando estado...");
    api.put(`/planes/admin/${id}`, { activo: !estadoActual })
      .then(() => {
        toast.success("Estado del plan actualizado.", { id: toastId });
        cargarPlanes();
      })
      .catch(e => {
        console.error(e);
        toast.error("Error al cambiar estado.", { id: toastId });
      });
  }

  const cargarTalleres = () => {
    setCargando(true)
    api.get('/talleres')
      .then(res => {
        setTalleres(res.data)
        setCargando(false)
      })
      .catch(err => {
        console.error(err)
        toast.error("Error al cargar la lista de clientes (talleres).")
        setCargando(false)
      })
  }

  const registrarTaller = (e) => {
    e.preventDefault()
    
    if (!nombre || !emailContacto || !password) {
        toast.warning("El nombre del taller, el email y la contraseña son obligatorios.")
        return
    }

    const toastId = toast.loading("Registrando nuevo inquilino...")

    const nuevoTaller = {
        nombre,
        titular,
        telefono,
        emailContacto,
        password,
        nombreAdmin,
        apellidoAdmin,
        estadoSuscripcion: 'PRUEBA_GRATUITA'
    }

    api.post('/talleres', nuevoTaller)
    .then(() => {
        toast.success("¡Taller registrado con éxito!", { id: toastId })
        setNombre('')
        setTitular('')
        setTelefono('')
        setEmailContacto('')
        setPassword('')
        setNombreAdmin('')
        setApellidoAdmin('')
        cargarTalleres()
    })
    .catch(() => {
        toast.error("Error al registrar el taller.", { id: toastId })
    })
  }

  const cambiarEstadoSuscripcion = (id, nuevoEstado) => {
    const toastId = toast.loading("Actualizando suscripción...");

    api.patch(`/talleres/${id}/suscripcion?estado=${nuevoEstado}`)
    .then(() => {
        toast.success(`Suscripción cambiada a: ${nuevoEstado.replace('_', ' ')}`, { id: toastId });
        cargarTalleres();
    })
    .catch(() => {
        toast.error("Error al cambiar la suscripción.", { id: toastId });
    });
  }

  const eliminarTaller = (id) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este taller y todos sus accesos? Esta acción no se puede deshacer.")) {
        return;
    }
    const toastId = toast.loading("Eliminando taller...");
    api.delete(`/admin/saas/talleres/${id}`)
    .then(() => {
        toast.success("Taller eliminado con éxito.", { id: toastId });
        cargarTalleres();
    })
    .catch((err) => {
        console.error(err);
        toast.error("Error al eliminar el taller.", { id: toastId });
    });
  }

  const getColorSuscripcion = (estado) => {
      switch(estado) {
          case 'ACTIVA': return { bg: '#dcfce7', text: '#166534' }
          case 'PRUEBA_GRATUITA': return { bg: '#fef3c7', text: '#92400e' }
          case 'VENCIDA': return { bg: '#fee2e2', text: '#991b1b' }
          case 'SUSPENDIDA': return { bg: '#f1f5f9', text: '#475569' }
          default: return { bg: '#f1f5f9', text: '#475569' }
      }
  }

  return (
    <div className="sa-container">
      
      <div className="sa-header">
          <h1 className="sa-title">
              <ShieldCheck size={32} color="#8b5cf6" /> Panel de Super Administrador (SaaS)
          </h1>
          <p className="sa-subtitle">Gestioná tus clientes, altas de talleres y suscripciones al software TuTaller.</p>
      </div>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
          <button 
             onClick={() => setTab('talleres')}
             style={{ padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', border: 'none', fontWeight: 'bold', background: tab === 'talleres' ? '#3b82f6' : '#e2e8f0', color: tab === 'talleres' ? 'white' : '#475569' }}
          >
             Gestión de Inquilinos
          </button>
          <button 
             onClick={() => setTab('planes')}
             style={{ padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', border: 'none', fontWeight: 'bold', background: tab === 'planes' ? '#3b82f6' : '#e2e8f0', color: tab === 'planes' ? 'white' : '#475569' }}
          >
             Gestión de Planes y Precios
          </button>
      </div>

      {tab === 'talleres' && (
      <>
      <div className="sa-card">
          <h3 className="sa-card-title">
              <Building2 size={20} /> Registrar Nuevo Taller Cliente
          </h3>
          <form onSubmit={registrarTaller} className="sa-form">
              <div>
                  <label className="sa-label">Nombre Comercial Taller *</label>
                  <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej: Mecánica Juan" className="sa-input" />
              </div>
              <div>
                  <label className="sa-label">Razón Social / Titular</label>
                  <input type="text" value={titular} onChange={e => setTitular(e.target.value)} placeholder="Ej: Juan Pérez" className="sa-input" />
              </div>
              <div>
                  <label className="sa-label">Teléfono del Taller</label>
                  <input type="text" value={telefono} onChange={e => setTelefono(e.target.value)} placeholder="Ej: 011 15..." className="sa-input" />
              </div>
              <div>
                  <label className="sa-label">Email Admin Taller *</label>
                  <input type="email" value={emailContacto} onChange={e => setEmailContacto(e.target.value)} placeholder="admin@mail.com" className="sa-input" />
              </div>
              <div>
                  <label className="sa-label">Clave de Acceso (Admin) *</label>
                  <input type="text" value={password} onChange={e => setPassword(e.target.value)} placeholder="Clave inicial..." className="sa-input" />
              </div>
              <div>
                  <label className="sa-label">Nombre Admin</label>
                  <input type="text" value={nombreAdmin} onChange={e => setNombreAdmin(e.target.value)} placeholder="Nombre del usuario" className="sa-input" />
              </div>
              <div>
                  <label className="sa-label">Apellido Admin</label>
                  <input type="text" value={apellidoAdmin} onChange={e => setApellidoAdmin(e.target.value)} placeholder="Apellido del usuario" className="sa-input" />
              </div>
              <button type="submit" className="sa-btn-submit">
                  <Plus size={18} /> Crear Taller y Admin
              </button>
          </form>
      </div>

      <div className="sa-card-no-pad">
        {cargando ? (
            <div className="sa-loading">Cargando tus clientes...</div>
        ) : (
            <div className="sa-table-wrapper">
                <table className="sa-table">
                    <thead>
                        <tr className="sa-table-header">
                            <th className="sa-th sa-th-left">ID Tenant</th>
                            <th className="sa-th sa-th-left">Taller</th>
                            <th className="sa-th sa-th-left">Titular</th>
                            <th className="sa-th sa-th-left">Contacto</th>
                            <th className="sa-th sa-th-center">Suscripción</th>
                            <th className="sa-th sa-th-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {talleres.map(t => {
                            const colores = getColorSuscripcion(t.estadoSuscripcion);
                            return (
                            <tr key={t.id} className="sa-tr">
                                <td className="sa-td sa-td-id">#{t.id}</td>
                                <td className="sa-td sa-td-taller">
                                    <div className="sa-flex-center">
                                        <Building2 size={16} color="#64748b" /> {t.nombre}
                                    </div>
                                </td>
                                <td className="sa-td sa-td-titular">
                                    <div className="sa-flex-center">
                                        <User size={16} color="#64748b" /> {t.titular || 'S/D'}
                                    </div>
                                </td>
                                <td className="sa-td sa-td-contacto">
                                    <div className="sa-flex-col">
                                        <span><Phone size={14} style={{verticalAlign: 'middle'}}/> {t.telefono || '-'}</span>
                                        <span><Mail size={14} style={{verticalAlign: 'middle'}}/> {t.emailContacto || '-'}</span>
                                    </div>
                                </td>
                                <td className="sa-td sa-td-center">
                                    <select 
                                        value={t.estadoSuscripcion || 'PRUEBA_GRATUITA'} 
                                        onChange={(e) => cambiarEstadoSuscripcion(t.id, e.target.value)}
                                        className="sa-select"
                                        style={{ 
                                            backgroundColor: colores.bg, color: colores.text, border: `2px solid ${colores.text}`
                                        }}
                                    >
                                        <option value="PRUEBA_GRATUITA">PRUEBA GRATUITA</option>
                                        <option value="ACTIVA">ACTIVA</option>
                                        <option value="SUSPENDIDA">SUSPENDIDA</option>
                                        <option value="VENCIDA">VENCIDA</option>
                                    </select>
                                </td>
                                <td className="sa-td sa-td-center">
                                    <button 
                                        onClick={() => eliminarTaller(t.id)}
                                        className="sa-btn-delete"
                                        title="Eliminar Taller"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        )})}
                        {talleres.length === 0 && (
                            <tr><td colSpan="6" className="sa-td-empty">Todavía no tenés talleres registrados.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        )}
      </div>
      </>
      )}

      {tab === 'planes' && (
      <div className="sa-card-no-pad">
        {cargandoPlanes ? (
            <div className="sa-loading">Cargando planes...</div>
        ) : (
            <div className="sa-table-wrapper">
                <table className="sa-table">
                    <thead>
                        <tr className="sa-table-header">
                            <th className="sa-th sa-th-left">ID</th>
                            <th className="sa-th sa-th-left">Nombre</th>
                            <th className="sa-th sa-th-left">Tipo</th>
                            <th className="sa-th sa-th-left">Frecuencia</th>
                            <th className="sa-th sa-th-center">Precio (ARS)</th>
                            <th className="sa-th sa-th-center">Estado</th>
                            <th className="sa-th sa-th-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {planes.map(p => (
                            <tr key={p.id} className="sa-tr">
                                <td className="sa-td sa-td-id">#{p.id}</td>
                                <td className="sa-td sa-td-taller"><strong>{p.descripcion}</strong></td>
                                <td className="sa-td">{p.tipo}</td>
                                <td className="sa-td">{p.frecuencia}</td>
                                <td className="sa-td sa-td-center">
                                    {editandoPlan === p.id ? (
                                        <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                                            <input 
                                                type="number" 
                                                value={nuevoPrecio} 
                                                onChange={e => setNuevoPrecio(e.target.value)} 
                                                style={{ width: '80px', padding: '5px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                                            />
                                            <button onClick={() => guardarPrecioPlan(p.id)} style={{ background: '#22c55e', color: 'white', border: 'none', borderRadius: '4px', padding: '5px 10px', cursor: 'pointer' }}>✓</button>
                                            <button onClick={() => setEditandoPlan(null)} style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', padding: '5px 10px', cursor: 'pointer' }}>✕</button>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', alignItems: 'center' }}>
                                            <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#0f172a' }}>${p.precio.toLocaleString('es-AR')}</span>
                                            <button onClick={() => { setEditandoPlan(p.id); setNuevoPrecio(p.precio); }} style={{ background: '#f8fafc', color: '#3b82f6', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '2px 8px', cursor: 'pointer', fontSize: '0.8rem' }}>Editar</button>
                                        </div>
                                    )}
                                </td>
                                <td className="sa-td sa-td-center">
                                    <span style={{ background: p.activo ? '#dcfce7' : '#fee2e2', color: p.activo ? '#166534' : '#991b1b', padding: '4px 8px', borderRadius: '12px', fontWeight: 'bold', fontSize: '0.8rem' }}>
                                        {p.activo ? 'ACTIVO' : 'INACTIVO'}
                                    </span>
                                </td>
                                <td className="sa-td sa-td-center">
                                    <button 
                                        onClick={() => toggleEstadoPlan(p.id, p.activo)}
                                        style={{ background: p.activo ? '#f59e0b' : '#10b981', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}
                                    >
                                        {p.activo ? 'Deshabilitar' : 'Habilitar'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
      </div>
      )}

    </div>
  )
}

export default SuperAdmin
