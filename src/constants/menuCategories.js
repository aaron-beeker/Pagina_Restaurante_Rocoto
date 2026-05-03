/**
 * Categorías reservadas para armar el menú ejecutivo del día (admin).
 * No deben mostrarse en la carta pública cuando son lo único del producto.
 */
export const CATEGORIAS_SOLO_MENU_DIARIO = ["Entrada", "Menú del Día", "Bebida Menú"];

/** Indica si el producto solo existe para el armado del menú del día (no carta pública). */
export function esProductoSoloMenuDiario(item) {
  const raw = Array.isArray(item.category) ? item.category : [item.category];
  const cats = raw.filter((c) => c != null && String(c).trim() !== "");
  if (!cats.length) return false;
  return cats.every((c) => CATEGORIAS_SOLO_MENU_DIARIO.includes(c));
}

/** True si todas las categorías marcadas son solo menú del día (entrada / plato menú / bebida menú). */
export function seleccionSoloMenuDiario(categoriasSeleccionadas) {
  if (!categoriasSeleccionadas.length) return false;
  return categoriasSeleccionadas.every((c) => CATEGORIAS_SOLO_MENU_DIARIO.includes(c));
}
