/**
 * Paleta de colores oficial de Tequio 
 */
export const TEQUIO_THEME = {
  warmIvory: '#FFFDF9',     // Fondo general
  surfaceWhite: '#FFFFFF',  // Tarjetas y contenedores
  espressoBrown: '#18110A', // Texto principal y títulos
  terracotta: '#D9481E',    // Acción principal (botones)
  emeraldGreen: '#1E6F43',  // Naturaleza, éxito y avances
  honeyAmber: '#FFB703',    // Avisos y fechas límite
  ashBrown: '#63584F',      // Textos secundarios
} as const;

/**
 * Cinta multicolores Tqqui
 */
export const CULTURAL_BAND_COLORS: string[] = [
  TEQUIO_THEME.honeyAmber,   // 1. Ámbar Miel (#FFB703)
  '#D81B60',                // 2. Rosa Mexicano
  '#00BFA5',                // 3. Turquesa Esmeralda
  '#FF6D00',                // 4. Naranja Cálido
  TEQUIO_THEME.terracotta,   // 5. Terracota Vivo (#D9481E)
  TEQUIO_THEME.emeraldGreen, // 6. Verde Bosque (#1E6F43)
];