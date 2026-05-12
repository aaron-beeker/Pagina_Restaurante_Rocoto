import { AdminMenuView } from "../views/AdminMenuView.js";
import { HeroPromoAdminView } from "../views/HeroPromoAdminView.js";
import { ManageCartaView } from "../views/ManageCartaView.js";
import { toast, dialog } from "../utils/notifications.js";

export class AdminMenuController {
    constructor(dependencies) {
        this.menuRepository = dependencies.menuRepository;
        this.pdfService = dependencies.pdfService;
        this.navigateTo = dependencies.navigateTo;
        
        // Estado persistente (recibido o manejado localmente)
        this.lastAdminSearch = "";
    }

    async abrirGestionCarta() {
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
            },
            onDelete: async (id) => { 
                if (await this.menuRepository.deletePlato(id)) {
                    toast.success("Producto eliminado");
                    await this.abrirGestionCarta();
                    document.getElementById("form-editor-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
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
                if (await this.menuRepository.addCategory(n, u, a)) {
                    toast.success("Categoría añadida con éxito");
                    this.abrirGestionCarta();
                }
            },
            onUpdateCategory: async (id, n, an, u, a) => { 
                if (await this.menuRepository.updateCategory(id, n, an, u, a)) {
                    toast.success("Categoría actualizada");
                    this.abrirGestionCarta();
                }
            },
            onDeleteCategory: async (id) => { 
                if (await this.menuRepository.deleteCategory(id)) {
                    toast.success("Categoría eliminada");
                    this.abrirGestionCarta(); 
                }
            },
            onReorderCategories: async (list) => { 
                if (await this.menuRepository.saveCategoriesOrder(list)) {
                    toast.success("Orden actualizado");
                    this.abrirGestionCarta(); 
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
    }

    async abrirGestionHero(onUpdateHero) {
        let d = null; 
        try { d = await this.menuRepository.getHeroPromo(); } catch (e) {}
        const v = new HeroPromoAdminView(document.getElementById("admin-layer"));
        v.render(d, {
            onSave: async (p) => { 
                if (await this.menuRepository.saveHeroPromo(p)) { 
                    if (onUpdateHero) onUpdateHero(p);
                    toast.success("Banners guardados correctamente"); 
                    await this.abrirGestionHero(onUpdateHero); // Refrescar vista completa
                }
            },
            onBack: () => {
                this.navigateTo('#/');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }
async abrirGestionMenuDiario(currentDailyMenu, onUpdateDailyMenu) {
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
      },
      onBack: () => {
          this.navigateTo('#/');
          window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      onToggleVisibility: async (activo) => {
          if (await this.menuRepository.saveDailyMenuVisibility(activo)) {
              const updatedConfig = { ...configActual, activo };
              if (onUpdateDailyMenu) onUpdateDailyMenu(updatedConfig);
              toast.success(activo ? "Menú activado en la web" : "Menú ocultado de la web");
              this.abrirGestionMenuDiario(updatedConfig, onUpdateDailyMenu);
          }
      }
    }, configActual?.activo);        const handleDownloadPdf = async () => {
            if (currentDailyMenu) {
                await this.pdfService.generarMenuDiarioPdf(currentDailyMenu);
            } else {
                const daily = await this.menuRepository.getDailyMenuConfig();
                await this.pdfService.generarMenuDiarioPdf(daily);
            }
        };

        const pdfBtn = document.getElementById("download-pdf-carta");
        if (pdfBtn) pdfBtn.onclick = handleDownloadPdf;

        const pdfBtnMobile = document.getElementById("download-pdf-carta-mobile");
        if (pdfBtnMobile) pdfBtnMobile.onclick = handleDownloadPdf;
    }
}
