import { CATEGORIAS_SOLO_MENU_DIARIO, seleccionSoloMenuDiario } from "../constants/menuCategories.js";
import { adminShell, button, form, typography } from "../ui/layout.js";
import { escapeHtml } from "../utils/html.js";
import { toast, dialog } from "../utils/notifications.js";

const PLACEHOLDER_ICON = "https://cdn-icons-png.flaticon.com/512/662/662244.png";

export class ManageCartaView {
  constructor(rootElement) {
    this.rootElement = rootElement;
  }

  render(platos, categorias, acciones) {
    this.rootElement.innerHTML = `
        <div class="min-h-screen bg-background px-2 py-4 sm:px-6 sm:py-8 pb-24">
            <div class="mx-auto w-full max-w-6xl rounded-3xl border border-surface-variant bg-surface p-4 sm:p-10 shadow-xl">
                ${this._renderHeader()}
                ${this._renderCategoryEditor(categorias)}
                ${this._renderProductEditor(categorias)}
                ${this._renderSearchSection(platos)}
            </div>
        </div>
    `;
    this.setupEventListeners(acciones, categorias);
  }

  _renderHeader() {
    return `
        <div class="z-40 -mx-4 -mt-4 mb-8 border-b border-surface-variant bg-surface/95 p-4 backdrop-blur-md sm:sticky sm:top-0 sm:-mx-10 sm:-mt-10 sm:px-10 sm:pt-10 sm:pb-8 flex flex-col sm:flex-row sm:items-center justify-start gap-4 sm:gap-6">
            <button type="button" id="back-from-carta" class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-stone-600 border border-stone-200 shadow-sm transition-all hover:bg-stone-200 active:scale-95">
                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M15 19l-7-7 7-7"></path></svg>
            </button>
            <div>
                <h2 class="text-xl sm:text-3xl font-black tracking-tight text-primary leading-tight">Gestión de Carta</h2>
                <p class="hidden sm:block text-sm text-on-surface-variant/60 font-medium">Administra productos y el orden de categorías.</p>
            </div>
        </div>
    `;
  }

  _renderCategoryEditor(categorias) {
    return `
        <!-- GESTIÓN DE CATEGORÍAS -->
        <div class="bg-blue-50/30 rounded-3xl border border-blue-100 p-5 sm:p-8 mb-10 scroll-mt-24" id="category-editor-section">
            <div class="flex items-center gap-3 mb-6">
                <div class="h-8 w-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/20 shrink-0">
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16m-7 6h7" stroke-width="2.5"/></svg>
                </div>
                <h3 class="text-sm font-black uppercase tracking-widest text-blue-900">Categorías y Orden</h3>
            </div>
            
            <div class="mb-8 grid grid-cols-1 md:grid-cols-2 gap-3" id="categories-grid">
                ${this._renderCategoriesGrid(categorias)}
            </div>

            <form id="add-category-form" class="space-y-5 bg-white p-5 rounded-2xl border border-blue-100 shadow-sm">
                <input type="hidden" id="edit-cat-id" value="" />
                <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                        <label class="${form.label} text-blue-900/40">Nombre Categoría</label>
                        <input type="text" id="new-cat-name" placeholder="Ej: Bebidas" class="${form.input} h-12 border-blue-100 focus:border-blue-500" required />
                    </div>
                    <div>
                        <label class="${form.label} text-blue-900/40">URL Foto (Opcional)</label>
                        <input type="url" id="new-cat-url" placeholder="https://..." class="${form.input} h-12 border-blue-100 focus:border-blue-500" />
                    </div>
                    <div class="flex items-center gap-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                        <input type="checkbox" id="new-cat-activo" checked class="w-5 h-5 rounded border-blue-200 text-blue-600 focus:ring-blue-500" />
                        <label for="new-cat-activo" class="text-xs font-black uppercase tracking-tight text-blue-900/60 cursor-pointer">Visible en Web</label>
                    </div>
                </div>
                <div class="flex flex-col sm:flex-row justify-end gap-3 pt-2">
                    <button type="button" id="cancel-cat-edit" class="hidden ${button.base} ${button.outlineDark} w-full sm:w-auto py-3 px-6 uppercase text-xs font-black">Cancelar</button>
                    <button type="submit" id="submit-cat-btn" class="${button.base} bg-blue-600 text-white w-full sm:w-auto py-3 px-10 shadow-lg shadow-blue-600/20 uppercase text-xs font-black tracking-widest">Guardar Categoría</button>
                </div>
            </form>
        </div>
    `;
  }

  _renderCategoriesGrid(categorias) {
    return categorias.map((cat, index) => `
        <div class="flex items-center gap-4 p-3 rounded-2xl border ${cat.activo !== false ? 'border-blue-100 bg-white' : 'border-surface-variant bg-stone-50 grayscale'} shadow-sm group hover:border-blue-300 transition-all">
            <div class="flex flex-col gap-1 shrink-0">
                <button class="move-up-btn p-1 text-blue-400 hover:text-blue-600 disabled:opacity-10" data-index="${index}" ${index === 0 ? 'disabled' : ''}>
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3"><path d="M5 15l7-7 7 7"/></svg>
                </button>
                <button class="move-down-btn p-1 text-blue-400 hover:text-blue-600 disabled:opacity-10" data-index="${index}" ${index === categorias.length - 1 ? 'disabled' : ''}>
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3"><path d="M19 9l-7 7-7-7"/></svg>
                </button>
            </div>
            <div class="h-12 w-16 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 border border-blue-50 overflow-hidden shadow-inner">
                <img src="${cat.imageUrl || PLACEHOLDER_ICON}" class="h-full w-full object-cover" onerror="this.src='${PLACEHOLDER_ICON}'" />
            </div>
            <div class="flex-1 min-w-0">
                <p class="text-sm font-black text-blue-900 truncate uppercase tracking-tight">${escapeHtml(cat.nombre)}</p>
                <div class="flex items-center gap-2">
                    <div class="h-1.5 w-1.5 rounded-full ${cat.activo !== false ? 'bg-green-500' : 'bg-stone-300'}"></div>
                    <p class="text-[8px] font-black uppercase tracking-widest text-on-surface-variant/40">
                        ${cat.activo !== false ? 'Visible' : 'Oculto'}
                    </p>
                </div>
            </div>
            <div class="flex gap-1 pr-1">
                <button type="button" class="edit-cat-btn p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all" 
                    data-id="${cat.id}" data-nombre="${cat.nombre}" data-url="${cat.imageUrl || ''}" data-activo="${cat.activo !== false}">
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                </button>
                <button type="button" class="delete-cat-btn p-2 text-red-400 hover:bg-red-50 rounded-xl transition-all" data-id="${cat.id}">
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                </button>
            </div>
        </div>
    `).join('');
  }

  _renderProductEditor(categorias) {
    const specialCats = categorias.filter(c => CATEGORIAS_SOLO_MENU_DIARIO.includes(c.nombre));
    const regularCats = categorias.filter(c => !CATEGORIAS_SOLO_MENU_DIARIO.includes(c.nombre));

    return `
        <!-- EDITOR DE PRODUCTO -->
        <div class="bg-stone-50 rounded-3xl border border-stone-200 p-5 sm:p-8 mb-10 scroll-mt-24" id="form-editor-section">
            <div class="flex items-center gap-3 mb-6">
                <div class="h-8 w-8 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" stroke-width="2.5"/></svg>
                </div>
                <h3 class="text-sm font-black uppercase tracking-widest text-primary">Añadir / Editar Producto</h3>
            </div>
            
            <form id="add-product-form" class="space-y-6">
                <input type="hidden" id="edit-id" value="" />
                <div class="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div>
                        <label class="${form.label}">Nombre del producto</label>
                        <input type="text" id="new-name" placeholder="Ej. Chaufa de Pollo" class="${form.input} h-12" required />
                    </div>
                    <div>
                        <label class="${form.label}">Precio S/</label>
                        <input type="number" id="new-price" placeholder="0.00" step="0.10" class="${form.input} h-12 disabled:bg-stone-100 disabled:opacity-50" />
                    </div>
                    <div class="md:col-span-2">
                        <label class="${form.label}">Descripción / Ingredientes</label>
                        <textarea id="new-description" rows="2" placeholder="Breve detalle del plato..." class="${form.input} py-3"></textarea>
                    </div>
                    <div class="md:col-span-2">
                        <label class="${form.label}">URL de la foto</label>
                        <input type="url" id="new-image-url" placeholder="https://..." class="${form.input} h-12" />
                    </div>
                </div>
                
                <div class="space-y-4">
                    <div class="p-5 bg-amber-50/50 rounded-2xl border border-amber-100">
                        <p class="mb-4 text-[9px] font-black uppercase text-amber-700 tracking-[0.2em]">Categorías Especiales (Sin Precio)</p>
                        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            ${this._renderCategoryCheckboxes(specialCats, "special")}
                        </div>
                    </div>

                    <div class="p-5 bg-white rounded-2xl border border-stone-200">
                        <p class="mb-4 text-[9px] font-black uppercase text-on-surface-variant/40 tracking-[0.2em]">Otras Categorías (Carta General)</p>
                        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            ${this._renderCategoryCheckboxes(regularCats)}
                        </div>
                    </div>
                </div>

                <div class="flex flex-col gap-3">
                    <button type="submit" id="submit-product-btn" class="${button.base} ${button.primary} w-full py-4.5 text-base font-black uppercase tracking-widest shadow-xl shadow-primary/20">Guardar Producto</button>
                    <button type="button" id="cancel-product-edit" class="hidden ${button.base} ${button.outlineDark} w-full py-3.5 uppercase text-xs font-black">Cancelar Edición</button>
                </div>
            </form>
        </div>
    `;
  }

  _renderCategoryCheckboxes(categorias, type = "regular") {
    if (!categorias || !categorias.length) return `<p class="text-[10px] italic opacity-40">No hay categorías.</p>`;
    return categorias.map(cat => `
      <label class="flex cursor-pointer items-center gap-3 rounded-xl border border-stone-100 bg-stone-50/50 px-4 py-3 transition-all hover:border-primary/30 has-[:checked]:border-primary has-[:checked]:bg-primary/5 active:scale-95">
        <input type="checkbox" name="product-category" value="${escapeHtml(cat.nombre)}" data-type="${type}" class="w-5 h-5 rounded border-stone-300 text-primary focus:ring-primary shrink-0" />
        <span class="text-[11px] font-black text-on-surface-variant/70 uppercase tracking-tight truncate">${escapeHtml(cat.nombre)}</span>
      </label>
    `).join("");
  }

  _renderSearchSection(platos) {
    return `
        <!-- BUSCADOR -->
        <div class="mb-8 space-y-4">
            <h3 class="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/40 ml-1">Listado General (${platos.length})</h3>
            <div class="relative">
                <input type="search" id="search-product" placeholder="Buscar por nombre o categoría..." class="${form.input} py-4 pl-12 rounded-2xl shadow-sm focus:ring-primary/20" autocomplete="off" />
                <svg class="absolute left-4 top-4 h-5 w-5 text-on-surface-variant opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            </div>
        </div>
        <div id="table-container">${this.renderProductList(platos)}</div>
    `;
  }

  renderProductList(platos) {
    if (platos.length === 0) return `<div class="py-20 text-center border-2 border-dashed border-stone-100 rounded-[2.5rem] bg-stone-50/30 text-stone-400 font-bold uppercase tracking-widest text-[10px]">No se encontraron productos</div>`;
    return `
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        ${platos.map(p => this._renderProductCard(p)).join('')}
      </div>
    `;
  }

  _renderProductCard(p) {
    const cats = Array.isArray(p.category) ? p.category : [p.category];
    return `
      <div class="p-4 rounded-3xl border border-stone-100 bg-white flex flex-col gap-4 shadow-sm hover:shadow-xl transition-all duration-500 group">
        <div class="flex gap-4 items-center">
            <div class="relative h-16 w-16 shrink-0 rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 shadow-inner">
                <img src="${p.imageUrl || PLACEHOLDER_ICON}" class="h-full w-full object-cover" onerror="this.src='${PLACEHOLDER_ICON}'" />
            </div>
            <div class="flex-1 min-w-0">
                <p class="text-[13px] font-black text-on-background uppercase tracking-tight truncate leading-tight mb-1">${escapeHtml(p.name)}</p>
                <p class="text-sm font-black text-primary italic font-display">S/ ${Number(p.price).toFixed(2)}</p>
            </div>
            <div class="flex flex-col gap-1.5 shrink-0">
                <button class="edit-btn flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-black uppercase tracking-tight hover:bg-blue-600 hover:text-white transition-all border border-blue-100 shadow-sm" data-id="${p.id}">
                    <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                    Editar
                </button>
                <button class="delete-btn flex items-center gap-1 px-2.5 py-1.5 bg-red-50 text-red-600 rounded-lg text-[9px] font-black uppercase tracking-tight hover:bg-red-600 hover:text-white transition-all border border-red-100 shadow-sm" data-id="${p.id}">
                    <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    Borrar
                </button>
            </div>
        </div>
        <div class="flex flex-wrap gap-1.5 border-t border-stone-50 pt-3">
            ${cats.map(c => `<span class="px-2.5 py-1 rounded-lg bg-primary/5 text-[8px] font-black text-primary uppercase tracking-tighter border border-primary/10">${escapeHtml(c)}</span>`).join('')}
        </div>
      </div>
    `;
  }

  setupEventListeners(acciones, categorias) {
    const { onAdd, onEdit, onDelete, onBack, onSearch, onAddCategory, onDeleteCategory, onUpdateCategory, onReorderCategories } = acciones;
    
    const backBtn = this.rootElement.querySelector("#back-from-carta");
    if (backBtn) backBtn.onclick = onBack;

    this.rootElement.querySelectorAll(".move-up-btn").forEach(btn => {
        btn.onclick = () => {
            const index = parseInt(btn.dataset.index);
            const list = [...categorias];
            [list[index - 1], list[index]] = [list[index], list[index - 1]];
            onReorderCategories(list);
        };
    });
    this.rootElement.querySelectorAll(".move-down-btn").forEach(btn => {
        btn.onclick = () => {
            const index = parseInt(btn.dataset.index);
            const list = [...categorias];
            [list[index + 1], list[index]] = [list[index], list[index + 1]];
            onReorderCategories(list);
        };
    });

    const catForm = document.getElementById("add-category-form");
    catForm.onsubmit = (e) => {
      e.preventDefault();
      const id = document.getElementById("edit-cat-id").value;
      const nombre = document.getElementById("new-cat-name").value.trim();
      const url = document.getElementById("new-cat-url").value.trim();
      const activo = document.getElementById("new-cat-activo").checked;
      const antiguoNombre = catForm.dataset.antiguoNombre;
      if (id) onUpdateCategory(id, nombre, antiguoNombre, url, activo);
      else onAddCategory(nombre, url, activo);
    };

    this.rootElement.querySelectorAll(".edit-cat-btn").forEach(btn => {
        btn.onclick = () => {
            const { id, nombre, url, activo } = btn.dataset;
            document.getElementById("edit-cat-id").value = id;
            document.getElementById("new-cat-name").value = nombre;
            document.getElementById("new-cat-url").value = url;
            document.getElementById("new-cat-activo").checked = activo === "true";
            catForm.dataset.antiguoNombre = nombre;
            document.getElementById("submit-cat-btn").textContent = "Actualizar Categoría";
            document.getElementById("cancel-cat-edit").classList.remove("hidden");
            document.getElementById("add-category-form").scrollIntoView({ behavior: "smooth", block: "center" });
        };
    });

    document.getElementById("cancel-cat-edit").onclick = () => {
        document.getElementById("edit-cat-id").value = "";
        catForm.reset();
        document.getElementById("submit-cat-btn").textContent = "Guardar Categoría";
        document.getElementById("cancel-cat-edit").classList.add("hidden");
    };

    // Botones de ELIMINAR CATEGORÍA
    this.rootElement.querySelectorAll(".delete-cat-btn").forEach(btn => {
        btn.onclick = async (e) => {
            e.preventDefault();
            const id = btn.dataset.id;
            if (await dialog.confirm("Eliminar Categoría", "¿Está seguro? Se borrará la categoría pero no los platos asociados.")) {
                onDeleteCategory(id);
            }
        };
    });

    const prodForm = document.getElementById("add-product-form");
    prodForm.onsubmit = (e) => {
      e.preventDefault();
      const selectedCats = Array.from(document.querySelectorAll('input[name="product-category"]:checked')).map((cb) => cb.value);
      if (selectedCats.length === 0) return toast.info("Selecciona al menos una categoría.");
      const data = {
        name: document.getElementById("new-name").value.trim(),
        price: parseFloat(document.getElementById("new-price").value) || 0,
        category: selectedCats,
        description: document.getElementById("new-description").value.trim(),
        imageUrl: document.getElementById("new-image-url").value.trim(),
      };
      onAdd(data);
    };

    document.getElementById("cancel-product-edit").onclick = () => {
        document.getElementById("edit-id").value = "";
        prodForm.reset();
        document.getElementById("submit-product-btn").textContent = "Guardar Producto";
        document.getElementById("cancel-product-edit").classList.add("hidden");
    };

    document.getElementById("search-product").oninput = (e) => onSearch(e.target.value);
    
    // Lógica de desactivación de precio para categorías especiales
    this.rootElement.querySelectorAll('input[name="product-category"]').forEach(cb => {
        cb.addEventListener('change', () => this._togglePriceInput());
    });

    this.attachTableEvents(onEdit, onDelete);
  }

  _togglePriceInput() {
    const priceInput = document.getElementById("new-price");
    const specialChecked = Array.from(document.querySelectorAll('input[name="product-category"][data-type="special"]:checked')).length > 0;
    
    if (specialChecked) {
        priceInput.value = "0.00";
        priceInput.disabled = true;
        priceInput.classList.add("bg-stone-100", "opacity-50");
    } else {
        priceInput.disabled = false;
        priceInput.classList.remove("bg-stone-100", "opacity-50");
    }
  }

  attachTableEvents(onEdit, onDelete) {
    // Usamos delegación o buscamos dentro de rootElement cada vez que se refresca la lista
    const container = document.getElementById("table-container");
    if (!container) return;

    container.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.onclick = async (e) => { 
        e.preventDefault();
        e.stopPropagation();
        const id = btn.dataset.id;
        if(await dialog.confirm("Eliminar Producto", "¿Está seguro de eliminar este producto permanentemente?")) {
            onDelete(id);
        }
      };
    });

    container.querySelectorAll(".edit-btn").forEach((btn) => {
      btn.onclick = (e) => { 
        e.preventDefault();
        e.stopPropagation();
        onEdit(btn.dataset.id); 
      };
    });
  }

  prepareEdit(plato) {
    document.getElementById("new-name").value = plato.name;
    document.getElementById("new-price").value = plato.price;
    document.getElementById("edit-id").value = plato.id;
    document.getElementById("new-description").value = plato.description;
    document.getElementById("new-image-url").value = plato.imageUrl;
    const checkboxes = document.querySelectorAll('input[name="product-category"]');
    checkboxes.forEach((cb) => {
      cb.checked = Array.isArray(plato.category) ? plato.category.includes(cb.value) : plato.category === cb.value;
    });

    this._togglePriceInput(); // Activar/desactivar precio según categorías cargadas

    document.getElementById("submit-product-btn").textContent = "Actualizar Producto";
    document.getElementById("cancel-product-edit").classList.remove("hidden");
    document.getElementById("add-product-form").scrollIntoView({ behavior: "smooth", block: "center" });
  }

  renderTableBody(platos) { return this.renderProductList(platos); }
}
