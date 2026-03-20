/* main.jsx - Punto de entrada de la aplicación */

// Importamos las herramientas principales de React necesarias para arrancar
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Importamos los estilos globales que revisamos anteriormente
// Esto asegura que variables, reseteos y temas se apliquen a toda la app
import './index.css'

// Importamos el componente raíz. 'App' es el contenedor principal 
// donde vivirá toda la estructura del sistema (el sidebar, las tarjetas, etc.)
import App from './App.jsx'

/* * INICIALIZACIÓN DE REACT
 * 1. document.getElementById('root'): Busca en tu archivo index.html un 
 * elemento (generalmente un <div>) que tenga el id "root".
 * 2. createRoot(...): Le dice a React que tome control de ese <div>.
 * 3. .render(...): Dibuja nuestra aplicación de React dentro de ese espacio.
 */
createRoot(document.getElementById('root')).render(
  /* * <StrictMode> es una herramienta de desarrollo de React.
   * No renderiza nada visible en la pantalla, pero ayuda a detectar 
   * problemas en el código, advertencias de uso y malas prácticas.
   * (Nota: En desarrollo, hace que los componentes se rendericen dos veces 
   * para detectar errores, pero esto no pasa en producción).
   */
  <StrictMode>
    <App />
  </StrictMode>,
)