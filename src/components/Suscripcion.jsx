import { useState, useEffect } from 'react';
import { CreditCard, CheckCircle2, AlertCircle, ShieldAlert, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import api from '../api/axiosConfig';
import '../styles/Tablas.css';

const Suscripcion = () => {
  const { userProfile } = useAuth();
  const [cargando, setCargando] = useState(false);
  const [planes, setPlanes] = useState([]);
  const [frecuencia, setFrecuencia] = useState('MENSUAL');

  useEffect(() => {
      api.get('/planes')
         .then(res => setPlanes(res.data.filter(p => p.activo)))
         .catch(err => console.error("Error cargando planes", err));
  }, []);

  // Colores dinámicos según el estado
  const getStatusColor = (estado) => {
    switch (estado) {
      case 'ACTIVA': return '#22c55e'; // Verde
      case 'PRUEBA_GRATUITA': return '#3b82f6'; // Azul
      case 'VENCIDA': return '#ef4444'; // Rojo
      case 'SUSPENDIDA': return '#f59e0b'; // Naranja
      default: return '#64748b'; // Gris
    }
  };

  const getStatusIcon = (estado) => {
    switch (estado) {
      case 'ACTIVA': return <CheckCircle2 size={32} color="#22c55e" />;
      case 'PRUEBA_GRATUITA': return <Zap size={32} color="#3b82f6" />;
      case 'VENCIDA': return <ShieldAlert size={32} color="#ef4444" />;
      case 'SUSPENDIDA': return <AlertCircle size={32} color="#f59e0b" />;
      default: return <AlertCircle size={32} color="#64748b" />;
    }
  };

  const simularPago = async (planId) => {
    const toastId = toast.loading(`Generando link de pago seguro...`);
    setCargando(true);
    try {
      const response = await api.post('/suscripciones/checkout', { planId });
      const { checkoutUrl } = response.data;
      
      toast.success('Redirigiendo a MercadoPago...', { id: toastId });
      setTimeout(() => {
          window.location.href = checkoutUrl;
      }, 1500);

    } catch (error) {
      console.error('Error al generar checkout', error);
      toast.error('Ocurrió un error al procesar el pago.', { id: toastId });
      setCargando(false);
    }
  };

  if (!userProfile) return <div className="tb-loading" style={{ padding: '20px' }}>Cargando datos de suscripción...</div>;

  const diasRestantes = () => {
    if (!userProfile.fechaVencimiento) return 0;
    const vencimiento = new Date(userProfile.fechaVencimiento);
    const hoy = new Date();
    const diferencia = vencimiento - hoy;
    return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
  };

  const dias = diasRestantes();
  const estadoSusc = userProfile.estadoSuscripcion || 'PRUEBA_GRATUITA';
  const planActual = userProfile.tipoPlan || 'BASE';
  const estaVencida = dias < 0 || estadoSusc === 'VENCIDA';

  const planBase = planes.find(p => p.tipo === 'BASE' && p.frecuencia === frecuencia);
  const planPro = planes.find(p => p.tipo === 'PRO' && p.frecuencia === frecuencia);

  return (
    <div className="tb-container" style={{ padding: '30px', maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* HEADER DE SUSCRIPCIÓN */}
      <div className="tb-header" style={{ marginBottom: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h1 className="tb-title" style={{ fontSize: '2.5rem', marginBottom: '10px', justifyContent: 'center' }}>Mi Suscripción</h1>
        <p className="tb-subtitle" style={{ fontSize: '1.1rem' }}>Administrá tu plan y mantené tu taller operando sin límites.</p>
      </div>

      {/* ESTADO ACTUAL - TARJETA */}
      <div className="tb-card" style={{ 
        padding: '30px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
        marginBottom: '40px',
        border: `2px solid ${getStatusColor(estadoSusc)}30`
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ 
            background: `${getStatusColor(estadoSusc)}15`, 
            padding: '20px', 
            borderRadius: '20px' 
          }}>
            {getStatusIcon(estadoSusc)}
          </div>
          <div>
            <h2 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#64748b', margin: '0 0 5px 0' }}>
              Estado Actual - Plan {planActual}
            </h2>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: getStatusColor(estadoSusc) }}>
              {estadoSusc?.replace('_', ' ')}
            </div>
            {userProfile.fechaVencimiento && (
              <p style={{ margin: '5px 0 0 0', color: '#475569', fontSize: '1.1rem' }}>
                Vence el: <strong>{new Date(userProfile.fechaVencimiento).toLocaleDateString('es-AR')}</strong> 
                {!estaVencida ? ` (En ${dias} días)` : ' (Expirada)'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* PLANES DISPONIBLES */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h2 className="tb-title" style={{ fontSize: '1.5rem', margin: 0 }}>
            Elegí tu Plan
          </h2>
          <div style={{ display: 'flex', background: '#e2e8f0', padding: '5px', borderRadius: '12px' }}>
              <button 
                  onClick={() => setFrecuencia('MENSUAL')}
                  style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', background: frecuencia === 'MENSUAL' ? 'white' : 'transparent', boxShadow: frecuencia === 'MENSUAL' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none', color: '#0f172a' }}
              >
                  Mensual
              </button>
              <button 
                  onClick={() => setFrecuencia('ANUAL')}
                  style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', background: frecuencia === 'ANUAL' ? '#3b82f6' : 'transparent', boxShadow: frecuencia === 'ANUAL' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none', color: frecuencia === 'ANUAL' ? 'white' : '#0f172a' }}
              >
                  Anual (Ahorrá un 20%)
              </button>
          </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
        
        {/* PLAN BASE */}
        {planBase && (
        <div className="tb-card" style={{
          padding: '40px 30px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.3s',
          cursor: 'pointer',
          border: planActual === 'BASE' ? '2px solid #3b82f6' : '1px solid #e2e8f0'
        }}>
          <h3 className="tb-title" style={{ fontSize: '1.5rem', margin: '0 0 10px 0' }}>Plan BASE</h3>
          <p className="tb-subtitle" style={{ margin: '0 0 20px 0', minHeight: '40px' }}>Ideal para talleres que recién comienzan a digitalizarse.</p>
          <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#0f172a', marginBottom: '30px' }}>
            ${planBase.precio.toLocaleString('es-AR')} <span style={{ fontSize: '1rem', color: '#64748b', fontWeight: 'normal' }}>/ {frecuencia.toLowerCase()}</span>
          </div>
          
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 40px 0', color: '#475569', display: 'flex', flexDirection: 'column', gap: '15px', flexGrow: 1 }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><CheckCircle2 size={20} color="#22c55e" /> Gestión de Clientes y Vehículos</li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><CheckCircle2 size={20} color="#22c55e" /> Historial y Cotizador</li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><CheckCircle2 size={20} color="#22c55e" /> Soporte estándar por email</li>
          </ul>

          <button 
            onClick={() => simularPago(planBase.id.toString())}
            disabled={cargando}
            className="tb-btn-save"
            style={{
              width: '100%',
              padding: '15px',
              borderRadius: '12px',
              background: planActual === 'BASE' ? '#e2e8f0' : '#f1f5f9',
              color: '#0f172a',
              fontSize: '1.1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              transition: 'background 0.2s'
            }}
          >
            <CreditCard size={20} />
            {planActual === 'BASE' ? 'Renovar Plan BASE' : 'Suscribirse al BASE'}
          </button>
        </div>
        )}

        {/* PLAN PRO */}
        {planPro && (
        <div className="tb-card" style={{
          background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
          padding: '40px 30px',
          boxShadow: '0 20px 40px rgba(15, 23, 42, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
          border: planActual === 'PRO' ? '2px solid #3b82f6' : 'none'
        }}>
          {/* Badge */}
          <div style={{ 
            position: 'absolute', top: '20px', right: '-35px', background: '#3b82f6', color: 'white', 
            padding: '8px 40px', transform: 'rotate(45deg)', fontWeight: 'bold', fontSize: '0.8rem', letterSpacing: '1px'
          }}>
            RECOMENDADO
          </div>

          <h3 className="tb-title" style={{ fontSize: '1.5rem', color: 'white', margin: '0 0 10px 0' }}>Plan PRO</h3>
          <p className="tb-subtitle" style={{ color: '#94a3b8', margin: '0 0 20px 0', minHeight: '40px' }}>Para talleres establecidos que necesitan control total del negocio.</p>
          <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'white', marginBottom: '30px' }}>
            ${planPro.precio.toLocaleString('es-AR')} <span style={{ fontSize: '1rem', color: '#94a3b8', fontWeight: 'normal' }}>/ {frecuencia.toLowerCase()}</span>
          </div>
          
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 40px 0', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '15px', flexGrow: 1 }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><CheckCircle2 size={20} color="#3b82f6" /> <strong>Todo lo del Plan BASE</strong></li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><CheckCircle2 size={20} color="#3b82f6" /> Módulo de Inventario</li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><CheckCircle2 size={20} color="#3b82f6" /> Gestión de Equipo (Mecánicos)</li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><CheckCircle2 size={20} color="#3b82f6" /> Soporte VIP 24/7</li>
          </ul>

          <button 
            onClick={() => simularPago(planPro.id.toString())}
            disabled={cargando}
            className="tb-btn-save"
            style={{
              width: '100%',
              padding: '15px',
              borderRadius: '12px',
              background: '#3b82f6',
              fontSize: '1.1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)'
            }}
          >
            <CreditCard size={20} />
            {planActual === 'PRO' ? 'Renovar Plan PRO' : 'Subir a PRO'}
          </button>
        </div>
        )}

      </div>
    </div>
  );
};

export default Suscripcion;
