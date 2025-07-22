# Capsulin

**Capsulin** es un asistente farmacéutico web desarrollado con [Astro](https://astro.build/), diseñado para la gestión y consulta de medicamentos, síntomas y relaciones entre ellos. El sistema permite a usuarios y administradores buscar información, gestionar bases de datos y obtener recomendaciones de tratamiento de manera sencilla y rápida.

## 🚀 Características principales

- **Panel de administración**: CRUD de medicamentos, dosis, presentaciones, síntomas y relaciones.
- **Buscador inteligente**: Permite a los usuarios consultar síntomas y medicamentos, mostrando recomendaciones y contraindicaciones.
- **Modal de edición**: Edición rápida de registros mediante modales dinámicos.
- **Filtros y paginación**: Navegación eficiente por grandes volúmenes de datos.
- **Validaciones robustas**: Validación tanto en frontend como en backend para mantener la integridad de los datos.
- **Interfaz moderna**: UI responsiva y amigable, construida con TailwindCSS y componentes personalizados.

## 📁 Estructura del proyecto

```
/
├── public/
│   ├── favicon.svg
│   └── assets/js/         # Scripts JS para interacción y lógica del frontend
├── src/
│   ├── assets/            # Imágenes y SVGs
│   ├── layouts/           # Layouts base de Astro
│   ├── lib/               # Utilidades y conexión a base de datos
│   ├── pages/
│   │   ├── admin/         # Panel de administración (listado y formularios)
│   │   ├── api/           # Endpoints API REST (v1 y list)
│   │   └── index.astro    # Página principal
│   ├── styles/            # CSS global
│   └── utils/             # Utilidades de paginación y helpers
└── package.json
```

## 🧑‍💻 Instalación y uso

1. **Instala dependencias**
   ```sh
   npm install
   ```

2. **Inicia el servidor de desarrollo**
   ```sh
   npm run dev
   ```

3. **Accede a la app**
   - [http://localhost:4321](http://localhost:4321) para la interfaz principal.
   - [http://localhost:4321/admin/db](http://localhost:4321/admin/db) para el panel de administración.

4. **Comandos útiles**
   | Comando             | Acción                                         |
   |---------------------|-----------------------------------------------|
   | `npm run dev`       | Inicia el servidor de desarrollo              |
   | `npm run build`     | Genera la versión de producción               |
   | `npm run preview`   | Previsualiza la app generada                  |

## 📝 Tecnologías utilizadas

- [Astro](https://astro.build/)
- [TypeScript](https://www.typescriptlang.org/)
- [TailwindCSS](https://tailwindcss.com/)
- [SQLite](https://www.sqlite.org/) (