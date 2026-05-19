import { html, render } from "lit-html";
import { button, form, layout } from "../ui/layout.js";
import { toast, dialog } from "../utils/notifications.js";

export class ManageUsersView {
  constructor(rootElement) {
    this.rootElement = rootElement;
    this.users = [];
    this.acciones = null;
  }

  /**
   * Renderizado principal: Dos columnas (Listado Izquierda, Editor Derecha Sticky).
   */
  render(users, actions) {
    this.users = users;
    this.acciones = actions;

    const template = html`
      <div class="min-h-screen bg-[#fafafa] font-sans pb-32 text-stone-900">
        <div class="max-w-[1400px] mx-auto px-4 py-8 sm:py-16">
          <!-- Cabecera Editorial -->
          ${this._renderHeader(actions.onBack)}

          <div class="space-y-24">
            <!-- BLOQUE MAESTRO: Gestión de Accesos -->
            <section class="space-y-12">
              <div class="flex items-center gap-4">
                <span class="text-primary font-black font-display italic text-2xl sm:text-3xl"
                  >01.</span
                >
                <h3 class="text-xs sm:text-sm font-black uppercase tracking-[0.5em]">
                  Seguridad de Usuarios
                </h3>
              </div>

              <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                <!-- LISTADO IZQUIERDA (Usuarios Autorizados) -->
                <div class="lg:col-span-7 order-2 lg:order-1 space-y-6">
                  <div class="flex items-center gap-4 ml-2 mb-6">
                    <div class="h-1.5 w-1.5 rounded-full bg-primary animate-pulse"></div>
                    <span class="text-[10px] font-black uppercase tracking-[0.3em] text-stone-900"
                      >Personal en el Sistema (${users.length})</span
                    >
                  </div>

                  <div id="users-list" class="flex flex-col gap-4">
                    ${users.length === 0
                      ? html`<div
                          class="py-24 text-center border-2 border-dashed border-stone-100 rounded-[3rem] text-stone-300 uppercase tracking-[0.4em] text-[10px] font-bold italic bg-stone-50/30"
                        >
                          Sin accesos configurados
                        </div>`
                      : users.map((u) => this._renderUserRow(u, actions))}
                  </div>
                </div>

                <!-- EDITOR DERECHA (Card para Editar - Sticky) -->
                <div class="lg:col-span-5 order-1 lg:order-2">
                  <div
                    class="bg-white p-8 sm:p-10 rounded-[3rem] shadow-xl border border-stone-100 lg:sticky lg:top-10 overflow-hidden"
                    id="user-editor-container"
                  >
                    <!-- Decoración Suave -->
                    <div
                      class="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full -mr-32 -mt-32 opacity-40"
                    ></div>

                    <div class="relative z-10">
                      <div class="mb-10 border-b border-stone-100 pb-6">
                        <h4
                          class="text-stone-900 font-display italic text-2xl"
                          id="user-form-title"
                        >
                          Gestionar Acceso
                        </h4>
                        <p
                          class="text-[9px] text-stone-400 uppercase tracking-[0.2em] font-black mt-2"
                        >
                          Seguridad de administrador
                        </p>
                      </div>

                      <form
                        id="user-manage-form"
                        @submit=${(e) => this._handleSubmit(e)}
                        class="space-y-8"
                      >
                        <input type="hidden" id="edit-user-email-hidden" value="" />

                        <div class="space-y-6">
                          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div class="space-y-2">
                              <label
                                class="text-[9px] uppercase tracking-[0.2em] text-primary/40 font-black px-1"
                                >Nombres</label
                              >
                              <input
                                type="text"
                                id="user-nombre"
                                placeholder="Ej. Roberto"
                                class="w-full bg-stone-50/50 border border-stone-100 rounded-2xl py-4 px-5 text-stone-900 text-sm focus:border-primary/30 focus:bg-white transition-all outline-none shadow-inner"
                                required
                              />
                            </div>
                            <div class="space-y-2">
                              <label
                                class="text-[9px] uppercase tracking-[0.2em] text-primary/40 font-black px-1"
                                >Apellidos</label
                              >
                              <input
                                type="text"
                                id="user-apellido"
                                placeholder="Ej. Valdez"
                                class="w-full bg-stone-50/50 border border-stone-100 rounded-2xl py-4 px-5 text-stone-900 text-sm focus:border-primary/30 focus:bg-white transition-all outline-none shadow-inner"
                                required
                              />
                            </div>
                          </div>

                          <div class="space-y-2">
                            <label
                              class="text-[9px] uppercase tracking-[0.2em] text-primary/40 font-black px-1"
                              >Correo Electrónico</label
                            >
                            <input
                              type="email"
                              id="user-email"
                              placeholder="usuario@gmail.com"
                              class="w-full bg-stone-50/50 border border-stone-100 rounded-2xl py-4 px-5 text-stone-900 text-sm focus:border-primary/30 focus:bg-white transition-all outline-none shadow-inner"
                              required
                            />
                          </div>

                          <div class="space-y-3">
                            <label
                              class="text-[9px] uppercase tracking-[0.2em] text-primary/40 font-black px-1"
                              >Nivel de Acceso</label
                            >
                            <div class="flex gap-3">
                              <label class="flex-1 cursor-pointer group">
                                <input
                                  type="radio"
                                  name="user-role"
                                  value="admin"
                                  checked
                                  class="sr-only peer"
                                />
                                <div
                                  class="p-4 rounded-2xl border border-stone-100 bg-stone-50/50 text-stone-400 peer-checked:border-primary peer-checked:bg-primary/5 peer-checked:text-primary transition-all text-center"
                                >
                                  <span
                                    class="text-[9px] font-black uppercase tracking-widest leading-none"
                                    >Admin</span
                                  >
                                </div>
                              </label>
                              <label class="flex-1 cursor-pointer group">
                                <input
                                  type="radio"
                                  name="user-role"
                                  value="client"
                                  class="sr-only peer"
                                />
                                <div
                                  class="p-4 rounded-2xl border border-stone-100 bg-stone-50/50 text-stone-400 peer-checked:border-primary peer-checked:bg-primary/5 peer-checked:text-primary transition-all text-center"
                                >
                                  <span
                                    class="text-[9px] font-black uppercase tracking-widest leading-none"
                                    >Cliente</span
                                  >
                                </div>
                              </label>
                            </div>
                          </div>
                        </div>

                        <div class="flex flex-col gap-4 pt-6">
                          <button
                            type="submit"
                            id="submit-user-btn"
                            class="w-full bg-primary text-white py-6 rounded-3xl text-[10px] uppercase tracking-[0.4em] font-black shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                          >
                            Guardar Acceso
                          </button>
                          <button
                            type="button"
                            id="cancel-user-edit"
                            @click=${() => this._resetForm()}
                            class="hidden w-full text-stone-400 py-2 text-[9px] font-black uppercase tracking-widest hover:text-primary transition-all text-center italic"
                          >
                            Cancelar Edición
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
    `;

    this._safeRender(template);
  }

  /**
   * Renderiza una fila de usuario (Larga para leer nombre completo).
   */
  _renderUserRow(u, actions) {
    const nombreCompleto = `${u.nombre || ""} ${u.apellido || ""}`.trim() || "Usuario sin nombre";

    return html`
      <div
        class="group relative overflow-hidden rounded-[2.5rem] border-2 border-stone-50 bg-white p-6 sm:p-7 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300 flex flex-col md:flex-row items-center gap-6"
      >
        <!-- Avatar Editorial -->
        <div
          class="h-14 w-14 rounded-2xl bg-gradient-to-br from-stone-900 to-stone-800 flex items-center justify-center text-white font-display italic text-xl shadow-md shrink-0 group-hover:scale-105 transition-transform duration-300 ring-4 ring-stone-50"
        >
          ${nombreCompleto.charAt(0).toUpperCase()}
        </div>

        <!-- Info -->
        <div class="flex-1 min-w-0 text-center md:text-left">
          <h4
            class="text-base font-bold text-stone-900 uppercase tracking-tight truncate mb-1 group-hover:text-primary transition-colors duration-300"
          >
            ${nombreCompleto}
          </h4>
          <p
            class="text-[10px] text-stone-400 truncate lowercase font-black tracking-widest opacity-60"
          >
            ${u.email}
          </p>
        </div>

        <!-- Rol Badge -->
        <div class="shrink-0">
          <span
            class="inline-flex px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-[0.2em] ${u.role ===
            "admin"
              ? "bg-primary/5 text-primary border border-primary/10"
              : "bg-stone-50 text-stone-400 border border-stone-100"}"
          >
            ${u.role}
          </span>
        </div>

        <!-- Acciones Modernas -->
        <div class="flex gap-2">
          <button
            @click=${() => this._prepareEdit(u)}
            class="group/btn flex items-center gap-2 px-4 py-3 rounded-2xl bg-stone-50 text-stone-400 hover:bg-primary hover:text-white transition-all active:scale-95 shadow-sm border border-stone-100/50"
          >
            <svg
              class="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              stroke-width="3"
            >
              <path
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
            <span class="text-[8px] font-black uppercase tracking-[0.2em] hidden sm:inline"
              >Editar</span
            >
          </button>
          <button
            @click=${() => this._handleDelete(u.email, actions.onDelete)}
            class="group/btn flex items-center gap-2 px-4 py-3 rounded-2xl bg-stone-50 text-stone-400 hover:bg-red-500 hover:text-white transition-all active:scale-95 shadow-sm border border-stone-100/50"
          >
            <svg
              class="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              stroke-width="3"
            >
              <path
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            <span class="text-[8px] font-black uppercase tracking-[0.2em] hidden sm:inline"
              >Eliminar</span
            >
          </button>
        </div>
      </div>
    `;
  }

  // --- Lógica ---

  _handleSubmit(e) {
    e.preventDefault();
    const oldEmail = document.getElementById("edit-user-email-hidden").value;
    const nombre = document.getElementById("user-nombre").value.trim();
    const apellido = document.getElementById("user-apellido").value.trim();
    const email = document.getElementById("user-email").value.trim().toLowerCase();
    const role = this.rootElement.querySelector('input[name="user-role"]:checked').value;

    this.acciones.onSave({ nombre, apellido, email, role }, oldEmail);
    this._resetForm();
  }

  _prepareEdit(u) {
    const container = document.getElementById("user-editor-container");
    document.getElementById("edit-user-email-hidden").value = u.email;
    document.getElementById("user-nombre").value = u.nombre || "";
    document.getElementById("user-apellido").value = u.apellido || "";
    document.getElementById("user-email").value = u.email;

    const radio = this.rootElement.querySelector(
      `input[name="user-role"][value="${u.role || "client"}"]`
    );
    if (radio) radio.checked = true;

    document.getElementById("user-form-title").textContent = "Editar Usuario";
    document.getElementById("submit-user-btn").textContent = "Actualizar Acceso";
    document.getElementById("cancel-user-edit").classList.remove("hidden");

    container.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
    container.classList.add("ring-8", "ring-primary/10", "duration-500");
    setTimeout(() => container.classList.remove("ring-8", "ring-primary/10"), 2000);
  }

  _resetForm() {
    const form = document.getElementById("user-manage-form");
    if (form) form.reset();
    document.getElementById("edit-user-email-hidden").value = "";
    document.getElementById("user-form-title").textContent = "Gestionar Acceso";
    document.getElementById("submit-user-btn").textContent = "Guardar Acceso";
    document.getElementById("cancel-user-edit").classList.add("hidden");
    const container = document.getElementById("user-editor-container");
    if (container) container.classList.remove("ring-8", "ring-primary/10");
  }

  async _handleDelete(email, onDelete) {
    if (
      await dialog.confirm("Quitar Permisos", `¿Está seguro de eliminar el acceso para ${email}?`)
    ) {
      onDelete(email);
    }
  }

  _renderHeader(onBack) {
    return html`
      <header
        class="flex flex-col sm:flex-row sm:items-end justify-between gap-8 mb-16 sm:mb-20 pb-8 border-b border-stone-200"
      >
        <div class="space-y-4 sm:space-y-6">
          <button
            @click=${onBack}
            class="flex items-center gap-3 text-primary hover:text-stone-900 font-bold text-[9px] sm:text-[10px] uppercase tracking-[0.3em] sm:tracking-[0.5em] transition-all group"
          >
            <svg
              class="h-4 w-4 transform group-hover:-translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-width="3" d="M15 19l-7-7 7-7"></path>
            </svg>
            Volver al Panel
          </button>
          <div class="flex flex-col gap-2">
            <span
              class="text-[8px] sm:text-[9px] uppercase tracking-[0.3em] sm:tracking-[0.4em] text-stone-400 font-bold"
              >Seguridad y Privacidad</span
            >
            <h2 class="text-3xl sm:text-6xl font-display italic text-stone-950 leading-none">
              Gestión de
              <span
                class="text-primary font-black not-italic underline decoration-stone-200 underline-offset-8"
                >Usuarios</span
              >
            </h2>
          </div>
        </div>
      </header>
    `;
  }

  _safeRender(template) {
    try {
      render(template, this.rootElement);
    } catch (e) {
      this.rootElement.innerHTML = "";
      render(template, this.rootElement);
    }
  }
}
