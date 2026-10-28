/**
 * Contract representing an individual category or subcategory option.
 */
export interface CategoryOption {
  readonly id: number;
  readonly label: string;
}

/**
 * Contract representing a parent category grouping its corresponding subcategories.
 */
export interface ParentCategoryGroup {
  readonly id: number;
  readonly label: string;
  readonly subcategories: readonly CategoryOption[];
}

/**
 * Standard measurement units supported by the catalog according to RN-01.
 */
export const MEASUREMENT_UNITS: readonly CategoryOption[] = [
  { id: 1, label: 'Kilogramo (kg)' },
  { id: 2, label: 'Gramo (g)' },
  { id: 3, label: 'Litro (L)' },
  { id: 4, label: 'Mililitro (ml)' },
  { id: 5, label: 'Pieza' },
  { id: 6, label: 'Manojo' },
  { id: 7, label: 'Frasco' },
  { id: 8, label: 'Bolsa / Paquete' },
] as const;

/**
 * Official hierarchical category tree matching database seed records (01_InitTequio.sql).
 */
export const PRODUCT_CATEGORIES_TREE: readonly ParentCategoryGroup[] = [
  {
    id: 1,
    label: 'Alimentos Frescos y Agroecológicos',
    subcategories: [
      { id: 2, label: 'Frutas y Cítricos' },
      { id: 3, label: 'Hortalizas y Verduras' },
      { id: 4, label: 'Hongos y Setas' },
    ],
  },
  {
    id: 5,
    label: 'Café y Derivados',
    subcategories: [
      { id: 6, label: 'Café en grano' },
      { id: 7, label: 'Café molido' },
      { id: 8, label: 'Licores y cremas de café' },
    ],
  },
  {
    id: 9,
    label: 'Lácteos y Embutidos',
    subcategories: [
      { id: 10, label: 'Quesos' },
      { id: 11, label: 'Embutidos y carnes ahumadas' },
    ],
  },
  {
    id: 12,
    label: 'Conservas, Salsas y Endulzantes',
    subcategories: [
      { id: 13, label: 'Salsas y chiles secos' },
      { id: 14, label: 'Miel y derivados' },
      { id: 15, label: 'Dulces típicos y mermeladas' },
    ],
  },
  {
    id: 16,
    label: 'Abarrotes y Granos',
    subcategories: [
      { id: 17, label: 'Frijol, arroz y semillas' },
      { id: 18, label: 'Piloncillo y especias' },
      { id: 19, label: 'Panadería tradicional' },
    ],
  },
  {
    id: 20,
    label: 'Artesanías y Manufactura Local',
    subcategories: [
      { id: 21, label: 'Alfarería y cerámica' },
      { id: 22, label: 'Talabartería y cuero' },
      { id: 23, label: 'Textiles y ropa' },
      { id: 24, label: 'Juguetes tradicionales' },
    ],
  },
  {
    id: 25,
    label: 'Viveros y Floricultura',
    subcategories: [
      { id: 26, label: 'Plantas de ornato' },
      { id: 27, label: 'Árboles frutales y maderables' },
      { id: 28, label: 'Tierra y abonos orgánicos' },
    ],
  },
  {
    id: 29,
    label: 'Cuidado Personal y Herbolaria',
    subcategories: [
      { id: 30, label: 'Jabones artesanales' },
      { id: 31, label: 'Extractos y aceites esenciales' },
    ],
  },
] as const;