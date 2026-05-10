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

  // Renderiza las categorías: Fijas en PC, Carrusel de 1 en 1 en Móvil
  renderCategoryGrid(categories, onCategoryClick) {
    if (!this.gridContainer) return;
    
    // Limpieza agresiva del contenedor antes de renderizar
    this.gridContainer.innerHTML = "";
    
    if (this.filterContainer) {
        this.filterContainer.innerHTML = "";
        this.filterContainer.classList.remove("hidden");
    }

    this.gridContainer.innerHTML = `
        <div class="col-span-full py-4 sm:py-6 animate-fade-in overflow-hidden w-full relative">
            
            <!-- VISTA MÓVIL: Carrusel (1 a la vez) - Absolutamente exclusivo < 768px -->
            <div class="block md:!hidden swiper category-swiper pb-12 w-full relative">
                <div class="swiper-wrapper">
                    ${categories.map(cat => `
                        <div class="swiper-slide px-4 flex justify-center">
                            ${this.renderCategoryItem(cat, "w-full max-w-[240px]")}
                        </div>
                    `).join('')}
                </div>
                <div class="swiper-pagination absolute !bottom-0 left-1/2 -translate-x-1/2 flex justify-center gap-2"></div>
            </div>

            <!-- VISTA ESCRITORIO: Cuadrícula Fija - Absolutamente exclusivo >= 768px -->
            <div class="hidden md:!grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10 w-full px-4 sm:px-0">
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
            <!-- Contenedor de Imagen con Efecto Flotante - TAMAÑO REDUCIDO -->
            <div class="relative ${sizeClass} max-w-[180px] sm:max-w-[200px] aspect-square flex items-center justify-center transition-all duration-700">
                
                <!-- Fondo Decorativo Circular (Glow) -->
                <div class="absolute inset-0 bg-stone-50 rounded-full group-hover:bg-[#1B5E34]/10 group-hover:scale-105 transition-all duration-700 shadow-inner"></div>
                
                <!-- Imagen PNG sin fondo con Sombra Proyectada -->
                <img src="${cat.imageUrl || CAT_IMG_FALLBACK}" 
                     class="relative z-10 w-[80%] h-[80%] object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.12)] group-hover:drop-shadow-[0_25px_40px_rgba(27,94,52,0.2)] group-hover:-translate-y-3 group-hover:scale-105 transition-all duration-700" 
                     onerror="this.src='${CAT_IMG_FALLBACK}'; this.classList.remove('object-contain'); this.classList.add('object-cover');" />
                
                <!-- Círculo decorativo giratorio sutil -->
                <div class="absolute inset-0 border border-dashed border-[#1B5E34]/10 rounded-full -m-2 animate-[spin_30s_linear_infinite] opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>

            <div class="flex flex-col items-center space-y-2">
                <span class="text-on-background font-black text-xs sm:text-sm uppercase tracking-[0.4em] text-center transition-colors group-hover:text-primary leading-none">
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
        slidesPerView: 1,
        centeredSlides: true,
        spaceBetween: 20,
        loop: count > 1,
        grabCursor: true,
        watchSlidesProgress: true,
        autoplay: { 
            delay: 4000, 
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
                    <button id="btn-back-to-categories" class="flex items-center gap-2 text-[#1B5E34] hover:text-[#1B5E34]/70 font-black text-[9px] uppercase tracking-[0.4em] transition-all group mb-4">
                        <svg class="h-3 w-3 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="3" d="M15 19l-7-7 7-7"></path></svg>
                        Volver a Categorías
                    </button>
                    <div class="flex items-center gap-4">
                        <div class="h-10 w-1 bg-amber-400 rounded-full"></div>
                        <h2 class="text-4xl sm:text-6xl font-black text-on-background tracking-tighter italic font-display leading-none uppercase">
                            ${escapeHtml(categoryName)}
                        </h2>
                    </div>
                </div>
                <div class="text-right hidden sm:block">
                    <span class="text-[10px] font-black text-stone-300 uppercase tracking-[0.3em] block mb-1">Especialidades</span>
                    <span class="text-2xl font-black text-[#1B5E34] italic font-display leading-none">${items.length} Platos</span>
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
                               <span class="text-xs sm:text-lg font-black text-[#1B5E34] italic font-display leading-none whitespace-nowrap">S/ ${Number(item.price).toFixed(2)}</span>
                            </div>
                        </div>

                        <!-- Información -->
                        <div class="px-1 flex flex-col flex-1">
                            <h3 class="text-xs sm:text-lg font-black text-on-background group-hover:text-[#1B5E34] transition-colors tracking-tight uppercase leading-tight mb-2 line-clamp-2">${escapeHtml(item.name)}</h3>
                            <p class="text-[9px] sm:text-xs text-on-surface-variant/50 leading-tight font-medium italic line-clamp-2">
                                ${escapeHtml(item.description || "Receta tradicional de la casa.")}
                            </p>
                        </div>
                    </div>
                `).join('')}
            </div>

            ${items.length === 0 ? `
                <div class="py-20 text-center">
                    <p class="text-stone-300 font-black text-[10px] uppercase tracking-[0.4em]">Próximamente más delicias</p>
                </div>
            ` : ''}
            
            <div class="mt-20 text-center">
                <button id="btn-back-to-categories-bottom" class="inline-flex items-center gap-4 border-2 border-stone-100 text-stone-400 px-10 py-4 rounded-full text-[9px] font-black uppercase tracking-[0.4em] hover:bg-stone-50 hover:text-[#1B5E34] transition-all">
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
