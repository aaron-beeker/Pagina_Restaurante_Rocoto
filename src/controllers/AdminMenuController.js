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
    }

    async abrirGestionCarta(silent = false) {
        if (!silent) preloader.show("Cargando Carta...");
        try {
            const searchInput = document.getElementById("search-product");
            if (searchInput) this.lastAdminSearch = searchInput.value;

            const [platosOriginales, categoriasReales] = await Promise.all([
                this.menuRepository.loadAllPlatos(), 
                this.menuRepository.getCategoriesFromFirestore()
            ]);

            const manageView = new ManageCartaView(document.getElementById("admin-layer"));
            const acciones = {
                onBack: () => { 
                    this.lastAdminSearch = ""; 
                    this.navigateTo('#/');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                },
                onAdd: async (data) => {
                    try {
                        const id = document.getElementById("edit-id").value;
                        if (id) {
                            if (await this.menuRepository.updatePlato(id, data)) {
                                toast.success("Producto actualizado correctamente");
                                await this.abrirGestionCarta(true);
                                document.getElementById("form-editor-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
                            }
                        } else {
                            if (await this.menuRepository.addPlato(data)) {
                                toast.success("Nuevo producto guardado");
                                await this.abrirGestionCarta(true);
                                document.getElementById("form-editor-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
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
                            await this.abrirGestionCarta(true);
                            document.getElementById("form-editor-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
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
                    const p = platosOriginales.find(x => x.id === id); 
                    if (p) {
                        manageView.prepareEdit(p);
                    } 
                },
                onAddCategory: async (n, u, a) => { 
                    try {
                        if (await this.menuRepository.addCategory(n, u, a)) {
                            toast.success("Categoría añadida con éxito");
                            this.abrirGestionCarta(true);
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
                            this.abrirGestionCarta(true);
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
                            this.abrirGestionCarta(true); 
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
                            this.abrirGestionCarta(true); 
                        }
                    } catch (error) {
                        console.error("Error al reordenar:", error);
                        toast.error("Error al reordenar");
                    }
                }
            };

            manageView.render(platosOriginales, categoriasReales, acciones);

            if (this.lastAdminSearch) {
                const newSearchInput = document.getElementById("search-product");
                if (newSearchInput) { 
                    newSearchInput.value = this.lastAdminSearch; 
                    acciones.onSearch(this.lastAdminSearch); 
                }
            }
        } finally {
            if (!silent) preloader.hide();
        }
    }

    async abrirGestionHero(onUpdateHero, silent = false) {
        if (!silent) preloader.show("Cargando Banner...");
        try {
            let d = null; 
            try { d = await this.menuRepository.getHeroPromo(); } catch (e) {}
            const v = new HeroPromoAdminView(document.getElementById("admin-layer"));
            v.render(d, {
                onSave: async (p) => { 
                    try {
                        if (await this.menuRepository.saveHeroPromo(p)) { 
                            if (onUpdateHero) onUpdateHero(p);
                            toast.success("Banners guardados correctamente"); 
                            await this.abrirGestionHero(onUpdateHero, true); 
                        }
                    } catch (error) {
                        console.error("Error al guardar banners:", error);
                        toast.error("Error al guardar los banners");
                    }
                },
                onBack: () => {
                    this.navigateTo('#/');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            });
        } finally {
            if (!silent) preloader.hide();
        }
    }

    async abrirGestionMenuDiario(currentDailyMenu, onUpdateDailyMenu, silent = false) {
        if (!silent) preloader.show("Cargando Menú del Día...");
        try {
            const [opc, configActual] = await Promise.all([
                this.menuRepository.getOpcionesParaAdmin(),
                this.menuRepository.getDailyMenuConfig()
            ]);
            const av = new AdminMenuView(document.getElementById("admin-layer"));

            // Marcar seleccionados según la config actual para que el admin vea qué está activo
            const marcarSeleccionados = (lista, seleccionados) => {
                return lista.map(p => ({ ...p, selected: (seleccionados || []).includes(p.name) }));
            };

            const entradas = marcarSeleccionados(opc.entradas, configActual?.entradas);
            const segundos = marcarSeleccionados(opc.segundos, configActual?.segundos);
            const refrescos = marcarSeleccionados(opc.refrescos, configActual?.refrescos);

            av.render(segundos, entradas, refrescos, {
              onSave: async (n) => { 
                  try {
                      if (await this.menuRepository.saveDailyMenu({ ...configActual, ...n })) { 
                          if (onUpdateDailyMenu) onUpdateDailyMenu(n);
                          toast.success("El menú público ha sido actualizado correctamente.", 3000);
                          document.getElementById("admin-menu-form")?.reset();
                          await this.abrirGestionMenuDiario(n, onUpdateDailyMenu, true);
                          const adminLayer = document.getElementById("admin-layer");
                          if (adminLayer) adminLayer.scrollTo({ top: 0, behavior: 'smooth' });
                      } else {
                          toast.error("Error al intentar guardar el menú");
                      }
                  } catch (error) {
                      console.error("Error al guardar menú diario:", error);
                      toast.error("Error al guardar el menú");
                  }
              },
              onBack: () => {
                  this.navigateTo('#/');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
              },
              onToggleVisibility: async (activo) => {
                  try {
                      if (await this.menuRepository.saveDailyMenuVisibility(activo)) {
                          const updatedConfig = { ...configActual, activo };
                          if (onUpdateDailyMenu) onUpdateDailyMenu(updatedConfig);
                          toast.success(activo ? "Menú activado en la web" : "Menú ocultado de la web");
                          this.abrirGestionMenuDiario(updatedConfig, onUpdateDailyMenu, true);
                      }
                  } catch (error) {
                      console.error("Error al cambiar visibilidad:", error);
                      toast.error("Error al actualizar visibilidad");
                  }
              }
            }, configActual?.activo);

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

            const pdfBtn = document.getElementById("download-pdf-carta");
            if (pdfBtn) pdfBtn.onclick = handleDownloadPdf;

            const pdfBtnMobile = document.getElementById("download-pdf-carta-mobile");
            if (pdfBtnMobile) pdfBtnMobile.onclick = handleDownloadPdf;
        } finally {
            if (!silent) preloader.hide();
        }
    }
}
