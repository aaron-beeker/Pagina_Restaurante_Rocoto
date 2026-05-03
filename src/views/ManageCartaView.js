import { CATEGORIAS_SOLO_MENU_DIARIO, seleccionSoloMenuDiario } from "../constants/menuCategories.js";
import { adminShell, formInput } from "../ui/layout.js";
import { escapeHtml } from "../utils/html.js";

const PLACEHOLDER_IMG =
  "https://images.unsplash.com/photo-1512058564366-18510be2db19?q=80&w=200&auto=format&fit=crop";

function truncate(str, max) {
  const s = str == null ? "" : String(str).trim();
  if (!s) return "—";
  return s.length <= max ? s : `${s.slice(0, max)}…`;
}

export class ManageCartaView {
  constructor(rootElement) {
    this.rootElement = rootElement;
  }

  splitCategories(categorias) {
    const carta = categorias.filter((c) => !CATEGORIAS_SOLO_MENU_DIARIO.includes(c.nombre));
    const soloMenu = categorias.filter((c) => CATEGORIAS_SOLO_MENU_DIARIO.includes(c.nombre));
    return { carta, soloMenu };
  }

  renderCategoryCheckboxes(categorias) {
    if (!categorias.length) {
      return `<p class="text-sm italic text-stone-400">No hay categorías en esta sección. Créalas arriba.</p>`;
    }
    return categorias
      .map(
        (cat) => `
      <label class="flex cursor-pointer items-center gap-2 rounded-lg border border-stone-100 bg-stone-50 px-3 py-2 transition-all hover:border-primary">
        <input type="checkbox" name="product-category" value="${escapeHtml(cat.nombre)}" class="h-4 w-4 rounded border-stone-300 text-primary focus:ring-primary" />
        <span class="text-sm font-medium text-stone-700">${escapeHtml(cat.nombre)}</span>
      </label>
    `,
      )
      .join("");
  }

  render(platos, categorias, acciones) {
    const { carta, soloMenu } = this.splitCategories(categorias);

    this.rootElement.innerHTML = `
        <div class="${adminShell.page}">
            <div class="${adminShell.card}">
                <div class="${adminShell.header}">
                    <div>
                        <h2 class="${adminShell.title}">Gestión de carta general</h2>
                        <p class="${adminShell.subtitle}">Administra productos y categorías del restaurante.</p>
                    </div>
                    <button type="button" id="back-from-manage" class="${adminShell.backBtn}">
                        Cerrar gestión
                    </button>
                </div>

                <div class="${adminShell.accentBox} mb-8 sm:mb-10">
                    <h3 class="${adminShell.sectionTitle} text-blue-900">Gestionar categorías</h3>
                    <div class="mb-4 flex flex-wrap gap-2" id="categories-list">
                        ${categorias
                          .map(
                            (cat) => `
                            <span class="flex items-center gap-2 rounded-full border border-blue-200 bg-white px-3 py-1 text-xs font-medium text-blue-900">
                                ${escapeHtml(cat.nombre)}
                                <button type="button" class="delete-cat-btn text-red-600 hover:text-red-800" data-id="${escapeHtml(cat.id)}" data-nombre="${escapeHtml(cat.nombre)}" aria-label="Eliminar categoría">
                                    <svg class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20"><path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"></path></svg>
                                </button>
                            </span>
                        `,
                          )
                          .join("")}
                    </div>
                    <form id="add-category-form" class="flex flex-col gap-2 sm:flex-row">
                        <input type="text" id="new-cat-name" placeholder="Nombre de nueva categoría" class="${formInput} flex-1" required />
                        <button type="submit" class="rounded-lg bg-primary px-4 py-2.5 font-button text-sm font-semibold text-white shadow-sm hover:brightness-110 sm:shrink-0">
                            Añadir categoría
                        </button>
                    </form>
                </div>

                <div class="${adminShell.mutedBox} mb-8 sm:mb-10">
                    <h3 class="${adminShell.sectionTitle}">Añadir o editar producto</h3>
                    <form id="add-product-form" class="space-y-4">
                        <input type="hidden" id="edit-id" value="" />

                        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <input type="text" id="new-name" placeholder="Nombre del producto" class="${formInput}" required />
                            <div>
                              <label for="new-price" class="mb-1 block text-xs font-bold uppercase tracking-wide text-stone-500">Precio (S/)</label>
                              <input type="number" id="new-price" placeholder="Precio (S/)" step="0.01" min="0" class="${formInput}" />
                              <p id="new-price-hint" class="mt-1 text-xs text-stone-500">
                                Obligatorio si marcas alguna categoría de la carta pública. Opcional si solo marcas Entrada, Menú del Día o Bebida Menú (se guarda 0).
                              </p>
                            </div>
                        </div>

                        <div>
                          <label for="new-description" class="mb-1 block text-xs font-bold uppercase tracking-wide text-stone-500">Descripción</label>
                          <textarea id="new-description" rows="3" placeholder="Describe el producto (aparece en la carta del sitio)" class="${formInput}"></textarea>
                        </div>

                        <div>
                          <label for="new-image-url" class="mb-1 block text-xs font-bold uppercase tracking-wide text-stone-500">URL de imagen</label>
                          <input type="url" id="new-image-url" placeholder="https://…" class="${formInput}" />
                          <p class="mt-1 text-xs text-stone-500">Para la carta pública. Los productos solo del menú del día pueden dejarla vacía (se usará una imagen por defecto).</p>
                        </div>

                        <div class="rounded-lg border border-stone-200 bg-white p-4">
                            <p class="mb-2 text-xs font-bold uppercase tracking-wide text-stone-600">Categorías en la carta pública</p>
                            <p class="mb-3 text-xs text-stone-500">Aparecen en la web con nombre, precio, descripción e imagen.</p>
                            <div class="flex flex-wrap gap-2 sm:gap-3">
                                ${this.renderCategoryCheckboxes(carta)}
                            </div>
                        </div>

                        <div class="rounded-lg border border-amber-200 bg-amber-50/80 p-4">
                            <p class="mb-2 text-xs font-bold uppercase tracking-wide text-amber-900">Solo menú del día (no en la carta pública)</p>
                            <p class="mb-3 text-xs text-amber-950/80">
                              Entrada, plato del menú y bebida del menú se eligen por separado al publicar el menú ejecutivo.
                              Marca <strong>una</strong> de estas categorías por producto si solo sirve para armar el menú del día (no hace falta marcar las tres a la vez).
                            </p>
                            <div class="flex flex-wrap gap-2 sm:gap-3">
                                ${this.renderCategoryCheckboxes(soloMenu)}
                            </div>
                        </div>

                        <button type="submit" class="w-full rounded-lg bg-primary py-3 font-button text-sm font-bold text-white shadow-md transition-all hover:brightness-110">
                            Guardar en carta
                        </button>
                    </form>
                </div>

                <div class="mb-6">
                    <input type="search" id="search-product" placeholder="Buscar por nombre o categoría…" class="${formInput} rounded-xl py-3 px-4" autocomplete="off" />
                </div>

                <div id="table-container">
                    ${this.renderProductList(platos)}
                </div>
            </div>
        </div>
    `;
    this.setupEventListeners(acciones);
  }

  syncPriceFieldRequirement() {
    const priceInput = document.getElementById("new-price");
    if (!priceInput) return;
    const selected = Array.from(this.rootElement.querySelectorAll('input[name="product-category"]:checked')).map((cb) => cb.value);
    const soloMenu = seleccionSoloMenuDiario(selected);
    priceInput.required = selected.length > 0 && !soloMenu;
    priceInput.placeholder = soloMenu && selected.length > 0 ? "Opcional (solo menú del día)" : "Precio (S/)";
  }

  setupEventListeners(acciones) {
    const { onAdd, onEdit, onDelete, onBack, onSearch, onAddCategory, onDeleteCategory } = acciones;

    document.getElementById("back-from-manage").onclick = onBack;

    document.getElementById("add-category-form").onsubmit = (e) => {
      e.preventDefault();
      const nombre = document.getElementById("new-cat-name").value.trim();
      if (nombre) onAddCategory(nombre);
    };

    this.rootElement.querySelectorAll(".delete-cat-btn").forEach((btn) => {
      btn.onclick = () => onDeleteCategory(btn.dataset.id);
    });

    this.rootElement.querySelectorAll('input[name="product-category"]').forEach((cb) => {
      cb.addEventListener("change", () => this.syncPriceFieldRequirement());
    });
    this.syncPriceFieldRequirement();

    document.getElementById("add-product-form").onsubmit = (e) => {
      e.preventDefault();
      const selectedCats = Array.from(document.querySelectorAll('input[name="product-category"]:checked')).map((cb) => cb.value);

      if (selectedCats.length === 0) return alert("Selecciona al menos una categoría.");

      const soloMenu = seleccionSoloMenuDiario(selectedCats);
      const priceRaw = document.getElementById("new-price").value.trim();
      let price;
      if (soloMenu) {
        if (priceRaw === "") {
          price = 0;
        } else {
          price = parseFloat(priceRaw);
          if (!Number.isFinite(price)) {
            return alert("Indica un precio numérico válido o déjalo vacío (se guardará 0).");
          }
        }
      } else {
        price = parseFloat(priceRaw);
        if (!Number.isFinite(price) || priceRaw === "") {
          return alert("Indica un precio válido: es obligatorio cuando el producto tiene categoría de carta pública.");
        }
      }

      const imageRaw = document.getElementById("new-image-url").value.trim();
      const descRaw = document.getElementById("new-description").value.trim();

      const data = {
        name: document.getElementById("new-name").value.trim(),
        price,
        category: selectedCats,
        description: descRaw || "",
        imageUrl: imageRaw || "",
      };
      onAdd(data);
    };

    document.getElementById("search-product").oninput = (e) => onSearch(e.target.value);

    this.attachTableEvents(onEdit, onDelete);
  }

  attachTableEvents(onEdit, onDelete) {
    this.rootElement.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.onclick = () => {
        if (onDelete) onDelete(btn.dataset.id);
      };
    });

    this.rootElement.querySelectorAll(".edit-btn").forEach((btn) => {
      btn.onclick = () => {
        if (onEdit) onEdit(btn.dataset.id);
      };
    });
  }

  categoriaTexto(producto) {
    return Array.isArray(producto.category) ? producto.category.join(", ") : producto.category;
  }

  thumbUrl(p) {
    const u = p.imageUrl && String(p.imageUrl).trim();
    return u || PLACEHOLDER_IMG;
  }

  renderProductCards(platos) {
    if (platos.length === 0) {
      return `<p class="rounded-xl border border-dashed border-stone-200 bg-stone-50/50 py-10 text-center text-sm text-stone-500">No se encontraron productos.</p>`;
    }
    return platos
      .map(
        (p) => `
      <article class="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
        <div class="flex gap-3 p-3">
          <img alt="" class="h-16 w-16 shrink-0 rounded-lg object-cover" src="${escapeHtml(this.thumbUrl(p))}" onerror="this.src='${PLACEHOLDER_IMG}'" />
          <div class="min-w-0 flex-1">
            <div class="flex items-start justify-between gap-2">
              <h4 class="font-bold text-stone-900">${escapeHtml(p.name)}</h4>
              <span class="shrink-0 font-bold text-primary">S/ ${Number(p.price).toFixed(2)}</span>
            </div>
            <p class="mt-1 text-xs text-stone-500">${escapeHtml(this.categoriaTexto(p))}</p>
            <p class="mt-1 line-clamp-2 text-xs text-stone-600">${
              p.description
                ? escapeHtml(p.description)
                : '<span class="text-stone-400">Sin descripción</span>'
            }</p>
          </div>
        </div>
        <div class="flex gap-3 border-t border-stone-100 px-3 py-2">
          <button type="button" class="edit-btn text-sm font-medium text-primary hover:underline" data-id="${escapeHtml(p.id)}">Editar</button>
          <button type="button" class="delete-btn text-sm font-medium text-secondary hover:underline" data-id="${escapeHtml(p.id)}">Eliminar</button>
        </div>
      </article>
    `,
      )
      .join("");
  }

  renderProductTable(platos) {
    return `
            <table class="w-full min-w-[720px] text-left text-sm">
                <thead>
                    <tr class="border-b text-[10px] uppercase text-stone-400">
                        <th class="py-3 px-1 w-14"></th>
                        <th class="py-3 px-2">Producto</th>
                        <th class="py-3 px-2 max-w-[200px]">Descripción</th>
                        <th class="py-3 px-2">Categoría</th>
                        <th class="py-3 px-2">Precio</th>
                        <th class="py-3 px-2 text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-stone-100">
                    ${
                      platos.length > 0
                        ? platos
                            .map((plato) => {
                              const categoriaTexto = this.categoriaTexto(plato);
                              const desc = plato.description ? truncate(plato.description, 70) : "—";
                              const img = escapeHtml(this.thumbUrl(plato));
                              return `
                        <tr class="transition-colors hover:bg-stone-50">
                            <td class="py-3 px-1">
                              <img alt="" class="h-11 w-11 rounded-md object-cover" src="${img}" onerror="this.src='${PLACEHOLDER_IMG}'" />
                            </td>
                            <td class="py-3 px-2 font-bold text-stone-800">${escapeHtml(plato.name)}</td>
                            <td class="py-3 px-2 text-xs text-stone-600">${escapeHtml(desc)}</td>
                            <td class="py-3 px-2">
                                <span class="rounded-full bg-stone-200 px-2 py-1 text-[10px]">${escapeHtml(categoriaTexto)}</span>
                            </td>
                            <td class="py-3 px-2 font-bold text-primary">S/ ${Number(plato.price).toFixed(2)}</td>
                            <td class="space-x-2 py-3 px-2 text-right">
                                <button type="button" class="edit-btn text-primary hover:underline" data-id="${escapeHtml(plato.id)}">Editar</button>
                                <button type="button" class="delete-btn text-secondary hover:underline" data-id="${escapeHtml(plato.id)}">Eliminar</button>
                            </td>
                        </tr>`;
                            })
                            .join("")
                        : `<tr><td colspan="6" class="py-10 text-center text-stone-400">No se encontraron productos.</td></tr>`
                    }
                </tbody>
            </table>
        `;
  }

  renderProductList(platos) {
    return `
      <div class="space-y-3 md:hidden">
        ${this.renderProductCards(platos)}
      </div>
      <div class="hidden overflow-x-auto md:block">
        ${this.renderProductTable(platos)}
      </div>
    `;
  }

  renderTableBody(platos) {
    return this.renderProductList(platos);
  }

  prepareEdit(plato) {
    document.getElementById("new-name").value = plato.name;
    const precio = plato.price;
    document.getElementById("new-price").value =
      precio != null && precio !== "" && Number.isFinite(Number(precio)) ? precio : "";
    document.getElementById("edit-id").value = plato.id;
    document.getElementById("new-description").value = plato.description || "";
    document.getElementById("new-image-url").value = plato.imageUrl || "";

    const checkboxes = document.querySelectorAll('input[name="product-category"]');
    checkboxes.forEach((cb) => {
      cb.checked = Array.isArray(plato.category) ? plato.category.includes(cb.value) : plato.category === cb.value;
    });

    this.syncPriceFieldRequirement();

    const submitBtn = this.rootElement.querySelector('#add-product-form button[type="submit"]');
    submitBtn.textContent = "Guardar cambios";
    submitBtn.classList.remove("bg-primary");
    submitBtn.classList.add("bg-blue-700", "hover:brightness-110");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}
