import { adminShell, button, form } from "../ui/layout.js";
import { escapeHtml } from "../utils/html.js";
import { toast, dialog } from "../utils/notifications.js";

export class ManageCompaniesView {
  constructor(rootElement) {
    this.rootElement = rootElement;
  }

  render(companies, acciones) {
    this.rootElement.innerHTML = `
        <div class="${adminShell.page}">
            <div class="${adminShell.card}">
                ${this._renderHeader()}

                <div class="${adminShell.mutedBox} mb-12 scroll-mt-24" id="company-form-section">
                    <h3 class="${adminShell.sectionTitle}">Añadir / Editar Empresa</h3>
                    <form id="company-form" class="space-y-6">
                        <input type="hidden" id="edit-company-id" value="" />
                        <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div>
                                <label class="${form.label}">RUC (Opcional)</label>
                                <input type="text" id="company-ruc" placeholder="RUC de la empresa" class="${form.input}" maxlength="11" />
                            </div>
                            <div>
                                <label class="${form.label}">Nombre de la Empresa</label>
                                <input type="text" id="company-name" placeholder="Nombre comercial" class="${form.input}" required />
                            </div>
                        </div>
                        <div>
                            <label class="${form.label}">URL del Logo (Opcional)</label>
                            <input type="url" id="company-logo" placeholder="https://ejemplo.com/logo.png" class="${form.input}" />
                        </div>
                        <button type="submit" id="submit-company-btn" class="${button.base} ${button.primary} w-full py-4 text-lg font-black uppercase tracking-widest">Guardar Empresa</button>
                        <button type="button" id="cancel-company-edit" class="hidden ${button.base} ${button.outlineDark} w-full py-3 mt-2 text-xs font-black uppercase tracking-widest">Cancelar Edición</button>
                    </form>
                </div>

                <div id="companies-list-container" class="space-y-3">
                    ${this.renderCompanyList(companies)}
                </div>
            </div>
        </div>
    `;
    this.setupEventListeners(acciones);
  }

  _renderHeader() {
    return `
        <div class="z-40 -mx-6 -mt-6 mb-10 border-b border-surface-variant bg-surface/95 p-6 backdrop-blur-md sm:sticky sm:top-0 sm:-mx-10 sm:-mt-10 sm:px-10 sm:pt-10 sm:pb-8 flex flex-col sm:flex-row sm:items-start justify-start gap-4 sm:gap-6">
            <button type="button" id="back-from-companies" class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-stone-600 border border-stone-200 shadow-sm transition-all hover:bg-stone-200 active:scale-95 mt-1">
                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M15 19l-7-7 7-7"></path></svg>
            </button>
            <div class="min-w-0">
                <h2 class="text-xl sm:text-3xl font-black tracking-tight text-primary leading-tight uppercase">Gestión de Empresas</h2>
                <p class="mt-1 text-xs sm:text-sm text-on-surface-variant/60 font-medium max-w-2xl">Administra las empresas aliadas, sus datos de facturación (RUC) e identidad visual para reportes corporativos.</p>
            </div>
        </div>
    `;
  }

  setupEventListeners(acciones) {
    const { onBack, onSave, onDelete, onEdit } = acciones;
    const backBtn = this.rootElement.querySelector("#back-from-companies");
    if (backBtn) backBtn.onclick = onBack;
    const formElement = document.getElementById("company-form");
    formElement.onsubmit = (e) => {
      e.preventDefault();
      onSave(document.getElementById("edit-company-id").value, {
        ruc: document.getElementById("company-ruc").value.trim(),
        nombre: document.getElementById("company-name").value.trim(),
        logo: document.getElementById("company-logo").value.trim()
      });
    };
    document.getElementById("cancel-company-edit").onclick = () => this.resetForm();
    this.attachListEvents(onEdit, onDelete);
  }

  resetForm() {
    document.getElementById("edit-company-id").value = ""; 
    document.getElementById("company-form").reset();
    document.getElementById("submit-company-btn").textContent = "Guardar Empresa";
    document.getElementById("cancel-company-edit").classList.add("hidden");
  }

  attachListEvents(onEdit, onDelete) {
    this.rootElement.querySelectorAll(".delete-company-btn").forEach((btn) => {
      btn.onclick = async () => { if(await dialog.confirm("Eliminar", "¿Eliminar esta empresa?")) onDelete(btn.dataset.id); };
    });
    this.rootElement.querySelectorAll(".edit-company-btn").forEach((btn) => {
      btn.onclick = () => onEdit(btn.dataset.id);
    });
  }

  renderCompanyList(companies) {
    if (companies.length === 0) return `<div class="py-10 text-center text-on-surface-variant opacity-60">No hay empresas registradas.</div>`;
    return companies.map(c => `
        <div class="p-4 rounded-2xl border border-surface-variant bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:shadow-md transition-all">
            <div class="flex items-center gap-4 min-w-0">
                <div class="h-12 w-12 rounded-xl bg-surface-container-low flex items-center justify-center border border-surface-variant text-primary font-bold overflow-hidden shrink-0 shadow-inner">
                    ${c.logo ? `<img src="${escapeHtml(c.logo)}" alt="${escapeHtml(c.nombre)}" class="h-full w-full object-contain" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(c.nombre)}&background=1B5E34&color=fff'" />` : c.nombre.charAt(0).toUpperCase()}
                </div>
                <div class="min-w-0">
                    <p class="text-sm font-black text-on-background uppercase tracking-tight truncate">${escapeHtml(c.nombre)}</p>
                    <p class="text-[10px] font-bold text-primary/40 uppercase tracking-widest mt-0.5">RUC: ${c.ruc || 'No registrado'}</p>
                </div>
            </div>
            <div class="flex gap-2 pt-3 sm:pt-0 border-t sm:border-t-0 border-surface-variant/50">
                <button class="edit-company-btn flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-tight hover:bg-blue-600 hover:text-white transition-all border border-blue-100 shadow-sm" data-id="${c.id}">
                    <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                    Editar
                </button>
                <button class="delete-company-btn flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-[10px] font-black uppercase tracking-tight hover:bg-red-600 hover:text-white transition-all border border-red-100 shadow-sm" data-id="${c.id}">
                    <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    Borrar
                </button>
            </div>
        </div>
    `).join("");
  }

  prepareEdit(company) {
    document.getElementById("company-ruc").value = company.ruc || ""; 
    document.getElementById("company-name").value = company.nombre;
    document.getElementById("company-logo").value = company.logo || "";
    document.getElementById("edit-company-id").value = company.id;
    document.getElementById("submit-company-btn").textContent = "Actualizar Empresa";
    document.getElementById("cancel-company-edit").classList.remove("hidden");
    document.getElementById("company-form-section").scrollIntoView({ behavior: "smooth", block: "center" });
  }

  renderListOnly(companies, onEdit, onDelete) {
    const c = document.getElementById("companies-list-container"); 
    if (c) { 
      c.innerHTML = this.renderCompanyList(companies); 
      this.attachListEvents(onEdit, onDelete); 
    }
  }
}
