# TuTaller SaaS - Frontend

Este es el frontend de la plataforma "TuTaller SaaS", un sistema de gestión integral para talleres mecánicos. Está desarrollado utilizando React (potenciado por Vite) y diseñado para ser una Single Page Application (SPA) rápida e interactiva.

## 🚀 Tecnologías Principales

*   **[React 19](https://react.dev/):** Biblioteca principal para la construcción de interfaces de usuario.
*   **[Vite](https://vitejs.dev/):** Entorno de desarrollo y herramienta de compilación ultrarrápida.
*   **[Lucide React](https://lucide.dev/):** Colección de iconos modernos, limpios y consistentes.
*   **[Recharts](https://recharts.org/):** Biblioteca de gráficos para la visualización de datos estadísticos.
*   **[Sonner](https://sonner.emilkowal.ski/):** Sistema de notificaciones (toast) elegante para mejorar la experiencia de usuario.

## 📁 Estructura del Proyecto

El código fuente se organiza principalmente dentro del directorio `src/`:

*   `src/App.jsx`: Componente contenedor principal. Gestiona el enrutamiento y el estado de la sesión, validando los tokens y el acceso a rutas protegidas.
*   `src/main.jsx`: Punto de entrada de la aplicación que inicializa React.
*   `src/components/`: Directorio que contiene todas las vistas modulares del sistema:
    *   `Login.jsx`: Pantalla de autenticación de usuarios.
    *   `DashboardLayout.jsx`: Componente estructural que define el layout base (Sidebar y Header) para todas las vistas internas de la plataforma.
    *   `Dashboard.jsx`: Panel de control principal con indicadores clave.
    *   `Cotizador.jsx`: Herramienta para la creación de presupuestos.
    *   `Vehiculos.jsx`, `Clientes.jsx`, `Servicios.jsx`, `Inventario.jsx`, `Equipo.jsx`: Módulos CRUD para la gestión del taller.
    *   `Historial.jsx`: Registro de actividades y servicios previos.
    *   `Suscripcion.jsx`: Panel de planes integrado con Mercado Pago para gestionar la suscripción del taller.
    *   `SuperAdmin.jsx`: Panel de gestión restringido para administradores del sistema SaaS (vista global de inquilinos).
    *   `MiPerfil.jsx`: Pantalla de ajustes de la cuenta del usuario logueado.
    *   `PrivateRoute.jsx`: Componente Wrapper para proteger las rutas que requieren autenticación.

## 🛠️ Instalación y Uso

1.  Asegúrate de tener [Node.js](https://nodejs.org/) instalado en tu sistema.
2.  Instala las dependencias del proyecto ejecutando:

    ```bash
    npm install
    ```

3.  Inicia el servidor de desarrollo local:

    ```bash
    npm run dev
    ```

4.  Abre tu navegador web en la dirección indicada por la consola (usualmente `http://localhost:5173`).

## 🔐 Manejo de Sesión y Roles

La aplicación utiliza **JSON Web Tokens (JWT)** para la autenticación:
*   Al iniciar sesión exitosamente, el token se guarda en el `localStorage`.
*   El componente principal (`App.jsx`) decodifica el token en formato base64 para leer su carga útil (payload).
*   A partir del payload, se determina si el usuario posee permisos especiales (como el rol `SUPER_ADMIN`) para revelar componentes ocultos en la barra de navegación lateral.

## 📜 Scripts Disponibles

En el directorio del proyecto, puedes ejecutar:

*   `npm run dev`: Arranca la app en modo desarrollo.
*   `npm run build`: Empaqueta la app para producción de forma optimizada.
*   `npm run preview`: Levanta un servidor estático para probar la versión de producción (`build`).
*   `npm run lint`: Ejecuta el linter (ESLint) para verificar la calidad y estilo del código.
