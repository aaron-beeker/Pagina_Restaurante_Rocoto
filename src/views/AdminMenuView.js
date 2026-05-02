// src/views/AdminMenuView.js
export class AdminMenuView {
  constructor(rootElement) {
    this.rootElement = rootElement;
  }

  render(segundos, entradas, refrescos, onSave) {
    this.rootElement.innerHTML = `
      <div class="min-h-screen bg-stone-100 p-8 pt-24 pb-20">
        <div class="mx-auto max-w-5xl rounded-2xl bg-white p-8 shadow-xl">
           <div class="mb-8 flex items-center justify-between border-b pb-6">
             <div>
               <h2 class="font-h1 text-2xl text-green-900 uppercase tracking-tight">Gestión del Menú Ejecutivo</h2>
               <p class="text-sm text-stone-500">Selecciona las opciones disponibles para hoy.</p>
             </div>
             <button id="back-to-home" class="flex items-center gap-2 text-stone-400 hover:text-secondary transition-colors font-button text-sm">
               <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
               Cerrar Panel
             </button>
           </div>
           
           <div class="space-y-10">
             <!-- ENTRADAS -->
             <div>
               <h3 class="mb-4 font-bold text-stone-800 uppercase text-sm">1. Entradas Disponibles</h3>
               <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                 ${entradas.map(e => this.createCheckboxCard('entrada-check', e.name || e)).join('')}
               </div>
             </div>

             <!-- SEGUNDOS -->
             <div>
               <h3 class="mb-4 font-bold text-stone-800 uppercase text-sm">2. Segundos del Recetario</h3>
               <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                 ${segundos.map(s => this.createCheckboxCard('segundo-check', s.name || s)).join('')}
               </div>
             </div>

             <!-- REFRESCOS -->
             <div>
               <h3 class="mb-4 font-bold text-stone-800 uppercase text-sm">3. Refrescos del Día</h3>
               <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                 ${refrescos.map(r => this.createCheckboxCard('refresco-check', r.name || r)).join('')}
               </div>
             </div>

             <div class="pt-8 border-t">
               <button id="save-menu" class="w-full rounded-xl bg-green-900 py-5 font-button font-bold text-white shadow-lg hover:bg-green-800 transition-all">
                 PUBLICAR ACTUALIZACIÓN DE MENÚ
               </button>
             </div>
           </div>
        </div>
      </div>
    `;
    this.setupEventListeners(onSave);
  }

  createCheckboxCard(name, label) {
    return `
      <label class="group relative flex cursor-pointer items-center gap-3 rounded-xl border border-stone-200 p-4 hover:bg-green-50">
        <input type="checkbox" name="${name}" value="${label}" class="h-5 w-5 rounded text-green-600">
        <span class="text-sm font-medium text-stone-700">${label}</span>
      </label>
    `;
  }

  setupEventListeners(onSave) {
    // REPARACIÓN: Conectar el botón de cerrar
    const backBtn = document.getElementById('back-to-home');
    if (backBtn) {
      backBtn.onclick = () => window.location.reload(); 
    }

    document.getElementById('save-menu').onclick = () => {
      const config = {
        entradas: Array.from(document.querySelectorAll('input[name="entrada-check"]:checked')).map(el => el.value),
        segundos: Array.from(document.querySelectorAll('input[name="segundo-check"]:checked')).map(el => el.value),
        refrescos: Array.from(document.querySelectorAll('input[name="refresco-check"]:checked')).map(el => el.value)
      };
      onSave(config);
    };
  }
}