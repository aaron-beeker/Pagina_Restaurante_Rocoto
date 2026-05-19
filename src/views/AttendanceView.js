import { adminShell, button, form, typography } from "../ui/layout.js";
import { escapeHtml } from "../utils/html.js";
import { toast } from "../utils/notifications.js";

export class AttendanceView {
  constructor(rootElement) {
    this.rootElement = rootElement;
    this.isAutoScanning = false;
    this.isProcessing = false;
  }

  render(acciones) {
    // Detener cualquier escaneo previo al re-renderizar
    this.isAutoScanning = false;
    this.isProcessing = false;

    const currentMeal = this.getSuggestedMeal();

    const mealStyles = {
      Desayuno: {
        active: "border-amber-400 bg-amber-50 text-amber-700 shadow-md shadow-amber-200/50",
        icon: '<path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>',
        accent: "text-amber-500",
      },
      Almuerzo: {
        active: "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-md shadow-emerald-200/50",
        icon: '<path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>',
        accent: "text-emerald-500",
      },
      Cena: {
        active: "border-indigo-500 bg-indigo-50 text-indigo-700 shadow-md shadow-indigo-200/50",
        icon: '<path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>',
        accent: "text-indigo-500",
      },
    };

    this.rootElement.innerHTML = `
        <div class="min-h-screen bg-[#fafafa] lg:h-screen flex items-center justify-center p-4 sm:p-6 overflow-hidden relative">
            <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-50 rounded-full blur-[120px] opacity-60 pointer-events-none"></div>
            <div class="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-blue-50 rounded-full blur-[100px] opacity-50 pointer-events-none"></div>

            <button id="back-to-home-mobile" class="sm:hidden fixed top-6 left-6 z-50 h-10 w-10 bg-white/90 backdrop-blur-xl rounded-2xl shadow-sm border border-stone-200 flex items-center justify-center text-stone-600 active:scale-90 transition-all hover:bg-stone-50">
                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="3" d="M15 19l-7-7 7-7"/></svg>
            </button>

            <div class="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10 animate-fade-in">
                <div class="lg:col-span-6 flex flex-col items-center justify-center order-1">
                    <div class="w-full max-w-sm bg-white rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] border border-stone-100 p-8 sm:p-10 flex flex-col items-center gap-8 relative overflow-hidden transition-all duration-700">
                        <div class="text-center w-full space-y-4">
                            <img src="https://res.cloudinary.com/dhcgrkrdc/image/upload/v1777604357/Logo_Rest_Rocoto_Horizontal_bgslwf.png" class="h-10 sm:h-12 w-auto mx-auto object-contain" />
                            <h2 class="text-[9px] font-black text-stone-300 uppercase tracking-[0.6em] leading-none text-center pl-2">Registrar Asistencia</h2>
                        </div>
                        
                        <div class="w-full space-y-3">
                            <div class="grid grid-cols-3 gap-2">
                                ${Object.entries(mealStyles)
                                  .map(
                                    ([meal, style]) => `
                                    <button type="button" class="meal-btn group flex flex-col items-center gap-2.5 p-4 rounded-3xl border-2 transition-all duration-500 active:scale-95 ${currentMeal === meal ? style.active : "border-stone-50 bg-stone-50/40 text-stone-300"}" data-meal="${meal}" data-active-class="${style.active}">
                                        <svg class="h-5 w-5 transition-transform duration-500 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">${style.icon}</svg>
                                        <span class="text-[8px] font-black uppercase tracking-widest leading-none">${meal}</span>
                                    </button>
                                `
                                  )
                                  .join("")}
                            </div>
                        </div>

                        <div class="w-full">
                            <div class="flex gap-3">
                                <div class="relative group flex-1">
                                    <label class="absolute -top-2 left-6 px-1.5 bg-white text-[8px] font-black uppercase tracking-widest text-primary/30 z-10 transition-colors group-focus-within:text-primary">Identificación</label>
                                    <input type="text" id="attendance-dni" maxlength="8" inputmode="numeric" placeholder="DNI" class="w-full bg-stone-50/30 border border-stone-100 rounded-3xl py-5 px-6 text-2xl font-black text-center tracking-[0.2em] text-primary focus:border-primary/20 focus:bg-white transition-all outline-none shadow-inner" />
                                </div>
                                <button id="manual-dni-btn" class="bg-primary/5 text-primary hover:bg-primary hover:text-white transition-all rounded-3xl px-6 flex flex-col items-center justify-center gap-1 group border border-primary/10">
                                    <svg class="h-6 w-6 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                                    <span class="text-[7px] font-black uppercase tracking-widest">OK</span>
                                </button>
                            </div>
                        </div>

                        <div class="relative w-full flex flex-col items-center gap-4">
                            <div class="flex items-center justify-between w-full px-2">
                                <div class="h-[1px] flex-1 bg-stone-100"></div>
                                <div class="px-4 flex items-center gap-2">
                                    <label class="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" id="auto-scan-toggle" class="sr-only peer">
                                        <div class="w-8 h-4 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-primary"></div>
                                    </label>
                                    <span class="text-[7px] font-black text-stone-400 uppercase tracking-widest">Modo Continuo</span>
                                </div>
                                <div class="h-[1px] flex-1 bg-stone-100"></div>
                            </div>
                            
                            <div class="relative">
                                <div id="scan-feedback" class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-primary/5 rounded-full scale-0 transition-transform duration-700 pointer-events-none"></div>
                                <button id="main-scan-btn" class="relative group h-28 w-28 sm:h-32 sm:w-32 rounded-full bg-primary text-white shadow-2xl shadow-primary/20 flex flex-col items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all duration-500 disabled:grayscale disabled:opacity-30 border-[6px] border-white ring-1 ring-stone-100">
                                    <div id="scan-icon-container" class="h-10 w-10 rounded-2xl bg-white/10 flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
                                        <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4"/><path d="M14 13.12c0 2.38 0 6.38-1 8.88"/><path d="M17.29 21.02c.12-.6.43-2.3.5-3.02"/><path d="M2 12a10 10 0 0 1 18-6"/><path d="M2 16h.01"/><path d="M21.8 16c.2-2 .131-5.354 0-6"/><path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2"/><path d="M8.65 22c.21-.66.45-1.32.57-2"/><path d="M9 6.8a6 6 0 0 1 9 5.2v2"/></svg>
                                    </div>
                                    <span id="scan-btn-text" class="text-[7px] font-black uppercase tracking-[0.2em] opacity-60 group-hover:opacity-100 transition-opacity">Iniciar</span>
                                </button>
                            </div>
                        </div>

                        <div id="attendance-status" class="w-full text-center min-h-[44px] bg-stone-50/50 rounded-2xl p-2 border border-stone-100 flex flex-col justify-center">
                            <p class="text-[8px] font-black text-stone-300 uppercase tracking-widest">En línea</p>
                        </div>

                        <button id="back-to-home" class="hidden sm:inline-flex items-center gap-3 text-stone-300 hover:text-primary font-black text-[8px] uppercase tracking-[0.4em] transition-all">
                            <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="3" d="M15 19l-7-7 7-7"/></svg>
                            Regresar
                        </button>
                    </div>
                </div>

                <div class="lg:col-span-6 order-2 flex flex-col justify-center h-full max-w-sm mx-auto lg:mx-0 w-full pt-4 lg:pt-0">
                    <div id="last-registrations" class="space-y-4 w-full"></div>
                </div>
            </div>
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
    const btnText = document.getElementById("scan-btn-text");
    const feedback = document.getElementById("scan-feedback");
    const autoToggle = document.getElementById("auto-scan-toggle");

    this.rootElement.querySelectorAll(".meal-btn").forEach((btn) => {
      btn.onclick = () => {
        this.rootElement.querySelectorAll(".meal-btn").forEach((b) => {
          const activeClasses = b.dataset.activeClass.split(" ");
          b.classList.remove(...activeClasses, "shadow-md");
          b.classList.add("border-stone-50", "bg-stone-50/40", "text-stone-300");
        });
        const myActiveClass = btn.dataset.activeClass.split(" ");
        btn.classList.add(...myActiveClass, "shadow-md");
        btn.classList.remove("border-stone-50", "bg-stone-50/40", "text-stone-300");
        selectedMeal = btn.dataset.meal;
      };
    });

    const performScan = async () => {
      if (this.isProcessing) return;
      this.isProcessing = true;

      const dni = dniInput.value.trim();
      if (!this.isAutoScanning) btn.disabled = true;

      feedback.classList.add("scale-150", "opacity-100");
      status.innerHTML = `<p class="text-[8px] font-black text-primary animate-pulse uppercase tracking-[0.2em]">Coloque su dedo...</p>`;

      const onStep = (step) => {
        if (step === "captured") {
          status.innerHTML = `
                    <p class="text-[10px] font-black text-emerald-500 uppercase animate-bounce tracking-widest leading-none">¡CAPTURADO!</p>
                    <p class="text-[8px] font-bold text-emerald-600 mt-1 uppercase tracking-tighter">Retire el dedo</p>
                `;
          this.showSuccessAnimation();
        }
      };

      try {
        const result =
          dni.length === 8
            ? await onVerify(dni, selectedMeal, onStep)
            : await onScanFingerprint(selectedMeal, onStep);

        if (result.success) {
          status.innerHTML = `
                    <p class="text-xs font-black text-green-600 uppercase tracking-tight leading-none">¡Bienvenido!</p>
                    <p class="text-[8px] font-bold text-green-700 mt-1 uppercase truncate max-w-[200px] mx-auto">${result.workerName}</p>
                `;
          dniInput.value = "";
          if (this.isAutoScanning) await new Promise((r) => setTimeout(r, 3000));
        } else {
          status.innerHTML = `<p class="text-[9px] font-black text-red-500 uppercase">${result.error}</p>`;
          if (this.isAutoScanning) await new Promise((r) => setTimeout(r, 2000)); // Espera más larga si falla
        }
      } catch (e) {
        status.innerHTML = `<p class="text-[9px] font-black text-red-500 uppercase">Error</p>`;
        if (this.isAutoScanning) await new Promise((r) => setTimeout(r, 2000));
      } finally {
        this.isProcessing = false;
        feedback.classList.remove("scale-150", "opacity-100");
        if (!this.isAutoScanning) {
          btn.disabled = false;
          setTimeout(() => {
            if (!status.innerText.includes("!")) {
              status.innerHTML = `<p class="text-[8px] font-black text-stone-300 uppercase tracking-widest">Listo</p>`;
            }
          }, 3000);
        }
      }
    };

    autoToggle.onchange = async () => {
      this.isAutoScanning = autoToggle.checked;
      if (this.isAutoScanning) {
        btnText.textContent = "ESCANEO ACTIVADO";
        btnText.classList.add("text-emerald-500", "opacity-100");
        btn.classList.add("ring-emerald-400/50", "ring-8");

        while (this.isAutoScanning && document.getElementById("auto-scan-toggle")) {
          await performScan();
          // Si no se capturó o hubo error, esperamos 2 segundos para no saturar con luces
          // Si tuvo éxito, esperamos 3 segundos para que el usuario se retire
          const delay = status.innerText.includes("!") ? 3000 : 2000;
          await new Promise((r) => setTimeout(r, delay));
        }
      } else {
        btnText.textContent = "INICIAR";
        btnText.classList.remove("text-emerald-500", "opacity-100");
        btn.classList.remove("ring-emerald-400/50", "ring-8");
        status.innerHTML = `<p class="text-[8px] font-black text-stone-300 uppercase tracking-widest">Modo manual</p>`;
      }
    };

    btn.onclick = async () => {
      if (this.isAutoScanning) {
        autoToggle.checked = false;
        autoToggle.dispatchEvent(new Event("change"));
        return;
      }
      await performScan();
    };

    const handleManualDni = async () => {
      const dni = dniInput.value.trim();
      if (dni.length !== 8) {
        toast.error("DNI inválido.");
        return;
      }
      if (this.isProcessing) return;
      this.isProcessing = true;
      status.innerHTML = `<p class="text-[8px] font-black text-primary animate-pulse uppercase tracking-[0.2em]">Verificando...</p>`;
      try {
        const result = await onManualDni(dni, selectedMeal);
        if (result.success) {
          status.innerHTML = `
                    <p class="text-xs font-black text-green-600 uppercase tracking-tight leading-none">¡Acceso Correcto!</p>
                    <p class="text-[8px] font-bold text-green-700 mt-1 uppercase truncate max-w-[200px] mx-auto">${result.workerName}</p>
                `;
          dniInput.value = "";
          this.showSuccessAnimation();
        } else {
          status.innerHTML = `<p class="text-[9px] font-black text-red-500 uppercase">${result.error}</p>`;
        }
      } catch (e) {
        status.innerHTML = `<p class="text-[9px] font-black text-red-500 uppercase">Error</p>`;
      } finally {
        this.isProcessing = false;
      }
    };

    document.getElementById("manual-dni-btn").onclick = handleManualDni;

    dniInput.onkeydown = async (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        await handleManualDni();
      }
    };

    const homeAction = () => {
      this.isAutoScanning = false;
      if (this._connectionInterval) clearInterval(this._connectionInterval);
      acciones.onBack();
    };

    // --- Monitor de Conexión (Heartbeat) ---
    const checkScanner = async () => {
      const isConnected = await acciones.onCheckConnection();
      const statusEl = document.getElementById("attendance-status");
      if (!statusEl) return;

      if (isConnected) {
        statusEl.innerHTML = `
                <div class="flex items-center justify-center gap-2">
                    <div class="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    <p class="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Lector en línea</p>
                </div>
            `;
      } else {
        statusEl.innerHTML = `
                <div class="flex items-center justify-center gap-2">
                    <div class="h-1.5 w-1.5 rounded-full bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)]"></div>
                    <p class="text-[8px] font-black text-red-500 uppercase tracking-widest">Lector desconectado</p>
                </div>
            `;
      }
    };

    // Primer check inmediato y luego cada 5 segundos
    checkScanner();
    this._connectionInterval = setInterval(checkScanner, 5000);

    const b1 = document.getElementById("back-to-home");
    if (b1) b1.onclick = homeAction;
    const b2 = document.getElementById("back-to-home-mobile");
    if (b2) b2.onclick = homeAction;
  }

  showSuccessAnimation() {
    const btn = document.getElementById("main-scan-btn");
    if (!btn) return;
    btn.classList.add("bg-green-500", "ring-green-100");
    setTimeout(() => btn && btn.classList.remove("bg-green-500", "ring-green-100"), 2000);
  }

  renderLastRegistrations(list) {
    const container = document.getElementById("last-registrations");
    if (!container) return;
    if (list.length === 0) {
      container.innerHTML = "";
      return;
    }
    container.innerHTML = `
        <div class="flex items-center justify-between mb-4 px-2">
            <h3 class="text-[9px] font-black uppercase tracking-[0.4em] text-stone-300">Actividad Reciente</h3>
            <div class="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
        </div>
        <div class="space-y-3">
            ${list
              .slice(0, 5)
              .map(
                (reg) => `
                <div class="bg-white/70 backdrop-blur-xl border border-white/50 p-4 rounded-[2rem] flex items-center justify-between animate-slide-in-right shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-lg transition-all duration-500">
                    <div class="flex items-center gap-4 min-w-0">
                        <div class="h-11 w-11 rounded-[1.2rem] ${reg.soloCampo ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"} flex items-center justify-center shrink-0 border shadow-sm">
                            ${reg.soloCampo ? "C" : "OK"}
                        </div>
                        <div class="min-w-0">
                            <p class="text-xs font-black text-stone-800 uppercase truncate tracking-tight leading-none">${reg.nombreCompleto}</p>
                            <p class="text-[8px] font-bold text-stone-400 uppercase mt-1">${reg.tipo} • ${escapeHtml(reg.empresa || "Particular")}</p>
                        </div>
                    </div>
                </div>
            `
              )
              .join("")}
        </div>
    `;
  }
}
