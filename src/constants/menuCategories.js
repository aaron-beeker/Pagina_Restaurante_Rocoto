/**
 * Categorías reservadas para armar el menú ejecutivo del día (admin).
 * No deben mostrarse en la carta pública cuando son lo único del producto.
 * @type {string[]}
 */
export const CATEGORIAS_SOLO_MENU_DIARIO = ["Entrada", "Menú del Día", "Bebida Menú"];

/**
 * Indica si el producto solo existe para el armado del menú del día (no carta pública).
 * @param {{category: string|string[]}} item - Producto a evaluar.
 * @returns {boolean} True si todas sus categorías son solo para menú del día.
 */
export function esProductoSoloMenuDiario(item) {
  const raw = Array.isArray(item.category) ? item.category : [item.category];
  const cats = raw.filter((c) => c != null && String(c).trim() !== "");
  if (!cats.length) return false;
  return cats.every((c) => CATEGORIAS_SOLO_MENU_DIARIO.includes(c));
}

/**
 * Indica si todas las categorías seleccionadas son solo para menú del día.
 * @param {string[]} categoriasSeleccionadas - Lista de categorías a evaluar.
 * @returns {boolean} True si todas son categorías de menú del día.
 */
export function seleccionSoloMenuDiario(categoriasSeleccionadas) {
  if (!categoriasSeleccionadas.length) return false;
  return categoriasSeleccionadas.every((c) => CATEGORIAS_SOLO_MENU_DIARIO.includes(c));
}
