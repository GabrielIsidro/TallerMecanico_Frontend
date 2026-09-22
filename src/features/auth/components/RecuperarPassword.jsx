import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Mail, Lock, KeyRound, ArrowLeft, ShieldCheck, CheckCircle2, RotateCw } from 'lucide-react';
import { solicitarCodigoRecuperacion, confirmarRecuperacionPassword } from '../api/authApi';
import logoTaller from '../../../assets/images/NuevoLogo.png';
import './Login.css';
import './RecuperarPassword.css';

function RecuperarPassword() {
  const navigate = useNavigate();

  // Estados del flujo
  const [paso, setPaso] = useState(1); // 1 = Ingreso de email, 2 = Código y nueva clave
  const [email, setEmail] = useState('');
  const [codigo, setCodigo] = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [cargando, setCargando] = useState(false);

  // Contador de enfriamiento para reenviar código
  const [segundosRestantes, setSegundosRestantes] = useState(0);

  useEffect(() => {
    let timer;
    if (segundosRestantes > 0) {
      timer = setTimeout(() => setSegundosRestantes(prev => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [segundosRestantes]);

  // Paso 1: Enviar código al correo
  const handleSolicitarCodigo = async (e) => {
    e.preventDefault();
    const emailLimpio = email.trim();

    if (!emailLimpio) {
      toast.warning("Por favor, ingresá tu correo electrónico.");
      return;
    }

    setCargando(true);
    const toastId = toast.loading("Enviando código de verificación...");

    try {
      const response = await solicitarCodigoRecuperacion(emailLimpio);
      toast.success(response.data?.mensaje || "Código de verificación enviado.", { id: toastId, duration: 6000 });
      setPaso(2);
      setSegundosRestantes(60); // 60 segundos de cooldown para reenvío
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || "No se pudo procesar la solicitud.";
      toast.error(errorMsg, { id: toastId });
    } finally {
      setCargando(false);
    }
  };

  // Reenviar código
  const handleReenviarCodigo = async () => {
    if (segundosRestantes > 0 || cargando) return;

    setCargando(true);
    const toastId = toast.loading("Reenviando nuevo código...");

    try {
      const response = await solicitarCodigoRecuperacion(email.trim());
      toast.success(response.data?.mensaje || "Se envió un nuevo código a tu correo.", { id: toastId });
      setSegundosRestantes(60);
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || "Error al reenviar código.";
      toast.error(errorMsg, { id: toastId });
    } finally {
      setCargando(false);
    }
  };

  // Paso 2: Validar código y restablecer clave
  const handleConfirmarRestablecimiento = async (e) => {
    e.preventDefault();

    const codigoLimpio = codigo.trim();
    if (!codigoLimpio || codigoLimpio.length !== 6) {
      toast.warning("El código de verificación debe tener 6 dígitos numéricos.");
      return;
    }

    if (!nuevaPassword || !confirmarPassword) {
      toast.warning("Por favor, completá los campos de nueva contraseña.");
      return;
    }

    if (nuevaPassword.length < 6) {
      toast.warning("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (nuevaPassword !== confirmarPassword) {
      toast.error("Las contraseñas no coinciden.");
      return;
    }

    setCargando(true);
    const toastId = toast.loading("Restableciendo tu contraseña...");

    try {
      const response = await confirmarRecuperacionPassword({
        email: email.trim(),
        codigo: codigoLimpio,
        nuevaPassword,
        confirmarPassword
      });

      toast.success(response.data?.mensaje || "¡Contraseña actualizada con éxito!", { id: toastId, duration: 5000 });
      
      // Redireccionar al login
      setTimeout(() => {
        navigate('/login');
      }, 1500);

    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || "No se pudo restablecer la contraseña.";
      toast.error(errorMsg, { id: toastId, duration: 6000 });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="recuperar-container">
      <div className="login-circle1"></div>
      <div className="login-circle2"></div>

      <div className="recuperar-card">
        {/* Cabecera con logo y título */}
        <div className="recuperar-header">
          <img src={logoTaller} alt="PatitoFix" className="login-logoImage" />
          <div className="recuperar-badge">
            <ShieldCheck size={15} /> Seguridad de la Cuenta
          </div>
          <h1 className="recuperar-title">
            {paso === 1 ? 'Recuperar Contraseña' : 'Nueva Contraseña'}
          </h1>
          <p className="recuperar-subtitle">
            {paso === 1 
              ? 'Ingresá el correo electrónico asociado a tu taller para recibir un código de verificación.'
              : <>Ingresá el código de 6 dígitos que enviamos a <strong style={{ color: '#60a5fa' }}>{email}</strong> y tu nueva clave.</>
            }
          </p>
        </div>

        {/* PASO 1: Formulario para ingresar correo */}
        {paso === 1 && (
          <form onSubmit={handleSolicitarCodigo} className="recuperar-form">
            <div className="recuperar-inputGroup">
              <label className="recuperar-label">Correo Electrónico del Taller</label>
              <div className="login-inputWrapper">
                <Mail size={19} color="#94a3b8" className="login-inputIcon" />
                <input
                  type="email"
                  placeholder="ejemplo@taller.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="login-input"
                  required
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={cargando}
              className="recuperar-btn-submit"
            >
              {cargando ? (
                <span className="login-loader"></span>
              ) : (
                <>Enviar Código de Verificación</>
              )}
            </button>

            <div className="recuperar-footer-actions">
              <Link to="/login" className="recuperar-link">
                <ArrowLeft size={16} /> Volver a Iniciar Sesión
              </Link>
            </div>
          </form>
        )}

        {/* PASO 2: Formulario para ingresar código y nueva clave */}
        {paso === 2 && (
          <form onSubmit={handleConfirmarRestablecimiento} className="recuperar-form">
            <div className="recuperar-inputGroup">
              <label className="recuperar-label" style={{ textAlign: 'center' }}>
                Código de Verificación (6 Dígitos)
              </label>
              <input
                type="text"
                maxLength={6}
                placeholder="123456"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ''))}
                className="recuperar-codigo-input"
                required
                autoFocus
              />
            </div>

            <div className="recuperar-inputGroup">
              <label className="recuperar-label">Nueva Contraseña</label>
              <div className="login-inputWrapper">
                <Lock size={19} color="#94a3b8" className="login-inputIcon" />
                <input
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={nuevaPassword}
                  onChange={(e) => setNuevaPassword(e.target.value)}
                  className="login-input"
                  required
                />
              </div>
            </div>

            <div className="recuperar-inputGroup">
              <label className="recuperar-label">Confirmar Nueva Contraseña</label>
              <div className="login-inputWrapper">
                <KeyRound size={19} color="#94a3b8" className="login-inputIcon" />
                <input
                  type="password"
                  placeholder="Repetí la contraseña"
                  value={confirmarPassword}
                  onChange={(e) => setConfirmarPassword(e.target.value)}
                  className="login-input"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={cargando}
              className="recuperar-btn-submit"
            >
              {cargando ? (
                <span className="login-loader"></span>
              ) : (
                <><CheckCircle2 size={19} /> Restablecer Contraseña</>
              )}
            </button>

            <div className="recuperar-footer-actions">
              <button
                type="button"
                onClick={handleReenviarCodigo}
                disabled={segundosRestantes > 0 || cargando}
                className="recuperar-btn-secondary"
              >
                {segundosRestantes > 0 
                  ? `Reenviar código en ${segundosRestantes}s`
                  : <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><RotateCw size={14} /> Reenviar código</span>
                }
              </button>

              <button
                type="button"
                onClick={() => setPaso(1)}
                className="recuperar-link"
                style={{ background: 'none', border: 'none', cursor: 'pointer', marginTop: '6px' }}
              >
                <ArrowLeft size={14} /> Cambiar correo electrónico
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}

export default RecuperarPassword;
