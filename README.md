# Rocoto Restaurante Chifa - Página Web

Este proyecto es la plataforma web oficial de **Rocoto Restaurante Chifa**, diseñada para ofrecer una experiencia interactiva a los clientes y un panel de administración robusto para la gestión interna del negocio.

## 🚀 Características Principales

### Para Clientes
- **Menú Interactivo:** Navegación por categorías de la carta completa.
- **Menú Diario:** Sección dedicada a los especiales del día (entradas, segundos y refrescos).
- **Promociones:** Visualización dinámica de ofertas y banners principales.
- **Diseño Responsivo:** Optimizado para dispositivos móviles y escritorio.

### Para Administración (Panel de Gestión)
- **Gestión de Carta:** Control total sobre los platos, categorías y disponibilidad.
- **Gestión de Personal:** Registro y control de trabajadores y empresas colaboradoras.
- **Control de Asistencia:** Sistema para registrar la asistencia diaria del personal.
- **Reportes:** Generación de reportes detallados en formatos **PDF** y **Excel**.
- **Seguridad:** Autenticación mediante Firebase Auth (Google Login) y control de roles de usuario.

## 🛠️ Tecnologías Utilizadas

- **Frontend:** [Vite](https://vitejs.dev/) + [Lit-html](https://lit.dev/docs/libraries/lit-html/) (Templating ligero)
- **Estilos:** [TailwindCSS](https://tailwindcss.com/) + [PostCSS](https://postcss.org/)
- **Backend/Base de Datos:** [Firebase](https://firebase.google.com/) (Firestore, Auth, Storage)
- **Reportes:** [jsPDF](https://github.com/parallax/jsPDF) + [xlsx-js-style](https://github.com/gitbrent/xlsx-js-style)
- **Interactividad:** [Swiper.js](https://swiperjs.com/) para carruseles.

## 📦 Instalación y Configuración

1. **Clonar el repositorio:**
   ```bash
   git clone <url-del-repositorio>
   cd Pagina_Restaurante_Rocoto
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno:**
   Crea un archivo `.env` en la raíz del proyecto con tus credenciales de Firebase:
   ```env
   VITE_FIREBASE_API_KEY=tu_api_key
   VITE_FIREBASE_AUTH_DOMAIN=tu_auth_domain
   VITE_FIREBASE_PROJECT_ID=tu_project_id
   VITE_FIREBASE_STORAGE_BUCKET=tu_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
   VITE_FIREBASE_APP_ID=tu_app_id
   ```

4. **Ejecutar en modo desarrollo:**
   ```bash
   npm run dev
   ```

5. **Construir para producción:**
   ```bash
   npm run build
   ```

## 📂 Estructura del Proyecto

```text
src/
├── assets/         # Imágenes y recursos estáticos
├── constants/      # Constantes globales y categorías
├── controllers/    # Lógica de negocio y orquestación (Home, Admin, Asistencia)
├── data/           # Datos semilla e inicialización
├── models/         # Definiciones de modelos de datos
├── services/       # Integración con Firebase, Excel, PDF y Repositorios
├── ui/             # Componentes de UI base (layout)
├── utils/          # Utilidades (Store global, notificaciones, fechas)
└── views/          # Plantillas y vistas de la aplicación (Lit-html)
```

## 🌐 Despliegue

El proyecto está configurado para desplegarse fácilmente en **Vercel**.
- Conecta tu repositorio de GitHub a Vercel.
- Asegúrate de configurar las variables de entorno en el panel de Vercel.

---
Desarrollado para **Rocoto Restaurante Chifa**.