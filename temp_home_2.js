           <!-- PANEL MI CUENTA (DERECHO) -->
          <div id="user-menu-panel" class="hidden fixed inset-0 z-[100] h-screen w-full flex justify-end">
            <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" onclick="document.getElementById('user-menu-panel').classList.add('hidden')"></div>
            <div class="relative h-full w-80 bg-white shadow-2xl flex flex-col z-[110]">
                <div class="bg-primary p-8 text-white shrink-0">
                  <div class="flex items-center justify-between mb-6">
                      <h2 class="text-xl font-bold uppercase tracking-tight">Mi cuenta</h2>
                      <button class="close-user-menu p-1 text-white/70 hover:text-white transition-colors">
                        <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"></path></svg>
                      </button>
                  </div>
                  <div class="flex items-center gap-3">
                    <div class="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                      <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    </div>
                    <div>
                      <p class="text-sm font-bold">${user ? user.name : "Invitado"}</p>
                      <p class="text-[10px] uppercase tracking-widest opacity-70">${user ? user.role : "Visitante"}</p>
                    </div>
                  </div>
                </div>
                <div class="flex-1 p-6 flex flex-col gap-2 bg-white overflow-y-auto">
                  ${!user ? `
                      <button id="login-btn-panel" class="${button.base} ${button.primary} w-full rounded-2xl py-5">
                        <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-2.21 5.42-7.84 5.42-4.86 0-8.83-4.02-8.83-8.98s3.97-8.98 8.83-8.98c2.76 0 4.61 1.17 5.67 2.18l2.59-2.5c-1.66-1.55-3.82-2.5-8.26-2.5C5.49 1.18 0 6.67 0 13.38s5.49 12.2 12.48 12.2c7.31 0 12.16-5.14 12.16-12.38 0-.83-.09-1.46-.2-2.08h-11.96z"/></svg>
                        Iniciar Sesión con Google
                      </button>` : ""}

                  ${user?.role === "admin" ? `
                      <span class="${layout.label} border-b border-stone-200 pb-2 mb-4">Panel de Administración</span>
                      <button id="admin-daily-menu-btn" class="flex items-center gap-4 rounded-2xl px-4 py-4 text-sm font-bold text-stone-700 hover:bg-stone-50 hover:text-primary transition-all text-left">
                        <div class="p-2 rounded-lg bg-primary/10 text-primary">
                          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                        </div>
                        Actualizar Menú Diario
                      </button>
                      <button id="admin-manage-carta-btn" class="flex items-center gap-4 rounded-2xl px-4 py-4 text-sm font-bold text-stone-700 hover:bg-stone-50 hover:text-primary transition-all text-left">
                        <div class="p-2 rounded-lg bg-secondary/10 text-secondary">
                          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                        </div>
                        Gestionar Carta
                      </button>
                      <button id="admin-hero-promo-btn" class="flex items-center gap-4 rounded-2xl px-4 py-4 text-sm font-bold text-stone-700 hover:bg-stone-50 hover:text-primary transition-all text-left">
                        <div class="p-2 rounded-lg bg-amber-100 text-amber-600">
                          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
                        </div>
                        Banner Destacado
                      </button>
                      <div class="my-6 border-t border-stone-200"></div>
                  ` : ""}

                  ${user ? `
                      <button id="logout-btn" class="flex items-center gap-4 rounded-2xl px-4 py-4 text-sm font-bold text-secondary hover:bg-red-50 transition-all text-left">
                        <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path></svg>
                        Cerrar Sesión
                      </button>` : ""}
                </div>
            </div>
          </div>

         </nav>

         <main>
           <!-- HERO CAROUSEL -->
           <section class="relative h-[65dvh] w-full overflow-hidden sm:h-[80dvh] lg:h-[90dvh]" id="hero">
             <div class="swiper hero-swiper h-full w-full">
                <div class="swiper-wrapper">
                    ${banners.length === 0 ? `
                        <div class="swiper-slide relative flex items-center justify-center">
                            <img src="${DEFAULT_HERO_BG}" class="absolute inset-0 h-full w-full object-cover" />
                        </div>
                    ` : banners.map(b => `
                        <div class="swiper-slide relative flex items-center justify-center">
                            <picture class="absolute inset-0 h-full w-full">
                                <source media="(max-width: 640px)" srcset="${escapeHtml(b.mobileImageUrl || b.imageUrl)}">
                                <img src="${escapeHtml(b.imageUrl)}" class="h-full w-full object-cover" />
                            </picture>
                        </div>
                    `).join("")}
                </div>
                <div class="swiper-pagination !bottom-8"></div>
                <div class="swiper-button-next !text-white after:!text-lg !w-10 !h-10 sm:!w-12 sm:!h-12 !bg-black/20 hover:!bg-black/40 backdrop-blur-sm rounded-full transition-all hidden sm:flex"></div>
                <div class="swiper-button-prev !text-white after:!text-lg !w-10 !h-10 sm:!w-12 sm:!h-12 !bg-black/20 hover:!bg-black/40 backdrop-blur-sm rounded-full transition-all hidden sm:flex"></div>
             </div>
           </section>

           <!-- REST OF THE FILE -->
