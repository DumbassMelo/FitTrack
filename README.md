# FitTrack - Sistema Integral de Gestión y Seguimiento de Entrenamientos

Aplicación móvil multiplataforma y API REST escalable para el seguimiento de rutinas y entrenamientos de fuerza, diseñada bajo principios de arquitectura limpia, separación de responsabilidades de lectura y escritura (CQS / CQRS), y diseño de interfaz de usuario de alta fidelidad.

---

## 📁 Estructura del Repositorio

Cumpliendo con los criterios y nomenclatura solicitados para la entrega del proyecto (`fittrack/`):

```text
fittrack/
│
├── Front/                  # Aplicativo Móvil (Expo, React Native, TypeScript)
│   ├── assets/             # Recursos visuales e ilustraciones
│   ├── src/
│   │   ├── components/     # Header, DrawerMenu, WeekCalendar, ExerciseIllustration...
│   │   ├── constants/      # Paleta de colores (Dark Theme), endpoints, config
│   │   ├── context/        # AuthContext (JWT) y WorkoutContext (sesión activa)
│   │   ├── screens/        # HomeScreen, ActiveWorkoutScreen, CatalogScreen, Routines...
│   │   ├── services/       # Conectores REST API (auth, ejercicios, rutinas, entrenamientos, stats)
│   │   └── types/          # Interfaces y modelos TypeScript del dominio
│   ├── App.tsx             # Orquestador de navegación, temas y proveedores
│   ├── package.json
│   └── tsconfig.json
│
├── Back/                   # API REST (.NET 10, C#, ASP.NET Core)
│   ├── Controllers/        # Controladores REST desacoplados
│   ├── Dtos/               # Data Transfer Objects de entrada y salida
│   ├── Models/             # Modelos de dominio y AppDbContext (Entity Framework Core)
│   ├── Services/
│   │   ├── Queries/        # Operaciones de LECTURA (CQS - AsNoTracking, alto rendimiento)
│   │   └── Commands/       # Operaciones de ESCRITURA (CQS - Transacciones, mutaciones)
│   ├── appsettings.json    # Configuración de base de datos SQL Server y JWT
│   └── Program.cs          # Pipeline HTTP, inyección de dependencias y CORS
│
├── BD/                     # Scripts de Base de Datos SQL Server
│   ├── 01_schema.sql       # Tablas, índices y limpieza de datos de prueba
│   └── 02_workout_guide_catalog.sql # Catálogo oficial de 302 ejercicios
│
├── requerimientos.txt      # Especificación formal de requisitos funcionales y no funcionales
└── README.md               # Documentación general y manual de ejecución
```

---

## 🎨 Fidelidad Visual y Experiencia de Usuario (UX)

La aplicación móvil reproduce fielmente el diseño provisto en los mockups:

1. **Pantalla Principal (Home - Imagen 1)**:
   - **Barra Superior**: Botón de menú hamburguesa, logotipo central **FitTrack** y badge de perfil.
   - **Calendario Semanal**: Franja de días (`L`, `M`, `M`, `J`, `V`, `S`, `D`) con fechas numéricas dinámicas y puntos de indicador de entrenamiento.
   - **Tarjeta "Rutina Reciente"**: Muestra la rutina reciente de la cuenta; si aún no hay rutinas, permite crear una.
   - **Botón "INICIAR ENTRENAMIENTO"**: Carga la rutina seleccionada en el gestor de sesión activa.
   - **Botón "ENTRENAMIENTO LIBRE"**: Permite iniciar una sesión en blanco agregando cualquier ejercicio.

2. **Entrenamiento Activo (Active Workout - Imagen 2)**:
   - Ilustraciones SVG oficiales de Workout Guide para cada ejercicio.
   - Título de cada ejercicio (ej. *Bench press*).
   - Tabla de series con columnas exactas: `Serie`, `Peso`, `Repeticiones` y casillas de entrada estilizadas (`Value`).
   - Botón `AÑADIR SERIE` por ejercicio para agregar dinámicamente nuevas series.
   - Botón `GUARDAR ENTRENAMIENTO` que calcula volumen acumulado y persiste los datos vía REST en la base de datos.

3. **Catálogo de Ejercicios (Catalog - Imagen 3)**:
   - Título de pantalla **Catalogo de ejercicios**.
   - Grilla de 2 columnas con tarjetas oscuras y bordes redondeados.
   - Catálogo de 302 ejercicios con metadatos e ilustraciones de Workout Guide.
   - Buscador en tiempo real y filtros rápidos por grupo muscular (Pecho, Espalda, Hombro, Brazos, Pierna).

---

## 📋 Cumplimiento de Requerimientos

### Requerimientos Funcionales (RF)

| Requisito | Descripción | Implementación Frontend | Endpoint Backend |
|---|---|---|---|
| **RF01** | Registro de usuario | `RegisterScreen.tsx` | `POST /api/auth/register` |
| **RF02** | Inicio de sesión | `LoginScreen.tsx` | `POST /api/auth/login` |
| **RF03** | Gestión del perfil | `ProfileScreen.tsx` | `GET /api/users/profile`, `PUT /api/users/profile` |
| **RF04** | Crear rutina | `CreateRoutineScreen.tsx` | `POST /api/routines` |
| **RF05** | Consultar rutinas | `RoutinesScreen.tsx` | `GET /api/routines` |
| **RF06** | Modificar rutina | `CreateRoutineScreen.tsx` (modo edición) | `PUT /api/routines/{id}` |
| **RF07** | Eliminar rutina | `RoutinesScreen.tsx` (alerta modal) | `DELETE /api/routines/{id}` |
| **RF08** | Registrar entrenamiento | `ActiveWorkoutScreen.tsx` | `POST /api/workouts` |
| **RF09** | Registrar series (peso, reps, serie) | `ActiveWorkoutScreen.tsx` | `POST /api/workouts` (series anidadas) |
| **RF10** | Consultar historial | `HistoryScreen.tsx` | `GET /api/workouts`, `GET /api/workouts/{id}` |
| **RF11** | Consultar estadísticas | `StatisticsScreen.tsx` (gráficos y top ejercicios) | `GET /api/statistics/progress`, `GET /api/statistics/exercise/{id}` |
| **RF12** | Cerrar sesión | `DrawerMenu.tsx` y `ProfileScreen.tsx` | Manejo seguro de JWT en `AuthContext.tsx` |

### Requerimientos No Funcionales (RNF)

- **RNF01 (Rendimiento)**: Consultas de lectura optimizadas con `.AsNoTracking()`, componentes React memoizados y carga diferida.
- **RNF02 (Seguridad)**: Hashing de contraseñas con **BCrypt**, tokens **JWT (JSON Web Tokens)** con expiración y validación de firma, políticas de autorización por reclamo de identidad (`UserId`).
- **RNF03 (Usabilidad)**: Tema oscuro (*Dark Theme*) elegante, contraste accesible, respuesta táctil y feedback claro ante errores.
- **RNF04 (Disponibilidad)**: Manejo tolerante a desconexión, configuración de URL de API en caliente desde la aplicación móvil.
- **RNF05 (Mantenibilidad)**: Arquitectura limpia con separación de comandos y consultas (CQS), tipado estricto con TypeScript y C# .NET 10.
- **RNF06 (Compatibilidad)**: Construido sobre Expo SDK 58, compatible con Android, iOS y navegadores Web.
- **RNF07 (Integridad de datos)**: Validación en dos capas (DataAnnotations en backend y validación de formularios en frontend).

---

## ⚙️ Backend: Arquitectura y Separación Lectura / Escritura (CQS)

Para cumplir con el requerimiento de escalabilidad y mantenimiento del sistema:
> *"API Rest que debe ser capaz de realizar operaciones de lectura y escritura de forma separada"*

El backend implementa el patrón **Command Query Separation (CQS)**:

### 1. Capa de Lectura (Queries) - `backend/Services/Queries/`
- Servicios dedicados exclusivamente a recuperar información:
  - `IEjercicioQueryService` / `EjercicioQueryService`
  - `IRutinaQueryService` / `RutinaQueryService`
  - `IEntrenamientoQueryService` / `EntrenamientoQueryService`
  - `IEstadisticaQueryService` / `EstadisticaQueryService`
  - `IUsuarioQueryService` / `UsuarioQueryService`
- Utilizan `AsNoTracking()` para minimizar consumo de memoria y maximizar la tasa de transferencia.

### 2. Capa de Escritura (Commands) - `backend/Services/Commands/`
- Servicios dedicados exclusivamente a mutaciones de estado del sistema:
  - `IEjercicioCommandService` / `EjercicioCommandService`
  - `IRutinaCommandService` / `RutinaCommandService`
  - `IEntrenamientoCommandService` / `EntrenamientoCommandService`
  - `IUsuarioCommandService` / `UsuarioCommandService`
- Gestionan transacciones atómicas (`BeginTransactionAsync`), validación de integridad referencial y auditoría.

---

## 🚀 Guía de Instalación y Ejecución

### 1. Base de Datos (SQL Server)
1. Abrir **SQL Server Management Studio (SSMS)** o Azure Data Studio.
2. Ejecutar estos scripts en SSMS o Azure Data Studio, en este orden:
   - `BD/01_schema.sql`
   - `BD/02_workout_guide_catalog.sql`

El catálogo carga los 302 ejercicios y sus metadatos de [Workout Guide](https://github.com/bryllim/workout-guide), y las ilustraciones se sirven desde su repositorio oficial. No se crea ninguna cuenta: regístrate desde la aplicación.

### 2. Ejecutar el Backend (.NET 10)
Desde la terminal en la raíz del proyecto:
```bash
cd Back
dotnet run
```
La API estará escuchando en `http://localhost:5123`.

Documentación interactiva disponible en:
- Swagger: `http://localhost:5123/swagger`
- Scalar: `http://localhost:5123/scalar`
- OpenAPI JSON: `http://localhost:5123/openapi/v1.json`

### 3. Ejecutar el Frontend Móvil (Expo)
Desde otra terminal:
```bash
cd Front
npm install
npm start
```
Opciones de ejecución:
- Presionar `w` para abrir en el **Navegador Web**.
- Presionar `a` para abrir en el **Emulador Android**.
- Escanear el código QR con la app **Expo Go** en un dispositivo físico.

---

## Catálogo de ejercicios y atribución

El catálogo, los grupos musculares, el equipamiento, los tipos de ejercicio y las imágenes proceden de [Bryl Lim / Workout Guide](https://github.com/bryllim/workout-guide) (versión `1.0.0`). Las ilustraciones están licenciadas bajo [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) y se atribuyen a Bryl Lim; las poses derivadas también reconocen a [Everkinetic](https://github.com/everkinetic/data). El manifiesto de Workout Guide conserva la atribución específica de cada fotograma.

---

## 👥 Autores
- Programación de Dispositivos Móviles
- Institución Universitaria Pascual Bravo
