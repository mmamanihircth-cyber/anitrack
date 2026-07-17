# 🎌 AniTrack - Frontend

Frontend de **AniTrack**, una aplicación web desarrollada en React que permite a los usuarios gestionar su lista de animes, dejar reseñas, interactuar con la comunidad y recibir notificaciones.

Este proyecto fue desarrollado para la materia **Programación Web Full Stack**.

---

# 🚀 Demo

## Frontend
https://anitrack-rho.vercel.app

## Backend (API)
https://anitrack-back.vercel.app

---

# ✨ Funcionalidades

- Registro de usuarios
- Inicio de sesión mediante JWT
- Verificación de cuenta por correo electrónico
- Recuperación de contraseña mediante email
- Visualización de animes
- Agregar animes a favoritos
- Administrar lista personal de animes
- Crear, editar y eliminar reseñas
- Dar Me Gusta y No Me Gusta a reseñas
- Sistema de comentarios
- Sistema de respuestas a comentarios
- Notificaciones en tiempo real para interacciones
- Perfil de usuario con estadísticas
- Diseño responsive

---

# 🛠 Tecnologías utilizadas

- React
- React Router DOM
- Vite
- CSS3
- JavaScript ES6
- Fetch API
- JWT

---

# 📁 Estructura del proyecto

```
src/
│
├── asent/
├── components/
├── context/
├── data/
├── hooks/
├── screens/
├── services/
├── app.jsx
└── main.jsx
```

---

# ⚙ Instalación

Clonar el repositorio

```bash
git clone https://github.com/mmamanihircth-cyber/anitrack-frontend.git
```

Ingresar al proyecto

```bash
cd anitrack-frontend
```

Instalar dependencias

```bash
npm install
```

Crear un archivo `.env`

```env
VITE_API_URL=http://localhost:8080
```

Iniciar el proyecto

```bash
npm run dev
```

---

# 🌐 Variables de entorno

| Variable | Descripción |
|----------|-------------|
| VITE_API_URL | URL del backend |

---

# 🔒 Autenticación

La autenticación se realiza mediante JSON Web Token (JWT).

Luego del login, el token se almacena localmente y es enviado automáticamente al backend mediante el header:

```
Authorization: Bearer <token>
```

Las rutas protegidas requieren un usuario autenticado.

---

# 📡 Comunicación con la API

El frontend consume una API REST desarrollada en Express.

Principales recursos utilizados:

- Auth
- Users
- Anime
- Reviews
- Favorites
- User List
- Notifications

---

# 📱 Responsive Design

La aplicación fue desarrollada para adaptarse correctamente a distintos tamaños de pantalla, desde dispositivos móviles hasta pantallas de escritorio.

---

# 👨‍💻 Autor

**Matías**

Proyecto desarrollado como trabajo práctico integrador para la carrera Ingeniería en Sistemas de Información.
