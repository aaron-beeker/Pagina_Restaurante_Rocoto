import { html, render } from 'lit-html';
import { button, form, layout } from "../ui/layout.js";
import { escapeHtml } from "../utils/html.js";
import { getLocalDateString } from "../utils/dateUtils.js";
import { toast, dialog } from "../utils/notifications.js";

export class ManageWorkersView {
  constructor(rootElement) {
    this.rootElement = rootElement;
    this.capturedTemplates = [];
    this.companies = [];
    this.allWorkers = [];
    this.acciones = null;
    
    // Estado interno de filtros para persistencia durante re-renders de tiempo real
    this.filters = {
        query: "",
        company: ""
    };
  }

  /**
   * Renderizado principal - Reconstruye la estructura base.
   */
  render(workers, acciones, companies = []) {
    this.allWorkers = workers || [];
    this.acciones = acciones;
    this.companies = companies || [];

    const filteredWorkers = this._getFilteredWorkers();

    const template = html`
      <div class="min-h-screen bg-[#fafafa] font-sans pb-32 text-stone-900">
        <div class="max-w-[1400px] mx-auto px-4 py-8 sm:py-16">
          
          <!-- Cabecera Editorial -->
          ${this._renderHeader(acciones.onBack)}

          <div class="space-y-12 sm:space-y-32">
            
            <!-- BLOQUE MAESTRO: Gestión de Personal -->
            <section class="space-y-12 scroll-mt-24" id="worker-form-section">
                <div class="flex items-center gap-4">
                    <h3 class="text-xs sm:text-sm font-black uppercase tracking-[0.4em] sm:tracking-[0.5em]">Gestión de Personal</h3>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                    
                    <!-- Listado Izquierda -->
                    <div class="lg:col-span-7 order-2 lg:order-1 space-y-8">
                        <!-- Buscador -->
                        <div class="relative w-full group">
                            <input type="search" id="search-worker" 
                                   .value=${this.filters.query}
                                   @input=${(e) => this._handleFilterChange('query', e.target.value)} 
                                   placeholder="Buscar por nombre, DNI o empresa..." 
                                   class="w-full bg-white border-2 border-stone-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:border-primary outline-none transition-all shadow-sm placeholder:text-stone-300" />
                            <svg class="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-300 group-focus-within:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke-width="2.5"/></svg>
                        </div>

                        <div class="flex items-center justify-between px-2">
                            <div class="flex items-center gap-4">
                                <div class="h-1.5 w-1.5 rounded-full bg-primary animate-pulse"></div>
                                <span class="text-[10px] font-black uppercase tracking-[0.3em] text-stone-900">Personal Registrado (${this.allWorkers.length})</span>
                            </div>
                            
                            <select id="filter-company" @change=${(e) => this._handleFilterChange('company', e.target.value)} 
                                    class="bg-transparent border-none text-[10px] font-black uppercase tracking-widest text-stone-400 focus:ring-0 cursor-pointer hover:text-primary transition-colors">
                                <option value="" ?selected=${this.filters.company === ""}>Todas las empresas</option>
                                ${this.companies.map(c => html`<option value="${c.nombre}" ?selected=${this.filters.company === c.nombre}>${c.nombre}</option>`)}
                            </select>
                        </div>
                        
                        <div id="workers-list-container" class="space-y-4">
                            ${this._renderWorkerList(filteredWorkers)}
                        </div>
                    </div>

                    <!-- Editor Derecha (Sticky) -->
                    <div class="lg:col-span-5 order-1 lg:order-2">
                        <div class="bg-white p-8 sm:p-10 rounded-[2.5rem] sm:rounded-[3rem] border border-stone-100 shadow-xl lg:sticky lg:top-10 overflow-hidden" id="worker-editor-container">
                            <div class="relative z-10">
                                <div class="mb-10 border-b border-stone-50 pb-6 text-center lg:text-left">
                                    <h4 class="text-stone-900 font-display italic text-xl sm:text-2xl" id="form-title">Registro de Trabajador</h4>
                                    <p class="text-[9px] text-stone-400 uppercase tracking-widest mt-2">Completa los datos del personal</p>
                                </div>

                                <form id="worker-form" @submit=${(e) => this._handleFormSubmit(e)} class="space-y-8">
                                    <input type="hidden" id="edit-worker-id" value="" />
                                    <input type="hidden" id="worker-huellas" value="" />
                                    
                                    <div class="space-y-6">
                                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label class="text-[10px] uppercase tracking-[0.3em] text-stone-400 font-bold mb-3 block ml-1">Nombres</label>
                                                <input type="text" id="worker-name" placeholder="Ej: Juan" class="w-full bg-stone-50 border-b-2 border-stone-100 py-3 text-stone-900 text-base focus:border-primary transition-all outline-none" required />
                                            </div>
                                            <div>
                                                <label class="text-[10px] uppercase tracking-[0.3em] text-stone-400 font-bold mb-3 block ml-1">Apellidos</label>
                                                <input type="text" id="worker-lastname" placeholder="Ej: Pérez" class="w-full bg-stone-50 border-b-2 border-stone-100 py-3 text-stone-900 text-base focus:border-primary transition-all outline-none" required />
                                            </div>
                                        </div>

                                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label class="text-[10px] uppercase tracking-[0.3em] text-stone-400 font-bold mb-3 block ml-1">DNI (8 dígitos)</label>
                                                <input type="text" id="worker-dni" placeholder="00000000" maxlength="8" pattern="\\d{8}" class="w-full bg-stone-50 border-b-2 border-stone-100 py-3 text-stone-900 text-base focus:border-primary transition-all outline-none" required />
                                            </div>
                                            <div>
                                                <label class="text-[10px] uppercase tracking-[0.3em] text-stone-400 font-bold mb-3 block ml-1">Empresa</label>
                                                <select id="worker-company" class="w-full bg-stone-50 border-b-2 border-stone-100 py-3 text-stone-900 text-sm focus:border-primary outline-none transition-all appearance-none" required>
                                                    <option value="">Seleccionar...</option>
                                                    ${this.companies.map(c => html`<option value="${c.nombre}">${c.nombre}</option>`)}
                                                </select>
                                            </div>
                                        </div>

                                        <label class="flex items-center gap-4 cursor-pointer group p-4 bg-stone-50 rounded-2xl border border-stone-100 hover:border-primary/30 transition-all active:scale-[0.98]">
                                            <input type="checkbox" id="worker-is-field-manager" class="w-5 h-5 rounded-lg border-stone-200 bg-white text-primary focus:ring-0 focus:ring-offset-0" />
                                            <div class="flex flex-col">
                                                <span class="text-[11px] uppercase tracking-widest text-stone-600 group-hover:text-primary transition-colors font-black">Encargado de Campo</span>
                                                <span class="text-[8px] text-stone-400 italic">Habilita raciones grupales</span>
                                            </div>
                                        </label>

                                        <!-- CONTROL BIOMÉTRICO -->
                                        <div class="p-6 bg-stone-50 rounded-[2rem] border border-stone-100 space-y-6 text-center shadow-inner">
                                            <p class="text-[10px] font-black uppercase text-primary tracking-[0.3em]">Control Biométrico</p>
                                            
                                            <div class="flex justify-center gap-3">
                                                ${[1, 2, 3].map(i => html`<div id="step-dot-${i}" class="h-6 w-6 rounded-full border-2 border-stone-200 bg-white transition-all flex items-center justify-center text-[10px] font-black text-stone-300">${i}</div>`)}
                                            </div>

                                            <div class="flex flex-col items-center gap-3 py-4 px-6 rounded-2xl bg-white border border-stone-100">
                                                <div class="flex items-center gap-3">
                                                    <div id="status-dot" class="h-2.5 w-2.5 rounded-full bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.3)]"></div>
                                                    <span id="status-text" class="text-[11px] font-black text-stone-400 uppercase tracking-widest">Esperando inicio</span>
                                                </div>
                                                <p id="status-instruction" class="text-[9px] font-black text-primary hidden uppercase animate-pulse">Coloque su dedo...</p>
                                            </div>

                                            <button type="button" id="capture-fingerprint-btn" @click=${() => this._handleCapture()} class="w-full bg-stone-900 text-white py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-primary transition-all active:scale-95 shadow-lg">
                                                <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4"/><path d="M14 13.12c0 2.38 0 6.38-1 8.88"/><path d="M17.29 21.02c.12-.6.43-2.3.5-3.02"/><path d="M2 12a10 10 0 0 1 18-6"/><path d="M2 16h.01"/><path d="M21.8 16c.2-2 .131-5.354 0-6"/><path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2"/><path d="M8.65 22c.21-.66.45-1.32.57-2"/><path d="M9 6.8a6 6 0 0 1 9 5.2v2"/></svg>
                                                <span id="btn-capture-text" class="text-[10px] font-black uppercase tracking-widest">Iniciar Captura</span>
                                            </button>
                                        </div>
                                    </div>

                                    <div class="flex flex-col gap-4 pt-6 border-t border-stone-50">
                                        <button type="submit" id="submit-worker-btn" class="w-full bg-stone-950 text-white py-8 sm:py-7 rounded-3xl text-sm sm:text-base uppercase tracking-[0.5em] font-black shadow-2xl hover:bg-primary transition-all duration-500 active:scale-[0.97] transform">
                                            Guardar Trabajador
                                        </button>
                                        <button type="button" id="cancel-worker-edit" @click=${() => this.resetForm()} class="hidden w-full text-stone-400 py-3 text-xs font-bold uppercase tracking-widest hover:text-stone-900 transition-all italic text-center">
                                            Descartar Cambios
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
          </div>
        </div>
      </div>

      <!-- MODAL DE DETALLES -->
      <div id="worker-detail-modal" class="hidden fixed inset-0 z-[3000] flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/80 backdrop-blur-md" @click=${() => this.toggleModal(false)}></div>
          <div class="relative bg-white w-full max-w-2xl max-h-[90vh] rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-scale-in">
              <div class="p-8 sm:p-10 border-b border-stone-50 flex justify-between items-center shrink-0">
                  <div>
                      <h2 class="text-xl sm:text-2xl font-display italic text-stone-950">Ficha del Personal</h2>
                      <p class="text-[9px] text-stone-400 uppercase tracking-widest mt-1">Historial y reportes individuales</p>
                  </div>
                  <button @click=${() => this.toggleModal(false)} class="p-3 rounded-full hover:bg-stone-50 transition-colors">
                      <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" stroke-width="3"/></svg>
                  </button>
              </div>
              <div class="flex-1 overflow-y-auto p-8 sm:p-10" id="worker-detail-content"></div>
          </div>
      </div>
    `;

    this._safeRender(template);
  }

  // --- LÓGICA DE FILTRADO UNIFICADA ---

  _getFilteredWorkers() {
    const q = String(this.filters.query || "").toLowerCase().trim();
    const c = String(this.filters.company || "").trim();

    return this.allWorkers.filter(w => {
        const workerDni = String(w.dni || "").toLowerCase();
        const workerName = String(w.nombre || "").toLowerCase();
        const workerLastName = String(w.apellidos || "").toLowerCase();
        const workerEmpresa = String(w.empresa || "").trim();

        const matchesQuery = !q || 
                           workerDni.includes(q) || 
                           workerName.includes(q) || 
                           workerLastName.includes(q);
                           
        const matchesCompany = !c || workerEmpresa === c;
        
        return matchesQuery && matchesCompany;
    });
  }

  _handleFilterChange(type, value) {
    this.filters[type] = value;
    
    // Sincronizar con el controlador para persistencia entre cambios de vista
    if (this.acciones && this.acciones.onSearch && type === 'query') {
        this.acciones.onSearch(value, this.filters.company);
    }
    
    // Re-renderizar (lit-html actualizará solo lo necesario)
    this.render(this.allWorkers, this.acciones, this.companies);
  }

  _renderWorkerList(workers) {
    if (workers.length === 0) {
        return html`<div class="py-24 text-center border-2 border-dashed border-stone-100 rounded-[3rem] text-stone-300 uppercase tracking-[0.4em] text-[10px] font-bold italic bg-white">Sin trabajadores encontrados</div>`;
    }
    return html`${workers.map(w => this._renderWorkerRow(w))}`;
  }

  _renderWorkerRow(w) {
    const huellaCount = w.huellas ? w.huellas.length : (w.huella ? 1 : 0);
    const nombreStr = String(w.nombre || "").trim();
    const apellidosStr = String(w.apellidos || "").trim();
    const nombreCompleto = `${apellidosStr}${apellidosStr && nombreStr ? ', ' : ''}${nombreStr}` || "Sin Nombre";
    const inicial = nombreStr ? nombreStr.charAt(0).toUpperCase() : "?";
    const empresaStr = String(w.empresa || "Particular");
    const dniStr = String(w.dni || "---");

    return html`
        <div class="group relative overflow-hidden rounded-[2.5rem] border-2 border-stone-50 bg-white p-6 sm:p-8 shadow-sm hover:shadow-2xl transition-all duration-700 flex flex-col md:flex-row items-center gap-6 cursor-pointer"
             @click=${() => this.acciones.onViewDetails(w.id)}>
            
            <div class="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-stone-950 flex items-center justify-center text-white font-display italic text-2xl shadow-xl shrink-0 group-hover:bg-primary transition-all duration-500">
                ${inicial}
            </div>

            <div class="flex-1 min-w-0 text-center md:text-left">
                <div class="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                    <h4 class="text-base sm:text-lg font-sans font-bold text-stone-900 uppercase tracking-tight truncate">${nombreCompleto}</h4>
                    ${w.esEncargadoCampo 
                        ? html`<span class="text-[7px] font-black text-amber-600 uppercase bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100 tracking-tighter">Encargado de Campo</span>` 
                        : ''
                    }
                </div>
                <div class="flex flex-wrap justify-center md:justify-start items-center gap-x-4 gap-y-1">
                    <span class="text-[9px] font-black uppercase text-primary tracking-widest">${empresaStr}</span>
                    <span class="text-[10px] font-mono text-stone-400">DNI: ${dniStr}</span>
                </div>
            </div>

            <div class="shrink-0 flex items-center gap-2 bg-stone-50 px-4 py-2 rounded-full border border-stone-100">
                <div class="h-1.5 w-1.5 rounded-full ${huellaCount >= 3 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : huellaCount > 0 ? 'bg-amber-400' : 'bg-red-400'}"></div>
                <span class="text-[9px] font-black uppercase tracking-tighter text-stone-500">${huellaCount} / 3 Huellas</span>
            </div>

            <div class="flex gap-2 shrink-0 relative z-20">
                <button @click=${(e) => { e.stopPropagation(); this.acciones.onEdit(w.id); }} class="p-3.5 rounded-2xl bg-stone-50 text-stone-500 hover:bg-stone-950 hover:text-white transition-all active:scale-90 border border-stone-100">
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                </button>
                <button @click=${(e) => { e.stopPropagation(); this._handleDelete(w.id); }} class="p-3.5 rounded-2xl bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-all active:scale-90 border border-red-100">
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                </button>
            </div>
        </div>
    `;
  }

  // --- Lógica de Interacción Biométrica ---

  async _handleCapture() {
    const { onCapture } = this.acciones;
    const btn = document.getElementById("capture-fingerprint-btn");
    const btnText = document.getElementById("btn-capture-text");
    const ins = document.getElementById("status-instruction");
    const st = document.getElementById("status-text");
    const dot = document.getElementById("status-dot");

    this.capturedTemplates = [];
    this.updateStepDots(0);
    btn.disabled = true;
    btn.classList.add("opacity-50");

    try {
        for (let i = 1; i <= 3; i++) {
            btnText.textContent = `Capturando Toma ${i}/3...`;
            ins.textContent = `TOMA ${i}: Coloque su dedo...`;
            ins.classList.remove("hidden");
            st.textContent = `Esperando dedo (${i}/3)`;
            dot.className = "h-3 w-3 rounded-full bg-amber-400 animate-pulse";

            const result = await onCapture((step) => {
                if (step === 'captured') {
                    ins.textContent = `¡TOMA ${i} CAPTURADA! RETIRE EL DEDO`;
                    st.textContent = `Procesando...`;
                    dot.className = "h-3 w-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]";
                }
            });

            if (result) {
                this.capturedTemplates.push(result);
                this.updateStepDots(i);
                if (i < 3) await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }
        document.getElementById("worker-huellas").value = JSON.stringify(this.capturedTemplates);
        ins.textContent = "¡Registro Biométrico Completo!";
        setTimeout(() => ins.classList.add("hidden"), 3000);
        this.updateFingerprintStatus(true);
    } catch (e) {
        toast.error("Error biométrico: " + e.message);
        this.updateFingerprintStatus(false);
        ins.classList.add("hidden");
    } finally {
        btn.disabled = false;
        btn.classList.remove("opacity-50");
        btnText.textContent = "Reiniciar Captura (3 tomas)";
    }
  }

  async _handleDelete(id) {
    if (this.acciones && this.acciones.onDelete) {
        await this.acciones.onDelete(id);
    }
  }

  async _handleFormSubmit(e) {
    e.preventDefault();
    const huellasStr = document.getElementById("worker-huellas").value;
    const data = {
        dni: document.getElementById("worker-dni").value.trim(),
        nombre: document.getElementById("worker-name").value.trim(),
        apellidos: document.getElementById("worker-lastname").value.trim(),
        empresa: document.getElementById("worker-company").value,
        esEncargadoCampo: document.getElementById("worker-is-field-manager").checked,
        huellas: huellasStr ? JSON.parse(huellasStr) : []
    };
    data.huella = data.huellas.length > 0 ? data.huellas[0] : null;
    await this.acciones.onSave(document.getElementById("edit-worker-id").value, data);
    this.resetForm();
  }

  // --- Helpers de UI ---

  _renderHeader(onBack) {
    return html`
      <header class="flex flex-col sm:flex-row sm:items-end justify-between gap-8 mb-16 sm:mb-20 pb-8 border-b border-stone-200">
        <div class="space-y-4 sm:space-y-6">
            <button @click=${onBack} class="flex items-center gap-3 text-primary hover:text-stone-900 font-bold text-[9px] sm:text-[10px] uppercase tracking-[0.3em] sm:tracking-[0.5em] transition-all group">
                <svg class="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="3" d="M15 19l-7-7 7-7"></path></svg>
                Volver al Panel
            </button>
            <div class="flex flex-col gap-2">
                <span class="text-[8px] sm:text-[9px] uppercase tracking-[0.3em] sm:tracking-[0.4em] text-stone-400 font-bold">Gestión de Recursos Humanos</span>
                <h2 class="text-3xl sm:text-6xl font-display italic text-stone-950 leading-none">
                    Gestión de <span class="text-primary font-black not-italic underline decoration-stone-200 underline-offset-8">Personal</span>
                </h2>
            </div>
        </div>
      </header>
    `;
  }

  updateStepDots(count) {
    for (let i = 1; i <= 3; i++) {
        const dot = document.getElementById(`step-dot-${i}`); if (!dot) continue;
        dot.className = i <= count ? "h-6 w-6 rounded-full border-2 border-emerald-500 bg-emerald-500 text-white flex items-center justify-center text-[10px] font-black shadow-lg" : "h-6 w-6 rounded-full border-2 border-stone-200 bg-white text-stone-300 flex items-center justify-center text-[10px] font-black";
    }
  }

  updateFingerprintStatus(hasHuellas) {
    const dot = document.getElementById("status-dot"), text = document.getElementById("status-text");
    if (!dot || !text) return;
    if (hasHuellas) { dot.className = "h-3 w-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"; text.textContent = "Huellas Listas (3/3)"; }
    else { dot.className = "h-3 w-3 rounded-full bg-red-400"; text.textContent = "Sin huellas"; }
  }

  toggleModal(show) {
    const m = document.getElementById("worker-detail-modal");
    if (show) m.classList.remove("hidden"); else m.classList.add("hidden");
  }

  resetForm() {
    const form = document.getElementById("worker-form");
    if (form) form.reset();
    document.getElementById("edit-worker-id").value = "";
    document.getElementById("worker-huellas").value = "";
    this.capturedTemplates = [];
    this.updateFingerprintStatus(false);
    this.updateStepDots(0);
    document.getElementById("form-title").textContent = "Registro de Trabajador";
    document.getElementById("submit-worker-btn").textContent = "Guardar Trabajador";
    document.getElementById("btn-capture-text").textContent = "Iniciar Captura";
    document.getElementById("cancel-worker-edit").classList.add("hidden");
    const container = document.getElementById("worker-editor-container");
    if (container) container.classList.remove("ring-8", "ring-primary/10");
  }

  prepareEdit(worker) {
    const container = document.getElementById("worker-editor-container");
    document.getElementById("edit-worker-id").value = worker.id;
    document.getElementById("worker-dni").value = worker.dni;
    document.getElementById("worker-name").value = worker.nombre;
    document.getElementById("worker-lastname").value = worker.apellidos;
    document.getElementById("worker-company").value = worker.empresa || "";
    document.getElementById("worker-is-field-manager").checked = !!worker.esEncargadoCampo;
    const huellas = worker.huellas || (worker.huella ? [worker.huella] : []);
    this.capturedTemplates = huellas;
    document.getElementById("worker-huellas").value = JSON.stringify(huellas);
    this.updateFingerprintStatus(huellas.length > 0);
    this.updateStepDots(huellas.length);
    document.getElementById("form-title").textContent = "Editar Trabajador";
    document.getElementById("submit-worker-btn").textContent = "Actualizar Datos";
    document.getElementById("cancel-worker-edit").classList.remove("hidden");
    container.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
    container.classList.add("ring-8", "ring-primary/10", "duration-500");
    setTimeout(() => container.classList.remove("ring-8", "ring-primary/10"), 2000);
  }

  _safeRender(template) {
    try { render(template, this.rootElement); }
    catch (e) { this.rootElement.innerHTML = ""; render(template, this.rootElement); }
  }

  showWorkerDetails(worker, attendance, reportActions) {
    const { onDownloadPdf, onDownloadExcel } = reportActions;
    this.toggleModal(true);
    const content = document.getElementById("worker-detail-content");
    const stats = {
        total: attendance.length,
        desayunos: attendance.filter(a => a.tipo === "Desayuno").length,
        almuerzos: attendance.filter(a => a.tipo === "Almuerzo").length,
        cenas: attendance.filter(a => a.tipo === "Cena").length
    };

    const modalTemplate = html`
        <div class="space-y-10">
            <div class="flex flex-col sm:flex-row items-center gap-6 p-6 bg-stone-50 rounded-[2.5rem] border border-stone-100 text-center sm:text-left">
                <div class="h-20 w-20 rounded-full bg-stone-950 flex items-center justify-center text-white text-3xl font-display italic shadow-xl">${worker.nombre.charAt(0)}</div>
                <div class="flex-1 min-w-0">
                    <h3 class="text-xl font-sans font-bold text-stone-900 uppercase truncate">${worker.apellidos}, ${worker.nombre}</h3>
                    <div class="flex flex-wrap justify-center sm:justify-start gap-3 items-center mt-2">
                        <span class="text-[10px] font-black text-primary uppercase tracking-widest">${worker.empresa || 'Particular'}</span>
                        <span class="text-[10px] font-mono text-stone-400">DNI: ${worker.dni}</span>
                    </div>
                </div>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
                ${[{l:'Total',v:stats.total,c:'bg-primary text-white'},{l:'Des.',v:stats.desayunos,c:'bg-white text-stone-900'},{l:'Alm.',v:stats.almuerzos,c:'bg-white text-stone-900'},{l:'Cena',v:stats.cenas,c:'bg-white text-stone-900'}].map(s=>html`<div class="${s.c} p-5 rounded-3xl text-center shadow-sm border border-stone-50"><span class="text-[8px] font-black uppercase tracking-widest opacity-60 mb-1 block">${s.l}</span><span class="text-2xl font-black tracking-tighter">${s.v}</span></div>`)}
            </div>
            <div class="p-6 sm:p-8 bg-white border border-stone-100 rounded-[2.5rem] shadow-sm space-y-6">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><label class="text-[9px] font-black text-stone-400 uppercase block mb-2">Inicio</label><input type="date" id="modal-start" class="w-full bg-stone-50 border-stone-100 rounded-xl py-2 px-4 text-xs font-bold" /></div>
                    <div><label class="text-[9px] font-black text-stone-400 uppercase block mb-2">Fin</label><input type="date" id="modal-end" class="w-full bg-stone-50 border-stone-100 rounded-xl py-2 px-4 text-xs font-bold" /></div>
                </div>
                <div class="flex gap-3">
                    <button @click=${()=>this._handleModalDownload(worker, attendance, onDownloadPdf, 'pdf')} class="flex-1 bg-stone-950 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">PDF</button>
                    <button @click=${()=>this._handleModalDownload(worker, attendance, onDownloadExcel, 'excel')} class="flex-1 bg-stone-100 text-stone-600 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-stone-200">EXCEL</button>
                </div>
            </div>
            <div class="overflow-hidden rounded-3xl border border-stone-100 bg-white"><table class="w-full text-left min-w-[350px]"><thead class="bg-stone-50 text-[9px] font-black uppercase text-stone-400"><tr class="border-b border-stone-100"><th class="px-6 py-4">Fecha</th><th class="px-6 py-4 text-right">Servicio</th></tr></thead><tbody class="divide-y divide-stone-50">${attendance.slice(0, 10).map(reg=>html`<tr class="text-[10px] font-bold text-stone-600"><td class="px-6 py-4">${reg.fecha}</td><td class="px-6 py-4 text-right"><span class="px-2 py-0.5 rounded-md bg-stone-50 text-[8px] font-black uppercase">${reg.tipo}</span></td></tr>`)}</tbody></table></div>
        </div>
    `;
    render(modalTemplate, content);
  }

  _handleModalDownload(worker, attendance, callback, format) {
      const s = document.getElementById("modal-start").value, e = document.getElementById("modal-end").value;
      let f = [...attendance]; if (s) f = f.filter(a => a.fecha >= s); if (e) f = f.filter(a => a.fecha <= e);
      if (f.length === 0) return toast.info("Sin registros.");
      callback(worker, f);
  }
}

