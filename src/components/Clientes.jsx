import { useEffect, useState } from 'react'

function Clientes() {
  /* --- 1. ESTADOS (Memoria del componente) --- */
  
  // 'clientes' guarda la lista completa de personas traídas de la base de datos
  const [clientes, setClientes] = useState([])
  
  // Estados para controlar la Interfaz de Usuario (UI) al editar
  const [modoEdicion, setModoEdicion] = useState(false) // ¿Estamos creando o editando?
  const [idEditar, setIdEditar] = useState(null) // Si estamos editando, ¿cuál es el ID del cliente?
  
  // Estado para el buscador en tiempo real
  const [busqueda, setBusqueda] = useState('') 
  
  // Estado que agrupa los datos del formulario en un solo objeto
  const [nuevoCliente, setNuevoCliente] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    email: ''
  })

  /* --- 2. EFECTOS (Ciclo de vida) --- 
   * useEffect con un arreglo vacío [] al final significa: 
   * "Ejecuta esta función una sola vez, justo cuando la pantalla cargue".
   */
  useEffect(() => {
    cargarClientes()
  }, [])

  /* --- 3. FUNCIONES DE COMUNICACIÓN CON EL BACKEND (API) --- */

  // READ: Trae la lista de clientes desde tu servidor Java (Spring/Tomcat en el puerto 8080)
  const cargarClientes = () => {
    fetch('http://localhost:8080/api/clientes')
      .then(res => res.json()) // Convierte la respuesta a formato JSON
      .then(data => setClientes(data)) // Guarda los datos en el estado 'clientes'
      .catch(err => console.error("Error cargando clientes:", err))
  }

  // CREATE / UPDATE: Maneja el botón de "Guardar" o "Actualizar"
  const manejarGuardado = () => {
    // Validación básica: Exigimos los datos mínimos de contacto
    if(!nuevoCliente.nombre || !nuevoCliente.apellido || !nuevoCliente.telefono) {
        alert("Por favor completa Nombre, Apellido y Teléfono");
        return; // Corta la ejecución si faltan datos
    }

    // Lógica inteligente: Decide si es una actualización (PUT) o una creación (POST)
    // basándose en el estado 'modoEdicion'
    const url = modoEdicion ? `http://localhost:8080/api/clientes/${idEditar}` : 'http://localhost:8080/api/clientes';
    const metodo = modoEdicion ? 'PUT' : 'POST';

    fetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoCliente) // Envía los datos del formulario al backend
    })
    .then(async (res) => {
        if (!res.ok) {
            // Si el backend tira un error (ej. email duplicado), lo capturamos
            const textoError = await res.text();
            throw new Error(textoError || "Error en el servidor al guardar el cliente.");
        }
        alert(modoEdicion ? "¡Cliente actualizado!" : "¡Cliente guardado!");
        terminarEdicion(); // Limpiamos el formulario
        cargarClientes();  // Refrescamos la tabla para ver los cambios
    })
    .catch(err => alert("⚠️ No se pudo guardar:\n\n" + err.message))
  }

  // DELETE: Borra un cliente por su ID
  const eliminarCliente = (id) => {
    // Confirmación de seguridad crucial para el sistema del taller
    if(!confirm("¿Borrar este cliente?\n\nOJO: Si el cliente tiene vehículos registrados, el sistema no te dejará borrarlo.")) return;
    
    fetch(`http://localhost:8080/api/clientes/${id}`, { method: 'DELETE' })
    .then(async (res) => {
        if (!res.ok) {
            // Manejo del error de Integridad Referencial de la base de datos
            // (cuando intentas borrar un cliente que ya tiene historial o autos asociados)
            throw new Error("No se puede borrar. Es casi seguro que este cliente tiene vehículos u órdenes de trabajo asociados en el sistema.");
        }
        cargarClientes(); // Recargamos la lista
        alert("Cliente eliminado correctamente.");
    })
    .catch(err => alert("⚠️ Error al borrar:\n\n" + err.message))
  }

  /* --- 4. FUNCIONES DE CONTROL DE INTERFAZ --- */

  // Prepara el formulario para editar: Carga los datos de la fila seleccionada en los inputs
  const iniciarEdicion = (cliente) => {
    setModoEdicion(true);
    setIdEditar(cliente.id);
    setNuevoCliente({
        nombre: cliente.nombre,
        apellido: cliente.apellido,
        telefono: cliente.telefono,
        email: cliente.email || '' // Evita errores si el email es nulo en la BD
    })
  }

  // Resetea el formulario y sale del modo edición
  const terminarEdicion = () => {
    setModoEdicion(false);
    setIdEditar(null);
    setNuevoCliente({ nombre: '', apellido: '', telefono: '', email: '' });
  }

  /* --- 5. LÓGICA DE BUSCADOR (Filtro en memoria) --- 
   * Gran optimización: En lugar de pedirle al servidor que busque cada vez que
   * tecleamos una letra, filtramos la lista que ya tenemos guardada en el navegador.
   */
  const clientesFiltrados = clientes.filter(c => {
      const termino = busqueda.toLowerCase();
      const nombreCompleto = `${c.nombre} ${c.apellido}`.toLowerCase();
      const tel = (c.telefono || '').toLowerCase();
      // Retorna true si lo escrito coincide con el nombre o el teléfono
      return nombreCompleto.includes(termino) || tel.includes(termino);
  });

  // Objeto de estilos reutilizable para los inputs
  const inputStyle = { padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: 'white', color: '#333', width: '100%', boxSizing: 'border-box' }

  return (
    <div style={{ color: '#333' }}>
      <h1 style={{ color: '#1e293b', marginTop: 0 }}>Gestión de Clientes</h1>
      
      {/* --- ZONA 1: FORMULARIO --- 
       * Cambia visualmente (colores y título) dependiendo de si estamos
       * creando o editando, para darle feedback claro al usuario.
       */}
      <div className="card" style={{ background: modoEdicion ? '#fff7ed' : '#eef2ff', border: modoEdicion ? '2px solid #fdba74' : '1px solid #c7d2fe', padding: '20px' }}>
        <h3 style={{ marginTop: 0, color: modoEdicion ? '#c2410c' : '#1e40af' }}>{modoEdicion ? '✏️ Editar Cliente' : '➕ Nuevo Cliente'}</h3>
        
        {/* CSS Grid para que los inputs se acomoden solos según el tamaño de la pantalla */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          
          {/* Inputs controlados: El 'value' está atado al estado, y 'onChange' actualiza solo la propiedad correspondiente del objeto */}
          <input placeholder="Nombre" value={nuevoCliente.nombre} onChange={e => setNuevoCliente({...nuevoCliente, nombre: e.target.value})} style={inputStyle} />
          <input placeholder="Apellido" value={nuevoCliente.apellido} onChange={e => setNuevoCliente({...nuevoCliente, apellido: e.target.value})} style={inputStyle} />
          <input placeholder="Teléfono (Ej: 11-1234-5678)" value={nuevoCliente.telefono} onChange={e => setNuevoCliente({...nuevoCliente, telefono: e.target.value})} style={inputStyle} />
          <input placeholder="Email (Opcional)" value={nuevoCliente.email} onChange={e => setNuevoCliente({...nuevoCliente, email: e.target.value})} style={inputStyle} />
          
          {/* Botón dinámico: Cambia de color y texto según el modo */}
          <button className="btn" onClick={manejarGuardado} style={{ backgroundColor: modoEdicion ? '#f97316' : '#2563eb', color: 'white', width: '100%' }}>{modoEdicion ? 'Actualizar' : 'Guardar'}</button>
          
          {/* Botón de cancelar: Solo aparece si estamos editando */}
          {modoEdicion && <button className="btn" onClick={terminarEdicion} style={{ backgroundColor: '#94a3b8', color: 'white', width: '100%' }}>Cancelar</button>}
        </div>
      </div>

      {/* --- ZONA 2: TABLA CON BUSCADOR --- */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ margin: 0 }}>👥 Cartera de Clientes</h3>
            
            {/* Input del buscador: Atado al estado 'busqueda' */}
            <input 
                type="text" 
                placeholder="🔍 Buscar por nombre o teléfono..." 
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                style={{ ...inputStyle, width: '300px', border: '2px solid #3b82f6' }}
            />
        </div>

        {/* Renderizado condicional: Si no hay resultados de búsqueda, mostramos un mensaje vacío. 
            Si hay, dibujamos la tabla. */}
        {clientesFiltrados.length === 0 ? <p style={{textAlign:'center', color:'#888'}}>No se encontraron clientes.</p> : (
            <div style={{overflowX: 'auto'}}>
                <table style={{ width: '100%', minWidth: '600px' }}>
                <thead>
                    <tr style={{ color: '#64748b', borderBottom: '2px solid #eee' }}>
                        <th style={{ textAlign: 'left', padding: '10px' }}>Nombre</th>
                        <th style={{ textAlign: 'left', padding: '10px' }}>Contacto</th>
                        <th style={{ textAlign: 'left', padding: '10px' }}>Email</th>
                        <th style={{ textAlign: 'right', padding: '10px' }}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {/* Iteramos sobre los clientes filtrados para generar las filas */}
                    {clientesFiltrados.map(c => (
                    <tr key={c.id} style={{ borderBottom: '1px solid #eee', color: '#333' }}>
                        <td style={{ padding: '10px', fontWeight: 'bold' }}>{c.nombre} {c.apellido}</td>
                        <td style={{ padding: '10px' }}>
                            <span style={{ background: '#dcfce7', color: '#166534', padding: '4px 8px', borderRadius: '15px', fontSize: '0.9em', display:'inline-flex', alignItems:'center', gap:'5px' }}>
                               📞 {c.telefono}
                            </span>
                        </td>
                        <td style={{ padding: '10px', color: '#64748b' }}>{c.email || '-'}</td>
                        <td style={{ padding: '10px', textAlign: 'right' }}>
                            {/* Botones de acción por fila que llaman a nuestras funciones pasando el cliente actual */}
                            <button className="btn" style={{ background: '#f59e0b', color: 'white', marginRight: '5px', padding: '5px 10px', minWidth: 'auto' }} onClick={() => iniciarEdicion(c)}>✏️</button>
                            <button className="btn" style={{ background: '#ef4444', color: 'white', padding: '5px 10px', minWidth: 'auto' }} onClick={() => eliminarCliente(c.id)}>🗑️</button>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
        )}
      </div>
    </div>
  )
}

export default Clientes