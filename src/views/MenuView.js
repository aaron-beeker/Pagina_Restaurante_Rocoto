import { escapeHtml } from "../utils/html.js";

const MENU_IMG_FALLBACK =
  "https://images.unsplash.com/photo-1512058564366-18510be2db19?q=80&w=1200&auto=format&fit=crop";

export class MenuView {
  constructor(filterContainer, gridContainer) {
    this.filterContainer = filterContainer;
    this.gridContainer = gridContainer;
  }

  renderFilters(categories, activeCategory, onCategoryClick) {
    this.filterContainer.innerHTML = categories
      .map((category) => {
        const isActive = category === activeCategory;
        const activeClasses = isActive
          ? "bg-primary text-white border-primary"
          : "bg-white text-stone-700 border-stone-300 hover:border-primary";
        return `<button type="button" class="rounded-full border px-3 py-2 font-button text-xs transition-colors sm:px-4 sm:text-button ${activeClasses}" data-category="${category}">${category}</button>`;
      })
      .join("");

    this.filterContainer.querySelectorAll("button").forEach((button) => {
      button.addEventListener("click", () => onCategoryClick(button.dataset.category));
    });
  }

  renderItems(items) {
    this.gridContainer.innerHTML = items
      .map(
        (item) => {
        const imgSrc = (item.imageUrl && String(item.imageUrl).trim()) || MENU_IMG_FALLBACK;
        const desc = (item.description && String(item.description).trim()) || "Sin descripción.";
        return `
        <article class="group overflow-hidden rounded-xl border border-surface-variant bg-surface shadow-sm transition-shadow hover:shadow-md">
          <div class="h-48 overflow-hidden sm:h-56 md:h-64">
            <img alt="${escapeHtml(item.name)}" class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" src="${escapeHtml(imgSrc)}" onerror="this.onerror=null;this.src='${MENU_IMG_FALLBACK}'" />
          </div>
          <div class="p-4 sm:p-5">
            <div class="mb-2 flex items-start justify-between gap-3">
              <h3 class="font-h3 text-lg sm:text-h3">${escapeHtml(item.name)}</h3>
              <span class="shrink-0 font-h3 text-base text-primary sm:text-h3">S/ ${Number(item.price).toFixed(2)}</span>
            </div>
            <p class="mb-3 font-body-sm text-on-surface-variant sm:mb-4">${escapeHtml(desc)}</p>
            <div class="flex flex-wrap gap-2">
              ${(item.tags || [])
                .map(
                  (tag) =>
                    `<span class="rounded bg-surface-container px-2 py-1 font-label-caps text-[10px] text-on-surface-variant">${tag}</span>`,
                )
                .join("")}
            </div>
          </div>
        </article>
      `;
        },
      )
      .join("");
  }
}
