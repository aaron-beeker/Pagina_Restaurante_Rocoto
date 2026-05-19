/**
 * Sistema de Diseño para Rocoto Restaurante Chifa
 * Define tokens de Tailwind compartidos para mantener la armonía visual.
 */

// --- Tipografía ---
export const typography = {
  h1: "font-display text-4xl sm:text-6xl lg:text-8xl font-black text-on-background tracking-tighter leading-[0.9]",
  h2: "font-display text-3xl sm:text-5xl lg:text-6xl font-black text-on-background tracking-tight leading-tight",
  h3: "font-display text-xl sm:text-2xl lg:text-3xl font-bold text-on-background tracking-tight",
  bodyLg: "font-sans text-base sm:text-lg text-on-surface-variant font-medium leading-relaxed",
  bodyMd: "font-sans text-sm sm:text-base text-on-surface-variant font-normal leading-relaxed",
  bodySm: "font-sans text-xs sm:text-sm text-on-surface-variant/70 font-medium",
};

// --- Contenedores y Secciones ---
export const layout = {
  container: "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8",
  section: "py-14 sm:py-20",
  sectionHeader: "mb-10 sm:mb-16 text-center",
  sectionTitle:
    "font-display text-4xl sm:text-6xl font-black text-on-background tracking-tight leading-tight",
  sectionSubtitle:
    "mt-4 mx-auto max-w-2xl text-base sm:text-lg text-on-surface-variant/80 font-normal leading-relaxed font-sans",
  label:
    "font-sans text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em] text-primary mb-3 block",
};

// --- Botones ---
export const button = {
  base: "inline-flex items-center justify-center gap-2 rounded-xl font-sans text-xs sm:text-sm font-bold transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none tracking-wide",
  primary: "bg-primary text-white shadow-md hover:brightness-110 px-6 py-3 sm:px-8 sm:py-4",
  secondary: "bg-secondary text-white shadow-md hover:brightness-110 px-6 py-3 sm:px-8 sm:py-4",
  outline: "border-2 border-white text-white hover:bg-white/10 px-6 py-3 sm:px-8 sm:py-4",
  outlineDark:
    "border-2 border-surface-variant text-on-surface-variant hover:bg-background px-6 py-3 sm:px-8 sm:py-4",
  ghost:
    "text-on-surface-variant hover:text-primary hover:bg-background px-3 py-2 sm:px-4 sm:py-2.5",
  admin: "bg-primary text-white rounded-xl py-3 sm:py-4 hover:brightness-110",
  small: "px-3 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-xs",
};

// --- Componentes UI ---
export const card = {
  base: "overflow-hidden rounded-2xl border border-surface-variant bg-surface transition-all duration-300",
  interactive: "hover:shadow-xl hover:-translate-y-1.5",
  product: "group border-transparent hover:border-surface-variant shadow-sm hover:shadow-lg",
  imageContainer: "relative overflow-hidden aspect-[4/3]",
  image: "h-full w-full object-cover transition-transform duration-500 group-hover:scale-110",
  content: "p-5 sm:p-7 lg:p-8",
};

// --- Formularios ---
export const form = {
  label: "mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/50",
  input:
    "w-full rounded-xl border-surface-variant bg-background text-sm shadow-sm transition-all focus:border-primary focus:ring-primary/10",
  checkbox: "h-5 w-5 rounded border-surface-variant text-primary focus:ring-primary",
};

// --- Administración (Estructura de Paneles) ---
export const adminShell = {
  page: "min-h-screen bg-background px-4 py-8 pb-20 sm:px-6 sm:pt-0",
  card: "mx-auto w-full max-w-6xl rounded-3xl border border-surface-variant bg-surface p-6 shadow-xl shadow-on-background/5 sm:p-10",
  header:
    "z-40 -mx-6 -mt-6 mb-10 flex flex-col gap-6 border-b border-surface-variant bg-surface/95 pb-10 pt-6 backdrop-blur-md sm:sticky sm:top-0 sm:-mx-10 sm:-mt-10 sm:flex-row sm:items-center sm:justify-between sm:px-10 sm:pt-10",
  title: "font-display text-2xl font-black tracking-tight text-primary sm:text-3xl",
  subtitle: "mt-2 max-w-xl text-sm text-on-surface-variant/60 font-medium",
  backBtn:
    "inline-flex items-center gap-2 rounded-xl bg-background sm:bg-transparent px-4 py-3 sm:py-2 text-sm font-bold text-secondary sm:text-on-surface-variant/40 hover:bg-background hover:text-secondary transition-all shadow-sm sm:shadow-none border border-surface-variant sm:border-transparent",
  sectionTitle:
    "mb-6 font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant/40",
  mutedBox: "rounded-2xl border border-surface-variant bg-background p-6 sm:p-8",
  accentBox: "rounded-2xl border border-blue-100 bg-blue-50/50 p-6 sm:p-8",
};

export const formInput = form.input;
