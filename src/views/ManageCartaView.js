import { CATEGORIAS_SOLO_MENU_DIARIO, seleccionSoloMenuDiario } from "../constants/menuCategories.js";
import { adminShell, button, form, typography } from "../ui/layout.js";
import { escapeHtml } from "../utils/html.js";

const PLACEHOLDER_ICON = "https://cdn-icons-png.flaticon.com/512/662/662244.png";

export class ManageCartaView {
  constructor(rootElement) {
    this.rootElement = rootElement;
  }

  renderCategoryCheckboxes(categorias) {
    if (!categorias || !categorias.length) {
      return `<p class="text-sm italic text-stone-400">No hay categorías disponibles.</p>`;
    }
    return categorias
      .map(
        (cat) => `
      <label class="flex cursor-pointer items-center gap-3 rounded-xl border border-stone-100 bg-stone-50/50 px-4 py-2.5 transition-all hover:border-primary hover:bg-white hover:shadow-sm">
        <input type="checkbox" name="product-category" value="${escapeHtml(cat.nombre)}" class="${form.checkbox}" />
        <span class="text-sm font-bold text-stone-600">${escapeHtml(cat.nombre)}</span>
      </label>
    `,
      )
      .join("");
  }

  render(platos, categorias, acciones) {
    this.rootElement.innerHTML = `
        <div class="${adminShell.page}">
            <div class="${adminShell.card}">
                <div class="${adminShell.header}">
                    <div>
                        <h2 class="${adminShell.title}">Gestión de carta general</h2>
                        <p class="${adminShell.subtitle}">Administra productos e intercambia el orden de tus categorías.</p>
                    </div>
                    <button type="button" id="back-from-manage" class="${adminShell.backBtn}">Cerrar gestión</button>
                </div>

                <!-- GESTIÓN DE CATEGORÍAS -->
                <div class="${adminShell.accentBox} mb-12 scroll-mt-24" id="category-editor-section">
                    <h3 class="${adminShell.sectionTitle} text-blue-900">Orden de Categorías</h3>
                    <div class="mb-8 grid grid-cols-1 gap-2" id="categories-grid">
                        ${categorias.map((cat, index) => `
                            <div class="flex items-center gap-4 p-3 rounded-2xl border ${cat.activo !== false ? 'border-blue-100 bg-white' : 'border-stone-200 bg-stone-50 grayscale'} shadow-sm group">
                                <div class="flex flex-col gap-1">
                                    <button class="move-up-btn p-1 text-stone-400 hover:text-primary disabled:opacity-20" data-index="${index}" ${index === 0 ? 'disabled' : ''}>
                                        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="3" d="M5 15l7-7 7 7"></path></svg>
                                    </button>
                                    <button class="move-down-btn p-1 text-stone-400 hover:text-primary disabled:opacity-20" data-index="${index}" ${index === categorias.length - 1 ? 'disabled' : ''}>
                                        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="3" d="M19 9l-7 7-7-7"></path></svg>
                                    </button>
                                </div>
                                <div class="h-10 w-16 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100 overflow-hidden">
                                    <img src="${cat.imageUrl || PLACEHOLDER_ICON}" class="h-full w-full object-cover" onerror="this.src='${PLACEHOLDER_ICON}'" />
                                </div>
                                <div class="flex-1 min-w-0">
                                    <p class="text-sm font-bold text-blue-900 truncate">${escapeHtml(cat.nombre)}</p>
                                    <p class="text-[9px] ${cat.activo !== false ? 'text-green-600' : 'text-stone-400'} font-bold uppercase tracking-tighter">
                                        ${cat.activo !== false ? 'Visible en Web' : 'Solo Gestión'}
                                    </p>
                                </div>
                                <div class="flex gap-1">
                                    <button type="button" class="edit-cat-btn p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg" 
                                        data-id="${cat.id}" data-nombre="${cat.nombre}" data-url="${cat.imageUrl || ''}" data-activo="${cat.activo !== false}">
                                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                                    </button>
                                    <button type="button" class="delete-cat-btn p-1.5 text-red-400 hover:text-red-600 rounded-lg" data-id="${cat.id}">
                                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>

                    <form id="add-category-form" class="space-y-4">
                        <input type="hidden" id="edit-cat-id" value="" />
                        <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <input type="text" id="new-cat-name" placeholder="Nombre (ej. Bebidas)" class="${form.input}" required />
                            <input type="url" id="new-cat-url" placeholder="URL Foto de Categoría" class="${form.input}" />
                            <label class="flex h-[42px] cursor-pointer items-center gap-3 rounded-xl border border-stone-200 bg-white px-4">
                                <input type="checkbox" id="new-cat-activo" checked class="${form.checkbox}" />
                                <span class="text-sm font-bold text-stone-700">Mostrar en Web</span>
                            </label>
                        </div>
                        <div class="flex justify-end gap-3">
                            <button type="button" id="cancel-cat-edit" class="hidden ${button.base} ${button.outlineDark} py-3">Cancelar</button>
                            <button type="submit" id="submit-cat-btn" class="${button.base} ${button.primary} py-3 px-8">Guardar Categoría</button>
                        </div>
                    </form>
                </div>

                <!-- EDITOR DE PRODUCTO -->
                <div class="${adminShell.mutedBox} mb-12 scroll-mt-24" id="form-editor-section">
                    <h3 class="${adminShell.sectionTitle}">Añadir / Editar Producto</h3>
                    <form id="add-product-form" class="space-y-6">
                        <input type="hidden" id="edit-id" value="" />
                        <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div>
                                <label class="${form.label}">Nombre del producto</label>
                                <input type="text" id="new-name" placeholder="Ej. Chaufa de Pollo / Coca Cola" class="${form.input}" required />
                            </div>
                            <div>
                                <label class="${form.label}">Precio S/</label>
                                <input type="number" id="new-price" placeholder="0.00" step="0.01" class="${form.input}" />
                            </div>
                        </div>
                        <div>
                            <label class="${form.label}">Descripción del producto</label>
                            <textarea id="new-description" rows="2" placeholder="Detalle e ingredientes..." class="${form.input}"></textarea>
                        </div>
                        <div>
                            <label class="${form.label}">URL de la foto del producto</label>
                            <input type="url" id="new-image-url" placeholder="https://..." class="${form.input}" />
                        </div>
                        <div class="p-4 bg-white rounded-2xl border border-stone-200">
                            <p class="mb-3 text-[10px] font-bold uppercase text-primary tracking-widest">Asignar a Categorías</p>
                            <div class="flex flex-wrap gap-2">
                                ${this.renderCategoryCheckboxes(categorias)}
                            </div>
                        </div>
                        <button type="submit" id="submit-product-btn" class="${button.base} ${button.primary} w-full py-4 text-lg">Guardar Producto</button>
                        <button type="button" id="cancel-product-edit" class="hidden ${button.base} ${button.outlineDark} w-full py-3 mt-2">Cancelar Edición</button>
                    </form>
                </div>

                <!-- BUSCADOR -->
                <div class="mb-6 relative">
                    <input type="search" id="search-product" placeholder="Buscar productos por nombre o categoría..." class="${form.input} py-4 pl-12 rounded-2xl shadow-sm" autocomplete="off" />
                    <svg class="absolute left-4 top-4 h-5 w-5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>
                <div id="table-container">${this.renderProductList(platos)}</div>
            </div>
        </div>
    `;
    this.setupEventListeners(acciones, categorias);
  }

  setupEventListeners(acciones, categorias) {
    const { onAdd, onEdit, onDelete, onBack, onSearch, onAddCategory, onDeleteCategory, onUpdateCategory, onReorderCategories } = acciones;
    document.getElementById("back-from-manage").onclick = onBack;

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

    const prodForm = document.getElementById("add-product-form");
    prodForm.onsubmit = (e) => {
      e.preventDefault();
      const selectedCats = Array.from(document.querySelectorAll('input[name="product-category"]:checked')).map((cb) => cb.value);
      if (selectedCats.length === 0) return alert("Selecciona al menos una categoría.");
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
    this.attachTableEvents(onEdit, onDelete);
  }

  attachTableEvents(onEdit, onDelete) {
    this.rootElement.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.onclick = () => { if(confirm("¿Eliminar este producto?")) onDelete(btn.dataset.id); };
    });
    this.rootElement.querySelectorAll(".edit-btn").forEach((btn) => {
      btn.onclick = () => onEdit(btn.dataset.id);
    });
  }

  renderProductList(platos) {
    if (platos.length === 0) return `<div class="py-10 text-center text-stone-400">No se encontraron productos que coincidan.</div>`;
    return `
      <div class="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        ${platos.map(p => {
          const cats = Array.isArray(p.category) ? p.category : [p.category];
          return `
          <div class="p-4 rounded-2xl border border-stone-100 bg-white flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">
            <div class="flex gap-4 items-center">
                <img src="${p.imageUrl || PLACEHOLDER_ICON}" class="h-14 w-14 rounded-xl object-cover border border-stone-50 shadow-sm" onerror="this.src='${PLACEHOLDER_ICON}'" />
                <div class="flex-1 min-w-0">
                    <p class="text-sm font-bold text-stone-800 truncate">${escapeHtml(p.name)}</p>
                    <p class="text-xs text-primary font-bold">S/ ${Number(p.price).toFixed(2)}</p>
                </div>
                <div class="flex gap-1">
                    <button class="edit-btn p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" data-id="${p.id}" title="Editar">
                        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                    </button>
                    <button class="delete-btn p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors" data-id="${p.id}" title="Eliminar">
                        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                </div>
            </div>
            <div class="flex flex-wrap gap-1.5 border-t border-stone-50 pt-3">
                ${cats.map(c => `<span class="px-2 py-0.5 rounded-md bg-stone-100 border border-stone-200 text-[9px] font-bold text-stone-500 uppercase tracking-tighter">${escapeHtml(c)}</span>`).join('')}
            </div>
          </div>
          `;
        }).join('')}
      </div>
    `;
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

    document.getElementById("submit-product-btn").textContent = "Actualizar Producto";
    document.getElementById("cancel-product-edit").classList.remove("hidden");

    document.getElementById("add-product-form").scrollIntoView({ behavior: "smooth", block: "center" });
  }

  renderTableBody(platos) { return this.renderProductList(platos); }
}
