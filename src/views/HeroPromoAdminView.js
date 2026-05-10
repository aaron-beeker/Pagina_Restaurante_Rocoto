import { adminShell, button, form } from "../ui/layout.js";
import { escapeHtml } from "../utils/html.js";
import { dialog } from "../utils/notifications.js";

export class HeroPromoAdminView {
  constructor(rootElement) {
    this.rootElement = rootElement;
    this.banners = [];
  }

  render(config, acciones) {
    this.banners = config?.banners || [];
    this.renderInternal(acciones);
  }

  renderInternal(acciones) {
    const { onSave, onBack } = acciones;
    this.rootElement.innerHTML = `
      <div class="min-h-screen bg-background px-2 py-4 sm:px-6 sm:py-8 pb-24">
        <div class="mx-auto w-full max-w-6xl rounded-3xl border border-surface-variant bg-surface p-4 sm:p-10 shadow-xl">
          
          <!-- Header Responsivo Estándar -->
          <div class="z-40 -mx-4 -mt-4 mb-8 border-b border-surface-variant bg-surface/95 p-4 backdrop-blur-md sm:sticky sm:top-0 sm:-mx-10 sm:-mt-10 sm:px-10 sm:pt-10 sm:pb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 class="text-xl sm:text-3xl font-black tracking-tight text-primary leading-tight">Gestión Carrusel</h2>
              <p class="hidden sm:block text-sm text-on-surface-variant/60 font-medium">Configura los banners promocionales del inicio.</p>
            </div>
            <button type="button" id="admin-shell-back" class="${adminShell.backBtn} hidden sm:inline-flex h-11 px-6 shrink-0 bg-stone-100 sm:bg-stone-50 border-stone-200 shadow-sm transition-all hover:bg-stone-200">
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                Cerrar gestión
            </button>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            
            <!-- FORMULARIO DE AGREGAR (Móvil Primero) -->
            <div class="lg:col-span-4 order-1 lg:order-2">
                <div class="bg-background rounded-3xl border border-surface-variant p-6 sticky top-24">
                    <div class="mb-6">
                        <h3 class="text-sm font-black uppercase tracking-widest text-primary">Añadir Banner</h3>
                    </div>

                    <form id="hero-promo-form" class="space-y-5">
                        <div class="flex items-center gap-3 p-3 bg-white rounded-2xl border border-surface-variant">
                            <input type="checkbox" id="hero-promo-activo" checked class="w-5 h-5 rounded border-stone-300 text-primary focus:ring-primary" />
                            <label for="hero-promo-activo" class="text-xs font-black uppercase tracking-tight text-stone-600 cursor-pointer">Banner Activo</label>
                        </div>

                        <div>
                            <label class="${form.label} ml-1">Título de Referencia</label>
                            <input type="text" id="hero-promo-titulo" class="${form.input} h-12" placeholder="Ej: Promo Parrillas" />
                        </div>

                        <div>
                            <label class="${form.label} ml-1">Imagen Escritorio (URL)</label>
                            <input type="url" id="hero-promo-image-url" class="${form.input} h-12" placeholder="https://..." required />
                        </div>

                        <div>
                            <label class="${form.label} ml-1">Imagen Móvil (URL)</label>
                            <input type="url" id="hero-promo-mobile-image-url" class="${form.input} h-12" placeholder="Opcional: URL para celular" />
                        </div>

                        <button type="submit" class="${button.base} ${button.primary} w-full py-4.5 text-base font-black uppercase tracking-widest shadow-xl shadow-primary/20">
                            Guardar Banner
                        </button>
                    </form>
                </div>
            </div>

            <!-- LISTA DE BANNERS -->
            <div class="lg:col-span-8 order-2 lg:order-1 space-y-6">
                <div class="flex items-center justify-between mb-2">
                    <h3 class="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/40 ml-1">Banners Actuales (${this.banners.length})</h3>
                </div>

                <div id="banners-list" class="grid grid-cols-1 gap-4">
                    ${this.banners.length === 0 
                        ? `<div class="py-20 text-center border-2 border-dashed border-stone-100 rounded-[2.5rem] bg-stone-50/30 text-stone-400 font-bold uppercase tracking-widest text-[10px]">No hay banners configurados</div>` 
                        : this.banners.map((b, index) => `
                        <div class="group relative overflow-hidden rounded-[2rem] border border-stone-100 bg-white shadow-sm hover:shadow-xl transition-all duration-500">
                            <div class="p-4 sm:p-6 flex flex-col sm:flex-row gap-6">
                                
                                <!-- Previsualización de Imágenes -->
                                <div class="flex gap-3 shrink-0">
                                  <div class="relative w-full sm:w-48 aspect-video rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 shadow-inner">
                                    <img src="${escapeHtml(b.imageUrl)}" class="h-full w-full object-cover" onerror="this.src='https://placehold.co/600x400?text=Error+Imagen'"/>
                                    <span class="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-md text-[8px] font-black text-white uppercase tracking-widest">Web</span>
                                  </div>
                                  <div class="relative w-16 sm:w-20 aspect-[9/16] rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 shadow-inner">
                                    <img src="${escapeHtml(b.mobileImageUrl || b.imageUrl)}" class="h-full w-full object-cover" onerror="this.src='https://placehold.co/400x600?text=Error'"/>
                                    <span class="absolute top-2 left-1 right-1 text-center px-1 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[6px] font-black text-white uppercase tracking-widest">Móvil</span>
                                  </div>
                                </div>

                                <!-- Detalles y Controles -->
                                <div class="flex-1 min-w-0 flex flex-col justify-center">
                                    <div class="flex items-center gap-2 mb-3">
                                        <span class="px-3 py-1 rounded-full bg-primary/5 text-[9px] font-black text-primary uppercase tracking-tighter border border-primary/10">Posición ${index + 1}</span>
                                        ${b.activo 
                                            ? '<span class="px-3 py-1 rounded-full bg-emerald-100 text-[9px] font-black text-emerald-600 uppercase tracking-tighter border border-emerald-200">Activo</span>' 
                                            : '<span class="px-3 py-1 rounded-full bg-stone-100 text-[9px] font-black text-stone-400 uppercase tracking-tighter border border-stone-200">Inactivo</span>'
                                        }
                                    </div>
                                    <h4 class="text-base sm:text-lg font-black text-stone-800 truncate uppercase tracking-tight">${escapeHtml(b.titulo || 'Banner sin título')}</h4>
                                    <p class="text-[9px] font-bold text-stone-400 truncate mt-1 opacity-60">${escapeHtml(b.imageUrl)}</p>
                                </div>

                                <!-- Botón Eliminar -->
                                <div class="flex items-center sm:pl-6 border-t sm:border-t-0 sm:border-l border-stone-100 pt-4 sm:pt-0">
                                    <button class="delete-banner-btn flex items-center justify-center gap-2 w-full sm:w-12 sm:h-12 rounded-2xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all group/btn" data-index="${index}">
                                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                        <span class="sm:hidden font-black uppercase text-xs">Eliminar Banner</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
          </div>
        </div>
      </div>
    `;
    this.setupEventListeners(acciones);
  }

  setupEventListeners(acciones) {
    const { onSave, onBack } = acciones;
    const backBtn = document.getElementById("admin-shell-back");
    if (backBtn) backBtn.onclick = onBack;

    this.rootElement.querySelectorAll(".delete-banner-btn").forEach(btn => {
      btn.onclick = async () => {
        if (await dialog.confirm("Confirmar Eliminación", "¿Está seguro de eliminar este banner del carrusel principal?")) {
            this.banners.splice(parseInt(btn.dataset.index), 1);
            await onSave({ banners: this.banners });
            this.renderInternal(acciones);
        }
      };
    });

    const formEl = document.getElementById("hero-promo-form");
    if (formEl) {
      formEl.onsubmit = async (e) => {
        e.preventDefault();
        const newBanner = { 
            id: Date.now().toString(), 
            activo: document.getElementById("hero-promo-activo").checked, 
            titulo: document.getElementById("hero-promo-titulo").value.trim() || 'Banner', 
            imageUrl: document.getElementById("hero-promo-image-url").value.trim(), 
            mobileImageUrl: document.getElementById("hero-promo-mobile-image-url").value.trim() || document.getElementById("hero-promo-image-url").value.trim() 
        };
        this.banners.push(newBanner);
        await onSave({ banners: this.banners });
        this.renderInternal(acciones);
      };
    }
  }
}
