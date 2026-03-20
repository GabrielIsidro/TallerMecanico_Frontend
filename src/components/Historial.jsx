import { useEffect, useState } from 'react'

function Historial() {
  /* --- 1. ESTADOS --- */
  const [ordenes, setOrdenes] = useState([]) // Guarda la lista de todas las facturas/órdenes
  const [ordenSeleccionada, setOrdenSeleccionada] = useState(null) // Guarda los datos de la orden que queremos ver/imprimir en el modal

  /* --- 2. CARGA INICIAL --- */
  useEffect(() => {
    cargarOrdenes()
  }, [])

  const cargarOrdenes = () => {
    fetch('http://localhost:8080/api/ordenes')
      .then(res => res.json())
      .then(data => {
        // Lógica de ordenamiento: 
        // b.id - a.id asegura que las órdenes más nuevas (IDs más altos) aparezcan arriba en la tabla
        const ordenadas = data.sort((a, b) => b.id - a.id);
        setOrdenes(ordenadas)
      })
      .catch(err => console.error(err))
  }

  /* --- 3. ACTUALIZACIÓN DE ESTADOS (PATCH) --- 
   * Usamos PATCH en lugar de PUT porque solo queremos modificar un campito 
   * específico (el estado) y no toda la orden de trabajo.
   */
  const cambiarEstado = (id, nuevoEstado) => {
    fetch(`http://localhost:8080/api/ordenes/${id}/estado?estado=${nuevoEstado}`, {
        method: 'PATCH' // Método HTTP ideal para actualizaciones parciales
    })
    .then(res => {
        if (!res.ok) throw new Error("Error al cambiar estado");
        cargarOrdenes(); // Refrescamos la tabla general
        
        // Sincronización de UI: Si justo tenemos esa orden abierta en el modal, 
        // le actualizamos el estado en vivo para que no muestre datos viejos.
        if (ordenSeleccionada && ordenSeleccionada.id === id) {
            setOrdenSeleccionada({...ordenSeleccionada, estado: nuevoEstado});
        }
    })
    .catch(err => alert("Error. Verifica que el Enum en Java coincida con las opciones."))
  }

  /* --- 4. DICCIONARIO DE ESTILOS VISUALES --- 
   * Un "Switch" muy limpio que recibe el estado de la base de datos y 
   * devuelve un objeto con los colores y el texto formateado con un emoji.
   */
  const getEstilosEstado = (estado) => {
    switch(estado) {
        case 'ENTREGADO': return { bg: '#dcfce7', color: '#166534', border: '#bbf7d0', texto: '🚗 Entregado' }; 
        case 'FINALIZADO': return { bg: '#dbeafe', color: '#1e40af', border: '#bfdbfe', texto: '🏁 Finalizado' }; 
        case 'EN_REPARACION': return { bg: '#ffedd5', color: '#c2410c', border: '#fed7aa', texto: '🔧 En Reparación' }; 
        case 'APROBADO': return { bg: '#f3e8ff', color: '#6b21a8', border: '#e9d5ff', texto: '👍 Aprobado' }; 
        case 'PRESUPUESTADO': return { bg: '#e0f2fe', color: '#0369a1', border: '#bae6fd', texto: '📝 Presupuestado' }; 
        // El 'default' actúa como paracaídas si llega un estado nulo o desconocido
        default: return { bg: '#fef9c3', color: '#854d0e', border: '#fde047', texto: '⏳ Pendiente' }; 
    }
  }

  // Estilo base para el fondo oscuro del modal emergente
  const modalStyle = {
    position: 'fixed', top: '0', left: '0', width: '100%', height: '100%',
    backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
  }

  return (
    <div style={{ color: '#333' }}>
      
      {/* --- MAGIA DE IMPRESIÓN (CSS Inject) --- 
       * @media print le avisa al navegador: "Cuando el usuario apriete Ctrl+P, aplicá estas reglas".
       * 1. Oculta todo el body.
       * 2. Vuelve visible solo el div con id "zona-factura".
       * 3. Le quita márgenes y sombras a la factura para que no gaste tinta ni se imprima corrida.
       * 4. Oculta los botones (clase "no-imprimir") para que no salgan en el papel.
       */}
      <style>
        {`
          @media print {
            body * { visibility: hidden; }
            #zona-factura, #zona-factura * { visibility: visible; }
            #zona-factura { position: absolute; left: 0; top: 0; width: 100%; height: 100%; margin: 0; padding: 20px; box-shadow: none; border: none; }
            .no-imprimir { display: none !important; }
          }
        `}
      </style>

      <h1 style={{ color: '#1e293b', marginTop: 0 }}>Historial de Trabajos</h1>
      
      {/* --- TABLA PRINCIPAL --- */}
      <div className="card">
        {ordenes.length === 0 ? (
           <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>📂 No hay órdenes creadas todavía.</div>
        ) : (
          <table style={{ width: '100%' }}>
            <thead>
              <tr style={{ color: '#64748b', borderBottom: '2px solid #eee' }}>
                <th style={{ textAlign: 'left', padding: '12px' }}>#</th>
                <th style={{ textAlign: 'left', padding: '12px' }}>Fecha</th>
                <th style={{ textAlign: 'left', padding: '12px' }}>Vehículo / Cliente</th>
                <th style={{ textAlign: 'left', padding: '12px' }}>Total</th>
                <th style={{ textAlign: 'center', padding: '12px' }}>Estado</th>
                <th style={{ textAlign: 'right', padding: '12px' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ordenes.map(orden => {
                // Obtenemos los colores para la fila actual
                const estilos = getEstilosEstado(orden.estado);
                
                return (
                  <tr key={orden.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px', fontWeight: 'bold', color: '#2563eb' }}>#{orden.id}</td>
                    
                    {/* Formateamos la fecha que viene de la BD a formato local (Ej: dd/mm/aaaa) */}
                    <td style={{ padding: '12px', fontSize: '0.9em' }}>{new Date(orden.fechaIngreso).toLocaleDateString()}</td>
                    
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: 'bold' }}>{orden.vehiculo.modelo} ({orden.vehiculo.patente})</div>
                      <div style={{ fontSize: '0.85em', color: '#64748b' }}>{orden.vehiculo.cliente ? `👤 ${orden.vehiculo.cliente.nombre}` : 'Sin dueño'}</div>
                    </td>
                    
                    <td style={{ padding: '12px', fontWeight: 'bold', color: '#166534' }}>${orden.costoTotal ? orden.costoTotal.toLocaleString() : '0'}</td>
                    
                    {/* SELECTOR DE ESTADOS */}
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <select 
                        value={orden.estado || 'PENDIENTE'}
                        onChange={(e) => cambiarEstado(orden.id, e.target.value)}
                        // Aplicamos los colores dinámicos calculados arriba
                        style={{ backgroundColor: estilos.bg, color: estilos.color, border: `1px solid ${estilos.border}`, padding: '6px 10px', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.85em', cursor: 'pointer', outline: 'none' }}
                      >
                        <option value="PENDIENTE">⏳ Pendiente</option>
                        <option value="PRESUPUESTADO">📝 Presupuestado</option>
                        <option value="APROBADO">👍 Aprobado</option>
                        <option value="EN_REPARACION">🔧 En Reparación</option>
                        <option value="FINALIZADO">🏁 Finalizado</option>
                        <option value="ENTREGADO">🚗 Entregado</option>
                      </select>
                    </td>

                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      {/* Al hacer click, guardamos toda la orden en el estado, lo que "activa" el modal inferior */}
                      <button className="btn" title="Ver Detalle" onClick={() => setOrdenSeleccionada(orden)} style={{ background: '#3b82f6', color: 'white', padding: '6px 12px' }}>📄 Factura / Orden</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* --- MODAL / FACTURA IMPRIMIBLE --- 
       * Solo se renderiza si 'ordenSeleccionada' no es nulo.
       */}
      {ordenSeleccionada && (
        // Al hacer click en el fondo oscuro, cerramos el modal
        <div style={modalStyle} onClick={() => setOrdenSeleccionada(null)}>
            
            <div 
                id="zona-factura" 
                style={{ background: 'white', padding: '40px', borderRadius: '8px', width: '600px', maxWidth: '95%', position: 'relative', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', color: '#333' }} 
                // e.stopPropagation() es CRUCIAL acá: Evita que al hacer click *dentro* de la factura blanca, 
                // el click traspase al fondo oscuro y se cierre el modal accidentalmente.
                onClick={e => e.stopPropagation()}
            >
                {/* Botón de cerrar (Clase no-imprimir para que no ensucie el papel) */}
                <button className="no-imprimir" onClick={() => setOrdenSeleccionada(null)} style={{ position:'absolute', top:'15px', right:'15px', background:'none', border:'none', fontSize:'24px', cursor:'pointer' }}>✖</button>

                {/* --- DISEÑO DE LA FACTURA --- */}
                
                {/* Cabecera corporativa */}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #1e293b', paddingBottom: '20px', marginBottom: '20px' }}>
                    <div>
                        <h2 style={{ margin: 0, color: '#1e293b', fontSize: '28px' }}>TALLER EL PATO</h2>
                        <p style={{ margin: '5px 0 0 0', color: '#64748b' }}>Especialistas en Inyección y Mecánica</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <h3 style={{ margin: 0, color: '#3b82f6' }}>ORDEN DE TRABAJO</h3>
                        <p style={{ margin: '5px 0 0 0', fontWeight: 'bold' }}>N° #{ordenSeleccionada.id}</p>
                        <p style={{ margin: '5px 0 0 0', color: '#64748b' }}>Fecha: {new Date(ordenSeleccionada.fechaIngreso).toLocaleDateString()}</p>
                    </div>
                </div>
                
                {/* Cajas de datos del Cliente y Vehículo */}
                <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
                    <div style={{ flex: 1, background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <h4 style={{ margin: '0 0 10px 0', color: '#1e293b' }}>Datos del Cliente</h4>
                        <p style={{ margin: '5px 0' }}><strong>Nombre:</strong> {ordenSeleccionada.vehiculo.cliente ? `${ordenSeleccionada.vehiculo.cliente.nombre} ${ordenSeleccionada.vehiculo.cliente.apellido}` : 'Consumidor Final'}</p>
                        <p style={{ margin: '5px 0' }}><strong>Teléfono:</strong> {ordenSeleccionada.vehiculo.cliente ? ordenSeleccionada.vehiculo.cliente.telefono : '-'}</p>
                    </div>
                    <div style={{ flex: 1, background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <h4 style={{ margin: '0 0 10px 0', color: '#1e293b' }}>Datos del Vehículo</h4>
                        <p style={{ margin: '5px 0' }}><strong>Vehículo:</strong> {ordenSeleccionada.vehiculo.marca} {ordenSeleccionada.vehiculo.modelo}</p>
                        <p style={{ margin: '5px 0' }}><strong>Patente:</strong> {ordenSeleccionada.vehiculo.patente.toUpperCase()}</p>
                        <p style={{ margin: '5px 0' }}><strong>KM:</strong> {ordenSeleccionada.vehiculo.kilometraje ? `${ordenSeleccionada.vehiculo.kilometraje.toLocaleString()} km` : '-'}</p>
                    </div>
                </div>

                {/* Detalle iterativo de servicios realizados */}
                <h4 style={{ borderBottom: '1px solid #cbd5e1', paddingBottom: '10px', color: '#1e293b' }}>Detalle de Reparaciones</h4>
                <table style={{ width: '100%', marginBottom: '30px', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f1f5f9' }}>
                            <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #cbd5e1' }}>Descripción del Servicio</th>
                            <th style={{ padding: '10px', textAlign: 'right', borderBottom: '1px solid #cbd5e1' }}>Importe</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Verificamos que existan ítems antes de mapearlos para evitar errores de renderizado */}
                        {ordenSeleccionada.items && ordenSeleccionada.items.map((item, idx) => (
                            <tr key={idx}>
                                <td style={{ padding: '10px', borderBottom: '1px solid #f1f5f9' }}>{item.tipoServicio ? item.tipoServicio.descripcion : 'Servicio'}</td>
                                <td style={{ padding: '10px', textAlign: 'right', borderBottom: '1px solid #f1f5f9' }}>${item.subtotal ? item.subtotal.toLocaleString() : '0'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Gran Total */}
                <div style={{ textAlign: 'right', fontSize: '1.5em', color: '#166534', borderTop: '2px solid #1e293b', paddingTop: '15px' }}>
                    <strong>TOTAL: ${ordenSeleccionada.costoTotal ? ordenSeleccionada.costoTotal.toLocaleString() : '0'}</strong>
                </div>

                {/* Pie de página con legales/avisos */}
                <div style={{ marginTop: '40px', textAlign: 'center', fontSize: '0.8em', color: '#94a3b8' }}>
                    <p>Los presupuestos tienen una validez de 7 días. El kilometraje para próximo service es orientativo.</p>
                    <p>¡Gracias por confiar en nosotros!</p>
                </div>

                {/* Botón que dispara el evento nativo de impresión del navegador */}
                <div className="no-imprimir" style={{ marginTop: '30px', textAlign: 'center' }}>
                    <button 
                        onClick={() => window.print()} 
                        style={{ background: '#2563eb', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '10px' }}
                    >
                        🖨️ Generar PDF / Imprimir
                    </button>
                </div>

            </div>
        </div>
      )}

    </div>
  )
}

export default Historial