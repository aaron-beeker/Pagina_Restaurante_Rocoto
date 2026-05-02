// src/controllers/HomeController.js
import { AdminMenuView } from "../views/AdminMenuView.js";
import { menuSeed, recetarioPlatos, opcionesEntradas, opcionesRefrescos } from "../data/seed.js";

import { auth, googleProvider } from "../services/firebaseConfig.js";
import { signInWithPopup, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import { signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";


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
        const admins = ["beeker147@gmail.com", "nuevo-admin@gmail.com"];
        
        this.currentUser = {
          name: user.displayName.split(' ')[0], // Solo tu primer nombre
          email: user.email,
          
          // Verificamos si el correo del usuario está en nuestra lista de admins
          role: admins.includes(user.email) ? "admin" : "client"
        };
      } else {
        this.currentUser = null;
      }
      this.renderAll(); // Método para refrescar toda la web
    });
  }


  async renderAll() {
    await this.menuRepository.loadAllPlatos();
    const dailyMenu = await this.menuRepository.getDailyMenuConfig();
    
    this.homeView.renderShell(this.restaurantInfo, this.currentUser, dailyMenu || this.currentDailyMenu);
    
      // Lógica para el botón de SALIR
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
      logoutBtn.onclick = async () => {
        try {
          await signOut(auth);
          console.log("Sesión cerrada correctamente");
          // No necesitas hacer nada más, onAuthStateChanged detectará la salida y refrescará la UI
        } catch (error) {
          console.error("Error al cerrar sesión:", error);
        }
      };
    }


    // Conectar botón de login
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
  
    

    if (this.currentUser?.role === "admin") {
      this.renderAdminControls();
    }
  
    this.menuView.filterContainer = document.getElementById("menu-filters");
    this.menuView.gridContainer = document.getElementById("menu-grid");
    this.renderMenu();
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

  abrirSelectorMenuEjecutivo() {
    const adminView = new AdminMenuView(document.getElementById('app'));
    
    adminView.render(recetarioPlatos, opcionesEntradas, opcionesRefrescos, async (nuevaConfig) => {
      // 1. Intentamos guardar en Firebase
      const exito = await this.menuRepository.saveDailyMenu(nuevaConfig);
      
      if (exito) {
        // 2. Actualizamos la memoria local
        this.currentDailyMenu = nuevaConfig;
        // 3. Reiniciamos para mostrar los cambios
        await this.initialize(); 
        window.scrollTo(0, 0);
        alert("¡El menú de hoy se ha publicado correctamente!");
      } else {
        alert("Hubo un error al conectar con la base de datos.");
      }
    });
  
    const backBtn = document.getElementById('back-to-home');
    if(backBtn) backBtn.onclick = () => this.initialize();
  }

  

  renderMenu() {
    let items = this.menuRepository.getByCategory(this.activeCategory);
    if (this.activeCategory === "Todos" || this.activeCategory === "Menú del Día") {
      const platosElegidosAdmin = this.currentDailyMenu.segundos.map(nombre => {
        const datosPlato = recetarioPlatos.find(p => p.name === nombre);
        const finalImageUrl = (datosPlato && datosPlato.imageUrl && datosPlato.imageUrl !== "URL_IMAGEN") 
      ? datosPlato.imageUrl 
      : "https://images.unsplash.com/photo-1512058564366-18510be2db19?q=80&w=1200";
        return {
          id: `daily-${nombre.toLowerCase().replace(/\s+/g, '-')}`,
          name: nombre,
          description: datosPlato ? datosPlato.description : `Menú completo con entrada y bebida.`,
          category: "Menú del Día",
          price: 8.00,
          tags: ["MENÚ DEL DÍA", "RECOMENDADO"],
          imageUrl: finalImageUrl
        };
      });

      if (this.activeCategory === "Menú del Día") {
        items = platosElegidosAdmin;
      } else {
        items = [...platosElegidosAdmin, ...items];
      }
    }

    this.menuView.renderFilters(this.menuRepository.getCategories(), this.activeCategory, (cat) => {
      this.activeCategory = cat;
      this.renderMenu();
    });
    this.menuView.renderItems(items);
  }
}
