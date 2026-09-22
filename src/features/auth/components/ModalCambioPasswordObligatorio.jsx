import { useState } from 'react';
import { toast } from 'sonner';
import { KeyRound, Lock, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { updateMiPerfil } from '../../talleres/api/talleresApi';
import { useAuth } from '../../../context/AuthContext';

function ModalCambioPasswordObligatorio() {
  const { userProfile, actualizarPasswordCompletada } = useAuth();

  const [passwordActual, setPasswordActual] = useState('');
  const [passwordNueva, setPasswordNueva] = useState('');
  const [passwordConfirmacion, setPasswordConfirmacion] = useState('');
  const [guardando, setGuardando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!passwordActual || !passwordNueva || !passwordConfirmacion) {
      toast.warning("Por favor, completá los tres campos requeridos.");
      return;
    }

    if (passwordNueva.length < 6) {
      toast.warning("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (passwordNueva !== passwordConfirmacion) {
      toast.error("Las nuevas contraseñas no coinciden.");
      return;
    }

    setGuardando(true);
    const toastId = toast.loading("Actualizando tu contraseña...");

    try {
      await updateMiPerfil({
        nombre: userProfile?.nombre || 'Admin',
        apellido: userProfile?.apellido || '',
        passwordActual: passwordActual.trim(),
        passwordNueva: passwordNueva.trim()
      });

      toast.success("¡Contraseña actualizada con éxito! Bienvenido a tu panel de control.", { id: toastId, duration: 5000 });
      actualizarPasswordCompletada();
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.response?.data?.error || "Error al actualizar la contraseña.";
      toast.error(errorMsg, { id: toastId, duration: 6000 });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.88)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '20px',
        maxWidth: '480px',
        width: '100%',
        padding: '35px 30px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
        border: '1px solid #e2e8f0',
        color: '#1e293b'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: '#fef3c7',
            color: '#d97706',
            marginBottom: '14px'
          }}>
            <ShieldAlert size={30} />
          </div>

          <h2 style={{ margin: '0 0 8px 0', fontSize: '1.45em', fontWeight: 800, color: '#0f172a' }}>
            Cambio de Contraseña Obligatorio
          </h2>
          <p style={{ margin: 0, fontSize: '0.92em', color: '#64748b', lineHeight: 1.5 }}>
            Ingresaste con la clave temporal que recibiste por correo. Por motivos de seguridad de tu taller, debés establecer una nueva contraseña personal antes de continuar.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85em', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
              Contraseña Temporal Actual
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="#94a3b8" style={{ position: 'absolute', top: '50%', left: '12px', transform: 'translateY(-50%)' }} />
              <input
                type="password"
                placeholder="La clave recibida por mail"
                value={passwordActual}
                onChange={(e) => setPasswordActual(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 40px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.95em',
                  boxSizing: 'border-box',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85em', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
              Nueva Contraseña Personal
            </label>
            <div style={{ position: 'relative' }}>
              <KeyRound size={18} color="#94a3b8" style={{ position: 'absolute', top: '50%', left: '12px', transform: 'translateY(-50%)' }} />
              <input
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={passwordNueva}
                onChange={(e) => setPasswordNueva(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 40px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.95em',
                  boxSizing: 'border-box',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85em', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
              Confirmar Nueva Contraseña
            </label>
            <div style={{ position: 'relative' }}>
              <KeyRound size={18} color="#94a3b8" style={{ position: 'absolute', top: '50%', left: '12px', transform: 'translateY(-50%)' }} />
              <input
                type="password"
                placeholder="Repetí la nueva contraseña"
                value={passwordConfirmacion}
                onChange={(e) => setPasswordConfirmacion(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 40px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.95em',
                  boxSizing: 'border-box',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={guardando}
            style={{
              marginTop: '10px',
              padding: '14px',
              borderRadius: '10px',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              fontWeight: 700,
              fontSize: '1em',
              cursor: guardando ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.3)'
            }}
          >
            {guardando ? 'Guardando nueva contraseña...' : <><CheckCircle2 size={18} /> Guardar y Activar Cuenta</>}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ModalCambioPasswordObligatorio;
