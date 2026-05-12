import { html, render } from 'lit-html';
import { button, form, layout } from "../ui/layout.js";
import { toast, dialog } from "../utils/notifications.js";

const PLACEHOLDER_IMG = "https://placehold.co/600x400?text=Sin+Imagen";

export class HeroPromoAdminView {
  constructor(rootElement) {
    this.rootElement = rootElement;
    this.banners = [];
    this.acciones = null;
  }

  /**
   * Renderizado principal: Gestión de Banners del Inicio.
   */
  render(config, acciones) {
    this.banners = config?.banners || [];
    this.acciones = acciones;
    
    const template = html`
      <div class="min-h-screen bg-[#fafafa] font-sans pb-32 text-stone-900">
        <div class="max-w-[1400px] mx-auto px-4 py-8 sm:py-16">
          
          <!-- Cabecera Editorial -->
          ${this._renderHeader(acciones.onBack)}

          <div class="space-y-24 sm:space-y-32">
            <!-- BLOQUE MAESTRO: Gestión de Carrusel -->
            <section class="space-y-6">
                <div class="flex items-center gap-4">
                    
                    <h3 class="text-xs sm:text-sm font-black uppercase tracking-[0.2em] sm:tracking-[0.2em]">Gestión Carrusel de Inicio</h3>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                    <!-- Listado Izquierda -->
                    <div class="lg:col-span-7 order-2 lg:order-1 space-y-6">
                        <div class="flex items-center gap-4 ml-2 mb-6">
                            <div class="h-1.5 w-1.5 rounded-full bg-primary"></div>
                            <span class="text-[10px] font-black uppercase tracking-[0.3em] text-stone-900">Banners Activos (${this.banners.length})</span>
                        </div>
                        
                        <div id="banners-list" class="grid grid-cols-1 gap-6">
                            ${this.banners.length === 0 
                                ? html`<div class="py-24 text-center border-2 border-dashed border-stone-100 rounded-[3rem] text-stone-300 uppercase tracking-[0.4em] text-[10px] font-bold italic bg-stone-50/30">No hay banners configurados</div>` 
                                : this.banners.map((b, index) => this._renderBannerCard(b, index))}
                        </div>
                    </div>

                    <!-- Editor Derecha (Sticky) -->
                    <div class="lg:col-span-5 order-1 lg:order-2">
                        <div class="bg-white rounded-[2.5rem] sm:rounded-[3rem] p-7 sm:p-10 border border-stone-100 shadow-xl lg:sticky lg:top-10" id="hero-editor-container">
                             <div class="mb-8 border-b border-stone-50 pb-6">
                                <h4 class="text-stone-900 font-display italic text-xl sm:text-2xl" id="form-title">Añadir Banner</h4>
                                <p class="text-[9px] text-stone-400 uppercase tracking-widest mt-1">Configura las imágenes del inicio</p>
                             </div>
                            
                            <form id="hero-promo-form" @submit=${(e) => this._handleSubmit(e)} @input=${() => this._updateCancelVisibility()} class="space-y-10 sm:space-y-14">
                                <input type="hidden" id="edit-banner-index" value="" />
                                
                                <div class="space-y-8">
                                    <!-- Estado Activo -->
                                    <label class="flex items-center gap-5 cursor-pointer group p-5 sm:p-6 bg-stone-50 rounded-2xl border-2 border-stone-100 hover:border-primary/30 transition-all active:bg-stone-100">
                                        <input type="checkbox" id="hero-promo-activo" checked class="w-6 h-6 rounded-lg border-stone-300 bg-white text-primary focus:ring-0 focus:ring-offset-0 transition-all" />
                                        <div class="flex flex-col">
                                            <span class="text-xs sm:text-sm uppercase tracking-widest text-stone-700 group-hover:text-stone-900 transition-colors font-black">Banner Activo</span>
                                            <span class="text-[9px] text-stone-400">¿Mostrar este anuncio ahora?</span>
                                        </div>
                                    </label>

                                    <div>
                                        <label class="text-[10px] uppercase tracking-[0.3em] text-stone-400 font-bold mb-3 block">Título de Referencia</label>
                                        <input type="text" id="hero-promo-titulo" placeholder="Ej: Promo Parrillas" class="w-full border-b-2 border-stone-100 py-3 sm:py-4 text-xl sm:text-2xl font-display italic text-stone-900 focus:border-primary outline-none transition-all placeholder:text-stone-200" required />
                                    </div>

                                    <div>
                                        <label class="text-[10px] uppercase tracking-[0.3em] text-stone-400 font-bold mb-3 block">Imagen Escritorio (Web)</label>
                                        <input type="url" id="hero-promo-image-url" placeholder="https://..." class="w-full bg-stone-50 border-none rounded-2xl py-4.5 sm:py-5 px-6 text-sm text-stone-900 focus:ring-2 focus:ring-primary/20 outline-none transition-all" required />
                                    </div>

                                    <div>
                                        <label class="text-[10px] uppercase tracking-[0.3em] text-stone-400 font-bold mb-3 block">Imagen Móvil (Celular)</label>
                                        <input type="url" id="hero-promo-mobile-image-url" placeholder="Opcional: URL para celular" class="w-full bg-stone-50 border-none rounded-2xl py-4.5 sm:py-5 px-6 text-sm text-stone-900 focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                                    </div>
                                </div>

                                <div class="flex flex-col gap-5 border-t border-stone-100 pt-10">
                                    <button type="submit" id="submit-banner-btn" class="w-full bg-stone-950 text-white py-8 sm:py-7 rounded-[2rem] sm:rounded-3xl text-sm sm:text-base uppercase tracking-[0.5em] font-black shadow-2xl hover:bg-primary transition-all duration-500 active:scale-[0.97] transform">
                                        Guardar Banner
                                    </button>
                                    <button type="button" id="cancel-banner-edit" @click=${() => this._cancelEdit()} class="hidden w-full text-stone-400 py-4 text-xs sm:text-sm uppercase tracking-widest font-bold hover:text-red-500 transition-all italic text-center flex items-center justify-center gap-2 group/cancel">
                                        <svg class="h-4 w-4 opacity-0 group-hover/cancel:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
                                        <span id="cancel-text">Limpiar Formulario</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
          </div>
        </div>
      </div>
    `;

    this._safeRender(template);
  }

  _renderBannerCard(b, index) {
    return html`
      <div class="group relative overflow-hidden rounded-[2.5rem] border-2 border-stone-50 bg-white shadow-sm hover:shadow-2xl transition-all duration-700 p-6 sm:p-8">
        <div class="flex flex-col gap-8">
            
            <!-- Previsualización Dual (Web + Móvil) -->
            <div class="flex gap-4 items-end">
                <div class="relative flex-1 aspect-[21/9] rounded-3xl overflow-hidden bg-stone-100 border border-stone-200 shadow-inner group-hover:shadow-lg transition-all duration-700">
                    <img src="${b.imageUrl}" class="h-full w-full object-cover group-hover:scale-105 transition-transform duration-[4s]" @error=${(e) => e.target.src = PLACEHOLDER_IMG} />
                    <div class="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md text-[8px] font-black text-white uppercase tracking-[0.2em] border border-white/10">WEB</div>
                </div>
                <div class="relative w-20 sm:w-28 aspect-[9/16] rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 shadow-inner shrink-0 group-hover:shadow-lg transition-all duration-700">
                    <img src="${b.mobileImageUrl || b.imageUrl}" class="h-full w-full object-cover group-hover:scale-110 transition-transform duration-[3s]" @error=${(e) => e.target.src = PLACEHOLDER_IMG} />
                    <div class="absolute top-3 left-0 right-0 text-center px-1 py-0.5 bg-black/40 backdrop-blur-md text-[6px] font-black text-white uppercase tracking-[0.1em]">MÓVIL</div>
                </div>
            </div>

            <!-- Detalles y Acciones -->
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-3 mb-2">
                        <span class="text-[9px] font-black uppercase tracking-[0.3em] text-primary">Posición ${index + 1}</span>
                        ${b.activo 
                            ? html`<span class="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase tracking-tighter border border-emerald-100"><span class="h-1 w-1 rounded-full bg-emerald-500 animate-pulse"></span>Activo</span>` 
                            : html`<span class="px-2.5 py-1 rounded-full bg-stone-100 text-stone-400 text-[8px] font-black uppercase tracking-tighter border border-stone-200">Inactivo</span>`
                        }
                    </div>
                    <h4 class="text-lg sm:text-xl font-display italic text-stone-900 uppercase tracking-tight truncate">${b.titulo}</h4>
                </div>

                <div class="flex gap-3 w-full sm:w-auto">
                    <!-- Botón Toggle Rápido -->
                    <button @click=${() => this._handleToggle(index)} class="flex-1 sm:flex-none px-5 py-3 rounded-xl border-2 transition-all active:scale-95 text-[9px] font-black uppercase tracking-widest ${b.activo ? 'bg-amber-50 border-amber-100 text-amber-600 hover:bg-amber-100' : 'bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-100'}">
                        ${b.activo ? 'Desactivar' : 'Activar'}
                    </button>
                    
                    <button @click=${() => this._prepareEdit(b, index)} class="flex-1 sm:flex-none px-8 py-3 rounded-xl bg-stone-50 text-stone-600 text-[10px] font-black uppercase tracking-widest hover:bg-stone-950 hover:text-white transition-all active:scale-95">
                        Editar
                    </button>
                    <button @click=${() => this._handleDelete(index)} class="px-5 py-3 rounded-xl text-stone-300 hover:text-red-500 hover:bg-red-50 transition-all active:scale-90">
                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </button>
                </div>
            </div>
        </div>
      </div>
    `;
  }

  // --- Handlers de Lógica ---

  async _handleToggle(index) {
      const banner = this.banners[index];
      banner.activo = !banner.activo;
      
      // Feedback inmediato local
      this.render({ banners: this.banners }, this.acciones);
      
      // Persistir
      await this.acciones.onSave({ banners: this.banners });
  }

  async _handleSubmit(e) {
      e.preventDefault();
      const index = document.getElementById("edit-banner-index").value;
      const bannerData = { 
          id: index !== "" ? this.banners[index].id : Date.now().toString(), 
          activo: document.getElementById("hero-promo-activo").checked, 
          titulo: document.getElementById("hero-promo-titulo").value.trim() || 'Banner', 
          imageUrl: document.getElementById("hero-promo-image-url").value.trim(), 
          mobileImageUrl: document.getElementById("hero-promo-mobile-image-url").value.trim() || document.getElementById("hero-promo-image-url").value.trim() 
      };

      let newBanners = [...this.banners];
      if (index !== "") {
          newBanners[index] = bannerData;
      } else {
          newBanners.push(bannerData);
      }

      await this.acciones.onSave({ banners: newBanners });
      this._cancelEdit();
  }

  _updateCancelVisibility() {
      const index = document.getElementById("edit-banner-index").value;
      const titulo = document.getElementById("hero-promo-titulo").value.trim();
      const img = document.getElementById("hero-promo-image-url").value.trim();
      const mobileImg = document.getElementById("hero-promo-mobile-image-url").value.trim();
      const cancelBtn = document.getElementById("cancel-banner-edit");
      
      const hasContent = titulo !== "" || img !== "" || mobileImg !== "";
      const isEditing = index !== "";
      
      if (hasContent || isEditing) {
          cancelBtn.classList.remove("hidden");
      } else {
          cancelBtn.classList.add("hidden");
      }
  }

  _prepareEdit(b, index) {
      const formContainer = document.getElementById("hero-editor-container");
      document.getElementById("edit-banner-index").value = index;
      document.getElementById("hero-promo-activo").checked = !!b.activo;
      document.getElementById("hero-promo-titulo").value = b.titulo || "";
      document.getElementById("hero-promo-image-url").value = b.imageUrl || "";
      document.getElementById("hero-promo-mobile-image-url").value = b.mobileImageUrl || "";
      
      document.getElementById("form-title").textContent = "Editar Banner #" + (index + 1);
      document.getElementById("submit-banner-btn").textContent = "Actualizar Banner";
      document.getElementById("cancel-text").textContent = "Cancelar Edición";
      this._updateCancelVisibility();
      
      // Alineación Superior Directa
      formContainer.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
      
      // Feedback visual
      formContainer.classList.add("ring-8", "ring-primary/10", "duration-500");
      setTimeout(() => formContainer.classList.remove("ring-8", "ring-primary/10"), 2000);
  }

  _cancelEdit() {
      const form = document.getElementById("hero-promo-form");
      const container = document.getElementById("hero-editor-container");
      if (form) form.reset();
      document.getElementById("edit-banner-index").value = "";
      document.getElementById("form-title").textContent = "Añadir Banner";
      document.getElementById("submit-banner-btn").textContent = "Guardar Banner";
      document.getElementById("cancel-text").textContent = "Limpiar Formulario";
      this._updateCancelVisibility();
      if (container) container.classList.remove("ring-8", "ring-primary/10");
  }

  async _handleDelete(index) {
      if (await dialog.confirm("Confirmar Eliminación", "¿Está seguro de eliminar este banner del carrusel principal?")) {
          this.banners.splice(index, 1);
          await this.acciones.onSave({ banners: this.banners });
          this.render({ banners: this.banners }, this.acciones);
      }
  }

  _renderHeader(onBack) {
    return html`
      <header class="flex flex-col sm:flex-row sm:items-end justify-between gap-8 mb-16 sm:mb-20 pb-8 border-b border-stone-200">
        <div class="space-y-4 sm:space-y-6">
            <button @click=${onBack} class="flex items-center gap-3 text-primary hover:text-stone-900 font-bold text-[9px] sm:text-[10px] uppercase tracking-[0.3em] sm:tracking-[0.5em] transition-all group">
                <svg class="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="3" d="M15 19l-7-7 7-7"></path></svg>
                Volver al Panel
            </button>
            <div class="flex flex-col gap-2">
                <span class="text-[8px] sm:text-[9px] uppercase tracking-[0.3em] sm:tracking-[0.4em] text-stone-400 font-bold">Marketing y Promociones</span>
                <h2 class="text-3xl sm:text-6xl font-display italic text-stone-950 leading-none">
                    Gestión <span class="text-primary font-black not-italic underline decoration-stone-200 underline-offset-8">Carrusel</span>
                </h2>
            </div>
        </div>
      </header>
    `;
  }

  _safeRender(template) {
    try { render(template, this.rootElement); }
    catch (e) { this.rootElement.innerHTML = ""; render(template, this.rootElement); }
  }
}
