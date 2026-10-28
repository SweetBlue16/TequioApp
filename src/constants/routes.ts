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
    ROOT: '/panel-vendedor',
    PRODUCTS: '/panel-vendedor/productos',
    NEW_PRODUCT: '/panel-vendedor/productos/nuevo',
    BATCHES: '/panel-vendedor/lotes',
    STATISTICS: '/panel-vendedor/estadisticas',
    VALIDATE_DELIVERY: '/panel-vendedor/validar-entrega',
  },
  BUYER: {
    MY_PURCHASES: '/mis-compras',
    CART: '/carrito',
    PROFILE: '/perfil',
  },
} as const;