# Rules — Tótem de Recepción Odontológica
# Stack: Angular (Standalone) + Signals + Node.js + MongoDB
# Herramienta: Antigravity

---

## 0. Principio general

Este proyecto es una aplicación de producción real instalada en un entorno físico (tótem).
Cada decisión de arquitectura debe priorizar: mantenibilidad, claridad y robustez por encima de cualquier atajo.
No se permiten soluciones "por ahora" sin un comentario `// TODO:` que explique qué falta y por qué.

---

## 1. Versión y consistencia de entorno

- La versión de Angular y todas las dependencias están fijadas de forma exacta en `package.json` usando versiones sin `^` ni `~`.
  ```json
  // ✅ Correcto
  "dependencies": {
    "@angular/core": "18.2.0"
  }
  // ❌ Incorrecto
  "dependencies": {
    "@angular/core": "^18.2.0"
  }
  ```
- El proyecto incluye un archivo `.nvmrc` en la raíz con la versión exacta de Node.js utilizada.
- El archivo `package-lock.json` siempre se commitea. Nunca se ignora.
- Antes de empezar a trabajar en otra PC, el primer comando es siempre `npm ci` (no `npm install`).

---

## 2. Estructura de carpetas

La estructura sigue una arquitectura por features. Cada módulo funcional vive en su propia carpeta con todo lo que necesita.

```
src/
├── app/
│   ├── core/                        # Servicios singleton, interceptors, guards
│   │   ├── services/
│   │   │   ├── patient.service.ts
│   │   │   └── print.service.ts
│   │   └── models/
│   │       └── patient.model.ts
│   ├── features/
│   │   ├── dni-lookup/              # Pantalla de ingreso de DNI
│   │   │   ├── dni-lookup.component.ts
│   │   │   ├── dni-lookup.component.html
│   │   │   └── dni-lookup.component.scss
│   │   ├── patient-form/            # Flujo multi-pantalla de carga de datos
│   │   │   ├── patient-form.component.ts
│   │   │   ├── patient-form.component.html
│   │   │   ├── patient-form.component.scss
│   │   │   └── steps/
│   │   │       ├── step-one.component.ts
│   │   │       ├── step-two.component.ts
│   │   │       └── step-three.component.ts
│   │   ├── patient-confirm/         # Confirmación para paciente existente
│   │   │   └── patient-confirm.component.ts
│   │   └── print-preview/           # Vista de impresión
│   │       └── print-preview.component.ts
│   ├── shared/                      # Componentes, pipes y directivas reutilizables
│   │   ├── components/
│   │   │   ├── big-button/
│   │   │   └── accessible-input/
│   │   └── pipes/
│   └── app.routes.ts
├── environments/
│   ├── environment.ts
│   └── environment.production.ts
└── styles/
    ├── _variables.scss
    ├── _typography.scss
    └── _print.scss                  # Estilos exclusivos para impresión
```

---

## 3. Componentes

- Todos los componentes son **standalone**. No se usan NgModules.
- Un componente tiene una sola responsabilidad. Si hace más de una cosa, se divide.
- El template nunca supera las 100 líneas. Si lo supera, se extraen sub-componentes.
- No se usa lógica de negocio en el template. Solo binding, eventos y directivas estructurales.
- Los componentes no llaman directamente a HTTP ni a MongoDB. Siempre delegan a un servicio.

```typescript
// ✅ Correcto
@Component({
  standalone: true,
  selector: 'app-dni-lookup',
  imports: [ReactiveFormsModule],
  templateUrl: './dni-lookup.component.html',
})
export class DniLookupComponent {
  private patientService = inject(PatientService);
  // ...
}

// ❌ Incorrecto — NgModule innecesario
@NgModule({ declarations: [DniLookupComponent] })
export class DniLookupModule {}
```

---

## 4. Estado con Signals

- Todo el estado de la aplicación se maneja con **Signals** de Angular. No se usa BehaviorSubject ni Subject salvo casos excepcionales justificados con comentario.
- El estado compartido entre componentes vive en un servicio de `core/services/`, nunca en un componente padre pasado como Input.
- Se usa `computed()` para todo valor derivado del estado. No se recalcula en el template.
- Se usa `effect()` con moderación y solo para side effects (logs, sincronización externa). Nunca para modificar otro signal dentro de un effect.

```typescript
// ✅ Correcto
@Injectable({ providedIn: 'root' })
export class PatientFormService {
  currentStep = signal<number>(1);
  formData = signal<Partial<Patient>>({});
  totalSteps = computed(() => 3);
  isLastStep = computed(() => this.currentStep() === this.totalSteps());

  nextStep() {
    this.currentStep.update(s => s + 1);
  }
}

// ❌ Incorrecto — lógica derivada en el template
// [En el template]: {{ currentStep() === 3 ? 'Último paso' : 'Siguiente' }}
```

---

## 5. Modelos y tipado

- Todo dato que entra o sale de la API tiene su interfaz TypeScript en `core/models/`.
- No se usa `any`. Si el tipo es desconocido, se usa `unknown` y se valida antes de usarlo.
- Los modelos son interfaces, no clases, salvo que necesiten métodos propios.
- Los campos opcionales se declaran explícitamente con `?`.

```typescript
// core/models/patient.model.ts
export interface Patient {
  _id?: string;
  apellido: string;
  nombre: string;
  dni: string;
  domicilio: string;
  localidad: string;
  telefono?: string;
  fechaNacimiento: string;
  edad: number;
  obraSocial?: string;
  creadoEn?: Date;
  actualizadoEn?: Date;
}
```

---

## 6. Servicios

- Los servicios se inyectan con `inject()`, no con el constructor.
- Cada servicio tiene una única responsabilidad: `PatientService` maneja pacientes, `PrintService` maneja impresión.
- Los métodos que llaman a la API siempre devuelven `Observable` o `Promise`. Nunca mutan estado directamente dentro del subscribe — eso lo hace el componente o el signal.
- Los errores de HTTP se manejan en el servicio con `catchError` y se relanza un error tipado.

```typescript
// ✅ Correcto
@Injectable({ providedIn: 'root' })
export class PatientService {
  private http = inject(HttpClient);
  private apiUrl = inject(ENVIRONMENT).apiUrl;

  getByDni(dni: string): Observable<Patient | null> {
    return this.http.get<Patient>(`${this.apiUrl}/patients/${dni}`).pipe(
      catchError(err => {
        if (err.status === 404) return of(null);
        return throwError(() => new Error('Error al buscar paciente'));
      })
    );
  }
}
```

---

## 7. Routing

- El router usa **lazy loading** para cada feature, aunque la app sea pequeña. Esto prepara la estructura para escalar.
- Las rutas se definen en `app.routes.ts` con nombres descriptivos en kebab-case.
- No se navega con strings hardcodeados. Se definen constantes de rutas en un archivo `app.routes.names.ts`.

```typescript
// app.routes.names.ts
export const ROUTES = {
  DNI_LOOKUP: 'buscar-paciente',
  PATIENT_FORM: 'nuevo-paciente',
  CONFIRM: 'confirmar-datos',
  PRINT: 'imprimir',
} as const;

// app.routes.ts
export const routes: Routes = [
  { path: '', redirectTo: ROUTES.DNI_LOOKUP, pathMatch: 'full' },
  {
    path: ROUTES.DNI_LOOKUP,
    loadComponent: () => import('./features/dni-lookup/dni-lookup.component')
      .then(m => m.DniLookupComponent)
  },
  // ...
];
```

---

## 8. Formularios

- Se usa **Reactive Forms** (`ReactiveFormsModule`). No se usa Template-driven forms.
- Cada campo tiene sus validadores declarados en el componente, no en el template.
- Los mensajes de error de validación se muestran con un componente compartido `<app-field-error>`, nunca con lógica inline en el template.
- El formulario multi-paso mantiene el estado en `PatientFormService` (signal), no en el componente.

---

## 9. Impresión posicional

- Todos los estilos de impresión viven exclusivamente en `styles/_print.scss` dentro de un bloque `@media print`.
- La vista de impresión es un componente separado `PrintPreviewComponent` que solo se activa para imprimir.
- Las posiciones de los campos (top, left) se definen como variables CSS en `_variables.scss` con nombres descriptivos:
  ```scss
  // _variables.scss
  :root {
    --print-nombre-top: 42mm;
    --print-nombre-left: 15mm;
    --print-dni-top: 58mm;
    --print-dni-left: 15mm;
  }
  ```
- Esto permite recalibrar posiciones cambiando solo las variables, sin tocar el componente.

---

## 10. Comunicación con el backend

- La URL base de la API nunca está hardcodeada en un servicio. Siempre viene de `environment.ts`.
- En desarrollo apunta a `http://localhost:3000`. En producción apunta a la IP local del servidor del consultorio.
- Se usa un `InjectionToken` para proveer el environment, no se importa directamente el archivo.

```typescript
// environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};
```

---

## 11. Estilos

- Se usa **SCSS**. No se usa CSS plano.
- Los colores, tipografías y espaciados globales se definen como variables CSS en `_variables.scss`. No se repiten valores hardcodeados en los componentes.
- Los estilos de cada componente son encapsulados (default de Angular). No se usa `ViewEncapsulation.None` salvo en casos excepcionales justificados.
- Los tamaños de fuente y botones usan unidades `rem` para garantizar accesibilidad y escalado correcto en pantallas de distintos tamaños.

---

## 12. Convenciones de nomenclatura

| Elemento | Convención | Ejemplo |
|---|---|---|
| Componentes | PascalCase | `DniLookupComponent` |
| Servicios | PascalCase + Service | `PatientService` |
| Archivos | kebab-case | `dni-lookup.component.ts` |
| Signals | camelCase | `currentStep`, `formData` |
| Interfaces/modelos | PascalCase | `Patient`, `PrintConfig` |
| Constantes globales | UPPER_SNAKE_CASE | `MAX_FORM_STEPS` |
| Variables CSS | kebab-case con prefijo | `--print-nombre-top` |
| Rutas URL | kebab-case | `/buscar-paciente` |

---

## 13. Calidad de código

- No se hace commit con errores de TypeScript (`tsc --noEmit` debe pasar limpio).
- No se desactiva el linter con `// eslint-disable` sin un comentario que explique por qué.
- Cada función pública de un servicio tiene un comentario JSDoc mínimo que describe qué hace y qué devuelve.
- Los métodos no superan las 30 líneas. Si superan, se refactorizan.
- No se deja código comentado en el repositorio. Para eso existe git.

---

## 14. Git

- Los commits siguen **Conventional Commits**:
  - `feat:` para funcionalidad nueva
  - `fix:` para corrección de bugs
  - `refactor:` para cambios que no agregan ni corrigen
  - `style:` para cambios de formato sin lógica
  - `chore:` para configuración, dependencias, etc.
- Ejemplos:
  ```
  feat: agregar flujo de carga de paciente nuevo
  fix: corregir posición de campo DNI en impresión
  refactor: extraer lógica de steps a PatientFormService
  ```
- Cada commit compila y no rompe la app. No se commitea código roto.

---

## 15. Lo que NO se hace en este proyecto

- ❌ No se usa `any`
- ❌ No se usan NgModules
- ❌ No se navega con strings hardcodeados
- ❌ No se hace lógica de negocio en el template
- ❌ No se llama a la API desde un componente directamente
- ❌ No se hardcodea la URL de la API
- ❌ No se usa `^` o `~` en las versiones de dependencias
- ❌ No se commitea con `npm install` como instrucción — siempre `npm ci`
