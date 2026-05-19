import { html, render } from "lit-html";
import { card, typography, button, layout } from "../ui/layout.js";
import Swiper from "swiper";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const CAT_IMG_FALLBACK = "https://images.unsplash.com/photo-1512058564366-18510be2db19?q=80&w=600";

export class MenuView {
  constructor(filterContainer, gridContainer) {
    this.filterContainer = filterContainer;
    this.gridContainer = gridContainer;
    this.categorySwiper = null;
  }

  /**
   * Renderiza las categorías: Fijas en PC, Carrusel Premium en Móvil
   */
  renderCategoryGrid(categories, onCategoryClick) {
    if (!this.gridContainer) return;

    if (this.filterContainer) {
      this.filterContainer.classList.remove("hidden");
      render(html``, this.filterContainer);
    }

    const template = html`
      <div class="col-span-full py-12 animate-fade-in w-full relative">
        ${this._renderCategoryMobile(categories)} ${this._renderCategoryDesktop(categories)}
      </div>
    `;

    render(template, this.gridContainer);

    this._setupCategorySwiper();
    this._bindCategoryEvents(onCategoryClick);
  }

  _renderCategoryMobile(categories) {
    return html` <!-- VISTA MÓVIL: Carrusel Premium -->
      <div class="block md:!hidden swiper category-swiper pt-10 pb-16 w-full relative">
        <div class="swiper-wrapper">
          ${categories.map(
            (cat) => html`
              <div class="swiper-slide flex justify-center py-4">
                ${this.renderCategoryItem(cat, "w-48")}
              </div>
            `
          )}
        </div>
        <div
          class="swiper-pagination absolute !bottom-2 left-1/2 -translate-x-1/2 flex justify-center gap-2"
        ></div>
      </div>`;
  }

  _renderCategoryDesktop(categories) {
    return html` <!-- VISTA ESCRITORIO: Cuadrícula Fija -->
      <div class="hidden md:!grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12 w-full px-4 sm:px-0">
        ${categories.map(
          (cat) => html`
            <div class="flex justify-center w-full">${this.renderCategoryItem(cat, "w-full")}</div>
          `
        )}
      </div>`;
  }

  /**
   * Rediseño Inmersivo de la Vista de Detalle de Categoría (Platos)
   */
  renderCategoryDetail(categoryName, items, onBack) {
    if (!this.gridContainer) return;

    const template = html`
      <div class="col-span-full animate-fade-in">
        ${this._renderDetailHeader(categoryName, items.length)} ${this._renderDetailGrid(items)}
        ${items.length === 0 ? this._renderEmptyState() : ""}

        <div class="mt-20 text-center">
          <button
            id="btn-back-to-categories-bottom"
            class="${button.base} ${button.outlineDark} rounded-full tracking-[0.4em] uppercase"
          >
            Ver otras categorías
          </button>
        </div>
      </div>
    `;

    render(template, this.gridContainer);
    this._bindDetailEvents(onBack);
  }

  _renderDetailHeader(categoryName, count) {
    return html` <div
      class="flex flex-col sm:flex-row sm:items-end justify-between gap-8 mb-16 sm:mb-20 pb-8 border-b border-primary/10"
    >
      <div class="space-y-6">
        <button
          id="btn-back-to-categories"
          class="flex items-center gap-3 text-primary hover:text-stone-900 font-bold text-[10px] uppercase tracking-[0.5em] transition-all group"
        >
          <svg
            class="h-4 w-4 transform group-hover:-translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-width="3" d="M15 19l-7-7 7-7"></path>
          </svg>
          Volver
        </button>
        <div class="flex flex-col gap-2">
          <span class="text-[9px] uppercase tracking-[0.4em] text-primary/60 font-bold"
            >Explorando</span
          >
          <h2
            class="text-4xl sm:text-6xl font-display italic text-stone-950 leading-none lowercase first-letter:uppercase"
          >
            ${categoryName}
          </h2>
        </div>
      </div>
      <div class="text-right hidden sm:block">
        <span class="block text-[8px] uppercase tracking-[0.5em] text-primary/40 font-bold mb-1"
          >Disponibles</span
        >
        <span class="text-2xl font-display italic text-primary leading-none"
          >${count} Especialidades</span
        >
      </div>
    </div>`;
  }

  _renderDetailGrid(items) {
    return html` <div
      class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12 sm:gap-x-10 sm:gap-y-20"
    >
      ${items.map((item, index) => this._renderMenuItem(item, index))}
    </div>`;
  }

  _renderMenuItem(item, index) {
    return html` <div
      class="group flex flex-col h-full animate-scale-in"
      style="animation-delay: ${index * 50}ms"
    >
      <div
        class="relative aspect-[16/11] rounded-[2.5rem] overflow-hidden mb-6 bg-gradient-to-br from-emerald-50 to-white shadow-sm transition-all duration-700 group-hover:shadow-2xl group-hover:-translate-y-2 border border-emerald-100/30"
      >
        <img
          src="${item.imageUrl || CAT_IMG_FALLBACK}"
          class="h-full w-full object-cover transition-transform duration-[3s] group-hover:scale-110"
          loading="lazy"
        />

        <div
          class="absolute bottom-4 right-4 bg-primary/95 backdrop-blur-xl px-4 py-2 rounded-2xl shadow-xl border border-white/20"
        >
          <span class="text-sm sm:text-base font-display italic text-white font-black"
            >S/ ${Number(item.price).toFixed(2)}</span
          >
        </div>
      </div>

      <div class="px-2 flex flex-col flex-1 space-y-2">
        <h3
          class="text-sm sm:text-lg font-display italic text-stone-900 group-hover:text-primary transition-colors leading-tight uppercase tracking-tight"
        >
          ${item.name}
        </h3>
        <p
          class="text-[10px] sm:text-xs text-primary/50 font-light italic line-clamp-2 leading-relaxed"
        >
          ${item.description ||
          "Receta artesanal preparada con insumos seleccionados de nuestra selva."}
        </p>
        <div class="h-[1px] w-8 bg-primary/20 group-hover:w-full transition-all duration-700"></div>
      </div>
    </div>`;
  }

  _renderEmptyState() {
    return html` <div class="py-32 text-center space-y-4">
      <div class="h-12 w-[1px] bg-primary/10 mx-auto"></div>
      <p class="text-[10px] uppercase tracking-[0.6em] text-primary/40 font-bold italic">
        Próximamente nuevas delicias
      </p>
    </div>`;
  }

  renderCategoryItem(cat, sizeClass) {
    return html` <button
      type="button"
      class="group flex flex-col items-center gap-6 transition-all active:scale-95 bg-transparent w-full"
      data-category="${cat.nombre}"
    >
      <div
        class="relative ${sizeClass} max-w-[200px] aspect-square flex items-center justify-center"
      >
        <div
          class="absolute inset-0 bg-gradient-to-br from-emerald-50 to-white rounded-full group-hover:bg-gradient-to-br group-hover:from-emerald-100 group-hover:to-emerald-50 group-hover:scale-110 transition-all duration-1000 shadow-inner"
        ></div>

        <div
          class="absolute inset-2 rounded-full bg-gradient-to-br from-emerald-200/10 via-transparent to-transparent blur-xl"
        ></div>

        <img
          src="${cat.imageUrl || CAT_IMG_FALLBACK}"
          class="relative z-10 w-[78%] h-[82%] object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.1)] group-hover:drop-shadow-[0_25px_45px_rgba(27,94,52,0.2)] group-hover:-translate-y-4 group-hover:scale-105 transition-all duration-700"
          @error=${(e) => {
            e.target.src = CAT_IMG_FALLBACK;
            e.target.classList.remove("object-contain");
            e.target.classList.add("object-cover");
          }}
        />

        <div
          class="absolute inset-0 border border-dashed border-emerald-200/30 rounded-full -m-2 animate-[spin_60s_linear_infinite] opacity-40 group-hover:opacity-100 group-hover:border-primary/40 transition-all"
        ></div>
      </div>

      <div class="flex flex-col items-center space-y-2">
        <span
          class="text-stone-900 group-hover:text-primary transition-colors text-center text-xs sm:text-sm font-bold uppercase tracking-[0.4em] leading-none select-none"
        >
          ${cat.nombre}
        </span>
        <div
          class="h-[1px] w-4 bg-primary/20 group-hover:w-12 group-hover:bg-primary/30 transition-all duration-700"
        ></div>
      </div>
    </button>`;
  }

  // --- Helpers de Lógica y Eventos ---

  _setupCategorySwiper() {
    if (window.innerWidth < 768) {
      this.initCategorySwiper();
    } else {
      if (this.categorySwiper) {
        this.categorySwiper.destroy(true, true);
        this.categorySwiper = null;
      }
    }
  }

  initCategorySwiper() {
    if (this.categorySwiper) this.categorySwiper.destroy(true, true);
    const swiperEl = document.querySelector(".category-swiper");
    if (!swiperEl) return;

    this.categorySwiper = new Swiper(".category-swiper", {
      modules: [Navigation, Pagination, Autoplay],
      slidesPerView: 1,
      centeredSlides: true,
      spaceBetween: 20,
      loop: false,
      grabCursor: true,
      watchSlidesProgress: true,
      autoplay: { delay: 5000, disableOnInteraction: false },
      pagination: { el: ".swiper-pagination", clickable: true },
    });
  }

  _bindCategoryEvents(onCategoryClick) {
    this.gridContainer.querySelectorAll("button[data-category]").forEach((btn) => {
      btn.onclick = () => onCategoryClick(btn.dataset.category);
    });
  }

  _bindDetailEvents(onBack) {
    const backAction = () => {
      onBack();
      setTimeout(() => {
        document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" });
      }, 50);
    };

    const b1 = document.getElementById("btn-back-to-categories");
    const b2 = document.getElementById("btn-back-to-categories-bottom");
    if (b1) b1.onclick = backAction;
    if (b2) b2.onclick = backAction;
  }
}
