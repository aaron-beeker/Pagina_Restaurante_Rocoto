import { adminShell, button, form } from "../ui/layout.js";
import { escapeHtml } from "../utils/html.js";
import { getLocalDateString } from "../utils/dateUtils.js";
import { toast, dialog } from "../utils/notifications.js";

export class ManageAttendanceView {
  constructor(rootElement) {
    this.rootElement = rootElement;
    this.allAttendances = [];
    this.monthAttendances = [];
    this.allWorkers = [];
    this.companies = [];
    this.acciones = null;
  }

  render(data, workers, companies, acciones) {
    const { day, month } = data;
    this.allAttendances = day;
    this.monthAttendances = month;
    this.allWorkers = workers;
    this.companies = companies;
    this.acciones = acciones;
    const today = getLocalDateString();

    this.rootElement.innerHTML = `
        <div class="${adminShell.page}">
            <div class="${adminShell.card}">
                <div class="${adminShell.header}">
                    <div>
                        <h2 class="${adminShell.title}">Gestión de Asistencias</h2>
                        <p class="${adminShell.subtitle}">Administra, corrige y reporta las asistencias de los trabajadores.</p>
                    </div>
                    <button type="button" id="back-from-attendance" class="${adminShell.backBtn}">
                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        Cerrar gestión
                    </button>
                </div>

                <div id="attendance-dashboard" class="mb-12 space-y-8">
                    ${this.renderDashboard(this.allAttendances, this.monthAttendances)}
                </div>

                <!-- REGISTRO MANUAL / EDICIÓN -->
                <div class="${adminShell.mutedBox} mb-12 scroll-mt-24" id="attendance-form-section">
                    <h3 class="${adminShell.sectionTitle}" id="form-title">Registro Manual de Asistencia</h3>
                    <form id="attendance-form" class="space-y-6">
                        <input type="hidden" id="edit-attendance-id" value="" />
                        <div class="grid grid-cols-1 gap-6 md:grid-cols-4">
                            <div class="md:col-span-2">
                                <label class="${form.label}">Trabajador</label>
                                <div class="space-y-2">
                                    <input type="text" id="worker-search" placeholder="Buscar por nombre o DNI..." class="${form.input} border-primary/20 focus:border-primary" />
                                    <select id="attendance-worker-dni" class="${form.input}" required>
                                        ${this.renderWorkerOptions(this.allWorkers)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label class="${form.label}">Fecha</label>
                                <input type="date" id="attendance-date" class="${form.input}" required value="${today}" />
                            </div>
                            <div>
                                <label class="${form.label}">Tipo de Consumo</label>
                                <select id="attendance-type" class="${form.input}" required>
                                    <option value="Desayuno">Desayuno</option>
                                    <option value="Almuerzo" selected>Almuerzo</option>
                                    <option value="Cena">Cena</option>
                                </select>
                            </div>
                        </div>

                        <div id="field-manager-options" class="hidden grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-primary/5 rounded-3xl border border-primary/20 animate-fade-in">
                            <div>
                                <label class="${form.label} text-primary">Cantidad Raciones a Campo</label>
                                <input type="number" id="attendance-field-qty" class="${form.input} border-primary/30" placeholder="0" min="0" value="0" />
                            </div>
                            <div class="flex items-center gap-3 pt-6">
                                <input type="checkbox" id="attendance-also-eats" class="w-6 h-6 rounded-lg border-2 border-primary text-primary focus:ring-primary cursor-pointer" checked />
                                <label for="attendance-also-eats" class="text-xs font-black uppercase text-primary cursor-pointer">
                                    ¿Consumirá su ración en el local?
                                </label>
                            </div>
                        </div>

                        <div class="flex gap-4">
                            <button type="submit" id="submit-attendance-btn" class="${button.base} ${button.primary} flex-1 py-4 text-lg">Guardar Registro</button>
                            <button type="button" id="cancel-attendance-edit" class="hidden ${button.base} ${button.outlineDark} px-8">Cancelar</button>
                        </div>
                    </form>
                </div>

                <!-- PANEL DE REPORTES GRUPALES (PDF Y EXCEL) -->
                <div class="bg-surface p-8 rounded-[2.5rem] border-2 border-primary/10 shadow-sm mb-12">
                    <div class="flex items-center gap-4 mb-8">
                        <div class="h-12 w-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
                            <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke-width="2"/></svg>
                        </div>
                        <div>
                            <h3 class="text-lg font-black text-primary uppercase tracking-tight">Reportes Mensuales / Por Empresa</h3>
                            <p class="text-xs font-bold text-on-surface-variant opacity-60 uppercase">Exportación masiva de datos</p>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                         <div class="lg:col-span-2">
                            <label class="${form.label}">Empresa</label>
                            <select id="report-company" class="${form.input}">
                                <option value="">Todas las empresas</option>
                                ${this.companies.map(c => `<option value="${c.nombre}">${escapeHtml(c.nombre)}</option>`).join('')}
                            </select>
                        </div>
                        <div>
                            <label class="${form.label}">Fecha Inicio</label>
                            <input type="date" id="report-start-date" class="${form.input}" />
                        </div>
                        <div>
                            <label class="${form.label}">Fecha Fin</label>
                            <input type="date" id="report-end-date" class="${form.input}" />
                        </div>
                        <div class="lg:col-span-2 grid grid-cols-3 gap-2">
                            <div>
                                <label class="${form.label}">Precio D</label>
                                <input type="number" id="price-d" class="${form.input}" value="10.00" step="0.50" />
                            </div>
                            <div>
                                <label class="${form.label}">Precio A</label>
                                <input type="number" id="price-a" class="${form.input}" value="10.00" step="0.50" />
                            </div>
                            <div>
                                <label class="${form.label}">Precio C</label>
                                <input type="number" id="price-c" class="${form.input}" value="10.00" step="0.50" />
                            </div>
                        </div>
                    </div>

                    <div class="flex flex-wrap gap-4">
                        <button id="btn-group-pdf" class="${button.base} ${button.primary} flex-1 py-4 gap-3 uppercase text-xs font-black tracking-widest shadow-xl shadow-primary/20">
                            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" stroke-width="2.5"/></svg>
                            Reporte Grupal PDF
                        </button>
                        <button id="btn-group-excel" class="${button.base} border-2 border-green-600 text-green-700 hover:bg-green-50 flex-1 py-4 gap-3 uppercase text-xs font-black tracking-widest shadow-xl shadow-green-600/10">
                            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke-width="2.5"/></svg>
                            Reporte Grupal EXCEL
                        </button>
                    </div>
                </div>

                <div class="flex flex-col md:flex-row gap-4 mb-6 items-end">
                    <div class="flex-1 w-full">
                        <label class="${form.label}">Filtrar por Día</label>
                        <input type="date" id="filter-date" class="${form.input} shadow-sm" value="${today}" />
                    </div>
                    <div class="flex-1 w-full">
                        <label class="${form.label}">Filtrar por Empresa</label>
                        <select id="filter-company-list" class="${form.input} shadow-sm">
                            <option value="">Todas las empresas</option>
                            ${this.companies.map(c => `<option value="${c.nombre}">${escapeHtml(c.nombre)}</option>`).join('')}
                        </select>
                    </div>
                    <button id="refresh-list-btn" class="${button.base} ${button.outlineDark} py-4 px-6 rounded-2xl">
                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </button>
                </div>
                
                <div id="attendance-list-container" class="overflow-hidden rounded-3xl border border-surface-variant">
                    <table class="w-full text-left">
                        <thead class="bg-surface-container-low text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60">
                            <tr>
                                <th class="px-6 py-4">Trabajador</th>
                                <th class="px-6 py-4 text-center">DNI</th>
                                <th class="px-6 py-4 text-center">Empresa</th>
                                <th class="px-6 py-4 text-center">Tipo</th>
                                <th class="px-6 py-4 text-center">Raciones Campo</th>
                                <th class="px-6 py-4 text-center">Hora</th>
                                <th class="px-6 py-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="attendance-table-body" class="divide-y divide-surface-variant">
                            ${this.renderTableRows(this.allAttendances)}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
    this.setupEventListeners(acciones);
  }

  renderWorkerOptions(workers) {
    return `
        <option value="">Seleccione un trabajador</option>
        ${workers.sort((a,b) => a.apellidos.localeCompare(b.apellidos)).map(w => `
            <option value="${w.dni}">${escapeHtml(w.apellidos)}, ${escapeHtml(w.nombre)} (${w.dni}) ${w.esEncargadoCampo ? '[ENCARGADO]' : ''}</option>
        `).join('')}
    `;
  }

  getStats(list) {
    return {
        totalIndividual: list.filter(a => !a.soloCampo).length,
        totalCampo: list.reduce((acc, a) => acc + (a.cantidadCampo || 0), 0),
        desayunos: list.filter(a => a.tipo === "Desayuno").reduce((acc, a) => acc + (a.soloCampo ? 0 : 1) + (a.cantidadCampo || 0), 0),
        almuerzos: list.filter(a => a.tipo === "Almuerzo").reduce((acc, a) => acc + (a.soloCampo ? 0 : 1) + (a.cantidadCampo || 0), 0),
        cenas: list.filter(a => a.tipo === "Cena").reduce((acc, a) => acc + (a.soloCampo ? 0 : 1) + (a.cantidadCampo || 0), 0),
    };
  }

  renderDashboard(dayList, monthList) {
    const day = this.getStats(dayList);
    const month = this.getStats(monthList);
    const renderCard = (title, dayVal, monthVal, icon, colorClass) => `
        <div class="bg-surface p-6 rounded-[2.5rem] border border-surface-variant shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div class="flex justify-between items-start mb-4">
                <div class="h-10 w-10 rounded-2xl ${colorClass} text-white flex items-center justify-center shadow-lg shadow-black/5">
                    ${icon}
                </div>
                <span class="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/30">Resumen</span>
            </div>
            <div>
                <h4 class="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40 mb-1">${title}</h4>
                <div class="flex items-baseline gap-2">
                    <span class="text-3xl font-black text-on-background">${dayVal}</span>
                    <span class="text-xs font-bold text-primary">hoy</span>
                </div>
            </div>
            <div class="mt-4 pt-4 border-t border-surface-variant/50 flex justify-between items-center">
                <span class="text-[9px] font-black uppercase tracking-tighter text-on-surface-variant/40">Total Mes</span>
                <span class="text-sm font-black text-on-background">${monthVal}</span>
            </div>
        </div>
    `;
    return `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            ${renderCard("Raciones Totales", day.totalIndividual + day.totalCampo, month.totalIndividual + month.totalCampo, '<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" stroke-width="2" stroke-linecap="round"/></svg>', "bg-primary")}
            ${renderCard("Desayunos", day.desayunos, month.desayunos, '<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" stroke-width="2"/></svg>', "bg-amber-500")}
            ${renderCard("Almuerzos", day.almuerzos, month.almuerzos, '<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke-width="2"/></svg>', "bg-green-600")}
            ${renderCard("Cenas", day.cenas, month.cenas, '<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" stroke-width="2"/></svg>', "bg-indigo-700")}
        </div>
    `;
  }

  setupEventListeners(acciones) {
    const { onBack, onSave, onDelete, onEdit, onRefresh, onDownloadGroupPdf, onDownloadGroupExcel } = acciones;
    document.getElementById("back-from-attendance").onclick = onBack;
    const workerSelect = document.getElementById("attendance-worker-dni");
    const workerSearch = document.getElementById("worker-search");
    const fieldManagerOptions = document.getElementById("field-manager-options");
    workerSearch.oninput = (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = this.allWorkers.filter(w => w.nombre.toLowerCase().includes(term) || w.apellidos.toLowerCase().includes(term) || w.dni.includes(term));
        workerSelect.innerHTML = this.renderWorkerOptions(filtered);
    };
    workerSelect.onchange = (e) => {
        const dni = e.target.value;
        const worker = this.allWorkers.find(w => w.dni === dni);
        if (worker && worker.esEncargadoCampo) fieldManagerOptions.classList.remove("hidden");
        else { fieldManagerOptions.classList.add("hidden"); document.getElementById("attendance-field-qty").value = 0; }
    };
    const formElement = document.getElementById("attendance-form");
    formElement.onsubmit = (e) => {
        e.preventDefault();
        const dni = workerSelect.value, worker = this.allWorkers.find(w => w.dni === dni);
        const qtyCampo = parseInt(document.getElementById("attendance-field-qty").value) || 0;
        const alsoEats = document.getElementById("attendance-also-eats").checked;
        const data = { dni, nombreCompleto: worker ? `${worker.apellidos}, ${worker.nombre}` : "Desconocido", empresa: worker ? (worker.empresa || "Particular") : "Particular", fecha: document.getElementById("attendance-date").value, tipo: document.getElementById("attendance-type").value, esEncargadoCampo: worker ? !!worker.esEncargadoCampo : false };
        if (qtyCampo > 0) data.cantidadCampo = qtyCampo;
        if (qtyCampo > 0 && !alsoEats) data.soloCampo = true;
        onSave(document.getElementById("edit-attendance-id").value, data);
    };
    document.getElementById("cancel-attendance-edit").onclick = () => this.resetForm();
    const handleRefresh = () => onRefresh(document.getElementById("filter-date").value);
    document.getElementById("filter-date").onchange = handleRefresh;
    document.getElementById("refresh-list-btn").onclick = handleRefresh;
    document.getElementById("filter-company-list").onchange = (e) => {
        const company = e.target.value;
        const filtered = company ? this.allAttendances.filter(a => a.empresa === company) : this.allAttendances;
        this.updateListUI(filtered);
    };

    // Eventos de Reporte Grupal
    document.getElementById("btn-group-pdf").onclick = () => {
        const company = document.getElementById("report-company").value;
        const start = document.getElementById("report-start-date").value;
        const end = document.getElementById("report-end-date").value;
        const prices = {
            d: parseFloat(document.getElementById("price-d").value) || 10,
            a: parseFloat(document.getElementById("price-a").value) || 10,
            c: parseFloat(document.getElementById("price-c").value) || 10
        };
        if (!start || !end) { toast.info("Por favor seleccione un rango de fechas."); return; }
        onDownloadGroupPdf(company, start, end, prices);
    };

    document.getElementById("btn-group-excel").onclick = () => {
        const company = document.getElementById("report-company").value;
        const start = document.getElementById("report-start-date").value;
        const end = document.getElementById("report-end-date").value;
        const prices = {
            d: parseFloat(document.getElementById("price-d").value) || 10,
            a: parseFloat(document.getElementById("price-a").value) || 10,
            c: parseFloat(document.getElementById("price-c").value) || 10
        };
        if (!start || !end) { toast.info("Por favor seleccione un rango de fechas."); return; }
        onDownloadGroupExcel(company, start, end, prices);
    };

    this.attachTableEvents(onEdit, onDelete);
  }

  attachTableEvents(onEdit, onDelete) {
    const editHandler = onEdit || (this.acciones ? this.acciones.onEdit : null);
    const deleteHandler = onDelete || (this.acciones ? this.acciones.onDelete : null);
    if (!editHandler || !deleteHandler) return;
    this.rootElement.querySelectorAll(".edit-attendance-btn").forEach(btn => { btn.onclick = () => editHandler(btn.dataset.id); });
    this.rootElement.querySelectorAll(".delete-attendance-btn").forEach(btn => {
        btn.onclick = async () => { if (await dialog.confirm("Eliminar Registro", "¿Está seguro?")) deleteHandler(btn.dataset.id); };
    });
  }

  renderTableRows(attendances) {
    if (attendances.length === 0) return `<tr><td colspan="7" class="px-6 py-10 text-center text-xs font-bold text-on-surface-variant opacity-40">No hay registros</td></tr>`;
    return attendances.map(a => `
        <tr class="hover:bg-background transition-colors text-xs font-bold text-on-background">
            <td class="px-6 py-4">
                <div class="flex flex-col">
                    <div class="flex items-center gap-2">
                        <p class="uppercase font-black tracking-tight">${escapeHtml(a.nombreCompleto)}</p>
                        ${a.esEncargadoCampo 
                            ? `<span class="text-[8px] font-black text-primary uppercase bg-primary/10 px-1.5 py-0.5 rounded shrink-0">Encargado de Campo</span>` 
                            : `<span class="text-[8px] font-black text-stone-400 uppercase bg-stone-100 px-1.5 py-0.5 rounded shrink-0">Personal</span>`
                        }
                    </div>
                </div>
            </td>
            <td class="px-6 py-4 text-center opacity-60 font-mono">${a.dni}</td>
            <td class="px-6 py-4 text-center"><span class="text-[10px] text-primary uppercase tracking-tighter">${escapeHtml(a.empresa || 'Particular')}</span></td>
            <td class="px-6 py-4 text-center"><div class="flex flex-col items-center gap-1"><span class="px-2 py-0.5 rounded-md bg-surface-container-low border border-surface-variant text-[9px] uppercase">${a.tipo}</span>${a.soloCampo ? `<span class="text-[7px] font-black text-amber-600 uppercase">Solo Campo</span>` : ''}</div></td>
            <td class="px-6 py-4 text-center">${a.cantidadCampo ? `<span class="text-sm font-black text-primary bg-primary/5 px-3 py-1 rounded-full border border-primary/20">${a.cantidadCampo}</span>` : '<span class="opacity-20">---</span>'}</td>
            <td class="px-6 py-4 text-center opacity-60">${a.timestamp?.seconds ? new Date(a.timestamp.seconds * 1000).toLocaleTimeString() : 'Manual'}</td>
            <td class="px-6 py-4 text-right"><div class="flex justify-end gap-1"><button class="edit-attendance-btn p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" data-id="${a.id}"><svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg></button><button class="delete-attendance-btn p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors" data-id="${a.id}"><svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button></div></td>
        </tr>
    `).join('');
  }

  prepareEdit(attendance) {
    document.getElementById("edit-attendance-id").value = attendance.id;
    const s = document.getElementById("attendance-worker-dni"); s.innerHTML = this.renderWorkerOptions(this.allWorkers);
    document.getElementById("worker-search").value = ""; s.value = attendance.dni;
    document.getElementById("attendance-date").value = attendance.fecha;
    document.getElementById("attendance-type").value = attendance.tipo;
    if (attendance.esEncargadoCampo) {
        document.getElementById("field-manager-options").classList.remove("hidden");
        document.getElementById("attendance-field-qty").value = attendance.cantidadCampo || 0;
        document.getElementById("attendance-also-eats").checked = !attendance.soloCampo;
    } else document.getElementById("field-manager-options").classList.add("hidden");
    document.getElementById("form-title").textContent = "Editar Registro";
    document.getElementById("submit-attendance-btn").textContent = "Actualizar Registro";
    document.getElementById("cancel-attendance-edit").classList.remove("hidden");
    document.getElementById("attendance-form-section").scrollIntoView({ behavior: "smooth", block: "center" });
  }

  resetForm() {
    document.getElementById("edit-attendance-id").value = "";
    document.getElementById("attendance-form").reset();
    document.getElementById("field-manager-options").classList.add("hidden");
    document.getElementById("form-title").textContent = "Registro Manual";
    document.getElementById("submit-attendance-btn").textContent = "Guardar Registro";
    document.getElementById("cancel-attendance-edit").classList.add("hidden");
    const s = document.getElementById("attendance-worker-dni"); if (s) s.innerHTML = this.renderWorkerOptions(this.allWorkers);
  }

  updateList(dayList, monthList) {
    this.allAttendances = dayList; this.monthAttendances = monthList;
    const c = document.getElementById("filter-company-list").value;
    this.updateListUI(c ? this.allAttendances.filter(a => a.empresa === c) : this.allAttendances, monthList);
  }

  updateListUI(dayAttendances, monthList) {
    document.getElementById("attendance-table-body").innerHTML = this.renderTableRows(dayAttendances);
    document.getElementById("attendance-dashboard").innerHTML = this.renderDashboard(dayAttendances, monthList || this.monthAttendances);
    this.attachTableEvents();
  }
}
