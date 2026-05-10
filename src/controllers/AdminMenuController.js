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
            this.menuRepository.getAllFromFirestore(), 
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
                        this.abrirGestionCarta();
                    }
                } else {
                    if (await this.menuRepository.addPlato(data)) {
                        toast.success("Nuevo producto guardado");
                        this.abrirGestionCarta();
                    }
                }
            },
            onDelete: async (id) => { 
                if (await this.menuRepository.deletePlato(id)) {
                    toast.success("Producto eliminado");
                    this.abrirGestionCarta();
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

    async abrirGestionHero() {
        let d = null; 
        try { d = await this.menuRepository.getHeroPromo(); } catch (e) {}
        const v = new HeroPromoAdminView(document.getElementById("admin-layer"));
        v.render(d, {
            onSave: async (p) => { 
                if (await this.menuRepository.saveHeroPromo(p)) { 
                    toast.success("Banners guardados correctamente"); 
                }
            },
            onBack: () => {
                this.navigateTo('#/');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }

    async abrirGestionMenuDiario(currentDailyMenu, onUpdateDailyMenu) {
        // Si no se pasan argumentos, intentamos obtener el estado actual (opcional pero recomendado)
        const opc = await this.menuRepository.getOpcionesParaAdmin();
        const av = new AdminMenuView(document.getElementById("admin-layer"));
        
        av.render(opc.segundos, opc.entradas, opc.refrescos, {
          onSave: async (n) => { 
              if (await this.menuRepository.saveDailyMenu(n)) { 
                  if (onUpdateDailyMenu) onUpdateDailyMenu(n);
                  toast.success("Menú actualizado"); 
              } 
          },
          onBack: () => {
              this.navigateTo('#/');
              window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        });

        const handleDownloadPdf = async () => {
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
