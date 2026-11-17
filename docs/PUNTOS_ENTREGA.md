# Integración de puntos de entrega

## Cierre y atribución de la revisión manual

El 16 de noviembre de 2026, **el usuario** confirmó aprobadas las seis pruebas manuales de persistencia
al recargar, edición, mapa, rechazo de duplicados, desactivación y acceso desde el menú. El agente registra
esa declaración y no se atribuye una revisión visual propia. Mapbox/configuración y la cuenta Admin ya
están resueltos; no siguen pendientes de revisión manual.

Se repitieron las **21 pruebas afectadas, en 6 suites**, de Navbar, login, rutas protegidas, restauración de
sesión y autenticación HTTP del cliente: todas aprobadas, sin omisiones. Se conserva la corrida completa
previa de 99 pruebas aprobadas. Los archivos `reports/2026-11-16-manual-closeout/frontend.json` y
`frontend.log` contienen el reporte y la salida de la repetición. El lint de archivos afectados pasó;
el global conserva cinco errores preexistentes, detallados en `lint-global.log` y `lint-status.json`.

Las cuatro actividades 5.11, 5.12, 5.13 y 6.2.1 tienen implementación y verificación registradas en
`TequioAPI/docs/PUNTOS_ENTREGA.md`, incluida la nueva corrida CP-PTO real con 47 solicitudes/83 aserciones
y las 151 pruebas backend aprobadas. No quedan bloqueos funcionales del módulo; permanecen los avisos
técnicos previos documentados. No se hicieron commits ni push ni se modificó SMTP.

Se conservaron las pantallas, estilos y el asistente de administración existentes. El servicio usa ahora
`createClient` con `TokenStorage`, `/api/v1` y los interceptores de sesión existentes. El mock permanece
exportado para usos aislados, pero no es la instancia de la aplicación.

- `/admin/*` exige Administrador (roleId 3). Los permisos definitivos se validan en la API.
- El decodificador acepta el formato previo de sesión y los claims URI que emite actualmente el backend.
- Alta y edición presentan en Toast mensajes localizados para 400/401/403/404/409 y fallos de conexión;
  una desactivación rechazada conserva el listado y permite volver a intentarlo.
- El listado recorre las páginas del catálogo para conservar la búsqueda y ordenación que ya ofrecía la UI.
- Mapbox usa la configuración de `src/config/mapbox.ts`. El marcador refleja el formulario y devuelve clics
  y arrastres; el callback se mantiene actualizado sin recrear el mapa. La geocodificación antigua no puede
  sobrescribir una selección más reciente. Se liberan marcador y mapa al desmontar.
- Sin token Mapbox aparece un estado alternativo. Latitud y longitud permiten entrada por teclado en el paso
  de ubicación, incluso sin mapa. Los controles tienen etiquetas; el mapa tiene `role=region` y nombre
  accesible, la retroalimentación usa `role=status` y los Toast usan alertas/regiones vivas. Los controles
  de formulario y confirmación son navegables con Tab. No se depende del arrastre del ratón para elegir datos.
- Se mantienen los límites regionales y el catálogo de nueve municipios del equipo como ayuda de formulario.
  Esto no comprueba pertenencia a un polígono municipal; la API admite cero y los rangos geográficos completos.

Configuración local: conservar `.env.local`; `.env.example` muestra `VITE_API_BASE_URL=/api/v1` y la clave
vacía `VITE_MAPBOX_ACCESS_TOKEN`. El proxy existente apunta a localhost:5168. No almacenar tokens en Git.

Verificación desde TequioApp:

```text
npm ci
npm run build
npm test -- --runInBand
npm run lint
```

Jest simula Mapbox y la configuración sin tokens reales. Cubre creación/contenedor accesible, coordenadas
iniciales, marcador, clic y arrastre, sincronización/callback actualizado, falta de configuración y limpieza.
El hook del asistente prueba propagación al formulario y protección ante geocodificación fuera de orden.
Se prueba además la restauración de sesión con los claims reales de Administrador.

La auditoría, contrato HTTP, decisiones de duplicados/RN-07, SQL, colección Postman y resultados completos
están en `TequioAPI/docs/PUNTOS_ENTREGA.md`, en el repositorio backend hermano.
La verificación posterior ejecutó la API con SQL Server real en una base aislada: CP-PTO pasó 47 solicitudes
y 83 aserciones. El proxy Vite respondió 200 y coincidió con los datos persistidos de la API. El frontend
compila y en esa corrida pasaron 89 pruebas Jest. Posteriormente se configuró el token local y el usuario aprobó
la prueba manual del mapa. Esta evidencia manual se distingue de la simulación del SDK en Jest.
Los archivos SMTP y credenciales del propietario no se modificaron.


Actualización Admin: Navbar muestra Panel de administración únicamente al rol 3, también en móvil.
El panel enlaza Puntos de entrega y su salida borra la sesión. Diez nuevas pruebas cubren navegación
y roles; Jest completo pasa 99 pruebas. El flujo de correo/OTP y sus resultados se documentan en
`TequioAPI/docs/ADMIN_FLOW.md` del repositorio hermano.
