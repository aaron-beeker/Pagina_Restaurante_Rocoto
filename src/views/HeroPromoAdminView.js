import { adminShell, button, form, typography, layout } from "../ui/layout.js";
import { escapeHtml } from "../utils/html.js";

export class HeroPromoAdminView {
  constructor(rootElement) {
    this.rootElement = rootElement;
    this.banners = [];
  }

  render(config, onSave, onClose) {
    this.banners = config?.banners || [];
    this.renderInternal(onSave, onClose);
  }

  renderInternal(onSave, onClose) {
    this.rootElement.innerHTML = `
      <div class="${adminShell.page}">
        <div class="${adminShell.card}">
          <div class="${adminShell.header}">
            <div>
              <h2 class="${adminShell.title}">Gestión de Carrusel (Por URL)</h2>
              <p class="${adminShell.subtitle}">
                Añade promociones pegando directamente la URL de la imagen.
              </p>
            </div>
            <button type="button" id="hero-promo-close" class="${adminShell.backBtn}">
                Volver al sitio
            </button>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div class="lg:col-span-2 space-y-6">
                <h3 class="${adminShell.sectionTitle}">Banners Publicados</h3>
                <div id="banners-list" class="grid grid-cols-1 gap-4">
                    ${this.banners.length === 0 ? `
                        <div class="py-20 text-center border-2 border-dashed border-stone-100 rounded-3xl text-stone-400">
                            No hay banners configurados.
                        </div>
                    ` : this.banners.map((b, index) => `
                        <div class="group relative overflow-hidden rounded-2xl border border-stone-100 bg-white shadow-sm hover:shadow-md transition-all">
                            <div class="flex flex-col sm:flex-row gap-4 p-4">
                                <div class="flex gap-2 shrink-0">
                                  <div class="w-32 aspect-video rounded-xl overflow-hidden bg-stone-100 border border-stone-200">
                                      <img src="${escapeHtml(b.imageUrl)}" class="h-full w-full object-cover" />
                                  </div>
                                  <div class="w-16 aspect-[9/16] rounded-xl overflow-hidden bg-stone-100 border border-stone-200">
                                      <img src="${escapeHtml(b.mobileImageUrl || b.imageUrl)}" class="h-full w-full object-cover" />
                                  </div>
                                </div>
                                <div class="flex-1 min-w-0 py-1">
                                    <div class="flex items-center gap-2 mb-2">
                                        <span class="px-2 py-0.5 rounded-full bg-primary/10 text-[10px] font-bold text-primary uppercase tracking-tighter">Posición ${index + 1}</span>
                                        ${b.activo ? '<span class="px-2 py-0.5 rounded-full bg-green-100 text-[10px] font-bold text-green-600 uppercase tracking-tighter">Activo</span>' : ''}
                                    </div>
                                    <h4 class="font-bold text-stone-800 truncate">${escapeHtml(b.titulo || 'Banner')}</h4>
                                    <p class="text-[10px] text-stone-400 truncate mt-1">D: ${escapeHtml(b.imageUrl)}</p>
                                    <p class="text-[10px] text-stone-400 truncate">M: ${escapeHtml(b.mobileImageUrl || 'Misma que desktop')}</p>
                                </div>
                                <div class="flex sm:flex-col justify-end gap-2">
                                    <button class="delete-banner-btn ${button.base} ${button.small} bg-red-50 text-red-500 hover:bg-red-500 hover:text-white" data-index="${index}">
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="space-y-6">
                <div class="${adminShell.mutedBox}">
                    <h3 class="${adminShell.sectionTitle}">Configurar Banner</h3>
                    <form id="hero-promo-form" class="space-y-4">
                        <label class="flex cursor-pointer items-center gap-3 mb-4">
                            <input type="checkbox" id="hero-promo-activo" checked class="${form.checkbox}" />
                            <span class="text-sm font-bold text-stone-700">Activo</span>
                        </label>
                        <input type="text" id="hero-promo-titulo" class="${form.input}" placeholder="Título (Admin reference)" />
                        <div>
                            <label class="${form.label}">Imagen Escritorio (1920x1080)</label>
                            <input type="url" id="hero-promo-image-url" class="${form.input}" placeholder="URL Escritorio" required />
                        </div>
                        <div>
                            <label class="${form.label}">Imagen Móvil (1080x1920)</label>
                            <input type="url" id="hero-promo-mobile-image-url" class="${form.input}" placeholder="URL Móvil (opcional)" />
                        </div>
                        <button type="submit" id="add-banner-btn" class="${button.base} ${button.primary} w-full py-4 mt-4">
                            Guardar Banner
                        </button>
                    </form>
                </div>
                <div class="rounded-2xl border border-amber-100 bg-amber-50/50 p-6 text-amber-900">
                    <h4 class="text-xs font-bold uppercase tracking-widest mb-3">Guía de Tamaños</h4>
                    <p class="text-xs">Escritorio: 1920x1080px</p>
                    <p class="text-xs">Móvil: 1080x1920px</p>
                </div>
            </div>
          </div>
        </div>
      </div>
    `;
    this.setupEventListeners(onSave, onClose);
  }

  setupEventListeners(onSave, onClose) {
    document.getElementById("hero-promo-close").onclick = onClose;
    this.rootElement.querySelectorAll(".delete-banner-btn").forEach(btn => {
      btn.onclick = async () => {
        if (confirm("¿Eliminar?")) {
            this.banners.splice(parseInt(btn.dataset.index), 1);
            await onSave({ banners: this.banners });
            this.renderInternal(onSave, onClose);
        }
      };
    });
    const formEl = document.getElementById("hero-promo-form");
    if (formEl) {
      formEl.onsubmit = async (e) => {
        e.preventDefault();
        const imageUrl = document.getElementById("hero-promo-image-url").value.trim();
        const mobileImageUrl = document.getElementById("hero-promo-mobile-image-url").value.trim();
        const newBanner = {
            id: Date.now().toString(),
            activo: document.getElementById("hero-promo-activo").checked,
            titulo: document.getElementById("hero-promo-titulo").value.trim() || 'Banner',
            imageUrl: imageUrl,
            mobileImageUrl: mobileImageUrl || imageUrl
        };
        this.banners.push(newBanner);
        await onSave({ banners: this.banners });
        this.renderInternal(onSave, onClose);
      };
    }
  }
}
