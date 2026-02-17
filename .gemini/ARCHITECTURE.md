# Smart Order App — Arquitectura de Referencia

> **Este archivo es la fuente de verdad para la arquitectura del proyecto.**
> Cualquier nuevo componente, servicio o feature debe seguir esta estructura.

## Stack Tecnológico

- **Framework**: Angular 20 (Standalone Components, Zoneless Change Detection)
- **Lenguaje**: TypeScript 5.9
- **Backend**: Firebase (Firestore, Hosting, Cloud Functions)
- **SSR**: ❌ Desactivado — app 100% client-side
- **Estilos**: CSS vanilla (sin frameworks CSS)

## Estructura de Carpetas

```
src/app/
├── core/                          ← Servicios singleton, guards, interceptors, modelos
│   ├── services/                  ← Servicios inyectables globales
│   ├── guards/                    ← Guards de autenticación/autorización
│   ├── interceptors/              ← Interceptors HTTP
│   └── models/                    ← Interfaces y tipos de datos
│
├── shared/                        ← Componentes, pipes y directivas reutilizables
│   ├── components/                ← Componentes UI reutilizables (botones, modales, etc.)
│   ├── pipes/                     ← Pipes personalizados
│   └── directives/                ← Directivas personalizadas
│
├── features/                      ← Módulos por funcionalidad (lazy loaded)
│   ├── [feature-name]/            ← Cada feature tiene su propia carpeta
│   │   ├── components/            ← Componentes específicos del feature
│   │   ├── [feature].routes.ts    ← Rutas del feature
│   │   └── ...
│   └── ...
│
├── layouts/                       ← Layouts de página (main, auth, etc.)
│   ├── main-layout/
│   └── auth-layout/
│
├── app.ts                         ← Componente raíz
├── app.html                       ← Template raíz
├── app.css                        ← Estilos raíz
├── app.routes.ts                  ← Rutas principales con lazy loading
└── app.config.ts                  ← Providers globales
```

## Reglas de Arquitectura

### 1. Feature-Based Organization
- Cada funcionalidad (auth, orders, menu, etc.) vive en `features/[nombre]/`
- Cada feature es independiente y se carga con **lazy loading**
- Las rutas de cada feature se definen en su propio `[feature].routes.ts`

### 2. Core vs Shared
- **`core/`**: Servicios que se instancian UNA sola vez (singletons). Nunca se importan en múltiples features directamente como componentes.
- **`shared/`**: Componentes, pipes y directivas que se REUTILIZAN en múltiples features.

### 3. Standalone Components
- **No usar NgModules**. Todo componente es standalone.
- Importar dependencias directamente en el decorador `@Component({ imports: [...] })`

### 4. Convenciones de Nombres
- Componentes: `nombre.ts`, `nombre.html`, `nombre.css`
- Servicios: `nombre.service.ts`
- Guards: `nombre.guard.ts`
- Modelos/Interfaces: `nombre.model.ts`
- Pipes: `nombre.pipe.ts`
- Rutas: `nombre.routes.ts`

### 5. Lazy Loading
```typescript
// app.routes.ts
export const routes: Routes = [
  {
    path: 'orders',
    loadChildren: () => import('./features/orders/orders.routes').then(m => m.ORDERS_ROUTES)
  }
];
```

### 6. Estado y Datos
- Usar **signals** de Angular para estado reactivo
- Los servicios en `core/services/` manejan la comunicación con Firebase
- No usar state management externo a menos que sea estrictamente necesario
