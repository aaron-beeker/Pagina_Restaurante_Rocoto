import { adminShell, button, form, typography } from "../ui/layout.js";
import { escapeHtml } from "../utils/html.js";
import { toast } from "../utils/notifications.js";

export class AttendanceView {
  constructor(rootElement) {
    this.rootElement = rootElement;
  }

  render(acciones) {
    const currentMeal = this.getSuggestedMeal();
    
    this.rootElement.innerHTML = `
        <div class="min-h-screen bg-background flex flex-col items-center justify-center p-6">
            <div class="w-full max-w-md bg-surface rounded-[3rem] shadow-2xl border border-surface-variant p-10 flex flex-col items-center gap-6">
                <div class="text-center">
                    <h2 class="text-3xl font-black text-primary uppercase tracking-tight mb-1">Asistencia FASAL</h2>
                    <p class="text-xs font-bold text-on-surface-variant opacity-60 uppercase">Ingrese su DNI y use el lector</p>
                </div>

                <!-- Input de DNI para Verificación 1:1 -->
                <div class="w-full">
                    <label class="text-[10px] font-bold uppercase tracking-widest text-primary mb-2 block ml-2">DNI del Trabajador</label>
                    <input type="text" id="attendance-dni" maxlength="8" placeholder="8 dígitos" 
                        class="w-full bg-surface-container-low border-2 border-surface-variant rounded-2xl py-4 px-6 text-2xl font-black text-center tracking-[0.3em] focus:border-primary transition-all outline-none"
                    />
                </div>

                <div class="flex flex-col gap-3 w-full">
                    <div class="grid grid-cols-3 gap-2">
                        ${["Desayuno", "Almuerzo", "Cena"].map(meal => `
                            <button type="button" class="meal-btn flex flex-col items-center gap-1 p-3 rounded-2xl border-2 transition-all ${currentMeal === meal ? 'border-primary bg-primary/5 text-primary' : 'border-surface-variant bg-surface text-on-surface-variant opacity-60'}" data-meal="${meal}">
                                <span class="text-[10px] font-black uppercase">${meal}</span>
                            </button>
                        `).join('')}
                    </div>
                </div>

                <div class="relative group mt-2">
                    <div id="scan-feedback" class="absolute inset-0 bg-primary/10 rounded-full scale-0 transition-transform duration-500"></div>
                    <button id="main-scan-btn" class="relative h-40 w-48 rounded-[2.5rem] bg-primary text-white shadow-xl shadow-primary/30 flex flex-col items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all disabled:grayscale disabled:opacity-50">
                        <svg class="h-14 w-14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A10.003 10.003 0 0012 3m0 0c.887 0 1.741.099 2.56.287M12 3v18m0-18a10.005 10.005 0 018.574 14.821m-5.965-12.727L12 3m0 0l-5.609 5.094M12 3L6.391 8.094M12 3l5.609 5.094" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
                        <span class="text-[10px] font-black uppercase tracking-widest">Validar Huella</span>
                    </button>
                </div>

                <div id="attendance-status" class="text-center min-h-[60px] flex flex-col justify-center">
                    <p class="text-xs font-bold text-on-surface-variant opacity-40 uppercase">Esperando validación...</p>
                </div>

                <button id="back-to-home" class="${button.base} ${button.ghost} text-on-surface-variant opacity-40 text-xs">Regresar al inicio</button>
            </div>
            
            <div id="last-registrations" class="mt-8 w-full max-w-md space-y-3"></div>
        </div>
    `;
    this.setupEventListeners(acciones);
  }

  getSuggestedMeal() {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 11) return "Desayuno";
    if (hour >= 11 && hour < 16) return "Almuerzo";
    if (hour >= 18 && hour < 22) return "Cena";
    return "Almuerzo";
  }

  setupEventListeners(acciones) {
    const { onManualDni, onScanFingerprint, onVerify, onBack } = acciones;
    let selectedMeal = this.getSuggestedMeal();

    const dniInput = document.getElementById("attendance-dni");
    const status = document.getElementById("attendance-status");
    const btn = document.getElementById("main-scan-btn");
    const feedback = document.getElementById("scan-feedback");

    this.rootElement.querySelectorAll(".meal-btn").forEach(btn => {
        btn.onclick = () => {
            this.rootElement.querySelectorAll(".meal-btn").forEach(b => {
                b.classList.remove("border-primary", "bg-primary/5", "text-primary");
                b.classList.add("border-surface-variant", "bg-surface", "text-on-surface-variant", "opacity-60");
            });
            btn.classList.add("border-primary", "bg-primary/5", "text-primary");
            btn.classList.remove("border-surface-variant", "bg-surface", "text-on-surface-variant", "opacity-60");
            selectedMeal = btn.dataset.meal;
        };
    });

    // MÉTODO: DNI + ENTER
    dniInput.onkeydown = async (e) => {
        if (e.key === 'Enter') {
            const dni = dniInput.value.trim();
            if (dni.length !== 8) {
                toast.error("Por favor, ingrese un DNI válido de 8 dígitos.");
                dniInput.focus();
                return;
            }

            status.innerHTML = `<p class="text-sm font-black text-primary animate-pulse uppercase">Validando DNI...</p>`;
            
            try {
                const result = await onManualDni(dni, selectedMeal);
                if (result.success) {
                    status.innerHTML = `
                        <p class="text-lg font-black text-green-600 uppercase tracking-tight">¡Éxito!</p>
                        <p class="text-xs font-bold text-green-700 mt-1 uppercase tracking-tighter">Registrado: ${result.workerName}</p>
                    `;
                    dniInput.value = "";
                    this.showSuccessAnimation();
                } else {
                    status.innerHTML = `
                        <p class="text-sm font-black text-red-500 uppercase">${result.error}</p>
                    `;
                }
            } catch (error) {
                status.innerHTML = `<p class="text-sm font-black text-red-500 uppercase">Error de sistema</p>`;
            }
        }
    };

    btn.onclick = async () => {
        const dni = dniInput.value.trim();
        
        btn.disabled = true;
        feedback.classList.add("scale-150", "opacity-100", "bg-primary/20");
        status.innerHTML = `<p class="text-sm font-black text-primary animate-pulse uppercase">Coloque su dedo en el lector...</p>`;

        try {
            let result;
            if (dni.length === 8) {
                result = await onVerify(dni, selectedMeal);
            } else {
                result = await onScanFingerprint(selectedMeal);
            }
            
            if (result.success) {
                status.innerHTML = `
                    <p class="text-lg font-black text-green-600 uppercase tracking-tight">¡Éxito!</p>
                    <p class="text-xs font-bold text-green-700 mt-1 uppercase tracking-tighter">Validado: ${result.workerName}</p>
                `;
                dniInput.value = ""; // Limpiar para el siguiente
                this.showSuccessAnimation();
            } else {
                status.innerHTML = `
                    <p class="text-sm font-black text-red-500 uppercase">${result.error}</p>
                    <p class="text-[10px] text-red-400 font-bold mt-1 uppercase">Intente nuevamente o use su DNI + ENTER</p>
                `;
            }
        } catch (e) {
            status.innerHTML = `<p class="text-sm font-black text-red-500 uppercase">Error de sistema</p>`;
        } finally {
            setTimeout(() => {
                btn.disabled = false;
                feedback.classList.remove("scale-150", "opacity-100", "bg-primary/20");
                if (!status.innerText.includes("Éxito")) {
                    status.innerHTML = `<p class="text-xs font-bold text-on-surface-variant opacity-40 uppercase">Esperando validación...</p>`;
                }
            }, 3000);
        }
    };

    document.getElementById("back-to-home").onclick = onBack;
  }

  showSuccessAnimation() {
    const btn = document.getElementById("main-scan-btn");
    btn.classList.add("bg-green-500");
    setTimeout(() => btn.classList.remove("bg-green-500"), 2000);
  }

  renderLastRegistrations(list) {
    const container = document.getElementById("last-registrations");
    if (!container) return;
    if (list.length === 0) { container.innerHTML = ""; return; }

    container.innerHTML = `
        <p class="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/40 text-center mb-4">Últimos registros</p>
        ${list.slice(0, 3).map(reg => `
            <div class="bg-surface/50 backdrop-blur-sm border border-surface-variant p-4 rounded-3xl flex items-center justify-between animate-fade-in">
                <div class="flex items-center gap-3">
                    <div class="h-8 w-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" stroke-width="3"/></svg>
                    </div>
                    <div>
                        <p class="text-xs font-black text-on-background uppercase">${reg.nombreCompleto}</p>
                        <p class="text-[10px] font-bold text-primary uppercase tracking-tighter mb-0.5">${escapeHtml(reg.empresa || 'Particular')} ${reg.cantidadCampo ? `• <span class="bg-primary text-white px-1.5 rounded-full">CAMPO: ${reg.cantidadCampo}</span>` : ''}</p>
                        <p class="text-[10px] font-bold text-on-surface-variant opacity-60">${reg.tipo} • ${reg.timestamp?.seconds ? new Date(reg.timestamp.seconds * 1000).toLocaleTimeString() : 'Recién'}</p>
                    </div>
                </div>
            </div>
        `).join('')}
    `;
  }
}
