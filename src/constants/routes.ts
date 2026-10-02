/**
 * Application route path constants.
 */
export const ROUTES = {
  PUBLIC: {
    HOME: '/',
    CATALOG: '/catalogo',
    BECOME_PRODUCER: '/vendedores',
  },
  AUTH: {
    ROOT: '/auth/*',
    LOGIN: '/login',
    REGISTER: '/registro',
    VERIFY_ACCOUNT: '/verificar',
  },
  PRODUCER: {
    ROOT: '/productor/*',
    DASHBOARD: '/productor/panel',
    CREATE_BATCH: '/productor/nuevo-lote',
  },
  BUYER: {
    MY_PURCHASES: '/mis-compras',
    CART: '/carrito',
    PROFILE: '/perfil',
  },
} as const;