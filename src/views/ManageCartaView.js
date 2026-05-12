import { html, render } from 'lit-html';
import { CATEGORIAS_SOLO_MENU_DIARIO, esProductoSoloMenuDiario } from "../constants/menuCategories.js";
import { button, form, layout } from "../ui/layout.js";
import { toast, dialog } from "../utils/notifications.js";

const PLACEHOLDER_ICON = "https://cdn-icons-png.flaticon.com/512/662/662244.png";

export class ManageCartaView {
  constructor(rootElement) {
    this.rootElement = rootElement;
    this.platos = [];
    this.categorias = [];
    this.currentQuery = ""; 
    this.acciones = null;
  }

  /**
   * Renderizado principal: Estructurado para máxima adaptabilidad.
   */
  render(platos, categorias, acciones) {
    this.platos = platos;
    this.categorias = categorias;
    this.acciones = acciones;
    
    const template = html`
      <div class="min-h-screen bg-[#fafafa] font-sans pb-32 text-stone-900">
        <div class="max-w-[1400px] mx-auto px-4 py-8 sm:py-16">
          
          <!-- Cabecera Editorial -->
          ${this._renderHeader(acciones.onBack)}

          <div class="space-y-24 sm:space-y-32">
            <!-- BLOQUE 1: Gestión de Inventario de Productos -->
            <section class="space-y-10 sm:space-y-12 scroll-mt-24" id="form-editor-section">
                <div class="flex items-center gap-4">
                    
                    <h3 class="text-xs sm:text-sm font-black uppercase tracking-[0.4em] sm:tracking-[0.5em]">Gestión de Inventario</h3>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                    <!-- Inventario Izquierda -->
                    <div class="lg:col-span-7 order-2 lg:order-1 flex flex-col gap-6">
                        <!-- Buscador Fijo encima del scroll -->
                        <div class="relative w-full group">
                            <input type="search" id="search-product" 
                                   .value=${this.currentQuery}
                                   @input=${(e) => this.applyFilter(e.target.value)} 
                                   placeholder="Buscar por nombre, categoría o precio..." 
                                   class="w-full bg-white border-2 border-stone-100 rounded-2xl py-4 sm:py-3.5 pl-12 pr-4 text-sm focus:border-primary outline-none transition-all shadow-sm placeholder:text-stone-300" />
                            <svg class="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-300 group-focus-within:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke-width="2.5"/></svg>
                        </div>

                        <!-- Área de Scroll de Platos -->
                        <div id="table-container" class="lg:max-h-[1100px] lg:overflow-y-auto lg:pr-4 custom-scrollbar">
                            ${this._renderProductGrid(platos, acciones)}
                        </div>
                    </div>

                    <!-- Editor Derecha -->
                    <div class="lg:col-span-5 order-1 lg:order-2">
                        <div class="bg-white rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 border border-stone-100 shadow-xl lg:sticky lg:top-8">
                             <div class="mb-5 sm:mb-6 border-b border-stone-50 pb-5">
                                <h4 class="text-stone-900 font-display italic text-base sm:text-lg">Añadir o Editar Producto</h4>
                                <p class="text-[7px] sm:text-[8px] text-stone-400 uppercase tracking-widest mt-0.5">Completa los campos para guardar</p>
                             </div>
                            ${this._renderProductForm(categorias, acciones)}
                        </div>
                    </div>
                </div>
            </section>

            <!-- BLOQUE 2: Gestión de Categorías -->
            <section class="space-y-10">
                <div class="flex items-center gap-4">
                    
                    <h3 class="text-xs sm:text-sm font-black uppercase tracking-[0.4em] sm:tracking-[0.5em]">Categorías y Orden</h3>
                </div>
                
                <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                    <!-- Listado Izquierda -->
                    <div class="lg:col-span-7 lg:max-h-[450px] lg:overflow-y-auto lg:pr-4 custom-scrollbar">
                        ${this._renderCategoriesGrid(categorias, acciones)}
                    </div>
                    <!-- Formulario Derecha -->
                    <div class="lg:col-span-5">
                        ${this._renderCategoryForm(acciones)}
                    </div>
                </div>
            </section>
          </div>
        </div>
      </div>
    `;

    this._safeRender(template);

    if (this.currentQuery) {
        this.applyFilter(this.currentQuery);
    }
  }

  _renderCategoriesGrid(categorias, acciones) {
    return html`
        <div class="space-y-2 sm:space-y-3">
            ${categorias.map((cat, index) => html`
                <div class="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-3xl bg-white border-2 border-stone-50 shadow-sm group hover:border-primary/20 hover:shadow-xl transition-all duration-700 ${cat.activo === false ? 'bg-stone-50/50 grayscale-[0.5]' : ''}">
                    <!-- Reordenar y Acciones -->
                    <div class="flex w-full sm:w-auto items-center justify-between sm:flex-col sm:gap-1.5 shrink-0 bg-stone-50 sm:bg-stone-50/50 p-2 rounded-xl">
                        <div class="flex sm:flex-col gap-1.5">
                            <button @click=${() => this._moveCategory(index, -1, acciones)} 
                                    class="p-1.5 text-stone-400 hover:text-primary disabled:opacity-0 transition-all hover:scale-125" 
                                    ?disabled=${index === 0}>
                                <svg class="h-5 w-5 rotate-[-90deg] sm:rotate-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3"><path d="M5 15l7-7 7 7"/></svg>
                            </button>
                            <button @click=${() => this._moveCategory(index, 1, acciones)} 
                                    class="p-1.5 text-stone-400 hover:text-primary disabled:opacity-0 transition-all hover:scale-125" 
                                    ?disabled=${index === categorias.length - 1}>
                                <svg class="h-5 w-5 rotate-[-90deg] sm:rotate-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3"><path d="M19 9l-7 7-7-7"/></svg>
                            </button>
                        </div>
                        <div class="flex gap-1.5 sm:hidden">
                             <button @click=${() => this._prepareCatEdit(cat)} class="p-2 text-primary bg-primary/5 rounded-lg transition-all active:scale-90">
                                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                             </button>
                             <button @click=${() => this._handleDeleteCategory(cat.id, acciones.onDeleteCategory)} class="p-2 text-stone-300 bg-stone-100 rounded-lg transition-all active:scale-90">
                                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                             </button>
                        </div>
                    </div>

                    <!-- Contenido Central: Icono + Info -->
                    <div class="flex items-center gap-3 sm:gap-4 flex-1 min-w-0 w-full">
                        <div class="relative h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-white flex items-center justify-center shrink-0 border-2 border-stone-100 overflow-hidden shadow-inner group-hover:border-primary/20 transition-all">
                            <img src="${cat.imageUrl || PLACEHOLDER_ICON}" class="h-[60%] w-[60%] object-contain" @error=${(e) => e.target.src = PLACEHOLDER_ICON} />
                        </div>

                        <div class="flex-1 min-w-0">
                            <p class="text-sm sm:text-base font-sans font-bold text-stone-900 uppercase tracking-wider truncate mb-0.5">${cat.nombre}</p>
                            <div class="flex items-center gap-2">
                                <span class="h-1.5 w-1.5 rounded-full ${cat.activo !== false ? 'bg-primary animate-pulse' : 'bg-stone-300'}"></span>
                                <span class="text-[9px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.2em] ${cat.activo !== false ? 'text-primary font-black' : 'text-stone-400 font-bold'}">
                                    ${cat.activo !== false ? 'Visible en web' : 'Oculta'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <!-- Acciones Desktop -->
                    <div class="hidden sm:flex gap-2">
                        <button @click=${() => this._prepareCatEdit(cat)} class="p-3 text-stone-400 hover:text-primary hover:bg-primary/5 rounded-2xl transition-all active:scale-95">
                            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                        </button>
                        <button @click=${() => this._handleDeleteCategory(cat.id, acciones.onDeleteCategory)} class="p-3 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all active:scale-95">
                            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        </button>
                    </div>
                </div>
            `)}
        </div>
    `;
  }


  _renderCategoryForm(acciones) {
      return html`
        <form id="add-category-form" @submit=${(e) => this._handleCatSubmit(e, acciones)} class="bg-white p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-stone-100 shadow-xl space-y-6 lg:sticky lg:top-8">
            <div class="space-y-1 border-b border-stone-50 pb-5">
                <h4 class="text-stone-900 font-display italic text-base sm:text-lg">Añadir o Editar Categoría</h4>
                <p class="text-[7px] sm:text-[8px] text-stone-400 uppercase tracking-widest mt-0.5">Gestión de grupos</p>
            </div>
            <input type="hidden" id="edit-cat-id" value="" />
            <div class="space-y-5">
                <div>
                    <label class="text-[9px] uppercase tracking-[0.3em] text-stone-400 font-bold mb-2 block">Nombre</label>
                    <input type="text" id="new-cat-name" placeholder="Ej: Especiales" class="w-full bg-stone-50 border-2 border-stone-100 rounded-xl py-3.5 px-5 text-stone-900 text-sm focus:border-primary transition-all outline-none" required />
                </div>
                <div>
                    <label class="text-[9px] uppercase tracking-[0.3em] text-stone-400 font-bold mb-2 block">URL Icono</label>
                    <input type="url" id="new-cat-url" placeholder="https://..." class="w-full bg-stone-50 border-2 border-stone-100 rounded-xl py-3.5 px-5 text-stone-900 text-sm focus:border-primary transition-all outline-none" />
                </div>
                <label class="flex items-center gap-4 cursor-pointer group p-4 bg-stone-50 rounded-xl border-2 border-stone-100 hover:border-primary/30 transition-all active:bg-stone-100">
                    <input type="checkbox" id="new-cat-activo" checked class="w-5 h-5 rounded border-stone-200 bg-white text-primary focus:ring-0 focus:ring-offset-0" />
                    <span class="text-[10px] sm:text-xs uppercase tracking-widest text-stone-500 group-hover:text-stone-900 transition-colors font-bold">Estado Activo</span>
                </label>
            </div>
            <div class="flex flex-col gap-3 pt-2">
                <button type="submit" id="submit-cat-btn" class="w-full bg-stone-950 text-white py-5 sm:py-4 rounded-2xl text-xs sm:text-sm uppercase tracking-[0.4em] font-black hover:bg-primary transition-all shadow-xl active:scale-[0.97] transform">
                    Guardar Cambios
                </button>
                <button type="button" id="cancel-cat-edit" @click=${() => this._cancelCatEdit()} class="hidden w-full text-stone-400 py-3 text-[10px] sm:text-xs uppercase tracking-widest font-bold hover:text-stone-900 transition-all italic">
                    Cancelar Edición
                </button>
            </div>
        </form>
      `;
  }

  _renderProductGrid(platos, acciones) {
    if (!platos || platos.length === 0) {
        return html`<div class="py-16 text-center border-2 border-dashed border-stone-100 rounded-[2rem] text-stone-300 uppercase tracking-[0.4em] text-[10px] font-bold italic bg-stone-50/30">Sin platos registrados</div>`;
    }
    return html`
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-5">
        ${platos.map(p => this._renderProductCard(p, acciones))}
      </div>
    `;
  }

  _renderProductCard(p, acciones) {
    const cats = Array.isArray(p.category) ? p.category : [p.category];
    const isSpecial = esProductoSoloMenuDiario(p);
    
    return html`
      <div class="p-4 rounded-3xl bg-white border border-stone-100 shadow-sm hover:shadow-xl transition-all duration-700 group flex flex-col gap-4 relative overflow-hidden"
           data-product-card 
           data-name="${p.name.toLowerCase()}" 
           data-price="${p.price}" 
           data-category="${cats.join(',').toLowerCase()}">
        
        ${isSpecial ? html`<div class="absolute top-3 right-3 z-20"><span class="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[6px] font-black uppercase tracking-widest border border-amber-200">Menú</span></div>` : ''}

        <div class="flex gap-3 sm:gap-4 items-center relative z-10">
            <div class="relative h-16 w-16 sm:h-18 sm:w-18 shrink-0 rounded-xl overflow-hidden bg-stone-50 border border-stone-100">
                <img src="${p.imageUrl || PLACEHOLDER_ICON}" class="h-full w-full object-cover group-hover:scale-110 transition-transform duration-[2s]" @error=${(e) => e.target.src = PLACEHOLDER_ICON} />
            </div>
            <div class="flex-1 min-w-0">
                <h4 class="text-xs sm:text-sm font-sans font-bold text-stone-900 group-hover:text-primary transition-colors leading-tight uppercase truncate mb-0.5">${p.name}</h4>
                <p class="text-sm sm:text-base font-display italic text-stone-950">${Number(p.price) > 0 ? `S/ ${Number(p.price).toFixed(2)}` : html`<span class="text-stone-300 font-sans text-[10px]">S/ 0.00</span>`}</p>
            </div>
        </div>

        ${p.description ? html`<p class="text-[9px] sm:text-[10px] text-stone-500 leading-relaxed italic border-l-2 border-stone-100 pl-2 line-clamp-2">${p.description}</p>` : ''}

        <div class="flex flex-wrap gap-1 min-h-[16px]">
            ${cats.map(c => html`<span class="px-2 py-1 rounded-md bg-stone-50 text-[7px] sm:text-[8px] font-bold text-stone-400 uppercase tracking-tighter border border-stone-100">${c}</span>`)}
        </div>

        <div class="flex gap-2 pt-4 border-t border-stone-50 mt-auto">
            <button @click=${() => acciones.onEdit(p.id)} class="flex-1 py-2.5 rounded-xl bg-stone-50 text-stone-600 text-[9px] sm:text-[10px] font-black uppercase tracking-widest hover:bg-stone-950 hover:text-white transition-all active:scale-95">Editar</button>
            <button @click=${() => this._handleDeleteProduct(p.id, acciones.onDelete)} class="px-4 py-2.5 rounded-xl text-stone-300 hover:text-red-500 hover:bg-red-50 transition-all active:scale-95">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </button>
        </div>
      </div>
    `;
  }

  _renderProductForm(categorias, acciones) {
    const specialCats = categorias.filter(c => CATEGORIAS_SOLO_MENU_DIARIO.includes(c.nombre));
    const regularCats = categorias.filter(c => !CATEGORIAS_SOLO_MENU_DIARIO.includes(c.nombre));
    return html`
        <form id="add-product-form" @submit=${(e) => this._handleProductSubmit(e, acciones)} class="space-y-6 sm:space-y-8">
            <input type="hidden" id="edit-id" value="" />
            <div class="space-y-4 sm:space-y-6">
                <div><label class="text-[9px] uppercase tracking-[0.3em] text-stone-400 font-bold mb-2 block">Nombre del Plato</label><input type="text" id="new-name" placeholder="Ej. Lomo Saltado" class="w-full border-b-2 border-stone-100 py-2 sm:py-3 text-lg sm:text-xl font-display italic text-stone-900 focus:border-primary outline-none transition-all" required /></div>
                <div class="relative group"><label class="text-[9px] uppercase tracking-[0.3em] text-stone-400 font-bold mb-2 block">Precio de Venta</label><input type="number" id="new-price" placeholder="0.00" step="0.10" class="w-full border-b-2 border-stone-100 py-2 sm:py-3 text-xl sm:text-2xl font-black text-primary outline-none focus:border-primary transition-all disabled:opacity-20" /><p id="price-warning" class="hidden text-[7px] uppercase tracking-widest text-amber-600 font-bold mt-1.5">Bloqueado para Menú</p></div>
                <div><label class="text-[9px] uppercase tracking-[0.3em] text-stone-400 font-bold mb-2 block">Descripción</label><textarea id="new-description" rows="2" placeholder="Ingredientes, porción..." class="w-full bg-stone-50 border-none rounded-2xl p-4 text-sm text-stone-600 focus:ring-2 focus:ring-primary/20 outline-none transition-all"></textarea></div>
                <div><label class="text-[9px] uppercase tracking-[0.3em] text-stone-400 font-bold mb-2 block">Foto URL</label><input type="url" id="new-image-url" placeholder="https://..." class="w-full bg-stone-50 border-none rounded-xl py-3 px-5 text-xs text-stone-900 focus:ring-2 focus:ring-primary/20 outline-none" /></div>
            </div>
            <div class="space-y-6 sm:space-y-8">
                <div class="p-5 sm:p-6 bg-amber-50/40 rounded-[1.5rem] sm:rounded-[2rem] border-2 border-amber-100 space-y-4"><span class="text-[10px] uppercase tracking-[0.4em] text-amber-700 font-black">Categorías Especiales</span><div class="grid grid-cols-1 gap-2">${this._renderCategoryCheckboxes(specialCats)}</div></div>
                <div class="p-5 sm:p-6 bg-stone-50 rounded-[1.5rem] sm:rounded-[2rem] border-2 border-stone-100 space-y-4"><span class="text-[10px] uppercase tracking-[0.4em] text-stone-400 font-black block">Carta General</span><div class="grid grid-cols-1 gap-2">${this._renderCategoryCheckboxes(regularCats)}</div></div>
            </div>
            <div class="flex flex-col gap-4 border-t border-stone-100 pt-8 sm:pt-10">
                <button type="submit" id="submit-product-btn" class="w-full bg-stone-950 text-white py-6 sm:py-5 rounded-2xl text-xs sm:text-sm uppercase tracking-[0.4em] font-black shadow-xl hover:bg-primary transition-all duration-500 active:scale-[0.97] transform">
                    Guardar Producto
                </button>
                <button type="button" id="cancel-product-edit" @click=${() => this._cancelProductEdit()} class="hidden w-full text-stone-400 py-3 text-[10px] sm:text-xs uppercase tracking-widest font-bold hover:text-stone-900 transition-all italic">
                    Descartar Cambios
                </button>
            </div>
        </form>
    `;
  }

  _renderCategoryCheckboxes(categorias) {
    return categorias.map(cat => html`
      <label class="flex cursor-pointer items-center justify-between px-5 py-3 rounded-xl border-2 border-stone-50 bg-white hover:border-primary/20 transition-all active:scale-95 has-[:checked]:border-primary has-[:checked]:bg-primary/[0.02] has-[:disabled]:opacity-40 has-[:disabled]:cursor-not-allowed has-[:disabled]:hover:border-stone-50">
        <span class="text-[11px] sm:text-xs font-bold text-stone-600 uppercase tracking-tight truncate">${cat.nombre}</span>
        <input type="checkbox" name="product-category" value="${cat.nombre}" class="w-5 h-5 rounded border-stone-200 text-primary focus:ring-0 disabled:pointer-events-none" @change=${(e) => this._handleCategoryChange(e)} />
      </label>
    `);
  }

  _handleCategoryChange(e) {
    const checkboxes = document.querySelectorAll('input[name="product-category"]');
    const isChecked = e.target.checked;
    
    if (isChecked) {
        checkboxes.forEach(cb => {
            if (cb !== e.target) {
                cb.disabled = true;
            }
        });
    } else {
        checkboxes.forEach(cb => {
            cb.disabled = false;
        });
    }
    this._togglePriceInput();
  }

  // --- Lógica de Filtro ---

  applyFilter(query) {
      this.currentQuery = query;
      const q = query.toLowerCase().trim();
      const cards = this.rootElement.querySelectorAll("[data-product-card]");
      cards.forEach(card => {
          const name = card.getAttribute("data-name") || "";
          const price = card.getAttribute("data-price") || "";
          const category = card.getAttribute("data-category") || "";
          const matches = name.includes(q) || price.includes(q) || category.includes(q);
          card.classList.toggle("hidden", !matches);
      });
  }

  _moveCategory(index, delta, acciones) {
      const list = [...this.categorias];
      const targetIndex = index + delta;
      if (targetIndex >= 0 && targetIndex < list.length) {
          [list[index], list[targetIndex]] = [list[targetIndex], list[index]];
          acciones.onReorderCategories(list);
      }
  }

  _prepareCatEdit(cat) {
      const form = document.getElementById("add-category-form");
      document.getElementById("edit-cat-id").value = cat.id;
      document.getElementById("new-cat-name").value = cat.nombre;
      document.getElementById("new-cat-url").value = cat.imageUrl || "";
      document.getElementById("new-cat-activo").checked = cat.activo !== false;
      form.dataset.antiguoNombre = cat.nombre;
      document.getElementById("submit-cat-btn").textContent = "Actualizar";
      document.getElementById("cancel-cat-edit").classList.remove("hidden");
      form.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
      form.classList.add("ring-8", "ring-primary/10", "duration-500");
      setTimeout(() => form.classList.remove("ring-8", "ring-primary/10"), 2000);
  }

  _cancelCatEdit() {
      const form = document.getElementById("add-category-form");
      if (form) {
          form.reset();
          form.classList.remove("ring-8", "ring-primary/10");
      }
      document.getElementById("edit-cat-id").value = "";
      document.getElementById("submit-cat-btn").textContent = "Guardar";
      document.getElementById("cancel-cat-edit").classList.add("hidden");
  }

  async _handleDeleteCategory(id, onDelete) {
      if (await dialog.confirm("Eliminar Categoría", "¿Deseas eliminar esta categoría?")) onDelete(id);
  }

  async _handleDeleteProduct(id, onDelete) {
      if (await dialog.confirm("Eliminar Producto", "¿Estás seguro?")) onDelete(id);
  }

  _handleCatSubmit(e, acciones) {
      e.preventDefault();
      const id = document.getElementById("edit-cat-id").value;
      const nombre = document.getElementById("new-cat-name").value.trim();
      const url = document.getElementById("new-cat-url").value.trim();
      const activo = document.getElementById("new-cat-activo").checked;
      const antiguoNombre = e.target.dataset.antiguoNombre;
      if (id) acciones.onUpdateCategory(id, nombre, antiguoNombre, url, activo);
      else acciones.onAddCategory(nombre, url, activo);
      this._cancelCatEdit();
  }

  _handleProductSubmit(e, acciones) {
      e.preventDefault();
      const selectedCats = Array.from(document.querySelectorAll('input[name="product-category"]:checked')).map(cb => cb.value);
      if (selectedCats.length === 0) return toast.info("Selecciona una categoría.");
      const data = {
        name: document.getElementById("new-name").value.trim(),
        price: parseFloat(document.getElementById("new-price").value) || 0,
        category: selectedCats,
        description: document.getElementById("new-description").value.trim(),
        imageUrl: document.getElementById("new-image-url").value.trim(),
      };
      acciones.onAdd(data);
      this._cancelProductEdit();
  }

  _cancelProductEdit() {
      const form = document.getElementById("add-product-form");
      const container = form?.closest(".bg-white");
      if (form) {
          form.reset();
          container?.classList.remove("ring-8", "ring-primary/10");
      }
      document.getElementById("edit-id").value = "";
      document.getElementById("submit-product-btn").textContent = "Guardar Producto";
      document.getElementById("cancel-product-edit").classList.add("hidden");
      
      // Re-habilitar todas las categorías al cancelar
      const checkboxes = document.querySelectorAll('input[name="product-category"]');
      checkboxes.forEach(cb => cb.disabled = false);

      this._togglePriceInput();
  }

  _togglePriceInput() {
    const priceInput = document.getElementById("new-price");
    const warning = document.getElementById("price-warning");
    const selected = Array.from(document.querySelectorAll('input[name="product-category"]:checked')).map(cb => cb.value);
    const isSpecial = selected.some(c => CATEGORIAS_SOLO_MENU_DIARIO.includes(c));
    if (isSpecial) { priceInput.value = "0.00"; priceInput.disabled = true; warning?.classList.remove("hidden"); }
    else { priceInput.disabled = false; warning?.classList.add("hidden"); }
  }

  prepareEdit(plato) {
    const form = document.getElementById("add-product-form");
    const container = form.closest(".bg-white");
    document.getElementById("new-name").value = plato.name;
    document.getElementById("new-price").value = plato.price;
    document.getElementById("edit-id").value = plato.id;
    document.getElementById("new-description").value = plato.description || "";
    document.getElementById("new-image-url").value = plato.imageUrl || "";
    const checkboxes = document.querySelectorAll('input[name="product-category"]');
    
    let anyChecked = false;
    checkboxes.forEach(cb => {
      const isChecked = Array.isArray(plato.category) ? plato.category.includes(cb.value) : plato.category === cb.value;
      cb.checked = isChecked;
      if (isChecked) anyChecked = true;
    });

    // Aplicar bloqueo de categorías si hay una seleccionada
    if (anyChecked) {
        checkboxes.forEach(cb => {
            if (!cb.checked) cb.disabled = true;
        });
    } else {
        checkboxes.forEach(cb => cb.disabled = false);
    }

    this._togglePriceInput();
    document.getElementById("submit-product-btn").textContent = "Actualizar Producto";
    document.getElementById("cancel-product-edit").classList.remove("hidden");
    container.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
    container.classList.add("ring-8", "ring-primary/10", "duration-500");
    setTimeout(() => container.classList.remove("ring-8", "ring-primary/10"), 2000);
  }

  _safeRender(template) {
    try { render(template, this.rootElement); }
    catch (e) { this.rootElement.innerHTML = ""; render(template, this.rootElement); }
  }

  renderTableBody(platos, acciones) { 
      this.render(platos, this.categorias, acciones);
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
                <span class="text-[8px] sm:text-[9px] uppercase tracking-[0.3em] sm:tracking-[0.4em] text-stone-400 font-bold">Gestión de Productos</span>
                <h2 class="text-3xl sm:text-6xl font-display italic text-stone-950 leading-none">
                    Gestión de <span class="text-primary font-black not-italic underline decoration-stone-200 underline-offset-8">Carta</span>
                </h2>
            </div>
        </div>
      </header>
    `;
  }
}
