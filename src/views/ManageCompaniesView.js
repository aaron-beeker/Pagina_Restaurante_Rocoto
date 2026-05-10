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
                <div class="${adminShell.header}">
                    <div>
                        <h2 class="${adminShell.title}">Gestión de Empresas</h2>
                        <p class="${adminShell.subtitle}">Administra las empresas que consumen en el restaurante.</p>
                    </div>
                    <button type="button" id="back-from-companies" class="${adminShell.backBtn} hidden sm:inline-flex">
                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        Cerrar gestión
                    </button>                </div>

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
                        <button type="submit" id="submit-company-btn" class="${button.base} ${button.primary} w-full py-4 text-lg">Guardar Empresa</button>
                        <button type="button" id="cancel-company-edit" class="hidden ${button.base} ${button.outlineDark} w-full py-3 mt-2">Cancelar Edición</button>
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

  setupEventListeners(acciones) {
    const { onBack, onSave, onDelete, onEdit } = acciones;
    document.getElementById("back-from-companies").onclick = onBack;
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
    if (companies.length === 0) return `<div class="py-10 text-center text-on-surface-variant opacity-60">No hay empresas.</div>`;
    return companies.map(c => `
        <div class="p-4 rounded-2xl border border-surface-variant bg-surface flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
            <div class="flex items-center gap-4">
                <div class="h-12 w-12 rounded-xl bg-surface-container-low flex items-center justify-center border border-surface-variant text-primary font-bold overflow-hidden">
                    ${c.logo ? `<img src="${escapeHtml(c.logo)}" alt="${escapeHtml(c.nombre)}" class="h-full w-full object-contain" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(c.nombre)}&background=1B5E34&color=fff'" />` : c.nombre.charAt(0).toUpperCase()}
                </div>
                <div>
                    <p class="text-sm font-bold text-on-background">${escapeHtml(c.nombre)}</p>
                    <p class="text-xs text-on-surface-variant opacity-60">RUC: ${c.ruc || 'N/A'}</p>
                </div>
            </div>
            <div class="flex gap-1">
                <button class="edit-company-btn p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" data-id="${c.id}"><svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg></button>
                <button class="delete-company-btn p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors" data-id="${c.id}"><svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
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
