import { adminShell, button, form, typography, layout } from "../ui/layout.js";
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
      <div class="${adminShell.page}">
        <div class="${adminShell.card}">
          <div class="${adminShell.header}">
            <div>
              <h2 class="${adminShell.title}">Gestión de Carrusel (Por URL)</h2>
              <p class="${adminShell.subtitle}">Añade promociones pegando directamente la URL de la imagen.</p>
            </div>
            <button type="button" id="hero-promo-close" class="${adminShell.backBtn}">
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                Cerrar panel
            </button>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div class="lg:col-span-2 space-y-6">
                <h3 class="${adminShell.sectionTitle}">Banners Publicados</h3>
                <div id="banners-list" class="grid grid-cols-1 gap-4">
                    ${this.banners.length === 0 ? `<div class="py-20 text-center border-2 border-dashed border-stone-100 rounded-3xl text-stone-400">Sin banners.</div>` : this.banners.map((b, index) => `
                        <div class="group relative overflow-hidden rounded-2xl border border-stone-100 bg-white shadow-sm hover:shadow-md transition-all">
                            <div class="flex flex-col sm:flex-row gap-4 p-4">
                                <div class="flex gap-2 shrink-0">
                                  <div class="w-32 aspect-video rounded-xl overflow-hidden bg-stone-100 border border-stone-200"><img src="${escapeHtml(b.imageUrl)}" class="h-full w-full object-cover" /></div>
                                  <div class="w-16 aspect-[9/16] rounded-xl overflow-hidden bg-stone-100 border border-stone-200"><img src="${escapeHtml(b.mobileImageUrl || b.imageUrl)}" class="h-full w-full object-cover" /></div>
                                </div>
                                <div class="flex-1 min-w-0 py-1">
                                    <div class="flex items-center gap-2 mb-2"><span class="px-2 py-0.5 rounded-full bg-primary/10 text-[10px] font-bold text-primary uppercase">Posición ${index + 1}</span>${b.activo ? '<span class="px-2 py-0.5 rounded-full bg-green-100 text-[10px] font-bold text-green-600 uppercase">Activo</span>' : ''}</div>
                                    <h4 class="font-bold text-stone-800 truncate">${escapeHtml(b.titulo || 'Banner')}</h4>
                                </div>
                                <div class="flex sm:flex-col justify-end gap-2"><button class="delete-banner-btn ${button.base} ${button.small} bg-red-50 text-red-500 hover:bg-red-500 hover:text-white" data-index="${index}">Eliminar</button></div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="space-y-6">
                <div class="${adminShell.mutedBox}">
                    <h3 class="${adminShell.sectionTitle}">Configurar Banner</h3>
                    <form id="hero-promo-form" class="space-y-4">
                        <label class="flex cursor-pointer items-center gap-3 mb-4"><input type="checkbox" id="hero-promo-activo" checked class="${form.checkbox}" /><span class="text-sm font-bold text-stone-700">Activo</span></label>
                        <input type="text" id="hero-promo-titulo" class="${form.input}" placeholder="Título (Referencia)" />
                        <div><label class="${form.label}">Imagen Escritorio</label><input type="url" id="hero-promo-image-url" class="${form.input}" placeholder="URL Escritorio" required /></div>
                        <div><label class="${form.label}">Imagen Móvil</label><input type="url" id="hero-promo-mobile-image-url" class="${form.input}" placeholder="URL Móvil" /></div>
                        <button type="submit" class="${button.base} ${button.primary} w-full py-4 mt-4">Guardar Banner</button>
                    </form>
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
    const closeBtn = document.getElementById("hero-promo-close");
    if (closeBtn) closeBtn.onclick = (e) => { e.preventDefault(); onBack(); };

    this.rootElement.querySelectorAll(".delete-banner-btn").forEach(btn => {
      btn.onclick = async () => {
        if (await dialog.confirm("Eliminar", "¿Eliminar este banner?")) {
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
        const newBanner = { id: Date.now().toString(), activo: document.getElementById("hero-promo-activo").checked, titulo: document.getElementById("hero-promo-titulo").value.trim() || 'Banner', imageUrl: document.getElementById("hero-promo-image-url").value.trim(), mobileImageUrl: document.getElementById("hero-promo-mobile-image-url").value.trim() || document.getElementById("hero-promo-image-url").value.trim() };
        this.banners.push(newBanner);
        await onSave({ banners: this.banners });
        this.renderInternal(acciones);
      };
    }
  }
}
