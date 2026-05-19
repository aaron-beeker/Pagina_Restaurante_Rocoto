import { AdminMenuView } from "../views/AdminMenuView.js";
import { HeroPromoAdminView } from "../views/HeroPromoAdminView.js";
import { ManageCartaView } from "../views/ManageCartaView.js";
import { toast, dialog, preloader } from "../utils/notifications.js";

export class AdminMenuController {
  constructor(dependencies) {
    this.menuRepository = dependencies.menuRepository;
    this.pdfService = dependencies.pdfService;
    this.navigateTo = dependencies.navigateTo;

    // Estado persistente (recibido o manejado localmente)
    this.lastAdminSearch = "";
    
    // Suscripciones
    this.unsubscribeCartaPlatos = null;
    this.unsubscribeCartaCategorias = null;
    this.unsubscribeDailyMenuConfig = null;
    this.unsubscribeHeroPromo = null;
  }

  async abrirGestionCarta(silent = false) {
    if (!silent) preloader.show("Cargando Carta...");
    try {
      if (this.unsubscribeCartaPlatos) this.unsubscribeCartaPlatos();
      if (this.unsubscribeCartaCategorias) this.unsubscribeCartaCategorias();

      const searchInput = document.getElementById("search-product");
      if (searchInput) this.lastAdminSearch = searchInput.value;

      const manageView = new ManageCartaView(document.getElementById("admin-layer"));
      
      let currentPlatos = [];
      let currentCategorias = [];

      const acciones = {
        onBack: () => {
          if (this.unsubscribeCartaPlatos) this.unsubscribeCartaPlatos();
          if (this.unsubscribeCartaCategorias) this.unsubscribeCartaCategorias();
          this.lastAdminSearch = "";
          this.navigateTo("#/");
          window.scrollTo({ top: 0, behavior: "smooth" });
        },
        onAdd: async (data) => {
          try {
            const id = document.getElementById("edit-id").value;
            if (id) {
              if (await this.menuRepository.updatePlato(id, data)) {
                toast.success("Producto actualizado correctamente");
                document
                  .getElementById("form-editor-section")
                  ?.scrollIntoView({ behavior: "smooth", block: "start" });
              }
            } else {
              if (await this.menuRepository.addPlato(data)) {
                toast.success("Nuevo producto guardado");
                document
                  .getElementById("form-editor-section")
                  ?.scrollIntoView({ behavior: "smooth", block: "start" });
              }
            }
          } catch (error) {
            console.error("Error al guardar plato:", error);
            toast.error("Error al guardar el producto");
          }
        },
        onDelete: async (id) => {
          try {
            if (await this.menuRepository.deletePlato(id)) {
              toast.success("Producto eliminado");
              document
                .getElementById("form-editor-section")
                ?.scrollIntoView({ behavior: "smooth", block: "start" });
            }
          } catch (error) {
            console.error("Error al eliminar plato:", error);
            toast.error("Error al eliminar el producto");
          }
        },
        onSearch: (q) => {
          this.lastAdminSearch = q;
          manageView.applyFilter(q);
        },
        onEdit: (id) => {
          const p = currentPlatos.find((x) => x.id === id);
          if (p) {
            manageView.prepareEdit(p);
          }
        },
        onAddCategory: async (n, u, a) => {
          try {
            if (await this.menuRepository.addCategory(n, u, a)) {
              toast.success("Categoría añadida con éxito");
            }
          } catch (error) {
            console.error("Error al añadir categoría:", error);
            toast.error("Error al añadir la categoría");
          }
        },
        onUpdateCategory: async (id, n, an, u, a) => {
          try {
            if (await this.menuRepository.updateCategory(id, n, an, u, a)) {
              toast.success("Categoría actualizada");
            }
          } catch (error) {
            console.error("Error al actualizar categoría:", error);
            toast.error("Error al actualizar la categoría");
          }
        },
        onDeleteCategory: async (id) => {
          try {
            if (await this.menuRepository.deleteCategory(id)) {
              toast.success("Categoría eliminada");
            }
          } catch (error) {
            console.error("Error al eliminar categoría:", error);
            toast.error("Error al eliminar la categoría");
          }
        },
        onReorderCategories: async (list) => {
          try {
            if (await this.menuRepository.saveCategoriesOrder(list)) {
              toast.success("Orden actualizado");
            }
          } catch (error) {
            console.error("Error al reordenar:", error);
            toast.error("Error al reordenar");
          }
        },
      };

      manageView.render([], [], acciones);
      
      this.unsubscribeCartaPlatos = this.menuRepository.subscribeToPlatos((platos) => {
        currentPlatos = platos;
        manageView.render(currentPlatos, currentCategorias, acciones);
        if (this.lastAdminSearch) {
          const newSearchInput = document.getElementById("search-product");
          if (newSearchInput) {
            newSearchInput.value = this.lastAdminSearch;
            acciones.onSearch(this.lastAdminSearch);
          }
        }
      });

      this.unsubscribeCartaCategorias = this.menuRepository.subscribeToCategories((categorias) => {
        currentCategorias = categorias;
        manageView.render(currentPlatos, currentCategorias, acciones);
        if (this.lastAdminSearch) {
          const newSearchInput = document.getElementById("search-product");
          if (newSearchInput) {
            newSearchInput.value = this.lastAdminSearch;
            acciones.onSearch(this.lastAdminSearch);
          }
        }
      });

    } finally {
      if (!silent) preloader.hide();
    }
  }

  async abrirGestionHero(onUpdateHero, silent = false) {
    if (!silent) preloader.show("Cargando Banner...");
    try {
      if (this.unsubscribeHeroPromo) this.unsubscribeHeroPromo();

      const v = new HeroPromoAdminView(document.getElementById("admin-layer"));
      
      let currentData = null;

      const acciones = {
        onSave: async (p) => {
          try {
            if (await this.menuRepository.saveHeroPromo(p)) {
              if (onUpdateHero) onUpdateHero(p);
              toast.success("Banners guardados correctamente");
            }
          } catch (error) {
            console.error("Error al guardar banners:", error);
            toast.error("Error al guardar los banners");
          }
        },
        onBack: () => {
          if (this.unsubscribeHeroPromo) this.unsubscribeHeroPromo();
          this.navigateTo("#/");
          window.scrollTo({ top: 0, behavior: "smooth" });
        },
      };

      this.unsubscribeHeroPromo = this.menuRepository.subscribeToHeroPromo((data) => {
        currentData = data;
        v.render(currentData, acciones);
        if (onUpdateHero) onUpdateHero(currentData);
      });

    } finally {
      if (!silent) preloader.hide();
    }
  }

  async abrirGestionMenuDiario(currentDailyMenu, onUpdateDailyMenu, silent = false) {
    if (!silent) preloader.show("Cargando Menú del Día...");
    try {
      if (this.unsubscribeCartaPlatos) this.unsubscribeCartaPlatos();
      if (this.unsubscribeDailyMenuConfig) this.unsubscribeDailyMenuConfig();

      const av = new AdminMenuView(document.getElementById("admin-layer"));

      let configActual = null;
      let opc = { entradas: [], segundos: [], refrescos: [] };

      // Marcar seleccionados según la config actual para que el admin vea qué está activo
      const renderView = () => {
        const marcarSeleccionados = (lista, seleccionados) => {
          return lista.map((p) => ({ ...p, selected: (seleccionados || []).includes(p.name) }));
        };

        const entradas = marcarSeleccionados(opc.entradas, configActual?.entradas);
        const segundos = marcarSeleccionados(opc.segundos, configActual?.segundos);
        const refrescos = marcarSeleccionados(opc.refrescos, configActual?.refrescos);

        av.render(segundos, entradas, refrescos, acciones, configActual?.activo);
      };

      const acciones = {
        onSave: async (n) => {
          try {
            if (await this.menuRepository.saveDailyMenu({ ...configActual, ...n })) {
              if (onUpdateDailyMenu) onUpdateDailyMenu(n);
              toast.success("El menú público ha sido actualizado correctamente.", 3000);
              document.getElementById("admin-menu-form")?.reset();
              const adminLayer = document.getElementById("admin-layer");
              if (adminLayer) adminLayer.scrollTo({ top: 0, behavior: "smooth" });
            } else {
              toast.error("Error al intentar guardar el menú");
            }
          } catch (error) {
            console.error("Error al guardar menú diario:", error);
            toast.error("Error al guardar el menú");
          }
        },
        onBack: () => {
          if (this.unsubscribeCartaPlatos) this.unsubscribeCartaPlatos();
          if (this.unsubscribeDailyMenuConfig) this.unsubscribeDailyMenuConfig();
          this.navigateTo("#/");
          window.scrollTo({ top: 0, behavior: "smooth" });
        },
        onToggleVisibility: async (activo) => {
          try {
            if (await this.menuRepository.saveDailyMenuVisibility(activo)) {
              const updatedConfig = { ...configActual, activo };
              if (onUpdateDailyMenu) onUpdateDailyMenu(updatedConfig);
              toast.success(activo ? "Menú activado en la web" : "Menú ocultado de la web");
            }
          } catch (error) {
            console.error("Error al cambiar visibilidad:", error);
            toast.error("Error al actualizar visibilidad");
          }
        },
      };

      const handleDownloadPdf = async () => {
        preloader.show("Generando PDF...");
        try {
          if (currentDailyMenu) {
            await this.pdfService.generarMenuDiarioPdf(currentDailyMenu);
          } else {
            const daily = await this.menuRepository.getDailyMenuConfig();
            await this.pdfService.generarMenuDiarioPdf(daily);
          }
        } finally {
          preloader.hide();
        }
      };

      // Initial empty render
      av.render([], [], [], acciones, true);

      this.unsubscribeCartaPlatos = this.menuRepository.subscribeToPlatos((platos) => {
        opc = {
          entradas: platos.filter((p) =>
            Array.isArray(p.category) ? p.category.includes("Entrada") : p.category === "Entrada"
          ),
          segundos: platos.filter((p) =>
            Array.isArray(p.category)
              ? p.category.includes("Menú del Día")
              : p.category === "Menú del Día"
          ),
          refrescos: platos.filter((p) =>
            Array.isArray(p.category)
              ? p.category.includes("Bebida Menú")
              : p.category === "Bebida Menú"
          ),
        };
        renderView();
      });

      this.unsubscribeDailyMenuConfig = this.menuRepository.subscribeToDailyMenuConfig((config) => {
        configActual = config;
        renderView();
        
        // Reattach events if needed after render
        setTimeout(() => {
          const pdfBtn = document.getElementById("download-pdf-carta");
          if (pdfBtn) pdfBtn.onclick = handleDownloadPdf;

          const pdfBtnMobile = document.getElementById("download-pdf-carta-mobile");
          if (pdfBtnMobile) pdfBtnMobile.onclick = handleDownloadPdf;
        }, 100);
      });

    } finally {
      if (!silent) preloader.hide();
    }
  }
}
