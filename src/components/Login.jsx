import { useState } from 'react';
import { toast } from 'sonner';
import { Mail, Lock, LogIn } from 'lucide-react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import logoTaller from '../assets/Logo_TuTaller.png';
import '../styles/Login.css';


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
      const response = await axios.post('http://localhost:8080/api/auth/login', { email, password });
      // El backend devuelve el token en la propiedad 'jwt' (según el código anterior)
      const data = response.data;

      login(data.jwt || data.token); // Ajustar según como venga en el JSON
      toast.success("¡Bienvenido a TuTaller!", { id: toastId });

      navigate('/');
    } catch (err) {
      const errorMsg = typeof err.response?.data === 'string' 
        ? err.response.data 
        : err.response?.data?.message || err.response?.data?.error || "Credenciales inválidas";
      toast.error(errorMsg, { id: toastId, duration: 5000 });
    } finally {
      setCargando(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.warning("Por favor, ingresá tu correo electrónico en el campo superior primero.");
      return;
    }

    if (!window.confirm(`¿Estás seguro que deseas restablecer la contraseña?\n\nSi continuas, tu contraseña actual se anulará y te llegará una nueva contraseña temporal al correo: ${email}`)) {
      return;
    }

    const toastId = toast.loading("Procesando solicitud...");
    try {
      const response = await axios.post('http://localhost:8080/api/auth/forgot-password', { email });
      toast.success(response.data.mensaje || "Revisa tu correo para las instrucciones.", { id: toastId, duration: 6000 });
    } catch (err) {
      toast.error(err.response?.data?.error || "Error al solicitar recuperación.", { id: toastId });
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
            alt="Logo TuTaller"
            className="login-logoImage"
          />
          <h1 className="login-title">TuTaller</h1>
          <p className="login-subtitle">Gestión integral para tu taller mecánico</p>
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
            <div className="login-labelRow">
              <label className="login-label">Contraseña</label>
              <a href="#" onClick={handleForgotPassword} className="login-forgotPassword">¿Olvidaste tu clave?</a>
            </div>
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
