import { escapeHtml } from "../utils/html.js";
import { card, typography, button, layout } from "../ui/layout.js";

const CAT_IMG_FALLBACK = "https://images.unsplash.com/photo-1512058564366-18510be2db19?q=80&w=600";

export class MenuView {
  constructor(filterContainer, gridContainer) {
    this.filterContainer = filterContainer;
    this.gridContainer = gridContainer;
    this.categorySwiper = null;
  }

  // Renderiza las categorías: Carrusel en Móvil / Grid Estático en PC
  renderCategoryGrid(categories, onCategoryClick) {
    if (!this.gridContainer) return;
    if (this.filterContainer) this.filterContainer.innerHTML = "";

    this.gridContainer.innerHTML = `
        <div class="col-span-full py-8 sm:py-12 mb-8 animate-fade-in">
            <!-- VISTA PC: Grid Estático y Centrado -->
            <div class="hidden lg:flex flex-wrap justify-center gap-10 lg:gap-14 mb-16">
                ${categories.map(cat => this.renderCategoryItem(cat, "w-48 lg:w-60")).join('')}
            </div>

            <!-- VISTA MÓVIL/TABLET: Carrusel Swiper -->
            <div class="lg:hidden overflow-hidden">
                <div class="swiper category-swiper !overflow-visible">
                    <div class="swiper-wrapper flex items-start">
                        ${categories.map(cat => `
                            <div class="swiper-slide !w-auto flex flex-col items-center px-4">
                                ${this.renderCategoryItem(cat, "w-32 sm:w-40")}
                            </div>
                        `).join('')}
                    </div>
                    <div class="swiper-pagination !-bottom-12"></div>
                </div>
            </div>
        </div>
    `;

    this.initCategorySwiper(categories.length);
    
    // Vincular clics en ambas vistas
    this.gridContainer.querySelectorAll("button[data-category]").forEach(btn => {
        btn.onclick = () => onCategoryClick(btn.dataset.category);
    });
  }

  // Helper para renderizar el botón de categoría consistente
  renderCategoryItem(cat, sizeClass) {
    return `
        <button type="button" 
            class="group flex flex-col items-center gap-5 transition-all active:scale-95" 
            data-category="${escapeHtml(cat.nombre)}">
            <div class="relative ${sizeClass} aspect-video rounded-2xl overflow-hidden transition-all duration-700 group-hover:shadow-xl group-hover:ring-1 group-hover:ring-primary/10">
                <img src="${cat.imageUrl || CAT_IMG_FALLBACK}" 
                     class="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                     onerror="this.src='${CAT_IMG_FALLBACK}'" />
                <div class="absolute inset-0 bg-gradient-to-t from-on-background/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
            <div class="flex flex-col items-center w-full">
                <span class="text-on-background font-black text-[10px] sm:text-[11px] lg:text-xs uppercase tracking-[0.2em] text-center leading-tight group-hover:text-primary transition-colors">
                    ${escapeHtml(cat.nombre)}
                </span>
                <div class="h-0.5 w-0 bg-primary mt-2 group-hover:w-10 transition-all duration-500"></div>
            </div>
        </button>
    `;
  }

  initCategorySwiper(count) {
    if (this.categorySwiper) this.categorySwiper.destroy(true, true);
    const swiperEl = document.querySelector('.category-swiper');
    if (!swiperEl) return;

    this.categorySwiper = new Swiper('.category-swiper', {
        slidesPerView: "auto", 
        centeredSlides: true,
        spaceBetween: 15,
        loop: count > 3,
        autoplay: { delay: 4500, disableOnInteraction: false },
        pagination: { el: '.swiper-pagination', clickable: true, dynamicBullets: true },
    });
  }

  // Vista de detalle con 2 columnas en Móvil
  renderCategoryDetail(categoryName, items, onBack) {
    if (!this.gridContainer) return;
    if (this.filterContainer) this.filterContainer.innerHTML = "";

    this.gridContainer.innerHTML = `
        <div class="col-span-full animate-fade-in">
            <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-surface-variant pb-8">
                <div>
                    <button id="btn-back-to-categories" class="flex items-center gap-2 text-on-surface-variant/40 font-bold text-[10px] uppercase tracking-[0.2em] mb-4 hover:text-primary transition-colors">
                        <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="3" d="M15 19l-7-7 7-7"></path></svg>
                        Regresar
                    </button>
                    <h2 class="text-3xl sm:text-5xl font-display font-black text-on-background leading-none tracking-tight">${escapeHtml(categoryName)}</h2>
                </div>
            </div>

            <!-- Grid de Platos: 2 columnas en móvil (grid-cols-2) -->
            <div class="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-10 sm:gap-x-12 sm:gap-y-16">
                ${items.map(item => `
                    <div class="group flex flex-col gap-3 sm:gap-6">
                        <!-- Foto del Plato -->
                        <div class="relative w-full aspect-video rounded-[1rem] sm:rounded-[1.5rem] overflow-hidden bg-background shrink-0 border border-surface-variant transition-all duration-500 group-hover:shadow-lg">
                            <img src="${item.imageUrl || CAT_IMG_FALLBACK}" 
                                 class="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                        </div>
                        
                        <!-- Detalles del Plato -->
                        <div class="flex-1 space-y-1.5 sm:space-y-2 px-1">
                            <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                                <h3 class="text-xs sm:text-lg font-bold text-on-background group-hover:text-primary transition-colors leading-tight line-clamp-2">${escapeHtml(item.name)}</h3>
                                <span class="text-sm sm:text-lg font-extrabold text-primary shrink-0">S/ ${Number(item.price).toFixed(2)}</span>
                            </div>
                            <!-- Descripción: Open Sans -->
                            <p class="${typography.bodySm} leading-relaxed line-clamp-2">
                                ${escapeHtml(item.description || "Ingredientes seleccionados con pasión.")}
                            </p>
                        </div>
                    </div>
                `).join('')}
            </div>

            ${items.length === 0 ? `<div class="py-20 text-center"><p class="text-on-surface-variant/40 italic">No hay productos disponibles.</p></div>` : ''}
            
            <div class="mt-16 text-center">
                <button id="btn-back-to-categories-bottom" class="${button.base} ${button.outlineDark} text-[10px] px-10">
                    Ver otras categorías
                </button>
            </div>
        </div>
    `;

    const backAction = () => { onBack(); document.getElementById("menu")?.scrollIntoView({ behavior: 'smooth' }); };
    document.getElementById("btn-back-to-categories").onclick = backAction;
    document.getElementById("btn-back-to-categories-bottom").onclick = backAction;
  }
}
