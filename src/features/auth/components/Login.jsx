import { useState } from 'react';
import { toast } from 'sonner';
import { Mail, Lock, LogIn } from 'lucide-react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { loginAdmin, loginTaller } from '../api/authApi';
import { useAuth } from '../../../context/AuthContext';
import logoTaller from '../../../assets/images/NuevoLogo.png';
import './Login.css';


function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const { login, token } = useAuth();
  const navigate = useNavigate();

  // Si ya está logueado, lo mandamos al dashboard
  if (token) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.warning("Por favor, completá todos los campos.");
      return;
    }

    setCargando(true);
    const toastId = toast.loading("Verificando credenciales...");

    try {
      let response;
      try {
        response = await loginAdmin(email, password);
      } catch (adminErr) {
        response = await loginTaller(email, password);
      }

      const data = response.data;

      login(data.jwt || data.token); // Ajustar según como venga en el JSON
      toast.success("¡Bienvenido a PatitoFix!", { id: toastId });

      if (data.estadoSuscripcion === 'VENCIDA' || data.estadoSuscripcion === 'SUSPENDIDA') {
        navigate('/suscripcion');
      } else {
        navigate('/');
      }
    } catch (err) {
      const errorMsg = typeof err.response?.data === 'string'
        ? err.response.data
        : err.response?.data?.message || err.response?.data?.error || "Credenciales inválidas";
      toast.error(errorMsg, { id: toastId, duration: 5000 });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-circle1"></div>
      <div className="login-circle2"></div>

      <div className="login-glassCard">
        <div className="login-header">
          <img
            src={logoTaller}
            alt="PatitoFix - Gestión Integral para Talleres Automotrices"
            className="login-logoImage"
          />
          <h1 className="sr-only">PatitoFix</h1>
          <p className="login-subtitle">Iniciá sesión para gestionar tu taller</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-inputGroup">
            <label className="login-label">Correo Electrónico</label>
            <div className="login-inputWrapper">
              <Mail size={19} color="#94a3b8" className="login-inputIcon" />
              <input
                type="email"
                placeholder="juan.perez@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="login-input"
                required
              />
            </div>
          </div>

          <div className="login-inputGroup">
            <label className="login-label">Contraseña</label>
            <div className="login-inputWrapper">
              <Lock size={19} color="#94a3b8" className="login-inputIcon" />
              <input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="login-input"
                required
              />
            </div>
            <div className="login-forgot-row">
              <Link to="/recuperar-password" className="login-forgot-link">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={cargando}
            className={`login-submitButton ${cargando ? 'login-submitButtonDisabled' : ''}`}
          >
            {cargando ? (
              <span className="login-loader"></span>
            ) : (
              <><LogIn size={21} /> Ingresar al Sistema</>
            )}
          </button>

        </form>

        <div className="login-footer">
          <div className="login-footer-text">
            Desarrollado por Gabriel Isidro Garcia © 2026
          </div>
        </div>

      </div>
    </div>
  );
}

export default Login;
