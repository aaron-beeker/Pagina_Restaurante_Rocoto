import { escapeHtml } from "../utils/html.js";
import { card, typography, button, layout } from "../ui/layout.js";
import Swiper from 'swiper';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const CAT_IMG_FALLBACK = "https://images.unsplash.com/photo-1512058564366-18510be2db19?q=80&w=600";

export class MenuView {
  constructor(filterContainer, gridContainer) {
    this.filterContainer = filterContainer;
    this.gridContainer = gridContainer;
    this.categorySwiper = null;
  }

  // Renderiza las categorías: Fijas en PC, Carrusel Premium en Móvil
  renderCategoryGrid(categories, onCategoryClick) {
    if (!this.gridContainer) return;
    
    // Limpieza agresiva del contenedor antes de renderizar
    this.gridContainer.innerHTML = "";
    
    if (this.filterContainer) {
        this.filterContainer.innerHTML = "";
        this.filterContainer.classList.remove("hidden");
    }

    this.gridContainer.innerHTML = `
        <div class="col-span-full py-6 animate-fade-in overflow-hidden w-full relative">
            
            <!-- VISTA MÓVIL: Carrusel Premium (Múltiples platos a la vez) - < 768px -->
            <div class="block md:!hidden swiper category-swiper pb-14 w-full relative">
                <div class="swiper-wrapper">
                    ${categories.map(cat => `
                        <div class="swiper-slide flex justify-center">
                            ${this.renderCategoryItem(cat, "w-full")}
                        </div>
                    `).join('')}
                </div>
                <div class="swiper-pagination absolute !bottom-0 left-1/2 -translate-x-1/2 flex justify-center gap-2"></div>
            </div>

            <!-- VISTA ESCRITORIO: Cuadrícula Fija - >= 768px -->
            <div class="hidden md:!grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12 w-full px-4 sm:px-0">
                ${categories.map(cat => `
                    <div class="flex justify-center w-full">
                        ${this.renderCategoryItem(cat, "w-full")}
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    // Lógica de Swiper Inteligente
    if (window.innerWidth < 768) {
        this.initCategorySwiper(categories.length);
    } else {
        if (this.categorySwiper) {
            this.categorySwiper.destroy(true, true);
            this.categorySwiper = null;
        }
    }
    
    this.gridContainer.querySelectorAll("button[data-category]").forEach(btn => {
        btn.onclick = () => onCategoryClick(btn.dataset.category);
    });
  }

  // Helper para renderizar categorías (Rediseñado para Premium Aesthetic con imágenes PNG)
  renderCategoryItem(cat, sizeClass) {
    return `
        <button type="button" class="group flex flex-col items-center gap-4 transition-all active:scale-95 bg-transparent w-full" data-category="${escapeHtml(cat.nombre)}">
            <!-- Contenedor de Imagen con Efecto Flotante -->
            <div class="relative ${sizeClass} max-w-[220px] aspect-square flex items-center justify-center transition-all duration-700">
                
                <!-- Fondo Decorativo Circular (Glow) -->
                <div class="absolute inset-0 bg-stone-50 rounded-full group-hover:bg-primary/10 group-hover:scale-105 transition-all duration-700 shadow-inner"></div>
                
                <!-- Imagen PNG sin fondo con Sombra Proyectada -->
                <img src="${cat.imageUrl || CAT_IMG_FALLBACK}" 
                     class="relative z-10 w-[82%] h-[82%] object-contain drop-shadow-[0_15px_35px_rgba(0,0,0,0.15)] group-hover:drop-shadow-[0_25px_45px_rgba(27,94,52,0.25)] group-hover:-translate-y-3 group-hover:scale-105 transition-all duration-700" 
                     onerror="this.src='${CAT_IMG_FALLBACK}'; this.classList.remove('object-contain'); this.classList.add('object-cover');" />
                
                <!-- Círculo decorativo giratorio sutil -->
                <div class="absolute inset-0 border border-dashed border-primary/15 rounded-full -m-2 animate-[spin_40s_linear_infinite] opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>

            <div class="flex flex-col items-center space-y-2">
                <span class="${typography.h3} text-on-background group-hover:text-primary transition-colors text-center !text-sm sm:!text-base uppercase !tracking-widest leading-none">
                    ${escapeHtml(cat.nombre)}
                </span>
                <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-1 group-hover:translate-y-0">
                    <div class="h-0.5 w-0.5 rounded-full bg-amber-500"></div>
                    <div class="h-0.5 w-6 rounded-full bg-amber-500"></div>
                    <div class="h-0.5 w-0.5 rounded-full bg-amber-500"></div>
                </div>
            </div>
        </button>
    `;
  }

  initCategorySwiper(count) {
    if (this.categorySwiper) this.categorySwiper.destroy(true, true);
    const swiperEl = document.querySelector('.category-swiper');
    if (!swiperEl) return;
    
    this.categorySwiper = new Swiper('.category-swiper', {
        modules: [Navigation, Pagination, Autoplay],
        slidesPerView: 2.1,
        centeredSlides: false,
        spaceBetween: 12,
        slidesOffsetBefore: 16,
        slidesOffsetAfter: 16,
        loop: false,
        grabCursor: true,
        watchSlidesProgress: true,
        autoplay: { 
            delay: 5000, 
            disableOnInteraction: false 
        },
        pagination: { 
            el: '.swiper-pagination', 
            clickable: true,
            dynamicBullets: true
        },
    });
  }

  // Rediseño Inmersivo de la Vista de Detalle de Categoría (Platos) - COMPACTO
  renderCategoryDetail(categoryName, items, onBack) {
    if (!this.gridContainer) return;
    
    // Limpieza y preparación
    this.gridContainer.innerHTML = "";
    
    this.gridContainer.innerHTML = `
        <div class="col-span-full animate-fade-in">
            
            <!-- CABECERA DE CATEGORÍA COMPACTA -->
            <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10 sm:mb-16 pb-6 border-b border-stone-100">
                <div class="space-y-2">
                    <button id="btn-back-to-categories" class="flex items-center gap-2 text-primary hover:text-primary/70 font-bold text-[9px] uppercase tracking-[0.4em] transition-all group mb-4">
                        <svg class="h-3 w-3 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="3" d="M15 19l-7-7 7-7"></path></svg>
                        Volver a Categorías
                    </button>
                    <div class="flex items-center gap-4">
                        <div class="h-10 w-1 bg-amber-400 rounded-full"></div>
                        <h2 class="${typography.h2} !text-4xl sm:!text-6xl uppercase italic leading-none">
                            ${escapeHtml(categoryName)}
                        </h2>
                    </div>
                </div>
                <div class="text-right hidden sm:block">
                    <span class="${layout.label} !mb-1 opacity-30">Especialidades</span>
                    <span class="${typography.h3} text-primary leading-none">${items.length} Platos</span>
                </div>
            </div>

            <!-- GRID GOURMET COMPACTO: 2 columnas móvil, 3-4 columnas desktop -->
            <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-8 sm:gap-y-16">
                ${items.map((item, index) => `
                    <div class="group flex flex-col h-full animate-scale-in" style="animation-delay: ${index * 50}ms">
                        <!-- Imagen de Producto -->
                        <div class="relative aspect-[16/11] rounded-[2rem] overflow-hidden mb-4 bg-stone-100 shadow-sm transition-all duration-700 group-hover:shadow-xl group-hover:-translate-y-1 border border-stone-50">
                            <img src="${item.imageUrl || CAT_IMG_FALLBACK}" 
                                 class="h-full w-full object-cover transition-transform duration-[2000ms] group-hover:scale-110" 
                                 loading="lazy" />
                            
                            <!-- Precio Flotante -->
                            <div class="absolute bottom-3 right-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-lg border border-white/50">
                               <span class="${typography.h3} !text-xs sm:!text-lg text-primary italic leading-none whitespace-nowrap">S/ ${Number(item.price).toFixed(2)}</span>
                            </div>
                        </div>

                        <!-- Información -->
                        <div class="px-1 flex flex-col flex-1">
                            <h3 class="${typography.h3} !text-xs sm:!text-lg text-on-background group-hover:text-primary transition-colors leading-tight mb-2 line-clamp-2 uppercase">${escapeHtml(item.name)}</h3>
                            <p class="${typography.bodySm} italic line-clamp-2">
                                ${escapeHtml(item.description || "Receta tradicional de la casa.")}
                            </p>
                        </div>
                    </div>
                `).join('')}
            </div>

            ${items.length === 0 ? `
                <div class="py-20 text-center">
                    <p class="${layout.label} opacity-30">Próximamente más delicias</p>
                </div>
            ` : ''}
            
            <div class="mt-20 text-center">
                <button id="btn-back-to-categories-bottom" class="${button.base} ${button.outlineDark} rounded-full tracking-[0.4em] uppercase">
                    Ver otras categorías
                </button>
            </div>
        </div>
    `;

    // Acción para volver
    const backAction = () => { 
        onBack(); 
        // Pequeño delay para que la animación de salida se sienta suave
        setTimeout(() => {
            document.getElementById("menu")?.scrollIntoView({ behavior: 'smooth' }); 
        }, 50);
    };

    const b1 = document.getElementById("btn-back-to-categories");
    const b2 = document.getElementById("btn-back-to-categories-bottom");
    if (b1) b1.onclick = backAction;
    if (b2) b2.onclick = backAction;
  }
}
