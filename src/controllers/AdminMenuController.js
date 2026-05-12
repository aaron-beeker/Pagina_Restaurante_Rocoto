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

    async abrirGestionCarta() {
        preloader.show("Cargando Carta...");
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
                    preloader.show("Guardando...");
                    try {
                        const id = document.getElementById("edit-id").value;
                        if (id) {
                            if (await this.menuRepository.updatePlato(id, data)) {
                                toast.success("Producto actualizado correctamente");
                                await this.abrirGestionCarta();
                                document.getElementById("form-editor-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
                            }
                        } else {
                            if (await this.menuRepository.addPlato(data)) {
                                toast.success("Nuevo producto guardado");
                                await this.abrirGestionCarta();
                                document.getElementById("form-editor-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
                            }
                        }
                    } finally {
                        preloader.hide();
                    }
                },
                onDelete: async (id) => { 
                    preloader.show("Eliminando...");
                    try {
                        if (await this.menuRepository.deletePlato(id)) {
                            toast.success("Producto eliminado");
                            await this.abrirGestionCarta();
                            document.getElementById("form-editor-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
                        }
                    } finally {
                        preloader.hide();
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
                    preloader.show("Añadiendo categoría...");
                    try {
                        if (await this.menuRepository.addCategory(n, u, a)) {
                            toast.success("Categoría añadida con éxito");
                            this.abrirGestionCarta();
                        }
                    } finally {
                        preloader.hide();
                    }
                },
                onUpdateCategory: async (id, n, an, u, a) => { 
                    preloader.show("Actualizando categoría...");
                    try {
                        if (await this.menuRepository.updateCategory(id, n, an, u, a)) {
                            toast.success("Categoría actualizada");
                            this.abrirGestionCarta();
                        }
                    } finally {
                        preloader.hide();
                    }
                },
                onDeleteCategory: async (id) => { 
                    preloader.show("Eliminando categoría...");
                    try {
                        if (await this.menuRepository.deleteCategory(id)) {
                            toast.success("Categoría eliminada");
                            this.abrirGestionCarta(); 
                        }
                    } finally {
                        preloader.hide();
                    }
                },
                onReorderCategories: async (list) => { 
                    preloader.show("Reordenando...");
                    try {
                        if (await this.menuRepository.saveCategoriesOrder(list)) {
                            toast.success("Orden actualizado");
                            this.abrirGestionCarta(); 
                        }
                    } finally {
                        preloader.hide();
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
            preloader.hide();
        }
    }

    async abrirGestionHero(onUpdateHero) {
        preloader.show("Cargando Banner...");
        try {
            let d = null; 
            try { d = await this.menuRepository.getHeroPromo(); } catch (e) {}
            const v = new HeroPromoAdminView(document.getElementById("admin-layer"));
            v.render(d, {
                onSave: async (p) => { 
                    preloader.show("Guardando Banners...");
                    try {
                        if (await this.menuRepository.saveHeroPromo(p)) { 
                            if (onUpdateHero) onUpdateHero(p);
                            toast.success("Banners guardados correctamente"); 
                            await this.abrirGestionHero(onUpdateHero); // Refrescar vista completa
                        }
                    } finally {
                        preloader.hide();
                    }
                },
                onBack: () => {
                    this.navigateTo('#/');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            });
        } finally {
            preloader.hide();
        }
    }

    async abrirGestionMenuDiario(currentDailyMenu, onUpdateDailyMenu) {
        preloader.show("Cargando Menú del Día...");
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
                  preloader.show("Actualizando Menú Público...");
                  try {
                      if (await this.menuRepository.saveDailyMenu({ ...configActual, ...n })) { 
                          if (onUpdateDailyMenu) onUpdateDailyMenu(n);
                          toast.success("El menú público ha sido actualizado correctamente.", 3000);
                          document.getElementById("admin-menu-form")?.reset();
                          await this.abrirGestionMenuDiario(n, onUpdateDailyMenu);
                          const adminLayer = document.getElementById("admin-layer");
                          if (adminLayer) adminLayer.scrollTo({ top: 0, behavior: 'smooth' });
                      } else {
                          toast.error("Error al intentar guardar el menú");
                      }
                  } finally {
                      preloader.hide();
                  }
              },
              onBack: () => {
                  this.navigateTo('#/');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
              },
              onToggleVisibility: async (activo) => {
                  preloader.show(activo ? "Activando menú..." : "Ocultando menú...");
                  try {
                      if (await this.menuRepository.saveDailyMenuVisibility(activo)) {
                          const updatedConfig = { ...configActual, activo };
                          if (onUpdateDailyMenu) onUpdateDailyMenu(updatedConfig);
                          toast.success(activo ? "Menú activado en la web" : "Menú ocultado de la web");
                          this.abrirGestionMenuDiario(updatedConfig, onUpdateDailyMenu);
                      }
                  } finally {
                      preloader.hide();
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
            preloader.hide();
        }
    }
}
