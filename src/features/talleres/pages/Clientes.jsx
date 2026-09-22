import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { User, Building2, Phone, Mail, MapPin, IdCard, Trash2, Edit, PlusCircle, Search, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import { getClientes, createCliente, updateCliente, deleteCliente } from '../api/talleresApi';
import { handleApiError } from '../../../utils/errorHandler';
import { useAuth } from '../../../context/AuthContext';

function Clientes() {
  const { userProfile, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const esSoloLectura = !isSuperAdmin() && (userProfile?.estadoSuscripcion === 'VENCIDA' || userProfile?.estadoSuscripcion === 'SUSPENDIDA');

  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  // Estados de paginación
  const [paginaActual, setPaginaActual] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [totalElementos, setTotalElementos] = useState(0);
  const size = 10;
  
  // Estados del formulario
  const [idEditando, setIdEditando] = useState(null);
  const [nombreCliente, setNombreCliente] = useState('');
  const [esEmpresa, setEsEmpresa] = useState(false);
  const [documentoCuit, setDocumentoCuit] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [direccion, setDireccion] = useState('');

  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [busquedaAplicada, setBusquedaAplicada] = useState('');

  useEffect(() => {
    cargarClientes(paginaActual, size, busquedaAplicada);
  }, [paginaActual, busquedaAplicada]);

  // Si cambia la búsqueda aplicada, reiniciamos a la página 0
  const aplicarBusqueda = () => {
    setPaginaActual(0);
    setBusquedaAplicada(terminoBusqueda);
  };

  const handleKeyDownBusqueda = (e) => {
    if (e.key === 'Enter') {
      aplicarBusqueda();
    }
  };

  const cargarClientes = async (page = 0, size = 10, search = '') => {
    try {
      setCargando(true);
      const response = await getClientes(page, size, search);
      setClientes(response.data.content || []);
      setTotalPaginas(response.data.totalPages || 0);
      setTotalElementos(response.data.totalElements || 0);
    } catch (error) {
      handleApiError(error, "Error al cargar los clientes");
    } finally {
      setCargando(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (esSoloLectura) {
      toast.warning("Tu suscripción ha vencido (Modo Solo Lectura). Regularizá tu plan para guardar clientes.", { duration: 4000 });
      return;
    }
    if (!nombreCliente.trim()) {
      toast.warning("El Nombre o Razón Social es obligatorio.");
      return;
    }

    const clienteData = { nombreCliente, esEmpresa, documentoCuit, telefono, email, direccion };
    try {
      if (idEditando) {
        await updateCliente(idEditando, clienteData);
      } else {
        await createCliente(clienteData);
      }
      
      toast.success(`Cliente ${idEditando ? 'actualizado' : 'guardado'} con éxito`);
      cargarClientes(paginaActual, size, busquedaAplicada);
      limpiarFormulario();
    } catch (error) {
      handleApiError(error, "Error al guardar el cliente");
    }
  };

  const eliminarCliente = async (id) => {
    if (esSoloLectura) {
      toast.warning("Tu suscripción ha vencido (Modo Solo Lectura). No podés eliminar clientes.", { duration: 4000 });
      return;
    }
    if (!window.confirm("¿Estás seguro de eliminar este cliente?")) return;
    
    try {
      await deleteCliente(id);
      toast.success("Cliente eliminado");
      cargarClientes(paginaActual, size, busquedaAplicada);
    } catch (error) {
      handleApiError(error, "No se pudo eliminar el cliente (puede tener órdenes asociadas)");
    }
  };

  const editarCliente = (cliente) => {
    if (esSoloLectura) {
      toast.warning("Tu suscripción ha vencido (Modo Solo Lectura). Regularizá tu plan para editar clientes.", { duration: 4000 });
      return;
    }
    setIdEditando(cliente.id);
    setNombreCliente(cliente.nombreCliente || '');
    setEsEmpresa(cliente.esEmpresa || false);
    setDocumentoCuit(cliente.documentoCuit || '');
    setTelefono(cliente.telefono || '');
    setEmail(cliente.email || '');
    setDireccion(cliente.direccion || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const limpiarFormulario = () => {
    setIdEditando(null);
    setNombreCliente('');
    setEsEmpresa(false);
    setDocumentoCuit('');
    setTelefono('');
    setEmail('');
    setDireccion('');
  };

  return (
    <div className="tb-container" style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      
      <div className="tb-header">
        <h1 className="tb-title" style={{ fontSize: '1.8em' }}>
          <div style={{ background: '#dbeafe', padding: '10px', borderRadius: '10px', display: 'flex' }}>
            <User size={26} color="#3b82f6" />
          </div>
          Gestión de Clientes
        </h1>
      </div>

      {/* BANNER SOLO LECTURA SI CORRESPONDE */}
      {esSoloLectura && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fca5a5',
          color: '#b91c1c',
          padding: '12px 18px',
          borderRadius: '10px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertTriangle size={20} />
            <span><strong>Modo Solo Lectura:</strong> Tu suscripción ha vencido. Podés consultar los clientes pero no crear ni editarlos.</span>
          </div>
          <button 
            onClick={() => navigate('/suscripcion')}
            style={{
              background: '#ef4444',
              color: 'white',
              border: 'none',
              padding: '6px 14px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Regularizar Plan
          </button>
        </div>
      )}

      {/* FORMULARIO */}
      <div className="tb-card" style={{ padding: '25px', marginBottom: '30px' }}>
        <h3 className="tb-title" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', fontSize: '1.2em' }}>
          {idEditando ? <Edit size={18} /> : <PlusCircle size={18} />}
          {idEditando ? 'Editar Cliente' : 'Nuevo Cliente'}
        </h3>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '15px', alignItems: 'center' }}>
            
            <div 
              onClick={() => setEsEmpresa(!esEmpresa)}
              style={{ 
                background: esEmpresa ? '#eff6ff' : '#f8fafc', 
                padding: '15px', borderRadius: '8px', 
                border: `1px solid ${esEmpresa ? '#bfdbfe' : '#e2e8f0'}`, 
                display: 'flex', alignItems: 'center', gap: '10px', 
                cursor: 'pointer', transition: 'all 0.2s' 
              }}
            >
              <input type="checkbox" checked={esEmpresa} readOnly style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontWeight: 'bold', color: '#334155', fontSize: '0.95em' }}>Es una Empresa</span>
                <span style={{ fontSize: '0.8em', color: '#64748b' }}>Habilitar CUIT y Razón Social</span>
              </div>
            </div>

            <div style={{ position: 'relative' }}>
              <label className="tb-label">
                {esEmpresa ? 'Razón Social' : 'Nombre y Apellido'}
              </label>
              {esEmpresa ? <Building2 size={16} className="tb-filter-icon" /> : <User size={16} className="tb-filter-icon" />}
              <input 
                type="text" 
                value={nombreCliente} 
                onChange={(e) => setNombreCliente(e.target.value)} 
                className="tb-input" 
                style={{ paddingLeft: '35px' }}
                required 
                placeholder={esEmpresa ? "Ej: Logística Los Hermanos S.R.L." : "Ej: Juan Pérez"} 
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <div style={{ position: 'relative' }}>
              <label className="tb-label">{esEmpresa ? 'CUIT' : 'DNI'}</label>
              <IdCard size={16} className="tb-filter-icon" />
              <input 
                type="text" 
                value={documentoCuit} 
                onChange={(e) => setDocumentoCuit(e.target.value)} 
                className="tb-input" 
                style={{ paddingLeft: '35px' }}
                placeholder={esEmpresa ? "30-12345678-9" : "12.345.678"} 
              />
            </div>
            
            <div style={{ position: 'relative' }}>
              <label className="tb-label">Teléfono</label>
              <Phone size={16} className="tb-filter-icon" />
              <input 
                type="text" 
                value={telefono} 
                onChange={(e) => setTelefono(e.target.value)} 
                className="tb-input" 
                style={{ paddingLeft: '35px' }}
                placeholder="11 1234-5678" 
              />
            </div>

            <div style={{ position: 'relative' }}>
              <label className="tb-label">Email</label>
              <Mail size={16} className="tb-filter-icon" />
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="tb-input"
                style={{ paddingLeft: '35px' }} 
                placeholder="correo@ejemplo.com" 
              />
            </div>
          </div>

          <div style={{ position: 'relative' }}>
            <label className="tb-label">Dirección</label>
            <MapPin size={16} className="tb-filter-icon" />
            <input 
              type="text" 
              value={direccion} 
              onChange={(e) => setDireccion(e.target.value)} 
              className="tb-input" 
              style={{ paddingLeft: '35px' }}
              placeholder="Calle Falsa 123" 
            />
          </div>

          <div className="tb-modal-actions">
            {idEditando && (
              <button type="button" onClick={limpiarFormulario} className="tb-btn-cancel">
                Cancelar
              </button>
            )}
            <button 
              type="submit" 
              className="tb-btn-save" 
              disabled={esSoloLectura}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                background: esSoloLectura ? '#94a3b8' : '#3b82f6',
                cursor: esSoloLectura ? 'not-allowed' : 'pointer'
              }}
            >
              {idEditando ? <Edit size={18} /> : <PlusCircle size={18} />}
              {idEditando ? 'Guardar Cambios' : 'Agregar Cliente'}
            </button>
          </div>
        </form>
      </div>

      {/* LISTA DE CLIENTES */}
      <div className="tb-card" style={{ padding: '25px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 className="tb-title" style={{ fontSize: '1.2em' }}>
            Directorio de Clientes
            <span style={{ fontSize: '0.8em', color: '#64748b', marginLeft: '10px', fontWeight: 'normal' }}>
              ({totalElementos} total)
            </span>
          </h3>
          
          <div style={{ position: 'relative', width: '300px', display: 'flex', gap: '10px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
                <Search size={18} className="tb-filter-icon" />
                <input 
                  type="text" 
                  placeholder="Buscar..." 
                  value={terminoBusqueda}
                  onChange={(e) => setTerminoBusqueda(e.target.value)}
                  onKeyDown={handleKeyDownBusqueda}
                  className="tb-input"
                  style={{ paddingLeft: '38px', width: '100%' }}
                />
            </div>
            <button className="tb-btn-save" onClick={aplicarBusqueda} style={{ padding: '0 15px', background: '#3b82f6' }}>
                Buscar
            </button>
          </div>
        </div>

        {cargando ? (
          <p className="tb-loading">Cargando clientes...</p>
        ) : clientes.length === 0 ? (
          <p className="tb-loading" style={{ background: '#f8fafc', borderRadius: '8px' }}>No hay clientes registrados o que coincidan con la búsqueda.</p>
        ) : (
          <div className="tb-table-wrapper">
            <table className="tb-table">
              <thead className="tb-thead">
                <tr>
                  <th className="tb-th" style={{ borderRadius: '8px 0 0 0' }}>Cliente</th>
                  <th className="tb-th">Documento</th>
                  <th className="tb-th">Contacto</th>
                  <th className="tb-th" style={{ textAlign: 'right', borderRadius: '0 8px 0 0' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {clientes.map(cliente => (
                  <tr key={cliente.id} className="tb-tr">
                    <td className="tb-td">
                      <div className="tb-td-primary">
                        {cliente.esEmpresa ? <Building2 size={18} color="#8b5cf6" /> : <User size={18} color="#3b82f6" />}
                        <span>{cliente.nombreCliente}</span>
                      </div>
                    </td>
                    <td className="tb-td tb-td-muted" style={{ fontSize: '0.9em' }}>
                      {cliente.documentoCuit || '-'}
                    </td>
                    <td className="tb-td">
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.85em', color: '#64748b' }}>
                        {cliente.telefono && <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Phone size={12} /> {cliente.telefono}</span>}
                        {cliente.email && <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Mail size={12} /> {cliente.email}</span>}
                      </div>
                    </td>
                    <td className="tb-td" style={{ textAlign: 'right' }}>
                      <div className="tb-actions" style={{ justifyContent: 'flex-end' }}>
                        <button 
                          onClick={() => editarCliente(cliente)} 
                          className="tb-btn-icon" 
                          style={{ 
                            background: '#fef3c7', 
                            color: '#d97706',
                            opacity: esSoloLectura ? 0.4 : 1,
                            cursor: esSoloLectura ? 'not-allowed' : 'pointer'
                          }} 
                          title={esSoloLectura ? "Modo solo lectura" : "Editar"}
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => eliminarCliente(cliente.id)} 
                          className="tb-btn-icon tb-btn-delete" 
                          style={{
                            opacity: esSoloLectura ? 0.4 : 1,
                            cursor: esSoloLectura ? 'not-allowed' : 'pointer'
                          }}
                          title={esSoloLectura ? "Modo solo lectura" : "Eliminar"}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Paginación */}
            {totalPaginas > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginTop: '20px' }}>
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
  );
}

export default Clientes;
