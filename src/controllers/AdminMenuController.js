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

    async abrirPanelGestionCarta() {
        const searchInput = document.getElementById("search-product");
        if (searchInput) this.lastAdminSearch = searchInput.value;

        const [platosOriginales, categoriasReales] = await Promise.all([
            this.menuRepository.getAllFromFirestore(), 
            this.menuRepository.getCategoriesFromFirestore()
        ]);

        const manageView = new ManageCartaView(document.getElementById("app"));
        const acciones = {
            onBack: () => { this.lastAdminSearch = ""; this.navigateTo('#/'); },
            onAdd: async (data) => {
                const id = document.getElementById("edit-id").value;
                if (id) {
                    if (await this.menuRepository.updatePlato(id, data)) {
                        toast.success("Producto actualizado correctamente");
                        this.abrirPanelGestionCarta();
                    }
                } else {
                    if (await this.menuRepository.addPlato(data)) {
                        toast.success("Nuevo producto guardado");
                        this.abrirPanelGestionCarta();
                    }
                }
            },
            onDelete: async (id) => { 
                if (await this.menuRepository.deletePlato(id)) {
                    toast.success("Producto eliminado");
                    this.abrirPanelGestionCarta();
                }
            },
            onSearch: (q) => {
                this.lastAdminSearch = q;
                const query = q.toLowerCase().trim();
                const filtrados = platosOriginales.filter(p => {
                    const coincideNombre = p.name.toLowerCase().includes(query);
                    const categories = Array.isArray(p.category) ? p.category : [p.category];
                    return coincideNombre || categories.some(c => String(c).toLowerCase().includes(query));
                });
                const container = document.getElementById("table-container");
                if (container) { 
                  container.innerHTML = manageView.renderTableBody(filtrados); 
                  manageView.attachTableEvents(acciones.onEdit, acciones.onDelete); 
                }
            },
            onEdit: (id) => { 
                const p = platosOriginales.find(x => x.id === id); 
                if (p) {
                    manageView.prepareEdit(p);
                    // Asegurar que el scroll vaya al formulario
                    document.getElementById("form-editor-section").scrollIntoView({ behavior: "smooth", block: "center" });
                } 
            },
            onAddCategory: async (n, u, a) => { 
                if (await this.menuRepository.addCategory(n, u, a)) {
                    toast.success("Categoría añadida con éxito");
                    this.abrirPanelGestionCarta();
                }
            },
            onUpdateCategory: async (id, n, an, u, a) => { 
                if (await this.menuRepository.updateCategory(id, n, an, u, a)) {
                    toast.success("Categoría actualizada");
                    this.abrirPanelGestionCarta();
                }
            },
            onDeleteCategory: async (id) => { 
                if (await this.menuRepository.deleteCategory(id)) {
                    toast.success("Categoría eliminada");
                    this.abrirPanelGestionCarta(); 
                }
            },
            onReorderCategories: async (list) => { 
                if (await this.menuRepository.saveCategoriesOrder(list)) {
                    toast.success("Orden actualizado");
                    this.abrirPanelGestionCarta(); 
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

    async abrirPanelHeroPromo() {
        let d = null; 
        try { d = await this.menuRepository.getHeroPromo(); } catch (e) {}
        const v = new HeroPromoAdminView(document.getElementById("app"));
        v.render(d, {
            onSave: async (p) => { 
                if (await this.menuRepository.saveHeroPromo(p)) { 
                    toast.success("Banners guardados correctamente"); 
                }
            },
            onBack: () => this.navigateTo('#/')
        });
    }

    async abrirSelectorMenuEjecutivo(currentDailyMenu, onUpdateDailyMenu) {
        const opc = await this.menuRepository.getOpcionesParaAdmin();
        const av = new AdminMenuView(document.getElementById('app'));
        
        av.render(opc.segundos, opc.entradas, opc.refrescos, {
          onSave: async (n) => { 
              if (await this.menuRepository.saveDailyMenu(n)) { 
                  onUpdateDailyMenu(n);
                  toast.success("Menú actualizado"); 
              } 
          },
          onBack: () => this.navigateTo('#/')
        });

        const handleDownloadPdf = async () => {
            await this.pdfService.generarMenuDiarioPdf(currentDailyMenu);
        };

        const pdfBtn = document.getElementById("download-pdf-carta");
        if (pdfBtn) pdfBtn.onclick = handleDownloadPdf;

        const pdfBtnMobile = document.getElementById("download-pdf-carta-mobile");
        if (pdfBtnMobile) pdfBtnMobile.onclick = handleDownloadPdf;
    }
}
