// src/views/AdminMenuView.js
export class AdminMenuView {
    constructor(rootElement) {
      this.rootElement = rootElement;
    }
  
    render(platos, entradas, refrescos, onSave) {
      this.rootElement.innerHTML = `
        <div class="min-h-screen bg-stone-100 p-8 pt-24 pb-20">
          <div class="mx-auto max-w-5xl rounded-2xl bg-white p-8 shadow-xl">
            
            <!-- Encabezado -->
            <div class="mb-8 flex items-center justify-between border-b pb-6">
              <div>
                <h2 class="font-h1 text-2xl text-green-900 uppercase tracking-tight">Gestión del Menú Ejecutivo</h2>
                <p class="text-sm text-stone-500">Selecciona todas las opciones que estarán disponibles para hoy.</p>
              </div>
              <button id="back-to-home" class="flex items-center gap-2 text-stone-400 hover:text-secondary transition-colors font-button text-sm">
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                Cerrar Panel
              </button>
            </div>
            
            <div class="space-y-10">
              
              <!-- SECCIÓN: ENTRADAS (Múltiples) -->
              <div>
                <div class="mb-4 flex items-center gap-2">
                  <span class="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-800">1</span>
                  <h3 class="font-bold text-stone-800 uppercase text-sm tracking-wider">Entradas Disponibles</h3>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  ${entradas.map(e => this.createCheckboxCard('entrada-check', e)).join('')}
                </div>
              </div>
  
              <!-- SECCIÓN: SEGUNDOS / PLATOS DE FONDO (Múltiples del Recetario) -->
              <div>
                <div class="mb-4 flex items-center gap-2">
                  <span class="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-800">2</span>
                  <h3 class="font-bold text-stone-800 uppercase text-sm tracking-wider">Segundos del Recetario</h3>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  ${platos.map(p => this.createCheckboxCard('segundo-check', p.name)).join('')}
                </div>
              </div>
  
              <!-- SECCIÓN: REFRESCOS (Múltiples) -->
              <div>
                <div class="mb-4 flex items-center gap-2">
                  <span class="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-800">3</span>
                  <h3 class="font-bold text-stone-800 uppercase text-sm tracking-wider">Refrescos del Día</h3>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  ${refrescos.map(r => this.createCheckboxCard('refresco-check', r)).join('')}
                </div>
              </div>
              
              <!-- Botón de Acción -->
              <div class="pt-8 border-t">
                <button id="save-menu" class="w-full rounded-xl bg-green-900 py-5 font-button font-bold text-white shadow-lg hover:bg-green-800 transition-all active:scale-[0.97] flex items-center justify-center gap-3">
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                  PUBLICAR ACTUALIZACIÓN DE MENÚ
                </button>
              </div>
  
            </div>
          </div>
        </div>
      `;
  
      this.setupEventListeners(onSave);
    }
  
    // Método auxiliar para crear las tarjetas de selección
    createCheckboxCard(name, label) {
      return `
        <label class="group relative flex cursor-pointer items-center gap-3 rounded-xl border border-stone-200 p-4 transition-all hover:border-green-300 hover:bg-green-50/50 has-[:checked]:border-green-600 has-[:checked]:bg-green-50">
          <input type="checkbox" name="${name}" value="${label}" class="h-5 w-5 rounded border-stone-300 text-green-600 focus:ring-green-500">
          <span class="text-sm font-medium text-stone-700 group-hover:text-green-900">${label}</span>
        </label>
      `;
    }
  
    setupEventListeners(onSave) {
      document.getElementById('save-menu').onclick = () => {
        const config = {
          entradas: Array.from(document.querySelectorAll('input[name="entrada-check"]:checked')).map(el => el.value),
          segundos: Array.from(document.querySelectorAll('input[name="segundo-check"]:checked')).map(el => el.value),
          refrescos: Array.from(document.querySelectorAll('input[name="refresco-check"]:checked')).map(el => el.value)
        };
  
        if (config.segundos.length === 0) {
          alert("Por favor, selecciona al menos un plato de fondo (Segundo).");
          return;
        }
  
        onSave(config);
      };
    }
  }