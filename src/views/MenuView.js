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
        return `<button class="rounded-full border px-4 py-2 font-button text-button transition-colors ${activeClasses}" data-category="${category}">${category}</button>`;
      })
      .join("");

    this.filterContainer.querySelectorAll("button").forEach((button) => {
      button.addEventListener("click", () => onCategoryClick(button.dataset.category));
    });
  }

  renderItems(items) {
    this.gridContainer.innerHTML = items
      .map(
        (item) => `
        <article class="group overflow-hidden rounded-xl border border-surface-variant bg-surface shadow-sm transition-shadow hover:shadow-md">
          <div class="h-64 overflow-hidden">
            <img alt="${item.name}" class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" src="${item.imageUrl}" />
          </div>
          <div class="p-5">
            <div class="mb-2 flex items-start justify-between gap-3">
              <h3 class="font-h3 text-h3">${item.name}</h3>
              <span class="font-h3 text-primary">S/ ${item.price}</span>
            </div>
            <p class="mb-4 font-body-sm text-on-surface-variant">${item.description}</p>
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
      `,
      )
      .join("");
  }
}
