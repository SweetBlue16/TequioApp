# Pruebas frontend: módulos 2 y 3

Fecha: 28 de octubre de 2026. Alcance: exclusivamente TequioApp.

## Auditoría inicial

- React 19, TypeScript, Jest 30, ts-jest, JSDOM y React Testing Library.
- Jest usa `tsconfig.test.json`, alias `@/`, identity-obj-proxy para CSS y
  `__mocks__/fileMocks.js` para imágenes. `jest.setup.ts` carga jest-dom y los
  polyfills TextEncoder/TextDecoder.
- Se revisaron las siete suites existentes: Login, LoginSession,
  RegisterWizard, ProtectedRoutes, ProfilePage, ProfileService y
  attachAuthInterceptors. No existían pruebas de AddProduct, AddProductForm,
  ImageUploader ni Toast.
- Ejecución inicial: 3 suites aprobadas, 4 suites bloqueadas por errores de
  TypeScript; 4 casos ejecutados y aprobados. Los casos de las suites que no
  compilaron no llegaron a ejecutarse.
- Build inicial fallido: mocks incompletos de AuthServiceInterface y
  ProfileServiceInterface. Se agregaron solo los métodos faltantes a esos mocks.
- Al desbloquear las suites apareció una aserción antigua que buscaba
  `Mis productos` en la navegación del productor. Se actualizó al enlace real
  `Panel de vendedor`, manteniendo las comprobaciones de acceso y logout.

## Casos nuevos

Cada fila de `it.each` se cuenta como un caso ejecutable independiente.

| Componente | Nuevos | Total del componente |
| --- | ---: | ---: |
| ProfilePage | 17 | 24 |
| ImageUploader | 8 | 8 |
| AddProductForm | 17 | 17 |
| AddProduct | 9 | 9 |
| Toast | 10 | 10 |
| **Total nuevo** | **61** | |

ProfilePage conserva sus siete escenarios originales. Se ampliaron las
aserciones de error HTTP y asociación de foto para comprobar el Toast real,
los datos editados conservados y las llamadas a servicios.

### Perfiles y archivos

- Nombre vacío, apellido paterno vacío o con espacios; el nombre con espacios
  ya estaba cubierto en la suite original.
- Fecha vacía, futura y de calendario inválida. Para fechas se usa change
  porque el soporte de escritura en inputs date de JSDOM es limitado.
- Límites superiores y aceptación exacta de 100 caracteres en nombres y
  localidad y 20 en teléfono, conforme a las reglas implementadas.
- Trim de los campos, opcionales vacíos a null y fecha en formato UTC.
- Error HTTP 500 de actualización: Toast error, conservación del formulario y
  fotografía previa, sin recargar datos después del fallo.
- Error de subida: no se intenta asociar la foto; error de asociación:
  se conserva la foto anterior. Se verifican cantidades de llamadas.
- Operaciones duplicadas bloqueadas durante actualización o asociación.
- JPG, PNG y WebP aceptados hasta exactamente 5 MiB; GIF, texto y tamaños
  superiores rechazados. Preview, eliminación y liberación de object URLs.

### Catálogo

- Cada campo obligatorio ausente, texto con espacios, descripción inferior a
  10 caracteres y ausencia de fotografía tras eliminarla.
- Límites nativos de 50 y 180 caracteres, aceptación del límite y validación
  defensiva del formulario cuando se omite la restricción nativa.
- Cambio de categoría: limpia la subcategoría y reemplaza sus opciones.
- Datos válidos normalizados; confirmación y cancelación sin llamadas API.
- Subida antes de crear el producto, payload exacto con ID de subcategoría,
  una llamada por servicio, diálogo de éxito y navegación posterior.
- Error de subida sin creación; error al crear sin reintentos automáticos;
  Toast error real y conservación de los datos y fotografía seleccionada.
- Validación de sesión y de archivos sin solicitudes; bloqueo de doble clic
  durante una subida pendiente.

### Toast y evidencia de bloqueo

Las pruebas comprueban mensaje, clase `error`, `role="alert"` y aria-live
assertive. La variante informativa usa `role="status"` y aria-live polite.
Se cubren cierre manual mediante un padre con estado, callback único,
duration, ausencia de autocierre, cambio de temporizador y cancelación al
desmontar con temporizadores simulados.

Los formularios inválidos verifican mensajes visibles y ausencia de llamadas:
`updateProfile`, `uploadImage`, `updatePicture`, `createBaseProduct` o el
callback `onSubmit`, según la capa probada. La página de catálogo tampoco
abre confirmación con datos inválidos. Los componentes reales se mantienen;
solo servicios, transporte HTTP y object URLs se sustituyen por mocks.

## Hallazgos y límites

- No hay pantalla ni servicio de edición de productos. Se prueba el registro
  disponible y no se introduce funcionalidad de edición.
- El mensaje existente para exceder la descripción dice `El descripción`.
  La prueba conserva ese texto visible; no se modificó la regla ni la UI.
- El input file no tiene una etiqueta accesible asociada y Modal no vincula
  su título con aria-labelledby. Las pruebas usan la zona de arrastre con
  role button y el contenido del diálogo; no se afirma que esos controles
  tengan nombres accesibles que todavía no implementan.
- No se prueba conectividad real ni persistencia del servidor. Las pruebas
  no requieren Docker, SQL Server, Cloudinary ni SMTP.
- No se ejecutó una herramienta de cobertura; no se informa un porcentaje.

## Validación

- `npm run build`: aprobado. Vite avisa del uso existente de __dirname en
  vite.config.ts para un futuro cambio de configLoader.
- `npm test -- --runInBand`: 11 suites aprobadas; 80 pruebas aprobadas,
  0 fallidas y 0 omitidas (19 existentes y 61 nuevas). El resultado JSON de
  la misma ejecución se guarda en `node_modules/.tmp/modules-2-3-results.json`
  (archivo local ignorado por Git).
- `npm run lint`: conserva exactamente los cuatro errores preexistentes:
  regla import/no-nodejs-modules inexistente en jest.setup.ts; referencias
  triple slash en Login.test.tsx y RegisterWizard.test.tsx; ROLE_ID usado solo
  como tipo en RegistrationRequest.ts. Ningún error nuevo de lint.
- No se cambian componentes, servicios, reglas de negocio, dependencias ni
  configuración de Jest. Sin commits ni pushes.
