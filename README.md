# Plataforma de Capacitaciones · CCIRR

Gestión en la nube de capacitaciones, inscripciones, pagos, mails, material y certificados.

| Parte         | Tecnologías                             | Dónde corre |
| ------------- | --------------------------------------- | ----------- |
| Backend (API) | Node, Express, Sequelize                | Railway     |
| Base de datos | MySQL                                   | Railway     |
| Frontend      | React, Vite, React Router, Axios        | Vercel      |
| CI            | GitHub Actions (lint, formato, pruebas) | GitHub      |

## Estructura

```
backend/
  server.js               arranque: valida variables, conecta a MySQL, aplica migraciones
  migrations/             cambios de base numerados (001-…sql), se aplican solos al arrancar
  src/
    app.js                Express: seguridad, CORS, rutas, manejo de errores
    config/database.js    conexión a MySQL
    models/               Capacitacion, Material, Empresa, Inscripcion (+ relaciones en index.js)
    routes/               URLs de la API y validaciones
    controllers/          lógica de cada URL
    services/             (próximos pasos: mails, certificados, archivos)
    middlewares/ utils/
  test/unit/              pruebas que corre GitHub en cada push
  pruebas.http            pedidos de prueba para la extensión REST Client
frontend/
  src/
    index.css             paleta y tipografía del CCIRR (variables CSS)
    api/                  llamadas al backend con Axios
    routes/AppRoutes.jsx  todas las pantallas
    pages/admin|publico|asistentes|empresas
.github/workflows/ci.yml
```

## Instalación en la computadora (una sola vez)

En Windows. Si alguna instalación pide permisos de administrador y no los tenés, pedíselos a sistemas.

1. **Node.js 22 LTS**: descargá el instalador "Windows Installer (.msi)" de https://nodejs.org e instalalo con
   las opciones por defecto. Para comprobarlo, abrí una terminal nueva y escribí `node -v` (tiene que decir v22…).
2. **Git**: descargá Git for Windows de https://git-scm.com e instalalo con las opciones por defecto. Después
   configurá tu nombre y mail (los mismos de GitHub):
   ```
   git config --global user.name "Tu Nombre"
   git config --global user.email "tu@mail.com"
   ```
3. **MySQL 8**: descargá "MySQL Installer for Windows" de https://dev.mysql.com/downloads/installer/ y elegí
   "Server only" + "MySQL Workbench". Anotá la contraseña de `root` que elijas.
   En Workbench, conectate y ejecutá: `CREATE DATABASE ccirr_capacitaciones;`
4. **Extensiones de VS Code** (ícono de cuadraditos, a la izquierda): ESLint, Prettier y REST Client.

## Levantar el proyecto en tu computadora

Abrí la carpeta del proyecto en VS Code y una terminal (menú Terminal → New Terminal).

**Backend** (primera terminal):

```
cd backend
npm install
copy .env.example .env
```

Abrí `backend/.env` y poné tu contraseña de MySQL en `DB_PASSWORD`. Después:

```
npm run dev
```

Tiene que aparecer "Conexión a MySQL exitosa" y "Base nueva creada desde los modelos". Las tablas ya están creadas.

**Frontend** (segunda terminal, con el botón "+" del panel de terminal):

```
cd frontend
npm install
copy .env.example .env
npm run dev
```

Abrí http://localhost:5173 en el navegador.

**Probar**: abrí `backend/pruebas.http` y hacé clic en "Send Request" sobre "Crear una capacitación de prueba".
Al recargar Administración en el navegador, aparece en el listado.

## Subir a GitHub

Creá un repositorio vacío en GitHub (sin README) y desde la carpeta raíz del proyecto:

```
git init
git add .
git commit -m "Estructura base"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/ccirr-capacitaciones.git
git push -u origin main
```

En la pestaña Actions de GitHub vas a ver correr la CI.

## Antes de cada commit

```
npm run lint
npm run format
npm test
```

(en `backend` y en `frontend`). Es lo mismo que revisa GitHub.

## Cambios de base de datos

Una base nueva se crea sola desde los modelos. Para cambiar una base que ya tiene datos, crear
`backend/migrations/001-descripcion.sql` con las sentencias SQL y modificar también el modelo.

## Publicación en la nube

- **Backend y base de datos**: Railway. El servicio del backend usa `/backend` como carpeta raíz,
  `/health` como verificación de estado y toma la conexión a MySQL de las variables del servicio MySQL.
- **Frontend**: Vercel, con `frontend` como carpeta raíz. `VITE_API_URL` apunta al backend de Railway.
- Cada `git push` a `main` vuelve a publicar los dos automáticamente.

Variables del backend en Railway:

| Variable                                        | Valor                                         |
| ----------------------------------------------- | --------------------------------------------- |
| `DB_HOST`                                       | `${{MySQL.MYSQLHOST}}`                        |
| `DB_PORT`                                       | `${{MySQL.MYSQLPORT}}`                        |
| `DB_NAME`                                       | `${{MySQL.MYSQLDATABASE}}`                    |
| `DB_USER`                                       | `${{MySQL.MYSQLUSER}}`                        |
| `DB_PASSWORD`                                   | `${{MySQL.MYSQLPASSWORD}}`                    |
| `JWT_SECRET`                                    | una clave nueva (no la de tu compu)           |
| `NODE_ENV`                                      | `production`                                  |
| `APP_URL` y `CORS_ORIGIN`                       | la dirección del frontend en Vercel           |
| `UPLOADS_DIR`                                   | `/data/uploads` (carpeta dentro del volumen)  |
| `ADMIN_INICIAL_EMAIL` / `_PASSWORD` / `_NOMBRE` | solo para el primer arranque; después, borrar |

Archivos subidos (comprobantes, material): se guardan en un **volumen** de Railway montado en `/data`
en el servicio del backend. Sin volumen, los archivos se borran en cada deploy.
