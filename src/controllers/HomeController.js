import { CATEGORIAS_SOLO_MENU_DIARIO } from "../constants/menuCategories.js";
import { AdminMenuView } from "../views/AdminMenuView.js";
import { HeroPromoAdminView } from "../views/HeroPromoAdminView.js";
import { menuSeed, recetarioPlatos, opcionesEntradas, opcionesRefrescos } from "../data/seed.js";
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
    this.activeCategory = "Todos";
    
    // Definimos el usuario y el menú inicial
    this.currentUser = { name: "BEEKER AARÓN", role: "admin" };
    this.currentDailyMenu = {
      entradas: ["Sopa del día"],
      segundos: ["Estofado de pollo"],
      refrescos: ["Chicha morada"]
    };
  }

  async initialize() {
    // Escuchamos si alguien inicia o cierra sesión
    onAuthStateChanged(auth, async (user) => {
      
      if (user) {
        // IMPORTANTE: Pon aquí tu correo real para que aparezca el botón de admin
        const admins = ["beeker147@gmail.com", "mjeanfranco22@gmail.com"];
        
        this.currentUser = {
          name: user.displayName.split(' ')[0], // Solo tu primer nombre
          email: user.email.toLowerCase().trim(),
          // Verificamos si el correo del usuario está en nuestra lista de admins
          role: admins.includes(user.email.toLowerCase().trim()) ? "admin" : "client"
        };
        console.log("Rol asignado:", this.currentUser.role); // Revisa esto en la consola F12
      } else {
        this.currentUser = null;
      }
      this.renderAll(); // Método para refrescar toda la web
    });
  }


  async abrirPanelGestionCarta() {
    const [platosOriginales, categoriasReales] = await Promise.all([
      this.menuRepository.getAllFromFirestore(),
      this.menuRepository.getCategoriesFromFirestore(),
    ]);

    const manageView = new ManageCartaView(document.getElementById("app"));
    const acciones = {
      onBack: () => this.initialize(),

      onAdd: async (platoData) => {
        const editId = document.getElementById("edit-id").value;
        let exito;
        if (editId) {
          exito = await this.menuRepository.updatePlato(editId, platoData);
        } else {
          exito = await this.menuRepository.addPlato(platoData);
        }
        if (exito) {
          alert(editId ? "Producto actualizado." : "Producto añadido.");
          document.getElementById("edit-id").value = "";
          this.abrirPanelGestionCarta();
        } else {
          alert("Error al procesar la solicitud.");
        }
      },

      onDelete: async (id) => {
        if (confirm("¿Eliminar este producto?")) {
          const exito = await this.menuRepository.deletePlato(id);
          if (exito) {
            alert("Eliminado.");
            this.abrirPanelGestionCarta();
          }
        }
      },

      onSearch: (query) => {
        const q = query.toLowerCase().trim();
        const filtrados = platosOriginales.filter((p) => {
          const coincideNombre = p.name.toLowerCase().includes(q);
          const coincideCategoria = Array.isArray(p.category)
            ? p.category.some((cat) => cat.toLowerCase().includes(q))
            : p.category && String(p.category).toLowerCase().includes(q);
          return coincideNombre || coincideCategoria;
        });

        const container = document.getElementById("table-container");
        if (container) {
          container.innerHTML = manageView.renderTableBody(filtrados);
          manageView.attachTableEvents(acciones.onEdit, acciones.onDelete);
        }
      },

      onEdit: (id) => {
        const plato = platosOriginales.find((p) => p.id === id);
        if (plato) manageView.prepareEdit(plato);
      },

      onAddCategory: async (nombre) => {
        const exito = await this.menuRepository.addCategory(nombre);
        if (exito) this.abrirPanelGestionCarta();
      },

      onDeleteCategory: async (id) => {
        const exito = await this.menuRepository.deleteCategory(id);
        if (exito) this.abrirPanelGestionCarta();
      },
    };

    manageView.render(platosOriginales, categoriasReales, acciones);
  }

  async renderAll() {
    await this.menuRepository.loadAllPlatos();
    let dailyMenuFromDB = null;
    let heroPromo = null;
    try {
      [dailyMenuFromDB, heroPromo] = await Promise.all([
        this.menuRepository.getDailyMenuConfig(),
        this.menuRepository.getHeroPromo(),
      ]);
    } catch (e) {
      console.error("Error cargando configuración:", e);
    }

    if (dailyMenuFromDB) {
      this.currentDailyMenu = dailyMenuFromDB;
    }

    this.homeView.renderShell(this.restaurantInfo, this.currentUser, this.currentDailyMenu, heroPromo);

    const mobileNavToggle = document.getElementById("mobile-nav-toggle");
    const mobileNavPanel = document.getElementById("mobile-nav-panel");
    if (mobileNavToggle && mobileNavPanel) {
      const setOpen = (open) => {
        mobileNavPanel.classList.toggle("hidden", !open);
        mobileNavToggle.setAttribute("aria-expanded", open ? "true" : "false");
        mobileNavToggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
      };
      mobileNavToggle.onclick = () => setOpen(mobileNavPanel.classList.contains("hidden"));
      mobileNavPanel.querySelectorAll(".mobile-nav-link").forEach((link) => {
        link.addEventListener("click", () => setOpen(false));
      });
    }

    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
      logoutBtn.onclick = async () => {
        try {
          await signOut(auth);
          console.log("Sesión cerrada correctamente");
        } catch (error) {
          console.error("Error al cerrar sesión:", error);
        }
      };
    }

    const adminDailyBtn = document.getElementById("admin-daily-menu-btn");
    if (adminDailyBtn) {
      adminDailyBtn.onclick = () => this.abrirSelectorMenuEjecutivo();
    }


    const loginBtn = document.getElementById("login-btn");
    if (loginBtn) {
      loginBtn.onclick = async () => {
        try {
          await signInWithPopup(auth, googleProvider);
        } catch (error) {
          console.error("Error al loguear:", error);
        }
      };
    }
  
    const adminManageCartaBtn = document.getElementById("admin-manage-carta-btn");
    if (adminManageCartaBtn) {
      adminManageCartaBtn.onclick = () => this.abrirPanelGestionCarta();
    }

    const adminHeroPromoBtn = document.getElementById("admin-hero-promo-btn");
    if (adminHeroPromoBtn) {
      adminHeroPromoBtn.onclick = () => this.abrirPanelHeroPromo();
    }

    this.menuView.filterContainer = document.getElementById("menu-filters");
    this.menuView.gridContainer = document.getElementById("menu-grid");
    await this.renderMenu();
  }

  renderAdminControls() {
    const heroActions = document.querySelector("#hero .flex");
    if (heroActions) {
      const adminBtn = document.createElement("button");
      adminBtn.className = "rounded-full bg-primary px-8 py-4 text-center font-button text-white shadow-lg transition-all hover:bg-green-800 active:scale-95 flex items-center gap-2";
      adminBtn.innerHTML = `Actualizar Menú Ejecutivo`;
      adminBtn.onclick = () => this.abrirSelectorMenuEjecutivo();
      heroActions.prepend(adminBtn);
    }
  }

  async abrirPanelHeroPromo() {
    let data = null;
    try {
      data = await this.menuRepository.getHeroPromo();
    } catch (e) {
      console.error(e);
    }
    const view = new HeroPromoAdminView(document.getElementById("app"));
    view.render(
      data,
      async (payload) => {
        const ok = await this.menuRepository.saveHeroPromo(payload);
        if (ok) {
          await this.renderAll();
          alert("Promoción del inicio guardada.");
        } else {
          alert("No se pudo guardar. Revisa la consola y los permisos de Firestore.");
        }
      },
      () => {
        void this.renderAll();
      },
    );
  }

  async abrirSelectorMenuEjecutivo() {
      const pdfService = new PdfService(this.restaurantInfo);
      const opciones = await this.menuRepository.getOpcionesParaAdmin();
      const adminView = new AdminMenuView(document.getElementById('app'));
      
      // Le pasamos las listas completas de objetos (entradas, segundos, refrescos)
      adminView.render(
          opciones.segundos, 
          opciones.entradas, 
          opciones.refrescos, 
          async (nuevaConfig) => {
              const exito = await this.menuRepository.saveDailyMenu(nuevaConfig);
              if (exito) {
                  this.currentDailyMenu = nuevaConfig;
                  await this.renderAll();
                  alert("Menú actualizado");
              }
          }
      );

      document.getElementById("download-pdf-a3").onclick = async () => {
        const btn = document.getElementById("download-pdf-a3");
        btn.textContent = "Generando PDF...";
        btn.disabled = true;
    
        const allPlatos = await this.menuRepository.loadAllPlatos();
        await pdfService.generarMenuA2(this.currentDailyMenu, allPlatos);
    
        btn.textContent = "Descargar Carta PDF (Tamaño A2)";
        btn.disabled = false;
    };


  }

  

  async renderMenu() {
    const items = this.menuRepository.getByCategory(this.activeCategory);
    const categoriasDB = await this.menuRepository.getCategoriesFromFirestore();
    const nombresCategorias = [
      "Todos",
      ...categoriasDB.map((c) => c.nombre).filter((nombre) => !CATEGORIAS_SOLO_MENU_DIARIO.includes(nombre)),
    ];

    this.menuView.renderFilters(nombresCategorias, this.activeCategory, (cat) => {
      this.activeCategory = cat;
      this.renderMenu();
    });

    this.menuView.renderItems(items);
  }
}
