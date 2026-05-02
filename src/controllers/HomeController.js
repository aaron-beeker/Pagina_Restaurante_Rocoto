// src/controllers/HomeController.js
import { AdminMenuView } from "../views/AdminMenuView.js";
import { menuSeed, recetarioPlatos, opcionesEntradas, opcionesRefrescos } from "../data/seed.js";
import { ManageCartaView } from "../views/ManageCartaView.js";
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


  // src/controllers/HomeController.js

  async abrirPanelGestionCarta() {
      // 1. Carga de datos en paralelo (Platos y Categorías reales de Firebase)
      const [platosOriginales, categoriasReales] = await Promise.all([
        this.menuRepository.getAllFromFirestore(),
        this.menuRepository.getCategoriesFromFirestore()
    ]);
      
      const manageView = new ManageCartaView(document.getElementById('app'));
      // OBJETO DE ACCIONES
      const acciones = {
          onBack: () => this.initialize(),

          // --- ACCIONES DE PLATOS ---
          onAdd: async (platoData) => {
              const editId = document.getElementById('edit-id').value;
              let exito;
              if (editId) {
                  // Modo Edición
                  exito = await this.menuRepository.updatePlato(editId, platoData);
              }else{
                  // Modo Nuevo
                  exito = await this.menuRepository.addPlato(platoData);
              }
              if (exito) {
                  alert(editId ? "¡Plato actualizado!" : "¡Plato añadido!");
                  // Limpiamos el ID de edición por si acaso
                  document.getElementById('edit-id').value = "";
                  // Recargamos el panel para ver los cambios
                  this.abrirPanelGestionCarta();
              } else {
                  alert("Error al procesar la solicitud.");
              }
          },
          onDelete: async (id) => {
              if (confirm("¿Eliminar plato?")) {
                  const exito = await this.menuRepository.deletePlato(id);
                  if (exito) {
                      alert("Eliminado.");
                      this.abrirPanelGestionCarta();
                  }
              }
          },
          onSearch: (query) => {
            const q = query.toLowerCase().trim();
            const filtrados = platosOriginales.filter(p => {
                // Buscamos en el nombre
                const coincideNombre = p.name.toLowerCase().includes(q);
                
                // Buscamos en las categorías (manejando que ahora es un array)
                const coincideCategoria = Array.isArray(p.category)
                    ? p.category.some(cat => cat.toLowerCase().includes(q))
                    : p.category.toLowerCase().includes(q);
        
                return coincideNombre || coincideCategoria;
            });
        
            const container = document.getElementById('table-container');
            if (container) {
                // Usamos el render de la vista para actualizar la tabla
                container.innerHTML = manageView.renderTableBody(filtrados);
                // Volvemos a conectar los eventos de los nuevos botones generados
                manageView.attachTableEvents(acciones.onEdit, acciones.onDelete);
            }
        },
          
          onEdit: (id) => {
            const plato = platosOriginales.find(p => p.id === id);
            if (plato) {
                manageView.prepareEdit(plato);
            }
        },

        // --- ACCIONES DE CATEGORÍAS ---
        onAddCategory: async (nombre) => {
            const exito = await this.menuRepository.addCategory(nombre);
            if (exito) {
                this.abrirPanelGestionCarta(); // Recargamos el panel para ver la nueva categoría
            }
        },
        onDeleteCategory: async (id) => {
            const exito = await this.menuRepository.deleteCategory(id);
            if (exito) {
                this.abrirPanelGestionCarta(); // Recargamos para actualizar la lista y el select
            }
        }




      };


      


      manageView.render(platosOriginales, categoriasReales, acciones);
  }

  async renderAll() {
    await this.menuRepository.loadAllPlatos();
    //const dailyMenu = await this.menuRepository.getDailyMenuConfig();
    const dailyMenuFromDB = await this.menuRepository.getDailyMenuConfig();
    
    //this.homeView.renderShell(this.restaurantInfo, this.currentUser, dailyMenu || this.currentDailyMenu);
    // SOLUCIÓN: Actualizar el estado local con lo que viene de Firebase
    

    if (dailyMenuFromDB) {
      this.currentDailyMenu = dailyMenuFromDB;
    }

    // Ahora renderShell usará el menú actualizado
    this.homeView.renderShell(this.restaurantInfo, this.currentUser, this.currentDailyMenu);

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

      // Conectar el botón de Actualizar Menú diario
    const adminDailyBtn = document.getElementById("admin-daily-menu-btn");
    if (adminDailyBtn) {
      adminDailyBtn.onclick = () => this.abrirSelectorMenuEjecutivo();
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
  
    // Conectar botón de Gestionar Carta
    const adminManageCartaBtn = document.getElementById("admin-manage-carta-btn");
    if (adminManageCartaBtn) {
        adminManageCartaBtn.onclick = () => this.abrirPanelGestionCarta(); // Cambiado de alert a la función real
    }

    
  
    this.menuView.filterContainer = document.getElementById("menu-filters");
    this.menuView.gridContainer = document.getElementById("menu-grid");
    //this.renderMenu();
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

  async abrirSelectorMenuEjecutivo() {
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
  }

  

  async renderMenu() {
    // 1. Obtener ítems filtrados (lógica existente)
    let items = this.menuRepository.getByCategory(this.activeCategory);
    
    if (this.activeCategory === "Todos" || this.activeCategory === "Menú del Día") {
      const platosElegidosAdmin = this.currentDailyMenu.segundos.map(nombre => {
        // REPARACIÓN: Buscar en la memoria local de platos cargados de Firebase
        const datosPlato = this.menuRepository.allPlatos.find(p => p.name === nombre);
        
        const finalImageUrl = (datosPlato && datosPlato.imageUrl)
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

    // 2. OBTENER CATEGORÍAS REALES DE FIREBASE (Cambio clave)
    const categoriasDB = await this.menuRepository.getCategoriesFromFirestore();
    // Después (solo usa lo que viene de Firebase y el botón "Todos")
    const nombresCategorias = ["Todos", ...categoriasDB.map(c => c.nombre)];

    // 3. Renderizar filtros con la lista actualizada
    this.menuView.renderFilters(nombresCategorias, this.activeCategory, (cat) => {
      this.activeCategory = cat;
      this.renderMenu(); // Re-ejecuta para filtrar
    });

    this.menuView.renderItems(items);
}
}
