import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";
import { auth, storage } from "../services/firebaseConfig.js";
import { adminShell, formInput } from "../ui/layout.js";
import { escapeHtml } from "../utils/html.js";

export class HeroPromoAdminView {
  constructor(rootElement) {
    this.rootElement = rootElement;
  }

  render(config, onSave, onClose) {
    const c = config || {};
    const activo = c.activo === true;
    const titulo = c.titulo || "";
    const subtitulo = c.subtitulo || "";
    const imageUrl = c.imageUrl || "";

    this.rootElement.innerHTML = `
      <div class="${adminShell.page}">
        <div class="${adminShell.card}">
          <div class="${adminShell.header}">
            <div>
              <h2 class="${adminShell.title}">Promoción en el inicio</h2>
              <p class="${adminShell.subtitle}">
                Destaca un plato o evento (ej. patasca los domingos): imagen de fondo del hero, título y texto. Los visitantes lo ven al entrar al sitio.
              </p>
            </div>
            <button type="button" id="hero-promo-close" class="${adminShell.backBtn}">Volver al sitio</button>
          </div>

          <form id="hero-promo-form" class="space-y-6">
            <label class="flex cursor-pointer items-center gap-3 rounded-xl border border-stone-200 bg-white p-4">
              <input type="checkbox" id="hero-promo-activo" name="activo" class="h-5 w-5 rounded border-stone-300 text-primary focus:ring-primary" ${activo ? "checked" : ""} />
              <div>
                <span class="font-button text-sm font-semibold text-stone-800">Mostrar promoción en la página de inicio</span>
                <p class="text-xs text-stone-500">Si lo desactivas, se vuelve al mensaje e imagen por defecto del restaurante.</p>
              </div>
            </label>

            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label for="hero-promo-titulo" class="mb-1 block text-xs font-bold uppercase tracking-wide text-stone-500">Título principal</label>
                <input type="text" id="hero-promo-titulo" class="${formInput}" placeholder="Ej. Domingos: Patasca Rocoto" value="${escapeHtml(titulo)}" />
              </div>
              <div>
                <label for="hero-promo-subtitulo" class="mb-1 block text-xs font-bold uppercase tracking-wide text-stone-500">Texto / descripción</label>
                <textarea id="hero-promo-subtitulo" rows="3" class="${formInput}" placeholder="Detalle del evento o promoción"></textarea>
              </div>
            </div>

            <div class="rounded-xl border border-stone-200 bg-stone-50 p-4">
              <p class="mb-3 text-xs font-bold uppercase tracking-wide text-stone-600">Imagen de fondo del hero</p>
              <p class="mb-3 text-xs text-stone-600">
                Sube un archivo (JPG, PNG, WebP) o pega la URL pública de una imagen. Recomendado: foto horizontal, buena luz.
              </p>
              <input type="file" id="hero-promo-file" accept="image/jpeg,image/png,image/webp,image/gif" class="mb-3 block w-full text-sm text-stone-600 file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-4 file:py-2 file:font-button file:text-white" />
              <div>
                <label for="hero-promo-image-url" class="mb-1 block text-xs font-bold uppercase text-stone-500">O URL de imagen</label>
                <input type="url" id="hero-promo-image-url" class="${formInput}" placeholder="https://…" value="${escapeHtml(imageUrl)}" />
              </div>
              <div class="mt-4">
                <p class="mb-2 text-xs text-stone-500">Vista previa</p>
                <div class="overflow-hidden rounded-xl border border-stone-200 bg-stone-200">
                  <img id="hero-promo-preview" alt="Vista previa" class="h-40 w-full object-cover sm:h-52 ${imageUrl ? "" : "opacity-40"}" ${imageUrl ? `src="${escapeHtml(imageUrl)}"` : ""} />
                </div>
              </div>
            </div>

            <button type="submit" class="w-full rounded-xl bg-primary py-4 font-button text-sm font-bold text-white shadow-lg transition-all hover:brightness-110">
              Guardar y publicar
            </button>
          </form>
        </div>
      </div>
    `;

    document.getElementById("hero-promo-subtitulo").value = subtitulo;

    const preview = document.getElementById("hero-promo-preview");
    const urlInput = document.getElementById("hero-promo-image-url");
    const fileInput = document.getElementById("hero-promo-file");

    const setPreviewSrc = (src) => {
      if (src && String(src).trim()) {
        preview.src = src;
        preview.classList.remove("opacity-40");
      } else {
        preview.removeAttribute("src");
        preview.classList.add("opacity-40");
      }
    };

    if (imageUrl) setPreviewSrc(imageUrl);

    let objectUrl = null;
    fileInput.addEventListener("change", () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
        objectUrl = null;
      }
      const f = fileInput.files[0];
      if (f) {
        objectUrl = URL.createObjectURL(f);
        setPreviewSrc(objectUrl);
      }
    });

    urlInput.addEventListener("input", () => {
      const v = urlInput.value.trim();
      if (v) setPreviewSrc(v);
      else if (!fileInput.files?.length) setPreviewSrc("");
    });

    document.getElementById("hero-promo-close").onclick = () => onClose();

    document.getElementById("hero-promo-form").onsubmit = async (e) => {
      e.preventDefault();
      const activoVal = document.getElementById("hero-promo-activo").checked;
      const tituloVal = document.getElementById("hero-promo-titulo").value.trim();
      const subtituloVal = document.getElementById("hero-promo-subtitulo").value.trim();
      let finalUrl = urlInput.value.trim();
      const file = fileInput.files[0];

      if (file) {
        try {
          const user = auth.currentUser;
          const uid = user?.uid || "publico";
          const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
          const path = `hero_promo/${uid}/${Date.now()}_${safeName}`;
          const storageRef = ref(storage, path);
          await uploadBytes(storageRef, file, { contentType: file.type || "image/jpeg" });
          finalUrl = await getDownloadURL(storageRef);
          urlInput.value = finalUrl;
          setPreviewSrc(finalUrl);
        } catch (err) {
          console.error(err);
          alert(
            "No se pudo subir la imagen a Firebase Storage. Revisa las reglas de Storage o usa una URL externa.\n\n" +
              (err?.message || err),
          );
          return;
        }
      }

      if (activoVal && !finalUrl) {
        alert("Para activar la promoción necesitas una imagen: súbela o pega una URL.");
        return;
      }

      await onSave({
        activo: activoVal,
        titulo: tituloVal,
        subtitulo: subtituloVal,
        imageUrl: finalUrl,
      });
    };
  }
}
