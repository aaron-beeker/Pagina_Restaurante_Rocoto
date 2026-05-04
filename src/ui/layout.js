/**
 * Sistema de Diseño para Rocoto Restaurante Chifa
 * Define tokens de Tailwind compartidos para mantener la armonía visual.
 */

// --- Contenedores y Secciones ---
export const layout = {
  container: "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8",
  section: "py-8 sm:py-14",
  sectionHeader: "mb-6 sm:mb-10 text-center",
  sectionTitle: "font-h1 text-3xl font-bold text-on-background sm:text-4xl lg:text-5xl tracking-tight",
  sectionSubtitle: "mt-3 mx-auto max-w-2xl text-base sm:text-lg text-on-surface-variant leading-relaxed",
  label: "font-label-caps text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-secondary mb-2 sm:mb-3 block",
};

// --- Tipografía ---
export const typography = {
  h1: "font-h1 text-4xl font-bold text-on-background sm:text-6xl lg:text-7xl tracking-tighter",
  h2: "font-h1 text-3xl font-bold text-on-background sm:text-4xl lg:text-5xl tracking-tight",
  h3: "font-h3 text-xl font-bold text-on-background sm:text-2xl tracking-tight",
  bodyLg: "font-body-lg text-base sm:text-lg text-on-surface-variant leading-relaxed",
  bodyMd: "font-body-md text-sm sm:text-base text-stone-600 leading-relaxed",
  bodySm: "font-body-sm text-xs sm:text-sm text-stone-500",
};

// --- Botones ---
export const button = {
  base: "inline-flex items-center justify-center gap-2 rounded-full font-button text-xs sm:text-sm font-bold transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none",
  primary: "bg-primary text-white shadow-lg shadow-primary/20 hover:brightness-110 px-6 py-3 sm:px-8 sm:py-4",
  secondary: "bg-secondary text-white shadow-lg shadow-secondary/20 hover:brightness-110 px-6 py-3 sm:px-8 sm:py-4",
  outline: "border-2 border-white text-white hover:bg-white/10 px-6 py-3 sm:px-8 sm:py-4",
  outlineDark: "border-2 border-stone-200 text-stone-700 hover:bg-stone-50 px-6 py-3 sm:px-8 sm:py-4",
  ghost: "text-stone-600 hover:text-primary hover:bg-stone-100 px-3 py-1.5 sm:px-4 sm:py-2",
  admin: "bg-primary text-white rounded-xl py-3 sm:py-4 hover:brightness-110",
  small: "px-3 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-xs",
};

// --- Componentes UI ---
export const card = {
  base: "overflow-hidden rounded-2xl sm:rounded-3xl border border-surface-variant bg-surface transition-all duration-300",
  interactive: "hover:shadow-xl hover:-translate-y-1",
  product: "group border-stone-100 shadow-sm hover:shadow-md",
  imageContainer: "relative overflow-hidden aspect-[4/3]",
  image: "h-full w-full object-cover transition-transform duration-500 group-hover:scale-110",
  content: "p-4 sm:p-6 lg:p-8",
};

// --- Formularios ---
export const form = {
  label: "mb-1 block text-xs font-bold uppercase tracking-wide text-stone-500",
  input: "w-full rounded-xl border-stone-200 text-sm shadow-sm transition-all focus:border-primary focus:ring-primary focus:ring-opacity-20",
  checkbox: "h-5 w-5 rounded border-stone-300 text-primary focus:ring-primary",
};

// --- Administración (Estructura de Paneles) ---
export const adminShell = {
  page: "min-h-screen bg-stone-50 px-4 py-6 pt-20 pb-16 sm:px-6 sm:pt-24 sm:pb-20",
  card: "mx-auto w-full max-w-6xl rounded-3xl border border-stone-200/50 bg-white p-6 shadow-2xl shadow-stone-200/50 sm:p-10",
  header: "mb-8 flex flex-col gap-6 border-b border-stone-100 pb-8 sm:flex-row sm:items-center sm:justify-between",
  title: "font-h1 text-2xl font-bold uppercase tracking-tight text-primary sm:text-3xl",
  subtitle: "mt-2 max-w-xl text-sm text-stone-500",
  backBtn: "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-stone-400 hover:bg-stone-50 hover:text-secondary transition-all",
  sectionTitle: "mb-6 font-label-caps text-xs font-bold uppercase tracking-widest text-stone-400",
  mutedBox: "rounded-2xl border border-stone-100 bg-stone-50/50 p-6 sm:p-8",
  accentBox: "rounded-2xl border border-blue-100 bg-blue-50/50 p-6 sm:p-8",
};

export const formInput = form.input; // Mantener retrocompatibilidad temporal
