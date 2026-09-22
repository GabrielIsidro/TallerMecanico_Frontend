import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { User, Lock, KeyRound, ShieldCheck, Contact, Mail } from 'lucide-react';
import { getMiPerfil, updateMiPerfil } from '../api/talleresApi';
import { handleApiError } from '../../../utils/errorHandler';

function MiPerfil() {
  // Estados para datos personales
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState(''); // El email no se edita, solo se muestra

  // Estados para la contraseña
  const [passwordActual, setPasswordActual] = useState('');
  const [passwordNueva, setPasswordNueva] = useState('');
  const [passwordConfirmacion, setPasswordConfirmacion] = useState('');
  
  const [cargandoDatos, setCargandoDatos] = useState(true);
  const [guardando, setGuardando] = useState(false);

  // ---> EFECTO 1: Cargar mis datos actuales apenas abre la pantalla
  useEffect(() => {
    cargarDatosPerfil();
  }, []);

  const cargarDatosPerfil = async () => {
    try {
      const response = await getMiPerfil();
      const datos = response.data;
      setNombre(datos.nombre || '');
      setApellido(datos.apellido || '');
      setEmail(datos.email || ''); // Llenamos el mail real
    } catch (error) {
      console.error(error);
      handleApiError(error, "Error de conexión al cargar perfil");
    } finally {
      setCargandoDatos(false);
    }
  };

  // ---> FUNCIÓN PRINCIPAL: Guardar todos los cambios
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones básicas de datos personales
    if (!nombre.trim() || !apellido.trim()) {
      toast.warning("Nombre y apellido son obligatorios.");
      return;
    }

    // Lógica para validar si se intentó cambiar la contraseña
    let datosAEnviar = { nombre: nombre.trim(), apellido: apellido.trim() };
    const quiereCambiarPassword = passwordNueva || passwordActual || passwordConfirmacion;

    if (quiereCambiarPassword) {
      if (!passwordActual || !passwordNueva || !passwordConfirmacion) {
        toast.warning("Para cambiar la contraseña, completá los 3 campos de seguridad.");
        return;
      }
      if (passwordNueva !== passwordConfirmacion) {
        toast.error("Las contraseñas nuevas no coinciden.");
        return;
      }
      if (passwordNueva.length < 6) {
        toast.warning("La nueva contraseña debe tener al menos 6 caracteres.");
        return;
      }
      // Sumamos las passwords al paquete de datos
      datosAEnviar.passwordActual = passwordActual;
      datosAEnviar.passwordNueva = passwordNueva;
    }

    setGuardando(true);
    const toastId = toast.loading("Guardando cambios en tu perfil...");

    try {
      // Mandamos la petición al endpoint de Java actualizado
      await updateMiPerfil(datosAEnviar);

      toast.success("¡Perfil actualizado con éxito!", { id: toastId });
      // Limpiamos los campos de password por seguridad, pero dejamos nombre y apellido
      setPasswordActual('');
      setPasswordNueva('');
      setPasswordConfirmacion('');
    } catch (error) {
      console.error(error);
      handleApiError(error, "Error al actualizar el perfil", toastId);
    } finally {
      setGuardando(false);
    }
  };

  if (cargandoDatos) {
    return (
      <div className="tb-loading" style={{ minHeight: '300px' }}>
        Cargando datos de perfil...
      </div>
    );
  }

  return (
    <div className="tb-container" style={{ padding: '25px', maxWidth: '800px', margin: '0 auto' }}>
      
      <div className="tb-header">
        <h1 className="tb-title" style={{ fontSize: '2em' }}>
          <div style={{ background: '#dbeafe', padding: '12px', borderRadius: '12px', display: 'flex' }}>
            <User size={30} color="#3b82f6" />
          </div>
          Configuración de Perfil
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        
        {/* SECCIÓN 1: DATOS PERSONALES */}
        <div className="tb-card" style={{ padding: '35px', marginBottom: '25px' }}>
          <h3 className="tb-title" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '15px', marginBottom: '25px', fontSize: '1.2em' }}>
            <Contact size={22} color="#64748b" />
            Datos Personales
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
            <div style={{ position: 'relative' }}>
              <label className="tb-label">Nombre</label>
              <User size={17} className="tb-filter-icon" />
              <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} className="tb-input" style={{ paddingLeft: '38px' }} required />
            </div>
            <div style={{ position: 'relative' }}>
              <label className="tb-label">Apellido</label>
              <User size={17} className="tb-filter-icon" />
              <input type="text" value={apellido} onChange={(e) => setApellido(e.target.value)} className="tb-input" style={{ paddingLeft: '38px' }} required />
            </div>
          </div>

          <div style={{ position: 'relative' }}>
            <label className="tb-label">Correo Electrónico (No editable)</label>
            <Mail size={17} className="tb-filter-icon" />
            <input type="email" value={email} className="tb-input" style={{ paddingLeft: '38px', background: '#f1f5f9', cursor: 'not-allowed' }} readOnly title="El email es tu identificador y no se puede cambiar." />
          </div>
        </div>

        {/* SECCIÓN 2: SEGURIDAD (OPCIONAL) */}
        <div className="tb-card" style={{ padding: '35px', marginBottom: '25px' }}>
          <h3 className="tb-title" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '15px', marginBottom: '15px', fontSize: '1.2em' }}>
            <ShieldCheck size={22} color="#10b981" />
            Cambiar Contraseña (Opcional)
          </h3>
          
          <p className="tb-subtitle" style={{ marginBottom: '25px' }}>
            Si querés cambiar tu clave, completá los tres campos de abajo. Si solo querés actualizar tus datos personales, dejalos vacíos.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ position: 'relative' }}>
              <label className="tb-label">Contraseña Actual</label>
              <Lock size={17} className="tb-filter-icon" />
              <input type="password" placeholder="Para validar el cambio" value={passwordActual} onChange={(e) => setPasswordActual(e.target.value)} className="tb-input" style={{ paddingLeft: '38px' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <div style={{ position: 'relative' }}>
                <label className="tb-label">Nueva Contraseña</label>
                <KeyRound size={17} className="tb-filter-icon" />
                <input type="password" placeholder="Mínimo 6 caracteres" value={passwordNueva} onChange={(e) => setPasswordNueva(e.target.value)} className="tb-input" style={{ paddingLeft: '38px' }} />
              </div>
              <div style={{ position: 'relative' }}>
                <label className="tb-label">Repetir Nueva</label>
                <KeyRound size={17} className="tb-filter-icon" />
                <input type="password" placeholder="Confirmá tu nueva clave" value={passwordConfirmacion} onChange={(e) => setPasswordConfirmacion(e.target.value)} className="tb-input" style={{ paddingLeft: '38px' }} />
              </div>
            </div>
          </div>
        </div>

        {/* BOTÓN DE GUARDADO FINAL */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '30px' }}>
          <button 
            type="submit" 
            disabled={guardando}
            className="tb-btn-save"
            style={{ 
              padding: '14px 40px', 
              fontSize: '1.05em', cursor: guardando ? 'not-allowed' : 'pointer', background: '#3b82f6'
            }}
          >
            {guardando ? 'Guardando cambios...' : 'Guardar Todo'}
          </button>
        </div>

      </form>
    </div>
  );
}

export default MiPerfil;
