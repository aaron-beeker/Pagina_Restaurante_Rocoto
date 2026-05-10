import { adminShell, button, form } from "../ui/layout.js";
import { escapeHtml } from "../utils/html.js";
import { getLocalDateString } from "../utils/dateUtils.js";
import { toast, dialog } from "../utils/notifications.js";

export class ManageWorkersView {
  constructor(rootElement) {
    this.rootElement = rootElement;
    this.capturedTemplates = [];
    this.companies = [];
    this.allWorkers = [];
  }

  render(workers, acciones, companies = []) {
    this.companies = companies;
    this.allWorkers = workers;
    this.rootElement.innerHTML = `
        <div class="${adminShell.page}">
            <div class="${adminShell.card}">
                ${this._renderHeader()}
                ${this._renderWorkerForm()}
                ${this._renderFilters()}
                
                <div id="workers-list-container" class="space-y-3">
                    ${this._renderWorkerList(workers)}
                </div>
            </div>
        </div>
        ${this._renderDetailModal()}
    `;
    this.setupEventListeners(acciones);
  }

  _renderHeader() {
    return `
        <div class="z-40 -mx-6 -mt-6 mb-10 border-b border-surface-variant bg-surface/95 p-6 backdrop-blur-md sm:sticky sm:top-0 sm:-mx-10 sm:-mt-10 sm:px-10 sm:pt-10 sm:pb-8 flex flex-col sm:flex-row sm:items-start justify-start gap-4 sm:gap-6">
            <button type="button" id="back-from-workers" class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-stone-600 border border-stone-200 shadow-sm transition-all hover:bg-stone-200 active:scale-95 mt-1">
                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M15 19l-7-7 7-7"></path></svg>
            </button>
            <div class="min-w-0">
                <h2 class="text-xl sm:text-3xl font-black tracking-tight text-primary leading-tight uppercase">Gestión de Trabajadores</h2>
                <p class="mt-1 text-xs sm:text-sm text-on-surface-variant/60 font-medium max-w-2xl">Administra el personal, sus datos básicos y el registro de huellas digitales para el control de asistencia.</p>
            </div>
        </div>
    `;
  }

  _renderWorkerForm() {
    return `
        <div class="${adminShell.mutedBox} mb-12 scroll-mt-24 p-5 sm:p-8" id="worker-form-section">
            <h3 class="${adminShell.sectionTitle}">Añadir / Editar Trabajador</h3>
            <form id="worker-form" class="space-y-5 sm:space-y-6">
                <input type="hidden" id="edit-worker-id" value="" />
                <div class="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div>
                        <label class="${form.label}">DNI</label>
                        <input type="text" id="worker-dni" placeholder="8 dígitos" class="${form.input}" required maxlength="8" pattern="\\d{8}" />
                    </div>
                    <div>
                        <label class="${form.label}">Empresa</label>
                        <select id="worker-company" class="${form.input}" required>
                            <option value="">Seleccione una empresa</option>
                            ${this.companies.map(c => `<option value="${c.nombre}">${escapeHtml(c.nombre)}</option>`).join('')}
                        </select>
                    </div>
                    <div>
                        <label class="${form.label}">Nombres</label>
                        <input type="text" id="worker-name" placeholder="Nombres" class="${form.input}" required />
                    </div>
                    <div>
                        <label class="${form.label}">Apellidos</label>
                        <input type="text" id="worker-lastname" placeholder="Apellidos" class="${form.input}" required />
                    </div>
                    <div class="flex items-center gap-3 md:col-span-2 p-3 bg-primary/5 rounded-2xl border border-primary/10">
                        <input type="checkbox" id="worker-is-field-manager" class="w-5 h-5 rounded-lg border-2 border-surface-variant text-primary focus:ring-primary cursor-pointer shrink-0" />
                        <label for="worker-is-field-manager" class="text-[10px] sm:text-xs font-black uppercase tracking-tight text-primary cursor-pointer leading-tight">
                            ¿Es Encargado de Campo? <span class="block sm:inline font-bold opacity-60">(Permitir raciones grupales)</span>
                        </label>
                    </div>
                </div>

                <div class="p-5 bg-white rounded-[2rem] border border-surface-variant flex flex-col items-center gap-4 shadow-inner">
                    <p class="text-[9px] font-black uppercase text-primary tracking-widest text-center">Registro de Huella Digital</p>
                    <div class="flex gap-2.5">
                        ${[1, 2, 3].map(i => `<div id="step-dot-${i}" class="h-5 w-5 rounded-full border-2 border-surface-variant bg-surface transition-all flex items-center justify-center text-[9px] font-black text-on-surface-variant">${i}</div>`).join('')}
                    </div>
                    <div id="fingerprint-status" class="flex flex-col items-center gap-2 py-3.5 px-6 rounded-[1.5rem] bg-surface-container-low border border-surface-variant w-full max-w-xs text-center">
                        <div class="flex items-center gap-3">
                            <div id="status-dot" class="h-2.5 w-2.5 rounded-full bg-red-400"></div>
                            <span id="status-text" class="text-[11px] font-bold text-on-surface-variant uppercase tracking-tight">Sin huellas</span>
                        </div>
                        <p id="status-instruction" class="text-[9px] font-black text-primary hidden uppercase animate-pulse">Inicie la captura...</p>
                    </div>
                    <input type="hidden" id="worker-huellas" value="" />
                    <button type="button" id="capture-fingerprint-btn" class="${button.base} ${button.outlineDark} py-3 px-8 flex items-center gap-3 w-full sm:w-auto justify-center">
                        <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4"/><path d="M14 13.12c0 2.38 0 6.38-1 8.88"/><path d="M17.29 21.02c.12-.6.43-2.3.5-3.02"/><path d="M2 12a10 10 0 0 1 18-6"/><path d="M2 16h.01"/><path d="M21.8 16c.2-2 .131-5.354 0-6"/><path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2"/><path d="M8.65 22c.21-.66.45-1.32.57-2"/><path d="M9 6.8a6 6 0 0 1 9 5.2v2"/></svg>
                        <span id="btn-capture-text" class="text-[10px] font-black uppercase tracking-widest">Iniciar Captura</span>
                    </button>
                </div>

                <div class="flex flex-col gap-3">
                    <button type="submit" id="submit-worker-btn" class="${button.base} ${button.primary} w-full py-4 text-base sm:text-lg shadow-xl shadow-primary/20 uppercase tracking-widest font-black">Guardar Trabajador</button>
                    <button type="button" id="cancel-worker-edit" class="hidden ${button.base} ${button.outlineDark} w-full py-3.5 uppercase text-xs font-black tracking-widest">Cancelar Edición</button>
                </div>
            </form>
        </div>
    `;
  }

  _renderFilters() {
    return `
        <div class="flex flex-col md:flex-row gap-3 sm:gap-4 mb-8">
            <div class="flex-[2] relative">
                <input type="search" id="search-worker" placeholder="Buscar trabajador..." class="${form.input} py-4 pl-12 rounded-2xl shadow-sm focus:ring-primary/20" autocomplete="off" />
                <svg class="absolute left-4 top-4 h-5 w-5 text-on-surface-variant opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke-width="2.5"></path></svg>
            </div>
            <div class="flex-1">
                <select id="filter-company" class="${form.input} py-4 rounded-2xl shadow-sm focus:ring-primary/20">
                    <option value="">Todas las empresas</option>
                    ${this.companies.map(c => `<option value="${c.nombre}">${escapeHtml(c.nombre)}</option>`).join('')}
                </select>
            </div>
        </div>
    `;
  }

  _renderDetailModal() {
    return `
        <div id="worker-detail-modal" class="hidden fixed inset-0 z-[150] flex items-center justify-center p-4">
            <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" id="close-modal-overlay"></div>
            <div class="relative bg-surface w-full max-w-2xl max-h-[90vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-scale-in">
                <div class="p-8 border-b border-surface-variant bg-surface flex justify-between items-center shrink-0">
                    <h2 class="text-xl font-black text-primary uppercase tracking-tight">Ficha del Trabajador</h2>
                    <button id="close-detail-modal" class="p-2 rounded-full hover:bg-background transition-colors">
                        <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" stroke-width="2.5"/></svg>
                    </button>
                </div>
                <div class="flex-1 overflow-y-auto p-8" id="worker-detail-content"></div>
            </div>
        </div>
    `;
  }

  setupEventListeners(acciones) {
    const { onBack, onSave, onDelete, onEdit, onCapture, onSearch, onViewDetails } = acciones;
    const backBtn = this.rootElement.querySelector("#back-from-workers");
    if (backBtn) backBtn.onclick = onBack;

    const formElement = document.getElementById("worker-form");
    formElement.onsubmit = async (e) => {
      e.preventDefault();
      const huellasStr = document.getElementById("worker-huellas").value;
      if (!huellasStr) {
        if (!await dialog.confirm("Sin huellas", "¿Desea guardar al trabajador sin huellas digitales?")) return;
      }

      const data = {
        dni: document.getElementById("worker-dni").value.trim(),
        nombre: document.getElementById("worker-name").value.trim(),
        apellidos: document.getElementById("worker-lastname").value.trim(),
        empresa: document.getElementById("worker-company").value,
        esEncargadoCampo: document.getElementById("worker-is-field-manager").checked,
        huellas: huellasStr ? JSON.parse(huellasStr) : []
      };
      data.huella = data.huellas.length > 0 ? data.huellas[0] : null;
      onSave(document.getElementById("edit-worker-id").value, data);
    };

    document.getElementById("cancel-worker-edit").onclick = () => this.resetForm();

    document.getElementById("capture-fingerprint-btn").onclick = async () => {
        this.capturedTemplates = []; this.updateStepDots(0);
        const btn = document.getElementById("capture-fingerprint-btn");
        const btnText = document.getElementById("btn-capture-text");
        const ins = document.getElementById("status-instruction");
        const st = document.getElementById("status-text");
        const dot = document.getElementById("status-dot");
        btn.disabled = true; btn.classList.add("opacity-50");
        try {
            for (let i = 1; i <= 3; i++) {
                btnText.textContent = `Capturando Toma ${i}/3...`;
                ins.textContent = `TOMA ${i}: Coloque su dedo...`;
                ins.className = "text-[10px] font-bold text-primary uppercase animate-pulse"; ins.classList.remove("hidden");
                st.textContent = `Esperando dedo (${i}/3)`; dot.className = "h-3 w-3 rounded-full bg-amber-400 animate-pulse";
                const result = await onCapture((step) => {
                    if (step === 'captured') {
                        ins.textContent = `¡TOMA ${i} CAPTURADA! RETIRE EL DEDO`;
                        ins.className = "text-[10px] font-bold text-green-600 uppercase animate-bounce";
                        st.textContent = `Procesando...`; dot.className = "h-3 w-3 rounded-full bg-green-500";
                    }
                });
                if (result) { this.capturedTemplates.push(result); this.updateStepDots(i); if (i < 3) await new Promise(resolve => setTimeout(resolve, 2000)); }
            }
            document.getElementById("worker-huellas").value = JSON.stringify(this.capturedTemplates);
            this.updateFingerprintStatus(true);
            ins.textContent = "¡Registro Completo!"; ins.className = "text-[10px] font-bold text-green-600 uppercase";
            setTimeout(() => ins.classList.add("hidden"), 3000);
        } catch (e) {
            toast.error("Error en captura: " + e.message);
            this.updateFingerprintStatus(false); ins.classList.add("hidden"); this.updateStepDots(0);
        } finally { btn.disabled = false; btn.classList.remove("opacity-50"); btnText.textContent = "Reiniciar Captura (3 tomas)"; }
    };

    const handleSearch = () => onSearch(document.getElementById("search-worker").value, document.getElementById("filter-company").value);
    document.getElementById("search-worker").oninput = handleSearch;
    document.getElementById("filter-company").onchange = handleSearch;
    document.getElementById("close-detail-modal").onclick = () => this.toggleModal(false);
    document.getElementById("close-modal-overlay").onclick = () => this.toggleModal(false);
    this.attachListEvents(onEdit, onDelete, onViewDetails);
  }

  toggleModal(show) {
    const m = document.getElementById("worker-detail-modal");
    if (show) m.classList.remove("hidden"); else m.classList.add("hidden");
  }

  resetForm() {
    document.getElementById("edit-worker-id").value = ""; document.getElementById("worker-form").reset();
    document.getElementById("worker-huellas").value = ""; this.capturedTemplates = [];
    this.updateFingerprintStatus(false); this.updateStepDots(0);
    document.getElementById("submit-worker-btn").textContent = "Guardar Trabajador";
    document.getElementById("btn-capture-text").textContent = "Iniciar Captura (3 tomas)";
    document.getElementById("cancel-worker-edit").classList.add("hidden");
  }

  updateStepDots(count) {
    for (let i = 1; i <= 3; i++) {
        const dot = document.getElementById(`step-dot-${i}`); if (!dot) continue;
        dot.className = i <= count ? "h-4 w-4 rounded-full border-2 border-green-500 bg-green-500 text-white flex items-center justify-center text-[8px] font-bold" : "h-4 w-4 rounded-full border-2 border-surface-variant bg-surface text-on-surface-variant flex items-center justify-center text-[8px] font-bold";
    }
  }

  attachListEvents(onEdit, onDelete, onViewDetails) {
    this.rootElement.querySelectorAll(".delete-worker-btn").forEach((btn) => {
      btn.onclick = async (e) => { 
        e.preventDefault();
        e.stopPropagation(); 
        if(await dialog.confirm("Eliminar", "¿Eliminar a este trabajador?")) onDelete(btn.dataset.id); 
      };
    });
    this.rootElement.querySelectorAll(".edit-worker-btn").forEach((btn) => {
      btn.onclick = (e) => { 
        e.preventDefault();
        e.stopPropagation(); 
        onEdit(btn.dataset.id); 
      };
    });
    this.rootElement.querySelectorAll(".worker-row").forEach((row) => {
        row.onclick = () => {
            if (onViewDetails) onViewDetails(row.dataset.id);
        };
    });
  }

  updateFingerprintStatus(hasHuellas) {
    const dot = document.getElementById("status-dot"), text = document.getElementById("status-text");
    if (hasHuellas) { dot.className = "h-3 w-3 rounded-full bg-green-500"; text.textContent = "Huellas (3/3)"; }
    else { dot.className = "h-3 w-3 rounded-full bg-red-400"; text.textContent = "Sin huellas"; }
  }

  _renderWorkerList(workers) {
    if (workers.length === 0) return `<div class="py-10 text-center text-on-surface-variant opacity-60">No se encontraron trabajadores.</div>`;
    return workers.map(w => {
        const count = w.huellas ? w.huellas.length : (w.huella ? 1 : 0);
        return `
            <div class="worker-row p-4 sm:p-5 rounded-2xl border border-surface-variant bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:shadow-md transition-all cursor-pointer hover:border-primary/30" data-id="${w.id}">
                <div class="flex items-center gap-4 min-w-0">
                    <div class="h-12 w-12 rounded-full bg-surface-container-low flex items-center justify-center border border-surface-variant shrink-0">
                        <svg class="h-6 w-6 text-on-surface-variant opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                    </div>
                    <div class="min-w-0">
                        <div class="flex flex-wrap items-center gap-2">
                            <p class="text-sm font-black text-on-background truncate uppercase tracking-tight">${escapeHtml(w.apellidos)}, ${escapeHtml(w.nombre)}</p>
                            ${w.esEncargadoCampo 
                                ? `<span class="text-[8px] font-black text-primary uppercase bg-primary/10 px-1.5 py-0.5 rounded shrink-0">Encargado</span>` 
                                : `<span class="text-[8px] font-black text-stone-400 uppercase bg-stone-100 px-1.5 py-0.5 rounded shrink-0">Personal</span>`
                            }
                        </div>
                        <div class="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                            <p class="text-[10px] text-primary font-bold uppercase tracking-tighter">${escapeHtml(w.empresa || 'Sin empresa')}</p>
                            <p class="text-[10px] text-on-surface-variant font-medium opacity-60">DNI: ${escapeHtml(w.dni)}</p>
                        </div>
                    </div>
                </div>
                
                <div class="flex items-center justify-between sm:justify-end gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-surface-variant/50">
                    <div class="flex items-center gap-1.5">
                        <div class="h-2 w-2 rounded-full ${count >= 3 ? 'bg-green-500' : (count > 0 ? 'bg-amber-400' : 'bg-red-400')}"></div>
                        <span class="text-[10px] font-black uppercase tracking-tighter text-on-surface-variant/60">${count} Huellas</span>
                    </div>
                    <div class="flex gap-2">
                        <button class="edit-worker-btn flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-tight hover:bg-blue-600 hover:text-white transition-all border border-blue-100 shadow-sm" data-id="${w.id}">
                            <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                            Editar
                        </button>
                        <button class="delete-worker-btn flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-tight hover:bg-red-600 hover:text-white transition-all border border-red-100 shadow-sm" data-id="${w.id}">
                            <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                            Borrar
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join("");
  }

  prepareEdit(worker) {
    document.getElementById("worker-dni").value = worker.dni; document.getElementById("worker-name").value = worker.nombre;
    document.getElementById("worker-lastname").value = worker.apellidos; document.getElementById("worker-company").value = worker.empresa || "";
    document.getElementById("worker-is-field-manager").checked = !!worker.esEncargadoCampo;
    const huellas = worker.huellas || (worker.huella ? [worker.huella] : []);
    this.capturedTemplates = huellas; document.getElementById("worker-huellas").value = JSON.stringify(huellas);
    document.getElementById("edit-worker-id").value = worker.id;
    this.updateFingerprintStatus(huellas.length > 0); this.updateStepDots(huellas.length);
    document.getElementById("submit-worker-btn").textContent = "Actualizar Trabajador";
    document.getElementById("cancel-worker-edit").classList.remove("hidden");
    document.getElementById("worker-form-section").scrollIntoView({ behavior: "smooth", block: "center" });
  }

  showWorkerDetails(worker, attendance, reportActions) {
    const { onDownloadPdf, onDownloadExcel } = reportActions;
    this.toggleModal(true);
    const content = document.getElementById("worker-detail-content");
    const now = new Date(), startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1), startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());

    const stats = {
        total: attendance.length,
        desayunos: attendance.filter(a => a.tipo === "Desayuno").length,
        almuerzos: attendance.filter(a => a.tipo === "Almuerzo").length,
        cenas: attendance.filter(a => a.tipo === "Cena").length,
        thisMonth: attendance.filter(a => (a.timestamp?.seconds ? new Date(a.timestamp.seconds * 1000) : new Date(a.fecha)) >= startOfMonth).length,
        thisWeek: attendance.filter(a => (a.timestamp?.seconds ? new Date(a.timestamp.seconds * 1000) : new Date(a.fecha)) >= startOfWeek).length
    };

    content.innerHTML = `
        <div class="space-y-6 sm:space-y-8">
            ${this._renderWorkerProfile(worker)}
            ${this._renderWorkerStats(stats)}
            
            <div class="grid grid-cols-2 gap-3 sm:gap-4">
                <div class="bg-surface-container-low p-4 sm:p-5 rounded-3xl border border-surface-variant text-center">
                    <span class="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/40 mb-1">Este Mes</span><br>
                    <span class="text-xl sm:text-2xl font-black text-primary">${stats.thisMonth}</span>
                </div>
                <div class="bg-surface-container-low p-4 sm:p-5 rounded-3xl border border-surface-variant text-center">
                    <span class="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/40 mb-1">Esta Semana</span><br>
                    <span class="text-xl sm:text-2xl font-black text-primary">${stats.thisWeek}</span>
                </div>
            </div>

            ${this._renderReportControls()}
            
            <div class="overflow-x-auto rounded-3xl border border-surface-variant bg-white">
                <table class="w-full text-left min-w-[400px]">
                    <thead class="bg-surface-container-low text-[9px] font-black uppercase tracking-widest text-on-surface-variant/60">
                        <tr>
                            <th class="px-4 sm:px-6 py-4">Fecha</th>
                            <th class="px-4 sm:px-6 py-4">Hora</th>
                            <th class="px-4 sm:px-6 py-4">Tipo</th>
                            <th class="px-4 sm:px-6 py-4 text-right">Empresa</th>
                        </tr>
                    </thead>
                    <tbody id="attendance-table-body" class="divide-y divide-surface-variant">
                        ${this._renderAttendanceRows(attendance)}
                    </tbody>
                </table>
            </div>
        </div>
    `;

    const s = document.getElementById("report-start"), e = document.getElementById("report-end"), tb = document.getElementById("attendance-table-body");
    const updateTable = () => {
        let f = [...attendance]; if (s.value) f = f.filter(a => a.fecha >= s.value); if (e.value) f = f.filter(a => a.fecha <= e.value);
        if (tb) tb.innerHTML = this._renderAttendanceRows(f);
    };
    s.onchange = updateTable; e.onchange = updateTable;
    document.getElementById("btn-report-today").onclick = () => { const t = getLocalDateString(); s.value = t; e.value = t; updateTable(); };
    document.getElementById("btn-report-month").onclick = () => { s.value = getLocalDateString(new Date(now.getFullYear(), now.getMonth(), 1)); e.value = getLocalDateString(new Date(now.getFullYear(), now.getMonth() + 1, 0)); updateTable(); };
    document.getElementById("btn-report-all").onclick = () => { s.value = ""; e.value = ""; updateTable(); };
    document.getElementById("download-pdf-btn").onclick = () => { const f = [...attendance].filter(a => (!s.value || a.fecha >= s.value) && (!e.value || a.fecha <= e.value)); if (f.length === 0) return toast.info("Sin registros."); onDownloadPdf(worker, f); };
    document.getElementById("download-excel-btn").onclick = () => { const f = [...attendance].filter(a => (!s.value || a.fecha >= s.value) && (!e.value || a.fecha <= e.value)); if (f.length === 0) return toast.info("Sin registros."); onDownloadExcel(worker, f); };
  }

  _renderWorkerProfile(worker) {
    return `
        <div class="flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-6 p-5 sm:p-6 bg-surface-container-low rounded-3xl border border-surface-variant text-center sm:text-left">
            <div class="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0 shadow-inner">
                <svg class="h-8 w-8 sm:h-10 sm:w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" stroke-width="1.5"/></svg>
            </div>
            <div class="flex-1 min-w-0">
                <h3 class="text-lg sm:text-xl font-black text-on-background uppercase tracking-tight leading-tight mb-2">${escapeHtml(worker.apellidos)}, ${escapeHtml(worker.nombre)}</h3>
                <div class="flex flex-wrap justify-center sm:justify-start gap-2 items-center mb-3">
                    <p class="text-xs font-black text-primary uppercase tracking-widest">${escapeHtml(worker.empresa || 'Particular')}</p>
                    <span class="h-1 w-1 rounded-full bg-surface-variant hidden sm:block"></span>
                    ${worker.esEncargadoCampo 
                        ? `<span class="text-[8px] font-black text-primary uppercase bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20 tracking-tighter">Encargado de Campo</span>` 
                        : `<span class="text-[8px] font-black text-stone-400 uppercase bg-stone-100 px-2 py-0.5 rounded-full border border-stone-200 tracking-tighter">Personal</span>`
                    }
                </div>
                <p class="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest bg-white/50 px-3 py-1 rounded-lg inline-block">DNI: ${worker.dni}</p>
            </div>
        </div>
    `;
  }

  _renderWorkerStats(stats) {
    return `
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div class="bg-primary p-4 sm:p-5 rounded-3xl text-center shadow-lg shadow-primary/20 relative overflow-hidden group">
                <div class="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <span class="text-[8px] font-black uppercase tracking-widest text-white/50 mb-1 block relative z-10">Total</span>
                <span class="text-2xl sm:text-3xl font-black text-white relative z-10">${stats.total}</span>
            </div>
            <div class="bg-white p-4 sm:p-5 rounded-3xl border border-surface-variant text-center shadow-sm">
                <span class="text-[8px] font-black uppercase tracking-widest text-on-surface-variant/40 mb-1 block">D</span>
                <span class="text-xl sm:text-2xl font-black text-primary">${stats.desayunos}</span>
            </div>
            <div class="bg-white p-4 sm:p-5 rounded-3xl border border-surface-variant text-center shadow-sm">
                <span class="text-[8px] font-black uppercase tracking-widest text-on-surface-variant/40 mb-1 block">A</span>
                <span class="text-xl sm:text-2xl font-black text-primary">${stats.almuerzos}</span>
            </div>
            <div class="bg-white p-4 sm:p-5 rounded-3xl border border-surface-variant text-center shadow-sm">
                <span class="text-[8px] font-black uppercase tracking-widest text-on-surface-variant/40 mb-1 block">C</span>
                <span class="text-xl sm:text-2xl font-black text-primary">${stats.cenas}</span>
            </div>
        </div>
    `;
  }

  _renderReportControls() {
    return `
        <div class="bg-surface p-5 sm:p-7 rounded-[2rem] border-2 border-primary/10 shadow-sm space-y-6">
            <div class="flex items-center gap-3">
                <div class="h-10 w-10 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
                    <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke-width="2"/></svg>
                </div>
                <div class="min-w-0">
                    <h4 class="text-xs sm:text-sm font-black uppercase tracking-widest text-primary truncate">Reportes</h4>
                    <p class="text-[9px] font-bold text-on-surface-variant opacity-60 uppercase tracking-tight">Filtra y descarga registros</p>
                </div>
            </div>
            
            <div class="flex flex-wrap gap-2">
                <button id="btn-report-today" class="flex-1 min-w-[70px] py-2.5 rounded-xl border-2 border-surface-variant bg-surface text-[9px] font-black uppercase hover:border-primary/40 hover:bg-primary/5 transition-all">Hoy</button>
                <button id="btn-report-month" class="flex-1 min-w-[70px] py-2.5 rounded-xl border-2 border-surface-variant bg-surface text-[9px] font-black uppercase hover:border-primary/40 hover:bg-primary/5 transition-all">Mes</button>
                <button id="btn-report-all" class="flex-1 min-w-[70px] py-2.5 rounded-xl border-2 border-surface-variant bg-surface text-[9px] font-black uppercase hover:border-primary/40 hover:bg-primary/5 transition-all">Todo</button>
            </div>
            
            <div class="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                    <label class="text-[9px] font-black uppercase text-on-surface-variant/40 ml-1 mb-1 block">Desde</label>
                    <input type="date" id="report-start" class="w-full bg-background border-2 border-surface-variant rounded-xl px-3 py-2.5 text-[10px] font-bold focus:border-primary transition-colors">
                </div>
                <div>
                    <label class="text-[9px] font-black uppercase text-on-surface-variant/40 ml-1 mb-1 block">Hasta</label>
                    <input type="date" id="report-end" class="w-full bg-background border-2 border-surface-variant rounded-xl px-3 py-2.5 text-[10px] font-bold focus:border-primary transition-colors">
                </div>
            </div>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button id="download-pdf-btn" class="${button.base} ${button.primary} w-full py-4 rounded-2xl shadow-lg shadow-primary/20 uppercase text-[10px] tracking-[0.15em] gap-2">
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" stroke-width="2.5"/></svg> PDF
                </button>
                <button id="download-excel-btn" class="${button.base} border-2 border-green-600 text-green-700 hover:bg-green-50 w-full py-4 rounded-2xl shadow-lg shadow-green-600/5 uppercase text-[10px] tracking-[0.15em] gap-2">
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke-width="2.5"/></svg> EXCEL
                </button>
            </div>
        </div>
    `;
  }

  _renderAttendanceRows(attendance) {
    if (attendance.length === 0) return `<tr><td colspan="4" class="px-4 sm:px-6 py-10 text-center text-[10px] font-bold text-on-surface-variant opacity-40 uppercase tracking-widest">Sin registros encontrados</td></tr>`;
    return attendance.map(reg => `
        <tr class="hover:bg-background transition-colors text-[10px] font-bold text-on-background">
            <td class="px-4 sm:px-6 py-4 whitespace-nowrap">${reg.fecha}</td>
            <td class="px-4 sm:px-6 py-4 opacity-50 font-mono">${reg.timestamp?.seconds ? new Date(reg.timestamp.seconds * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '---'}</td>
            <td class="px-4 sm:px-6 py-4">
                <span class="px-2 py-0.5 rounded-md bg-primary/5 text-primary text-[8px] font-black uppercase border border-primary/10 tracking-tighter">${reg.tipo}</span>
            </td>
            <td class="px-4 sm:px-6 py-4 text-right opacity-50 uppercase text-[9px] truncate max-w-[100px]">${escapeHtml(reg.empresa || 'Particular')}</td>
        </tr>
    `).join('');
  }

  renderListOnly(workers, onEdit, onDelete, onViewDetails) {
    const c = document.getElementById("workers-list-container"); if (c) { c.innerHTML = this._renderWorkerList(workers); this.attachListEvents(onEdit, onDelete, onViewDetails); }
  }
}
