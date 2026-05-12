import logoSolo from "../assets/img/logo_small_restaurante_rocoto.png";

/**
 * Sistema de Notificaciones y Diálogos Centrados para Rocoto Restaurante
 * Reemplaza los alerts, confirms y prompts nativos por componentes elegantes.
 */

// --- NOTIFICACIONES (TOASTS) ---
export const showNotification = (message, type = 'success', duration = 3000) => {
    const existing = document.getElementById('global-notification');
    if (existing) existing.remove();

    const container = document.createElement('div');
    container.id = 'global-notification';
    container.className = `fixed inset-0 z-[3000] flex items-center justify-center pointer-events-none p-4 animate-fade-in`;

    const styles = {
        success: { bg: 'bg-green-600', icon: '<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>' },
        error: { bg: 'bg-red-600', icon: '<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>' },
        info: { bg: 'bg-blue-600', icon: '<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>' }
    };

    const style = styles[type] || styles.success;
    container.innerHTML = `
        <div class="pointer-events-auto flex items-center gap-4 rounded-3xl ${style.bg} px-8 py-5 text-white shadow-2xl shadow-black/20 animate-scale-in max-w-md w-full">
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20">
                ${style.icon}
            </div>
            <div>
                <p class="text-sm font-black uppercase tracking-widest opacity-60 mb-0.5">${type === 'success' ? 'Éxito' : type === 'error' ? 'Error' : 'Aviso'}</p>
                <p class="text-base font-bold leading-tight">${message}</p>
            </div>
        </div>
    `;
    document.body.appendChild(container);

    setTimeout(() => {
        if (!container.parentElement) return;
        container.classList.add('animate-fade-out');
        container.querySelector('div').classList.add('animate-scale-out');
        setTimeout(() => container.remove(), 400);
    }, duration);
};

// --- DIÁLOGOS INTERACTIVOS (CONFIRM / PROMPT) ---
const createModalOverlay = () => {
    const overlay = document.createElement('div');
    overlay.className = "fixed inset-0 z-[3000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in";
    return overlay;
};

export const dialog = {
    confirm: (title, message) => {
        return new Promise((resolve) => {
            const overlay = createModalOverlay();
            overlay.innerHTML = `
                <div class="bg-surface w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl animate-scale-in flex flex-col items-center text-center">
                    <div class="h-16 w-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-6">
                        <svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                    <h3 class="text-xl font-black text-on-background uppercase mb-2">${title}</h3>
                    <p class="text-sm font-medium text-on-surface-variant mb-8">${message}</p>
                    <div class="flex gap-3 w-full">
                        <button id="modal-cancel" class="flex-1 py-4 rounded-2xl border-2 border-surface-variant text-sm font-black uppercase tracking-widest hover:bg-background transition-all">Cancelar</button>
                        <button id="modal-confirm" class="flex-1 py-4 rounded-2xl bg-primary text-white text-sm font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:brightness-110 transition-all">Aceptar</button>
                    </div>
                </div>
            `;
            document.body.appendChild(overlay);

            const cleanup = (val) => {
                overlay.classList.add('animate-fade-out');
                overlay.querySelector('div').classList.add('animate-scale-out');
                setTimeout(() => { overlay.remove(); resolve(val); }, 300);
            };

            overlay.querySelector('#modal-confirm').onclick = () => cleanup(true);
            overlay.querySelector('#modal-cancel').onclick = () => cleanup(false);
        });
    },

    prompt: (title, message, defaultValue = "") => {
        return new Promise((resolve) => {
            const overlay = createModalOverlay();
            overlay.innerHTML = `
                <div class="bg-surface w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl animate-scale-in flex flex-col items-center text-center">
                    <div class="h-16 w-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-6">
                        <svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                    </div>
                    <h3 class="text-xl font-black text-on-background uppercase mb-2">${title}</h3>
                    <p class="text-sm font-medium text-on-surface-variant mb-6">${message}</p>
                    <input type="text" id="modal-input" value="${defaultValue}" class="w-full bg-background border-2 border-surface-variant rounded-2xl py-4 px-6 text-center text-xl font-black focus:border-primary outline-none mb-8 transition-all" />
                    <div class="flex gap-3 w-full">
                        <button id="modal-cancel" class="flex-1 py-4 rounded-2xl border-2 border-surface-variant text-sm font-black uppercase tracking-widest hover:bg-background transition-all">Cancelar</button>
                        <button id="modal-confirm" class="flex-1 py-4 rounded-2xl bg-primary text-white text-sm font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:brightness-110 transition-all">Aceptar</button>
                    </div>
                </div>
            `;
            document.body.appendChild(overlay);

            const input = overlay.querySelector('#modal-input');
            input.focus();
            input.select();

            const cleanup = (val) => {
                overlay.classList.add('animate-fade-out');
                overlay.querySelector('div').classList.add('animate-scale-out');
                setTimeout(() => { overlay.remove(); resolve(val); }, 300);
            };

            overlay.querySelector('#modal-confirm').onclick = () => cleanup(input.value);
            overlay.querySelector('#modal-cancel').onclick = () => cleanup(null);
            input.onkeydown = (e) => { if (e.key === 'Enter') cleanup(input.value); if (e.key === 'Escape') cleanup(null); };
        });
    }
};

// --- PRELOADER GLOBAL ---
export const preloader = {
    show: (message = "Cargando...") => {
        let overlay = document.getElementById('global-preloader');
        if (overlay) return;

        overlay = document.createElement('div');
        overlay.id = 'global-preloader';
        overlay.className = "fixed inset-0 z-[4000] bg-black flex flex-col items-center justify-center animate-fade-in backdrop-blur-sm";
        overlay.innerHTML = `
            <div class="relative flex flex-col items-center gap-8">
                <!-- Diseño Identitario Rocoto (Igual al Main Preloader) -->
                <div class="relative flex flex-col items-center gap-6 animate-pulse" style="animation-duration: 3s">
                    <div class="relative h-20 w-20 sm:h-24 sm:w-24 flex items-center justify-center">
                        <img src="${logoSolo}" class="h-full w-full object-contain opacity-80 select-none" alt="Rocoto" />
                        <div class="absolute inset-0 -m-2 border-t border-primary/20 rounded-full animate-[spin_6s_linear_infinite]"></div>
                    </div>
                    <div class="flex flex-col items-center gap-4">
                        <span class="text-stone-700 font-medium uppercase tracking-[1.5em] text-[8px] sm:text-[10px] select-none translate-x-[0.75em]">Rocoto</span>
                        
                        <!-- Mensaje Dinámico -->
                        <div class="flex flex-col items-center gap-2">
                            <p class="text-[9px] font-black uppercase tracking-[0.4em] text-primary/60 italic">${message}</p>
                            <div class="h-[1px] w-8 bg-primary/20 rounded-full overflow-hidden">
                                <div class="h-full bg-primary w-full animate-[shimmer_2s_infinite]"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        document.body.style.overflow = "hidden";
    },
    hide: () => {
        const overlay = document.getElementById('global-preloader');
        if (!overlay) return;
        
        overlay.classList.add('animate-fade-out');
        setTimeout(() => {
            overlay.remove();
            // Solo restaurar overflow si no hay admin-layer visible (que maneja su propio scroll)
            const adminLayer = document.getElementById('admin-layer');
            if (!adminLayer || adminLayer.classList.contains('hidden')) {
                document.body.style.overflow = "auto";
            }
        }, 400);
    }
};

// Exportar funciones rápidas
export const toast = {
    success: (msg, dur) => showNotification(msg, 'success', dur),
    error: (msg, dur) => showNotification(msg, 'error', dur),
    info: (msg, dur) => showNotification(msg, 'info', dur)
};
