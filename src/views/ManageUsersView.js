import { adminShell, button, form } from "../ui/layout.js";
import { escapeHtml } from "../utils/html.js";
import { toast, dialog } from "../utils/notifications.js";

export class ManageUsersView {
    constructor(rootElement) {
        this.rootElement = rootElement;
    }

    render(users, actions) {
        this.rootElement.innerHTML = `
            <div class="${adminShell.page}">
                <div class="${adminShell.card}">
                    <div class="${adminShell.header} flex flex-col sm:flex-row sm:items-center justify-start gap-4 sm:gap-6">
                        <button type="button" id="back-from-users" class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-stone-600 border border-stone-200 shadow-sm transition-all hover:bg-stone-200 active:scale-95">
                            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M15 19l-7-7 7-7"></path></svg>
                        </button>
                        <div>
                            <h2 class="${adminShell.title}">Gestión de Roles</h2>
                            <p class="${adminShell.subtitle}">Control de acceso y seguridad para administradores.</p>
                        </div>
                    </div>

                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
                        <div>
                            <h3 class="${adminShell.sectionTitle}">Lista de Usuarios Autorizados</h3>
                        </div>
                        <button id="add-user-btn" class="bg-emerald-600 text-white px-8 py-4 rounded-full text-xs font-black uppercase tracking-widest shadow-xl shadow-emerald-900/10 hover:bg-emerald-500 transition-all active:scale-95">
                            Nuevo Administrador
                        </button>
                    </div>

                    <div class="bg-white rounded-[2.5rem] border border-emerald-50 shadow-sm overflow-hidden">
                        <table class="w-full text-left">
                            <thead class="bg-emerald-50/50 border-b border-emerald-50">
                                <tr>
                                    <th class="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-emerald-900/40">Correo Electrónico</th>
                                    <th class="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-emerald-900/40">Rol Asignado</th>
                                    <th class="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-emerald-900/40 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-emerald-50/50">
                                ${users.map(u => `
                                    <tr class="hover:bg-emerald-50/30 transition-colors">
                                        <td class="px-8 py-6 font-bold text-on-background text-sm lowercase">${escapeHtml(u.email)}</td>
                                        <td class="px-8 py-6">
                                            <span class="inline-flex px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${u.role === 'admin' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}">
                                                ${u.role}
                                            </span>
                                        </td>
                                        <td class="px-8 py-6 text-right">
                                            <div class="flex justify-end gap-2">
                                                <button class="edit-user-btn flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-tight hover:bg-blue-600 hover:text-white transition-all border border-blue-100 shadow-sm" data-email="${escapeHtml(u.email)}" data-role="${u.role}">
                                                    <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                                                    Editar
                                                </button>
                                                <button class="delete-user-btn flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-[10px] font-black uppercase tracking-tight hover:bg-red-600 hover:text-white transition-all border border-red-100 shadow-sm" data-email="${escapeHtml(u.email)}">
                                                    <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                                    Borrar
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                        ${users.length === 0 ? `<div class="p-20 text-center text-emerald-900/20 font-black uppercase tracking-widest">No hay usuarios registrados</div>` : ''}
                    </div>
                </div>
            </div>
        `;

        this.setupEventListeners(actions);
    }

    setupEventListeners(actions) {
        const { onBack } = actions;
        const backBtn = this.rootElement.querySelector("#back-from-users");
        if (backBtn) backBtn.onclick = onBack || (() => window.location.hash = '#/');

        document.getElementById("add-user-btn").onclick = async () => {
            const email = await dialog.prompt("Nuevo Administrador", "Ingrese el correo de Google del nuevo administrador:");
            if (email && email.includes('@')) {
                await actions.onAdd(email, "admin");
            } else if (email) {
                toast.error("Correo inválido");
            }
        };

        document.querySelectorAll(".edit-user-btn").forEach(btn => {
            btn.onclick = async () => {
                const email = btn.dataset.email;
                const currentRole = btn.dataset.role;
                const newRole = await dialog.prompt("Editar Rol", `Cambiar rol para ${email} (admin o client):`, currentRole);
                if (newRole && (newRole === 'admin' || newRole === 'client')) {
                    await actions.onEdit(email, newRole);
                } else if (newRole) {
                    toast.error("Rol inválido (debe ser 'admin' o 'client')");
                }
            };
        });

        document.querySelectorAll(".delete-user-btn").forEach(btn => {
            btn.onclick = async () => {
                const email = btn.dataset.email;
                if (await dialog.confirm("Eliminar Permiso", `¿Está seguro de quitar los permisos a ${email}?`)) {
                    await actions.onDelete(email);
                }
            };
        });
    }
}
