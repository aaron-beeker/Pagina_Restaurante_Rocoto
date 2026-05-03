/**
 * Clases Tailwind compartidas para mantener el mismo aspecto en paneles admin y secciones densas.
 */
export const adminShell = {
  page: "min-h-screen bg-stone-100 px-4 py-6 pt-20 pb-16 sm:px-6 sm:pt-24 sm:pb-20",
  card: "mx-auto w-full max-w-6xl rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xl sm:p-6 md:p-8",
  header:
    "mb-6 flex flex-col gap-4 border-b border-stone-200 pb-4 sm:mb-8 sm:flex-row sm:items-start sm:justify-between sm:pb-6",
  title: "font-h1 text-xl font-bold uppercase tracking-tight text-primary sm:text-2xl md:text-3xl",
  subtitle: "mt-1 max-w-xl text-sm text-stone-500",
  backBtn:
    "inline-flex shrink-0 items-center gap-2 self-start rounded-lg px-2 py-1.5 font-button text-sm text-stone-500 transition-colors hover:bg-stone-100 hover:text-secondary",
  sectionTitle: "mb-3 font-label-caps text-xs font-bold uppercase tracking-wide text-stone-700 sm:mb-4",
  mutedBox: "rounded-xl border border-stone-200 bg-stone-50/80 p-4 sm:p-6",
  accentBox: "rounded-xl border border-blue-200/80 bg-blue-50/90 p-4 sm:p-6",
};

export const formInput =
  "w-full rounded-lg border-stone-300 text-sm shadow-sm focus:border-primary focus:ring-primary";
