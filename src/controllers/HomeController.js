import { CATEGORIAS_SOLO_MENU_DIARIO } from "../constants/menuCategories.js";
import { AdminMenuView } from "../views/AdminMenuView.js";
import { HeroPromoAdminView } from "../views/HeroPromoAdminView.js";
import { menuSeed, recetarioPlatos } from "../data/seed.js";
import { ManageCartaView } from "../views/ManageCartaView.js";
import { auth, googleProvider } from "../services/firebaseConfig.js";
import { signInWithPopup, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { PdfService } from "../services/PdfService.js";

export class HomeController {
  constructor({ homeView, menuView, menuRepository, restaurantInfo }) {
    this.homeView = homeView;
    this.menuView = menuView;
    this.menuRepository = menuRepository;
    this.restaurantInfo = restaurantInfo;
    this.activeCategory = "Inicio";
    this.currentUser = null;
    this.currentDailyMenu = { entradas: ["Sopa"], segundos: ["Chifa"], refrescos: ["Chicha"] };
    
    // Estado persistente para el buscador de admin
    this.lastAdminSearch = "";
  }

  async initialize() {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const admins = ["beeker147@gmail.com", "mjeanfranco22@gmail.com" , "aliciamattoslimaymanta@gmail.com"];
        this.currentUser = {
          name: user.displayName.split(' ')[0],
          email: user.email.toLowerCase().trim(),
          role: admins.includes(user.email.toLowerCase().trim()) ? "admin" : "client"
        };
      } else { this.currentUser = null; }
      this.renderAll();
    });
  }

  async abrirPanelGestionCarta() {
    // 1. Guardar el valor actual del buscador antes de recargar
    const searchInput = document.getElementById("search-product");
    if (searchInput) {
        this.lastAdminSearch = searchInput.value;
    }

    const [platosOriginales, categoriasReales] = await Promise.all([
        this.menuRepository.getAllFromFirestore(),
        this.menuRepository.getCategoriesFromFirestore(),
    ]);

    const manageView = new ManageCartaView(document.getElementById("app"));
    const acciones = {
        onBack: () => {
            this.lastAdminSearch = ""; // Limpiar al salir
            this.initialize();
        },
        onAdd: async (data) => {
            const id = document.getElementById("edit-id").value;
            if (id ? await this.menuRepository.updatePlato(id, data) : await this.menuRepository.addPlato(data)) {
                this.abrirPanelGestionCarta();
            }
        },
        onDelete: async (id) => { 
            if (await this.menuRepository.deletePlato(id)) {
                this.abrirPanelGestionCarta();
            }
        },
        onSearch: (q) => {
            this.lastAdminSearch = q; // Actualizar estado persistente
            const query = q.toLowerCase().trim();
            const filtrados = platosOriginales.filter(p => {
                const coincideNombre = p.name.toLowerCase().includes(query);
                const categories = Array.isArray(p.category) ? p.category : [p.category];
                const coincideCategoria = categories.some(c => String(c).toLowerCase().includes(query));
                return coincideNombre || coincideCategoria;
            });
            
            const container = document.getElementById("table-container");
            if (container) { 
              container.innerHTML = manageView.renderTableBody(filtrados); 
              manageView.attachTableEvents(acciones.onEdit, acciones.onDelete); 
            }
        },
        onEdit: (id) => { const p = platosOriginales.find(x => x.id === id); if (p) manageView.prepareEdit(p); },
        onAddCategory: async (n, u, a) => { if (await this.menuRepository.addCategory(n, u, a)) this.abrirPanelGestionCarta(); },
        onUpdateCategory: async (id, n, an, u, a) => { if (await this.menuRepository.updateCategory(id, n, an, u, a)) this.abrirPanelGestionCarta(); },
        onDeleteCategory: async (id) => { if (await this.menuRepository.deleteCategory(id)) this.abrirPanelGestionCarta(); },
        onReorderCategories: async (list) => { if (await this.menuRepository.saveCategoriesOrder(list)) this.abrirPanelGestionCarta(); }
    };

    manageView.render(platosOriginales, categoriasReales, acciones);

    // 2. RESTAURAR EL VALOR Y EL FILTRADO
    if (this.lastAdminSearch) {
        const newSearchInput = document.getElementById("search-product");
        if (newSearchInput) {
            newSearchInput.value = this.lastAdminSearch;
            acciones.onSearch(this.lastAdminSearch);
        }
    }
  }

  async renderAll() {
    await this.menuRepository.loadAllPlatos();
    let daily = null, hero = null;
    try { [daily, hero] = await Promise.all([this.menuRepository.getDailyMenuConfig(), this.menuRepository.getHeroPromo()]); } catch (e) {}
    if (daily) this.currentDailyMenu = daily;

    this.homeView.renderShell(this.restaurantInfo, this.currentUser, this.currentDailyMenu, hero);
    this.homeView.initSwiper();
    this.menuView.filterContainer = document.getElementById("menu-filters");
    this.menuView.gridContainer = document.getElementById("menu-grid");

    const mNav = document.getElementById("mobile-nav-panel"), uMenu = document.getElementById("user-menu-panel");
    const navBtn = document.getElementById("mobile-nav-toggle");
    if (navBtn) {
        navBtn.onclick = () => mNav.classList.remove("hidden");
        mNav.querySelector(".close-nav").onclick = () => mNav.classList.add("hidden");
    }
    const uBtn = document.getElementById("user-menu-toggle");
    if (uBtn) { uBtn.onclick = () => uMenu.classList.remove("hidden"); uMenu.querySelector(".close-user-menu").onclick = () => uMenu.classList.add("hidden"); }

    const setup = (id, cb) => { const b = document.getElementById(id); if (b) b.onclick = () => { uMenu.classList.add("hidden"); cb(); }};
    setup("admin-daily-menu-btn", () => this.abrirSelectorMenuEjecutivo());
    setup("admin-manage-carta-btn", () => this.abrirPanelGestionCarta());
    setup("admin-hero-promo-btn", () => this.abrirPanelHeroPromo());

    const lBtn = document.getElementById("login-btn-panel"); if (lBtn) lBtn.onclick = () => signInWithPopup(auth, googleProvider);
    const loBtn = document.getElementById("logout-btn"); if (loBtn) loBtn.onclick = () => signOut(auth);

    if (this.menuView.filterContainer) await this.renderMenu();
  }

  async abrirPanelHeroPromo() {
    let d = null; try { d = await this.menuRepository.getHeroPromo(); } catch (e) {}
    const v = new HeroPromoAdminView(document.getElementById("app"));
    v.render(d, async (p) => { if (await this.menuRepository.saveHeroPromo(p)) { await this.renderAll(); alert("Banners guardados"); }}, () => this.renderAll());
  }

  async abrirSelectorMenuEjecutivo() {
    const pdf = new PdfService(this.restaurantInfo), opc = await this.menuRepository.getOpcionesParaAdmin(), av = new AdminMenuView(document.getElementById('app'));
    av.render(opc.segundos, opc.entradas, opc.refrescos, async (n) => { if (await this.menuRepository.saveDailyMenu(n)) { this.currentDailyMenu = n; await this.renderAll(); alert("Actualizado"); }});
    document.getElementById("download-pdf-a3").onclick = async () => await pdf.generarMenuA2(this.currentDailyMenu, await this.menuRepository.loadAllPlatos());
  }

  async renderMenu() {
    const dbCats = await this.menuRepository.getCategoriesFromFirestore();
    const activeCats = dbCats.filter(c => !CATEGORIAS_SOLO_MENU_DIARIO.includes(c.nombre) && c.activo !== false);

    if (this.activeCategory === "Inicio") {
        this.menuView.renderCategoryGrid(activeCats, (cat) => {
            this.activeCategory = cat;
            this.renderMenu();
            document.getElementById("menu")?.scrollIntoView({ behavior: 'smooth' });
        });
    } else {
        const items = this.menuRepository.getByCategory(this.activeCategory);
        this.menuView.renderCategoryDetail(this.activeCategory, items, () => {
            this.activeCategory = "Inicio";
            this.renderMenu();
        });
    }
  }
}
