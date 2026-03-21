import { useEffect, useState, Fragment } from 'react'
import { toast } from 'sonner'
import { 
  History, 
  Search, 
  ChevronDown,
  ChevronUp,
  Car, 
  User, 
  Receipt,
  Wrench,
  Printer,
  CreditCard // <-- NUEVO: Icono de tarjeta para los pagos
} from 'lucide-react'

function Historial() {
  const [ordenes, setOrdenes] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [cargando, setCargando] = useState(true)
  const [filaExpandida, setFilaExpandida] = useState(null)

  useEffect(() => {
    cargarOrdenes()
  }, [])

  const cargarOrdenes = () => {
    setCargando(true)
    fetch('http://localhost:8080/api/ordenes')
      .then(res => res.json())
      .then(data => {
        setOrdenes(data.sort((a, b) => b.id - a.id))
        setCargando(false)
      })
      .catch(err => {
        setCargando(false)
        toast.error("Error al cargar el historial desde el servidor.");
      })
  }

  const calcularPrecioItem = (servicio, categoria) => {
      if (!servicio) return 0;
      if (categoria === 'CATEGORIA_B') return servicio.precioB || 0;
      if (categoria === 'CATEGORIA_C') return servicio.precioC || 0;
      return servicio.precioA || 0; 
  }

  const cambiarEstado = (orden, nuevoEstado) => {
    const toastId = toast.loading("Actualizando estado...");
    
    fetch(`http://localhost:8080/api/ordenes/${orden.id}/estado?estado=${nuevoEstado}`, {
        method: 'PATCH'
    })
    .then(async (res) => {
        if (!res.ok) throw new Error("El servidor rechazó la actualización");
        toast.success(`Estado cambiado a: ${nuevoEstado.replace('_', ' ')}`, { id: toastId });
        cargarOrdenes(); 
    })
    .catch((err) => {
        toast.error("Fallo al cambiar estado. Revisá si el backend está corriendo.", { id: toastId });
    });
  }

  // ---> NUEVA FUNCIÓN: Conecta con el PatchMapping de pago que hiciste en Java <---
  const cambiarPago = (orden, nuevaFormaPago) => {
    const toastId = toast.loading("Actualizando forma de pago...");
    
    fetch(`http://localhost:8080/api/ordenes/${orden.id}/pago?formaPago=${nuevaFormaPago}`, {
        method: 'PATCH'
    })
    .then(async (res) => {
        if (!res.ok) throw new Error("El servidor rechazó la actualización");
        toast.success(`Pago registrado como: ${nuevaFormaPago.replace('_', ' ')}`, { id: toastId });
        cargarOrdenes(); 
    })
    .catch((err) => {
        toast.error("Fallo al registrar pago.", { id: toastId });
    });
  }

  const imprimirTicket = (orden) => {
    const ventanita = window.open('', 'PRINT', 'height=800,width=800');
    
    const categoria = orden.vehiculo?.categoria;
    let htmlItems = '';
    let totalReal = 0;

    if (orden.items && orden.items.length > 0) {
        orden.items.forEach(item => {
            const precio = calcularPrecioItem(item.tipoServicio, categoria);
            totalReal += precio;
            htmlItems += `
                <tr>
                    <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; color: #334155;">${item.tipoServicio?.descripcion || 'Servicio'}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: 500; color: #0f172a;">$${precio.toLocaleString()}</td>
                </tr>
            `;
        });
    } else {
        totalReal = orden.costoTotal || 0;
        htmlItems = `<tr><td colspan="2" style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${orden.descripcion}</td></tr>`;
    }

    // Le damos formato legible al método de pago para el PDF
    const pagoFormateado = orden.formaPago ? orden.formaPago.replace('_', ' ') : 'A COORDINAR';

    ventanita.document.write(`
        <html>
            <head>
                <title>Factura #${orden.id} - Taller El Pato</title>
                <style>
                    body { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.6; background: #fff; margin: 0; padding: 40px; }
                    .invoice-box { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #cbd5e1; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
                    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px; }
                    .header h1 { margin: 0; color: #1e40af; font-size: 28px; }
                    .header p { margin: 5px 0 0 0; color: #64748b; font-size: 14px; }
                    .invoice-details { text-align: right; }
                    .invoice-details h2 { margin: 0; color: #0f172a; font-size: 20px; }
                    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; }
                    .info-col h3 { margin-top: 0; color: #475569; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #cbd5e1; padding-bottom: 5px; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                    th { text-align: left; background: #f1f5f9; padding: 12px; font-size: 14px; color: #475569; text-transform: uppercase; border-bottom: 2px solid #cbd5e1; }
                    .total-box { display: flex; justify-content: flex-end; }
                    .total-content { background: #eff6ff; padding: 20px 30px; border-radius: 8px; border: 1px solid #bfdbfe; text-align: right; }
                    .total-content span { display: block; color: #1e40af; font-size: 14px; text-transform: uppercase; font-weight: bold; margin-bottom: 5px; }
                    .total-content strong { font-size: 28px; color: #1d4ed8; }
                    .footer { text-align: center; margin-top: 40px; color: #94a3b8; font-size: 13px; border-top: 1px solid #e2e8f0; padding-top: 20px; }
                </style>
            </head>
            <body>
                <div class="invoice-box">
                    <div class="header">
                        <div>
                            <h1>TALLER EL PATO</h1>
                            <p>Servicio Automotor Integral</p>
                            <p>Capitán Sarmiento, Buenos Aires</p>
                        </div>
                        <div class="invoice-details">
                            <h2>FACTURA ORIGINAL</h2>
                            <p><strong>Orden N°:</strong> #${orden.id}</p>
                            <p><strong>Fecha:</strong> ${new Date(orden.fechaIngreso).toLocaleDateString('es-AR')}</p>
                        </div>
                    </div>
                    
                    <div class="info-grid">
                        <div class="info-col">
                            <h3>Datos del Cliente</h3>
                            <strong>${orden.vehiculo?.cliente ? `${orden.vehiculo.cliente.nombre} ${orden.vehiculo.cliente.apellido}` : 'Consumidor Final'}</strong><br>
                            Teléfono: ${orden.vehiculo?.cliente?.telefono || 'No registrado'}<br>
                            Email: ${orden.vehiculo?.cliente?.email || 'No registrado'}
                        </div>
                        <div class="info-col">
                            <h3>Datos del Vehículo</h3>
                            <strong>${orden.vehiculo?.marca} ${orden.vehiculo?.modelo}</strong><br>
                            Patente: <span style="background: #1e293b; color: white; padding: 2px 6px; border-radius: 4px; font-family: monospace;">${orden.vehiculo?.patente}</span><br>
                            Kilometraje: ${orden.vehiculo?.kilometraje ? orden.vehiculo.kilometraje.toLocaleString() + ' km' : 'No registrado'}<br>
                            Motor: ${orden.vehiculo?.numeroMotor || 'S/D'}
                        </div>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th>Descripción del Trabajo / Repuesto</th>
                                <th style="text-align: right;">Importe</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${htmlItems}
                        </tbody>
                    </table>

                    <div class="total-box">
                        <div class="total-content">
                            <span>Total a Pagar</span>
                            <strong>$${totalReal.toLocaleString()}</strong>
                            <p style="margin: 10px 0 0 0; color: #475569; font-size: 14px;">Forma de Pago: <strong>${pagoFormateado}</strong></p>
                        </div>
                    </div>
                    
                    <div class="footer">
                        <p>Los trabajos tienen una garantía de 30 días o 1000km, lo que ocurra primero.</p>
                        <p>¡Gracias por confiar en Taller El Pato!</p>
                    </div>
                </div>
            </body>
        </html>
    `);

    ventanita.document.close();
    ventanita.focus();
    setTimeout(() => { ventanita.print(); }, 500);
  }

  const toggleFila = (id) => {
    if (filaExpandida === id) {
        setFilaExpandida(null);
    } else {
        setFilaExpandida(id);
    }
  }

  const ordenesFiltradas = ordenes.filter(o => {
    if (!o || !o.vehiculo) return false;
    const termino = busqueda.toLowerCase()
    const idString = o.id.toString()
    const patente = (o.vehiculo.patente || '').toLowerCase()
    const nombreCliente = o.vehiculo.cliente ? `${o.vehiculo.cliente.nombre} ${o.vehiculo.cliente.apellido}`.toLowerCase() : ''
    
    return idString.includes(termino) || patente.includes(termino) || nombreCliente.includes(termino)
  })

  const inputStyle = { padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: 'white', color: '#333', width: '300px', boxSizing: 'border-box' }

  const getColorEstado = (estado) => {
      switch(estado) {
          case 'PENDIENTE': return '#f59e0b'; 
          case 'EN_REPARACION': return '#3b82f6'; 
          case 'FINALIZADO': return '#8b5cf6'; 
          case 'ENTREGADO': return '#10b981'; 
          default: return '#64748b'; 
      }
  }

  return (
    <div style={{ color: '#333' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
              <h1 style={{ margin: 0, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <History size={32} color="#3b82f6" /> Historial Operativo
              </h1>
              <p style={{ color: '#64748b', margin: '5px 0 0 0', fontSize: '1em' }}>Revisá todos los trabajos, cambiá estados e imprimí facturas.</p>
          </div>
          
          <div style={{ position: 'relative' }}>
              <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" 
                placeholder="Buscar ID, patente o dueño..." 
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                style={{ ...inputStyle, paddingLeft: '35px', border: '2px solid #3b82f6' }}
              />
          </div>
      </div>

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        {cargando ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Cargando registros...</div>
        ) : ordenesFiltradas.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No se encontraron órdenes.</div>
        ) : (
            <div style={{overflowX: 'auto'}}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1050px' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc', color: '#475569', borderBottom: '2px solid #e2e8f0' }}>
                            <th style={{ textAlign: 'left', padding: '15px' }}>ID</th>
                            <th style={{ textAlign: 'left', padding: '15px' }}>Fecha</th>
                            <th style={{ textAlign: 'left', padding: '15px' }}>Vehículo / Dueño</th>
                            <th style={{ textAlign: 'left', padding: '15px' }}>ESTADO</th>
                            {/* ---> NUEVA COLUMNA DE PAGO <--- */}
                            <th style={{ textAlign: 'left', padding: '15px' }}>PAGO</th>
                            <th style={{ textAlign: 'right', padding: '15px' }}>Total Exacto</th>
                            <th style={{ textAlign: 'center', padding: '15px', width: '120px' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ordenesFiltradas.map(o => {
                            const categoria = o.vehiculo?.categoria;
                            const totalReal = o.items && o.items.length > 0 
                                ? o.items.reduce((sum, item) => sum + calcularPrecioItem(item.tipoServicio, categoria), 0) 
                                : (o.costoTotal || 0);

                            return (
                            <Fragment key={o.id}>
                                <tr style={{ borderBottom: '1px solid #e2e8f0', background: filaExpandida === o.id ? '#f0fdf4' : 'white', transition: '0.2s background' }}>
                                    <td style={{ padding: '15px', fontWeight: 'bold', color: '#2563eb' }}>#{o.id}</td>
                                    <td style={{ padding: '15px', color: '#475569' }}>{new Date(o.fechaIngreso).toLocaleDateString('es-AR')}</td>
                                    <td style={{ padding: '15px' }}>
                                        <div style={{ fontWeight: 'bold', color: '#1e293b' }}>{o.vehiculo?.patente || 'S/P'} - {o.vehiculo?.marca}</div>
                                        <div style={{ fontSize: '0.85em', color: '#64748b' }}>👤 {o.vehiculo?.cliente ? `${o.vehiculo.cliente.nombre} ${o.vehiculo.cliente.apellido}` : 'Sin dueño'}</div>
                                    </td>
                                    
                                    <td style={{ padding: '15px' }}>
                                        <select 
                                            value={o.estado || 'PENDIENTE'} 
                                            onChange={(e) => cambiarEstado(o, e.target.value)}
                                            style={{ 
                                                padding: '6px 10px', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.85em', cursor: 'pointer', outline: 'none',
                                                backgroundColor: 'white', color: getColorEstado(o.estado), border: `2px solid ${getColorEstado(o.estado)}`
                                            }}
                                        >
                                            <option value="PENDIENTE">PENDIENTE</option>
                                            <option value="EN_REPARACION">EN REPARACIÓN</option>
                                            <option value="FINALIZADO">FINALIZADO</option>
                                            <option value="ENTREGADO">ENTREGADO</option>
                                        </select>
                                    </td>

                                    {/* ---> NUEVO: Selector de Forma de Pago <--- */}
                                    <td style={{ padding: '15px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <CreditCard size={16} color="#475569" />
                                            <select 
                                                value={o.formaPago || 'PENDIENTE'} 
                                                onChange={(e) => cambiarPago(o, e.target.value)}
                                                style={{ 
                                                    padding: '6px', borderRadius: '8px', fontSize: '0.85em', cursor: 'pointer', outline: 'none',
                                                    backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1'
                                                }}
                                            >
                                                <option value="PENDIENTE">Pendiente</option>
                                                <option value="EFECTIVO">Efectivo 💵</option>
                                                <option value="TRANSFERENCIA">Transferencia 🏦</option>
                                                <option value="MERCADO_PAGO">Mercado Pago 📱</option>
                                                <option value="TARJETA_DEBITO">Débito 💳</option>
                                                <option value="TARJETA_CREDITO">Crédito 💳</option>
                                            </select>
                                        </div>
                                    </td>

                                    <td style={{ padding: '15px', textAlign: 'right', fontWeight: 'bold', color: '#166534', fontSize: '1.1em' }}>
                                        ${totalReal.toLocaleString()}
                                    </td>

                                    <td style={{ padding: '15px', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '10px' }}>
                                        <button 
                                            onClick={() => imprimirTicket(o)}
                                            title="Imprimir Factura A4"
                                            style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer', transition: '0.2s' }}
                                        >
                                            <Printer size={18} />
                                        </button>
                                        
                                        <button 
                                            onClick={() => toggleFila(o.id)}
                                            title="Ver Detalle de Ítems"
                                            style={{ background: filaExpandida === o.id ? '#166534' : '#e2e8f0', color: filaExpandida === o.id ? 'white' : '#475569', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer', transition: '0.2s' }}
                                        >
                                            {filaExpandida === o.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                        </button>
                                    </td>
                                </tr>

                                {filaExpandida === o.id && (
                                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid #cbd5e1' }}>
                                        <td colSpan="7" style={{ padding: '0' }}>
                                            <div style={{ padding: '20px 30px', display: 'flex', gap: '40px' }}>
                                                
                                                <div style={{ flex: '1', borderRight: '1px solid #cbd5e1', paddingRight: '20px' }}>
                                                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 0, color: '#1e40af' }}>
                                                        <Receipt size={18} /> Info Técnica
                                                    </h4>
                                                    <div style={{ display: 'grid', gap: '10px', fontSize: '0.9em', color: '#475569', marginTop: '15px' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Car size={16}/> <strong>Motor:</strong> {o.vehiculo?.numeroMotor || 'N/A'}</div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Car size={16}/> <strong>Chasis:</strong> {o.vehiculo?.numeroChasis || 'N/A'}</div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><User size={16}/> <strong>Teléfono:</strong> {o.vehiculo?.cliente?.telefono || 'N/A'}</div>
                                                    </div>
                                                </div>

                                                <div style={{ flex: '2' }}>
                                                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 0, color: '#334155' }}>
                                                        <Wrench size={18} /> Trabajos Facturados (Ítems)
                                                    </h4>
                                                    
                                                    {(!o.items || o.items.length === 0) ? (
                                                        <p style={{ color: '#94a3b8', fontSize: '0.9em' }}>No hay detalle de ítems cargados.</p>
                                                    ) : (
                                                        <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '10px' }}>
                                                            {o.items.map((item, idx) => {
                                                                const precioCalculado = calcularPrecioItem(item.tipoServicio, categoria);
                                                                return (
                                                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: idx !== o.items.length -1 ? '1px dashed #cbd5e1' : 'none' }}>
                                                                        <span style={{ color: '#334155', fontSize: '0.95em' }}>{item.tipoServicio?.descripcion || 'Servicio'}</span>
                                                                        <span style={{ fontWeight: 'bold', color: '#166534' }}>${precioCalculado.toLocaleString()}</span>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>

                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </Fragment>
                        )})}
                    </tbody>
                </table>
            </div>
        )}
      </div>

    </div>
  )
}

export default Historial