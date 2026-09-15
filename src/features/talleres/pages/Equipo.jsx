import { useState, useEffect } from 'react';
import { Users, Plus, UserX, UserPlus, Shield, Wrench } from 'lucide-react';
import { toast } from 'sonner';
import { getClientes, createCliente, updateCliente, deleteCliente, getVehiculos, createVehiculo, updateVehiculo, deleteVehiculo, getServicios, createServicio, updateServicio, deleteServicio, importServicios, getOrdenes, createOrden, updateOrden, updateEstadoOrden, updatePagoOrden, getOrdenPdf, getRepuestos, createRepuesto, updateRepuesto, deleteRepuesto, getEquipo, createMiembroEquipo, deleteMiembroEquipo, getMiPerfil, updateMiPerfil } from '../api/talleresApi';
import { useAuth } from '../../../context/AuthContext';


const Equipo = () => {
  const { isMecanico } = useAuth();
  const [equipo, setEquipo] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  // Formulario
  const [mostrarForm, setMostrarForm] = useState(false);
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    cargarEquipo();
  }, []);

  const cargarEquipo = async () => {
    try {
      setCargando(true);
      const res = await getEquipo();
      setEquipo(res.data);
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar el equipo de mec�nicos');
    } finally {
      setCargando(false);
    }
  };

  const agregarMecanico = async (e) => {
    e.preventDefault();
    if (!nombre || !email || !password) {
      toast.warning('Complet� los campos obligatorios');
      return;
    }

    const toastId = toast.loading('Registrando mec�nico...');
    try {
      await createMiembroEquipo({ nombre, apellido, email, password });
      toast.success('Mec�nico agregado correctamente', { id: toastId });
      setNombre('');
      setApellido('');
      setEmail('');
      setPassword('');
      setMostrarForm(false);
      cargarEquipo();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data || 'Error al agregar mec�nico', { id: toastId });
    }
  };

  const eliminarMecanico = async (id, nombreMecanico) => {
    if (!window.confirm(`�Seguro que quer�s dar de baja a ${nombreMecanico}? Perder� el acceso al sistema.`)) return;

    const toastId = toast.loading('Eliminando...');
    try {
      await deleteMiembroEquipo(id);
      toast.success('Mec�nico eliminado', { id: toastId });
      cargarEquipo();
    } catch (error) {
      console.error(error);
      toast.error('Error al eliminar mec�nico', { id: toastId });
    }
  };

  if (isMecanico()) {
    return <div style={{ padding: '30px', textAlign: 'center', color: '#ef4444' }}>No ten�s permisos para ver esta secci�n.</div>;
  }

  if (cargando) return <div className="tb-loading" style={{ padding: '30px' }}>Cargando equipo...</div>;

  return (
    <div className="tb-container" style={{ padding: '30px', maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* HEADER */}
      <div className="tb-header" style={{ marginBottom: '30px' }}>
        <div>
          <h1 className="tb-title" style={{ fontSize: '2.5rem' }}>
            <Users size={40} color="#8b5cf6" /> Mi Equipo
          </h1>
          <p className="tb-subtitle" style={{ fontSize: '1.1rem' }}>Administr� los accesos de tus mec�nicos y empleados.</p>
        </div>
        <button 
          onClick={() => setMostrarForm(!mostrarForm)}
          className="tb-btn-add"
          style={{ padding: '12px 24px', borderRadius: '12px', background: mostrarForm ? '#64748b' : '#8b5cf6' }}
        >
          {mostrarForm ? 'Cancelar' : <><UserPlus size={20} /> Nuevo Mec�nico</>}
        </button>
      </div>

      {/* FORMULARIO */}
      {mostrarForm && (
        <div className="tb-card" style={{ padding: '30px', borderRadius: '20px', marginBottom: '30px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
          <h2 style={{ margin: '0 0 20px 0', color: '#1e293b' }}>Crear Cuenta de Mec�nico</h2>
          <p className="tb-subtitle" style={{ marginBottom: '20px' }}>
            Los mec�nicos solo pueden ver los veh�culos, clientes y gestionar el estado de las �rdenes de trabajo. No tienen acceso a facturaci�n ni configuraciones.
          </p>
          <form onSubmit={agregarMecanico} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', alignItems: 'end' }}>
            <div>
              <label className="tb-label">Nombre *</label>
              <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} className="tb-input" placeholder="Carlos" required />
            </div>
            <div>
              <label className="tb-label">Apellido</label>
              <input type="text" value={apellido} onChange={e => setApellido(e.target.value)} className="tb-input" placeholder="L�pez" />
            </div>
            <div>
              <label className="tb-label">Email (Usuario) *</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="tb-input" placeholder="carlos@taller.com" required />
            </div>
            <div>
              <label className="tb-label">Contrase�a *</label>
              <input type="text" value={password} onChange={e => setPassword(e.target.value)} className="tb-input" placeholder="clave123" required />
            </div>
            <button type="submit" className="tb-btn-save" style={{ background: '#8b5cf6', height: '46px' }}>
              Registrar Mec�nico
            </button>
          </form>
        </div>
      )}

      {/* LISTA DE MEC�NICOS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        
        {/* Tarjeta del Due�o (Informativa) */}
        <div className="tb-card" style={{ padding: '25px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '20px', background: '#f8fafc' }}>
          <div style={{ background: '#e0e7ff', padding: '15px', borderRadius: '15px' }}>
            <Shield size={30} color="#4f46e5" />
          </div>
          <div>
            <h3 style={{ margin: '0 0 5px 0', color: '#1e293b' }}>Due�o / Admin</h3>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.9em' }}>Tiene acceso total al sistema.</p>
          </div>
        </div>

        {equipo.map(m => (
          <div key={m.id} className="tb-card" style={{ padding: '25px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ background: '#fef3c7', padding: '15px', borderRadius: '15px' }}>
                <Wrench size={30} color="#d97706" />
              </div>
              <div>
                <h3 style={{ margin: '0 0 5px 0', color: '#1e293b' }}>{m.nombre} {m.apellido}</h3>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.9em' }}>{m.email}</p>
                <span className="tb-badge" style={{ marginTop: '5px', background: '#f1f5f9', color: '#475569' }}>
                  MEC�NICO
                </span>
              </div>
            </div>
            <button 
              onClick={() => eliminarMecanico(m.id, m.nombre)}
              className="tb-btn-icon tb-btn-delete"
              style={{ padding: '10px', borderRadius: '10px' }}
              title="Eliminar Acceso"
            >
              <UserX size={20} />
            </button>
          </div>
        ))}

        {equipo.length === 0 && (
          <div className="tb-loading" style={{ gridColumn: '1 / -1', padding: '40px', background: 'white', borderRadius: '20px' }}>
            Todav�a no ten�s mec�nicos registrados en tu equipo.
          </div>
        )}

      </div>
    </div>
  );
};

export default Equipo;
