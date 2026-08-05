import { useState, useEffect } from 'react';
import { PackageSearch, Plus, PackageOpen, AlertTriangle, CheckCircle, Edit3, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '../api/axiosConfig';
import '../styles/Tablas.css';

const Inventario = () => {
  const [repuestos, setRepuestos] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Form states
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  
  const [nombre, setNombre] = useState('');
  const [sku, setSku] = useState('');
  const [cantidad, setCantidad] = useState(0);
  const [stockMinimo, setStockMinimo] = useState(5);
  const [precio, setPrecio] = useState(0);

  useEffect(() => {
    cargarRepuestos();
  }, []);

  const cargarRepuestos = async () => {
    try {
      setCargando(true);
      const res = await api.get('/repuestos');
      setRepuestos(res.data);
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar inventario');
    } finally {
      setCargando(false);
    }
  };

  const limpiarForm = () => {
    setNombre('');
    setSku('');
    setCantidad(0);
    setStockMinimo(5);
    setPrecio(0);
    setEditandoId(null);
    setMostrarForm(false);
  };

  const guardarRepuesto = async (e) => {
    e.preventDefault();
    if (!nombre || cantidad < 0 || precio < 0) {
      toast.warning('Completá los campos correctamente');
      return;
    }

    const toastId = toast.loading('Guardando repuesto...');
    const data = { nombre, sku, cantidad, stockMinimo, precio };

    try {
      if (editandoId) {
        await api.put(`/repuestos/${editandoId}`, data);
        toast.success('Repuesto actualizado', { id: toastId });
      } else {
        await api.post('/repuestos', data);
        toast.success('Repuesto agregado', { id: toastId });
      }
      limpiarForm();
      cargarRepuestos();
    } catch (error) {
      console.error(error);
      toast.error('Error al guardar', { id: toastId });
    }
  };

  const editarRepuesto = (repuesto) => {
    setNombre(repuesto.nombre);
    setSku(repuesto.sku || '');
    setCantidad(repuesto.cantidad);
    setStockMinimo(repuesto.stockMinimo);
    setPrecio(repuesto.precio);
    setEditandoId(repuesto.id);
    setMostrarForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const eliminarRepuesto = async (id) => {
    if (!window.confirm('¿Seguro que querés eliminar este repuesto?')) return;
    const toastId = toast.loading('Eliminando...');
    try {
      await api.delete(`/repuestos/${id}`);
      toast.success('Eliminado correctamente', { id: toastId });
      cargarRepuestos();
    } catch (error) {
      console.error(error);
      toast.error('Error al eliminar', { id: toastId });
    }
  };

  const totalInvertido = repuestos.reduce((acc, curr) => acc + (curr.cantidad * curr.precio), 0);
  const repuestosBajos = repuestos.filter(r => r.cantidad <= r.stockMinimo).length;

  if (cargando) return <div className="tb-loading" style={{ padding: '30px' }}>Cargando inventario...</div>;

  return (
    <div className="tb-container" style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* HEADER */}
      <div className="tb-header" style={{ marginBottom: '30px' }}>
        <div>
          <h1 className="tb-title" style={{ fontSize: '2.5rem' }}>
            <PackageSearch size={40} color="#3b82f6" /> Inventario
          </h1>
          <p className="tb-subtitle" style={{ fontSize: '1.1rem' }}>Gestioná tus repuestos y recibí alertas de stock.</p>
        </div>
        <button 
          onClick={() => { limpiarForm(); setMostrarForm(!mostrarForm); }}
          className="tb-btn-add"
          style={{ padding: '12px 24px', borderRadius: '12px' }}
        >
          {mostrarForm ? 'Cerrar Formulario' : <><Plus size={20} /> Nuevo Repuesto</>}
        </button>
      </div>

      {/* KPIS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ background: 'white', padding: '25px', borderRadius: '20px', borderLeft: '5px solid #3b82f6', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: 0, color: '#64748b', fontSize: '1rem', textTransform: 'uppercase' }}>Artículos Totales</h3>
          <p style={{ margin: '10px 0 0 0', fontSize: '2.5rem', fontWeight: 'bold', color: '#1e293b' }}>{repuestos.length}</p>
        </div>
        <div style={{ background: 'white', padding: '25px', borderRadius: '20px', borderLeft: '5px solid #10b981', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: 0, color: '#64748b', fontSize: '1rem', textTransform: 'uppercase' }}>Valor Invertido</h3>
          <p style={{ margin: '10px 0 0 0', fontSize: '2.5rem', fontWeight: 'bold', color: '#10b981' }}>${totalInvertido.toLocaleString()}</p>
        </div>
        <div style={{ background: 'white', padding: '25px', borderRadius: '20px', borderLeft: '5px solid #ef4444', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: 0, color: '#64748b', fontSize: '1rem', textTransform: 'uppercase' }}>Alertas de Stock</h3>
          <p style={{ margin: '10px 0 0 0', fontSize: '2.5rem', fontWeight: 'bold', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '10px' }}>
            {repuestosBajos} {repuestosBajos > 0 && <AlertTriangle size={30} />}
          </p>
        </div>
      </div>

      {/* FORMULARIO */}
      {mostrarForm && (
        <div className="tb-card" style={{ padding: '30px', borderRadius: '20px', marginBottom: '30px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', overflow: 'visible' }}>
          <h2 style={{ margin: '0 0 20px 0', color: '#1e293b' }}>{editandoId ? 'Editar Repuesto' : 'Agregar Nuevo Repuesto'}</h2>
          <form onSubmit={guardarRepuesto} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', alignItems: 'end' }}>
            <div>
              <label className="tb-label">Nombre / Descripción *</label>
              <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} className="tb-input" placeholder="Filtro de Aceite" required />
            </div>
            <div>
              <label className="tb-label">SKU (Opcional)</label>
              <input type="text" value={sku} onChange={e => setSku(e.target.value)} className="tb-input" placeholder="COD-123" />
            </div>
            <div>
              <label className="tb-label">Cantidad Actual *</label>
              <input type="number" value={cantidad} onChange={e => setCantidad(Number(e.target.value))} className="tb-input" min="0" required />
            </div>
            <div>
              <label className="tb-label">Stock Mínimo *</label>
              <input type="number" value={stockMinimo} onChange={e => setStockMinimo(Number(e.target.value))} className="tb-input" min="1" required />
            </div>
            <div>
              <label className="tb-label">Precio Unitario *</label>
              <input type="number" value={precio} onChange={e => setPrecio(Number(e.target.value))} className="tb-input" min="0" step="0.01" required />
            </div>
            <button type="submit" className="tb-btn-save" style={{ height: '46px' }}>
              {editandoId ? 'Guardar Cambios' : 'Registrar'}
            </button>
          </form>
        </div>
      )}

      {/* TABLA DE INVENTARIO */}
      <div className="tb-card" style={{ borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
        {repuestos.length === 0 ? (
          <div style={{ padding: '50px', textAlign: 'center', color: '#64748b' }}>
            <PackageOpen size={60} color="#cbd5e1" style={{ marginBottom: '15px' }} />
            <h3 style={{ margin: 0 }}>El inventario está vacío</h3>
            <p>Agregá tu primer repuesto para empezar a controlar tu stock.</p>
          </div>
        ) : (
          <div className="tb-table-wrapper">
            <table className="tb-table">
              <thead className="tb-thead">
                <tr>
                  <th className="tb-th" style={{ padding: '20px' }}>Detalle del Producto</th>
                  <th className="tb-th tb-th-center" style={{ padding: '20px' }}>Cantidad</th>
                  <th className="tb-th" style={{ padding: '20px' }}>Precio</th>
                  <th className="tb-th tb-th-center" style={{ padding: '20px' }}>Estado</th>
                  <th className="tb-th tb-th-center" style={{ padding: '20px' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {repuestos.map(r => {
                  const bajoStock = r.cantidad <= r.stockMinimo;
                  return (
                    <tr key={r.id} className="tb-tr">
                      <td className="tb-td" style={{ padding: '20px' }}>
                        <div className="tb-td-primary" style={{ fontSize: '1.1rem' }}>{r.nombre}</div>
                        <div className="tb-td-muted" style={{ fontSize: '0.85rem' }}>SKU: {r.sku || 'N/A'}</div>
                      </td>
                      <td className="tb-td tb-td-center" style={{ padding: '20px' }}>
                        <span style={{ 
                          background: bajoStock ? '#fef2f2' : '#f0fdf4',
                          color: bajoStock ? '#ef4444' : '#166534',
                          padding: '5px 15px',
                          borderRadius: '20px',
                          fontWeight: 'bold',
                          fontSize: '1.2rem'
                        }}>
                          {r.cantidad}
                        </span>
                      </td>
                      <td className="tb-td" style={{ padding: '20px', fontWeight: 'bold', color: '#334155' }}>
                        ${r.precio.toLocaleString()}
                      </td>
                      <td className="tb-td tb-td-center" style={{ padding: '20px' }}>
                        {bajoStock ? (
                          <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', fontSize: '0.9rem', fontWeight: 'bold' }}>
                            <AlertTriangle size={16} /> Reabastecer
                          </span>
                        ) : (
                          <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', fontSize: '0.9rem', fontWeight: 'bold' }}>
                            <CheckCircle size={16} /> Óptimo
                          </span>
                        )}
                      </td>
                      <td className="tb-td tb-td-center" style={{ padding: '20px' }}>
                        <div className="tb-actions">
                          <button onClick={() => editarRepuesto(r)} className="tb-btn-icon tb-btn-edit"><Edit3 size={18} /></button>
                          <button onClick={() => eliminarRepuesto(r.id)} className="tb-btn-icon tb-btn-delete"><Trash2 size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inventario;
