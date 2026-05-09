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
                <div class="${adminShell.header}">
                    <div>
                        <h2 class="${adminShell.title}">Gestión de Trabajadores</h2>
                        <p class="${adminShell.subtitle}">Registra, modifica y elimina trabajadores, incluyendo su huella digital.</p>
                    </div>
                    <button type="button" id="back-from-workers" class="${adminShell.backBtn}">
                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        Cerrar gestión
                    </button>
                </div>

                <div class="${adminShell.mutedBox} mb-12 scroll-mt-24" id="worker-form-section">
                    <h3 class="${adminShell.sectionTitle}">Añadir / Editar Trabajador</h3>
                    <form id="worker-form" class="space-y-6">
                        <input type="hidden" id="edit-worker-id" value="" />
                        <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
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
                            <div class="flex items-center gap-2 md:col-span-2 p-2 bg-primary/5 rounded-xl border border-primary/10">
                                <input type="checkbox" id="worker-is-field-manager" class="w-5 h-5 rounded-lg border-2 border-surface-variant text-primary focus:ring-primary cursor-pointer" />
                                <label for="worker-is-field-manager" class="text-xs font-black uppercase tracking-tight text-primary cursor-pointer">
                                    ¿Es Encargado de Campo? (Puede llevar raciones grupales)
                                </label>
                            </div>
                        </div>

                        <div class="p-4 bg-surface rounded-2xl border border-surface-variant flex flex-col items-center gap-4">
                            <p class="text-[10px] font-bold uppercase text-primary tracking-widest">Huella Digital (Se requieren 3 tomas)</p>
                            <div class="flex gap-2 mb-2">
                                ${[1, 2, 3].map(i => `<div id="step-dot-${i}" class="h-4 w-4 rounded-full border-2 border-surface-variant bg-surface transition-all flex items-center justify-center text-[8px] font-bold text-on-surface-variant">${i}</div>`).join('')}
                            </div>
                            <div id="fingerprint-status" class="flex flex-col items-center gap-2 py-3 px-6 rounded-3xl bg-surface-container-low border border-surface-variant w-full max-w-xs text-center">
                                <div class="flex items-center gap-3">
                                    <div id="status-dot" class="h-3 w-3 rounded-full bg-red-400"></div>
                                    <span id="status-text" class="text-xs font-bold text-on-surface-variant">Sin huellas</span>
                                </div>
                                <p id="status-instruction" class="text-[10px] font-bold text-primary hidden uppercase animate-pulse">Inicie la captura...</p>
                            </div>
                            <input type="hidden" id="worker-huellas" value="" />
                            <button type="button" id="capture-fingerprint-btn" class="${button.base} ${button.outlineDark} py-2 px-6 flex items-center gap-2">
                                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A10.003 10.003 0 0012 3m0 0c.887 0 1.741.099 2.56.287M12 3v18m0-18a10.005 10.005 0 018.574 14.821m-5.965-12.727L12 3m0 0l-5.609 5.094M12 3L6.391 8.094M12 3l5.609 5.094" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                                <span id="btn-capture-text">Iniciar Captura (3 tomas)</span>
                            </button>
                        </div>

                        <button type="submit" id="submit-worker-btn" class="${button.base} ${button.primary} w-full py-4 text-lg">Guardar Trabajador</button>
                        <button type="button" id="cancel-worker-edit" class="hidden ${button.base} ${button.outlineDark} w-full py-3 mt-2">Cancelar Edición</button>
                    </form>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div class="md:col-span-2 relative">
                        <input type="search" id="search-worker" placeholder="Buscar por DNI o Nombre..." class="${form.input} py-4 pl-12 rounded-2xl shadow-sm" autocomplete="off" />
                        <svg class="absolute left-4 top-4 h-5 w-5 text-on-surface-variant opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </div>
                    <div>
                        <select id="filter-company" class="${form.input} py-4 rounded-2xl shadow-sm">
                            <option value="">Todas las empresas</option>
                            ${this.companies.map(c => `<option value="${c.nombre}">${escapeHtml(c.nombre)}</option>`).join('')}
                        </select>
                    </div>
                </div>
                
                <div id="workers-list-container" class="space-y-3">
                    ${this.renderWorkerList(workers)}
                </div>
            </div>
        </div>

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
    this.setupEventListeners(acciones);
  }

  setupEventListeners(acciones) {
    const { onBack, onSave, onDelete, onEdit, onCapture, onSearch, onViewDetails } = acciones;
    document.getElementById("back-from-workers").onclick = onBack;

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
                if (result) { this.capturedTemplates.push(result); this.updateStepDots(i); if (i < 3) await new Promise(r => setTimeout(r, 2000)); }
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
      btn.onclick = async (e) => { e.stopPropagation(); if(await dialog.confirm("Eliminar", "¿Eliminar a este trabajador?")) onDelete(btn.dataset.id); };
    });
    this.rootElement.querySelectorAll(".edit-worker-btn").forEach((btn) => {
      btn.onclick = (e) => { e.stopPropagation(); onEdit(btn.dataset.id); };
    });
    this.rootElement.querySelectorAll(".worker-row").forEach((row) => {
        row.onclick = () => onViewDetails(row.dataset.id);
    });
  }

  updateFingerprintStatus(hasHuellas) {
    const dot = document.getElementById("status-dot"), text = document.getElementById("status-text");
    if (hasHuellas) { dot.className = "h-3 w-3 rounded-full bg-green-500"; text.textContent = "Huellas (3/3)"; }
    else { dot.className = "h-3 w-3 rounded-full bg-red-400"; text.textContent = "Sin huellas"; }
  }

  renderWorkerList(workers) {
    if (workers.length === 0) return `<div class="py-10 text-center text-on-surface-variant opacity-60">No se encontraron trabajadores.</div>`;
    return workers.map(w => {
        const count = w.huellas ? w.huellas.length : (w.huella ? 1 : 0);
        return `
            <div class="worker-row p-4 rounded-2xl border border-surface-variant bg-surface flex items-center justify-between shadow-sm hover:shadow-md transition-all cursor-pointer hover:border-primary/30" data-id="${w.id}">
                <div class="flex items-center gap-4">
                    <div class="h-10 w-10 rounded-full bg-surface-container-low flex items-center justify-center border border-surface-variant">
                        <svg class="h-6 w-6 text-on-surface-variant opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                    </div>
                    <div>
                        <p class="text-sm font-bold text-on-background">${escapeHtml(w.apellidos)}, ${escapeHtml(w.nombre)}</p>
                        <p class="text-[10px] text-primary font-bold uppercase tracking-tighter">${escapeHtml(w.empresa || 'Sin empresa')}</p>
                        <p class="text-xs text-on-surface-variant opacity-60">DNI: ${escapeHtml(w.dni)}</p>
                    </div>
                </div>
                <div class="flex items-center gap-4">
                    <div class="flex items-center gap-1.5">
                        <div class="h-2 w-2 rounded-full ${count >= 3 ? 'bg-green-500' : (count > 0 ? 'bg-amber-400' : 'bg-red-400')}"></div>
                        <span class="text-[10px] font-bold uppercase tracking-tighter text-on-surface-variant opacity-60">${count} huellas</span>
                    </div>
                    <div class="flex gap-1">
                        <button class="edit-worker-btn p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" data-id="${w.id}"><svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg></button>
                        <button class="delete-worker-btn p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors" data-id="${w.id}"><svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
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
    this.toggleModal(true); const content = document.getElementById("worker-detail-content");
    const now = new Date(), startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1), startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const total = attendance.length, thisMonth = attendance.filter(a => (a.timestamp?.seconds ? new Date(a.timestamp.seconds * 1000) : new Date(a.fecha)) >= startOfMonth).length;
    const thisWeek = attendance.filter(a => (a.timestamp?.seconds ? new Date(a.timestamp.seconds * 1000) : new Date(a.fecha)) >= startOfWeek).length;

    content.innerHTML = `
        <div class="space-y-8">
            <div class="flex flex-col sm:flex-row items-center gap-6 p-6 bg-surface-container-low rounded-3xl border border-surface-variant">
                <div class="h-20 w-20 rounded-full bg-primary/5 text-primary flex items-center justify-center border border-primary/10 shrink-0">
                    <svg class="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                </div>
                <div class="text-center sm:text-left flex-1">
                    <h3 class="text-xl font-black text-on-background uppercase">${escapeHtml(worker.apellidos)}, ${escapeHtml(worker.nombre)}</h3>
                    <p class="text-sm font-bold text-primary uppercase tracking-wider">${escapeHtml(worker.empresa || 'Particular')}</p>
                    <p class="text-xs text-on-surface-variant font-bold opacity-60 mt-1">DNI: ${worker.dni}</p>
                </div>
            </div>
            <div class="bg-surface p-6 rounded-[2rem] border-2 border-primary/10 shadow-sm space-y-6">
                <div class="flex items-center gap-3">
                    <div class="h-10 w-10 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20"><svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke-width="2"/></svg></div>
                    <div><h4 class="text-sm font-black uppercase tracking-widest text-primary">Reportes</h4><p class="text-[10px] font-bold text-on-surface-variant opacity-60 uppercase">Exportar a PDF o Excel</p></div>
                </div>
                <div class="flex flex-wrap gap-2">
                    <button id="btn-report-today" class="flex-1 py-3 px-4 rounded-xl border-2 border-surface-variant bg-surface text-[10px] font-black uppercase hover:border-primary/40 hover:bg-primary/5 transition-all">Hoy</button>
                    <button id="btn-report-month" class="flex-1 py-3 px-4 rounded-xl border-2 border-surface-variant bg-surface text-[10px] font-black uppercase hover:border-primary/40 hover:bg-primary/5 transition-all">Mes</button>
                    <button id="btn-report-all" class="flex-1 py-3 px-4 rounded-xl border-2 border-surface-variant bg-surface text-[10px] font-black uppercase hover:border-primary/40 hover:bg-primary/5 transition-all">Todo</button>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div><label class="text-[10px] font-black uppercase text-on-surface-variant/40 ml-1">Inicio</label><input type="date" id="report-start" class="w-full bg-background border-2 border-surface-variant rounded-xl px-4 py-3 text-xs font-bold"></div>
                    <div><label class="text-[10px] font-black uppercase text-on-surface-variant/40 ml-1">Fin</label><input type="date" id="report-end" class="w-full bg-background border-2 border-surface-variant rounded-xl px-4 py-3 text-xs font-bold"></div>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button id="download-pdf-btn" class="${button.base} ${button.primary} w-full py-5 rounded-2xl shadow-xl shadow-primary/30 uppercase text-xs tracking-[0.2em] gap-3"><svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" stroke-width="2.5"/></svg> PDF</button>
                    <button id="download-excel-btn" class="${button.base} border-2 border-green-600 text-green-700 hover:bg-green-50 w-full py-5 rounded-2xl shadow-xl shadow-green-600/10 uppercase text-xs tracking-[0.2em] gap-3"><svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke-width="2.5"/></svg> EXCEL</button>
                </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div class="bg-surface p-5 rounded-3xl border border-surface-variant text-center"><span class="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40 mb-1">Total</span><br><span class="text-3xl font-black text-primary">${total}</span></div>
                <div class="bg-surface p-5 rounded-3xl border border-surface-variant text-center"><span class="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40 mb-1">Mes</span><br><span class="text-3xl font-black text-primary">${thisMonth}</span></div>
                <div class="bg-surface p-5 rounded-3xl border border-surface-variant text-center"><span class="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40 mb-1">Semana</span><br><span class="text-3xl font-black text-primary">${thisWeek}</span></div>
            </div>
        </div>
    `;
    const s = document.getElementById("report-start"), e = document.getElementById("report-end"), tb = document.getElementById("attendance-table-body");
    const updateTable = () => {
        let f = [...attendance]; if (s.value) f = f.filter(a => a.fecha >= s.value); if (e.value) f = f.filter(a => a.fecha <= e.value);
        if (tb) tb.innerHTML = this.renderAttendanceRows(f);
    };
    s.onchange = updateTable; e.onchange = updateTable;
    document.getElementById("btn-report-today").onclick = () => { const t = getLocalDateString(); s.value = t; e.value = t; updateTable(); };
    document.getElementById("btn-report-month").onclick = () => { s.value = getLocalDateString(new Date(now.getFullYear(), now.getMonth(), 1)); e.value = getLocalDateString(new Date(now.getFullYear(), now.getMonth() + 1, 0)); updateTable(); };
    document.getElementById("btn-report-all").onclick = () => { s.value = ""; e.value = ""; updateTable(); };
    document.getElementById("download-pdf-btn").onclick = () => { const f = [...attendance].filter(a => (!s.value || a.fecha >= s.value) && (!e.value || a.fecha <= e.value)); if (f.length === 0) return toast.info("Sin registros."); onDownloadPdf(worker, f); };
    document.getElementById("download-excel-btn").onclick = () => { const f = [...attendance].filter(a => (!s.value || a.fecha >= s.value) && (!e.value || a.fecha <= e.value)); if (f.length === 0) return toast.info("Sin registros."); onDownloadExcel(worker, f); };
  }

  renderAttendanceRows(attendance) {
    if (attendance.length === 0) return `<tr><td colspan="4" class="px-6 py-10 text-center text-xs font-bold text-on-surface-variant opacity-40">Sin registros</td></tr>`;
    return attendance.map(reg => `<tr class="hover:bg-background transition-colors text-xs font-bold text-on-background"><td class="px-6 py-4">${reg.fecha}</td><td class="px-6 py-4 opacity-60">${reg.timestamp?.seconds ? new Date(reg.timestamp.seconds * 1000).toLocaleTimeString() : '---'}</td><td class="px-6 py-4"><span class="px-2 py-1 rounded-lg bg-primary/5 text-primary text-[9px] uppercase tracking-tighter">${reg.tipo}</span></td><td class="px-6 py-4 opacity-60 text-[10px] uppercase">${escapeHtml(reg.empresa || 'Particular')}</td></tr>`).join('');
  }

  renderListOnly(workers, onEdit, onDelete, onViewDetails) {
    const c = document.getElementById("workers-list-container"); if (c) { c.innerHTML = this.renderWorkerList(workers); this.attachListEvents(onEdit, onDelete, onViewDetails); }
  }
}
