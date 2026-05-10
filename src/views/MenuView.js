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
        <div class="col-span-full py-8 sm:py-16 animate-fade-in overflow-hidden w-full relative">
            
            <!-- VISTA MÓVIL: Carrusel (1 a la vez) - Absolutamente exclusivo < 768px -->
            <div class="block md:!hidden swiper category-swiper pb-20 w-full relative">
                <div class="swiper-wrapper">
                    ${categories.map(cat => `
                        <div class="swiper-slide px-4 flex justify-center">
                            ${this.renderCategoryItem(cat, "w-full max-w-[280px]")}
                        </div>
                    `).join('')}
                </div>
                <!-- Paginación Premium Perfectamente Centrada -->
                <div class="swiper-pagination absolute !bottom-4 left-1/2 -translate-x-1/2 flex justify-center gap-2"></div>
            </div>

            <!-- VISTA ESCRITORIO: Cuadrícula Fija - Absolutamente exclusivo >= 768px -->
            <div class="hidden md:!grid grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-16 w-full px-4 sm:px-0">
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

  // Helper para renderizar categorías (Rediseñado para Premium Aesthetic)
  renderCategoryItem(cat, sizeClass) {
    return `
        <button type="button" class="group flex flex-col items-center gap-6 transition-all active:scale-95 bg-transparent w-full" data-category="${escapeHtml(cat.nombre)}">
            <div class="relative ${sizeClass} aspect-[16/10] rounded-[2.5rem] overflow-hidden transition-all duration-700 group-hover:-translate-y-2 border border-surface-variant shadow-sm group-hover:shadow-2xl">
                <img src="${cat.imageUrl || CAT_IMG_FALLBACK}" 
                     class="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                     onerror="this.src='${CAT_IMG_FALLBACK}'" />
                <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>

            <div class="flex flex-col items-center">
                <span class="text-on-background font-black text-sm sm:text-base uppercase tracking-[0.4em] text-center transition-colors group-hover:text-primary leading-none">
                    ${escapeHtml(cat.nombre)}
                </span>
                <div class="h-1.5 w-0 bg-primary mt-4 group-hover:w-16 transition-all duration-500 rounded-full"></div>
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

  // Rediseño Inmersivo de la Vista de Detalle de Categoría (Platos)
  renderCategoryDetail(categoryName, items, onBack) {
    if (!this.gridContainer) return;
    
    // Limpieza y preparación para una vista inmersiva
    this.gridContainer.innerHTML = "";
    
    this.gridContainer.innerHTML = `
        <div class="col-span-full animate-fade-in px-2 sm:px-0">
            
            <!-- CABECERA DE CATEGORÍA: Impacto Visual (Full Scene) -->
            <div class="relative mb-16 sm:mb-24 pt-10 pb-16 text-center overflow-hidden rounded-[3rem] bg-emerald-950 text-white shadow-2xl">
                <!-- Luces de Fondo (Aesthetic) -->
                <div class="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                <div class="absolute -top-24 -left-24 w-64 h-64 bg-emerald-500/20 blur-[80px] rounded-full"></div>
                <div class="absolute -bottom-24 -right-24 w-64 h-64 bg-amber-500/10 blur-[80px] rounded-full"></div>

                <div class="relative z-10 space-y-6 px-6">
                    <button id="btn-back-to-categories" class="inline-flex items-center gap-2 text-white/40 hover:text-white font-black text-[9px] uppercase tracking-[0.4em] transition-all group">
                        <svg class="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="3" d="M15 19l-7-7 7-7"></path></svg>
                        Volver a la Carta
                    </button>
                    
                    <div class="space-y-2">
                        <h2 class="text-5xl sm:text-8xl font-black tracking-tighter italic font-display leading-none uppercase drop-shadow-2xl">
                            ${escapeHtml(categoryName)}
                        </h2>
                        <div class="flex items-center justify-center gap-4 opacity-30">
                            <div class="h-px w-8 sm:w-16 bg-white"></div>
                            <span class="text-[9px] font-black uppercase tracking-[0.3em] whitespace-nowrap">${items.length} Especialidades Seleccionadas</span>
                            <div class="h-px w-8 sm:w-16 bg-white"></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- GRID GOURMET: 2 columnas móvil, 3-4 columnas desktop -->
            <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-12 sm:gap-x-8 sm:gap-y-20 px-2 sm:px-0">
                ${items.map((item, index) => `
                    <div class="group flex flex-col h-full animate-scale-in" style="animation-delay: ${index * 80}ms">
                        <!-- Imagen de Producto Rectangular (Ideal para comida) -->
                        <div class="relative aspect-[16/10] rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden mb-5 sm:mb-7 bg-stone-100 shadow-sm transition-all duration-700 group-hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.12)] group-hover:-translate-y-2 border border-stone-50">
                            <img src="${item.imageUrl || CAT_IMG_FALLBACK}" 
                                 class="h-full w-full object-cover transition-transform duration-[2000ms] group-hover:scale-110" 
                                 loading="lazy" />
                            
                            <!-- Precio Premium Flotante -->
                            <div class="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 bg-white/95 backdrop-blur-xl px-4 py-2 sm:px-5 sm:py-2.5 rounded-2xl shadow-2xl border border-white/50 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                               <span class="text-sm sm:text-xl font-black text-primary italic font-display leading-none whitespace-nowrap">S/ ${Number(item.price).toFixed(2)}</span>
                            </div>

                            <!-- Overlay de Gradiente Suave -->
                            <div class="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                        </div>

                        <!-- Información Detallada -->
                        <div class="px-2 flex flex-col flex-1">
                            <h3 class="text-sm sm:text-xl font-black text-on-background group-hover:text-primary transition-colors tracking-tight uppercase leading-tight mb-2 sm:mb-3 line-clamp-2">${escapeHtml(item.name)}</h3>
                            <p class="text-[10px] sm:text-sm text-on-surface-variant/40 leading-snug sm:leading-relaxed font-medium italic line-clamp-3">
                                ${escapeHtml(item.description || "Receta tradicional preparada con ingredientes frescos de la estación y el toque secreto de Rocoto.")}
                            </p>
                        </div>
                    </div>
                `).join('')}
            </div>

            ${items.length === 0 ? `
                <div class="py-40 text-center space-y-4">
                    <div class="h-20 w-20 bg-stone-50 rounded-full flex items-center justify-center mx-auto opacity-20">
                        <svg class="h-10 w-10 text-stone-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke-width="1.5"/></svg>
                    </div>
                    <p class="text-stone-300 font-black text-[10px] uppercase tracking-[0.4em]">Estamos preparando nuevas delicias en esta sección</p>
                </div>
            ` : ''}
            
            <div class="mt-32 text-center">
                <button id="btn-back-to-categories-bottom" class="inline-flex items-center gap-6 bg-primary text-white px-16 py-7 rounded-full text-[10px] font-black uppercase tracking-[0.4em] hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-primary/30">
                    Descubrir Otras Categorías
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
