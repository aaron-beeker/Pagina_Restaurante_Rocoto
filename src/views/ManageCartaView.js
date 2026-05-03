export class ManageCartaView {
    constructor(rootElement) {
        this.rootElement = rootElement;
    }

    // src/views/ManageCartaView.js

render(platos, categorias, acciones) {
    const { onAdd, onEdit, onDelete, onBack, onSearch, onAddCategory, onDeleteCategory } = acciones;
    this.rootElement.innerHTML = `
        <div class="min-h-screen bg-stone-100 p-4 pt-20 pb-20">
            <div class="mx-auto max-w-6xl rounded-2xl bg-white p-6 shadow-xl">
                
                <div class="mb-8 flex items-center justify-between border-b pb-4">
                    <div>
                        <h2 class="font-h1 text-2xl text-secondary uppercase text-primary">Gestión de Carta General</h2>
                        <p class="text-sm text-stone-500">Administra platos y categorías del restaurante.</p>
                    </div>
                    <button id="back-from-manage" class="flex items-center gap-2 text-stone-400 hover:text-primary transition-colors font-button text-sm">
                        Cerrar Gestión
                    </button>
                </div>

                <!-- 1. GESTIÓN DE CATEGORÍAS (RESTAURADO) -->
                <div class="mb-10 rounded-xl bg-blue-50 p-6 border border-blue-200">
                    <h3 class="mb-4 font-bold text-blue-800 text-sm uppercase">Gestionar Categorías</h3>
                    <div class="flex flex-wrap gap-2 mb-4" id="categories-list">
                        ${categorias.map(cat => `
                            <span class="flex items-center gap-2 rounded-full bg-white border border-blue-300 px-3 py-1 text-xs font-medium text-blue-800">
                                ${cat.nombre}
                                <button class="text-red-500 hover:text-red-700 delete-cat-btn" data-id="${cat.id}" data-nombre="${cat.nombre}">
                                    <svg class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20"><path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"></path></svg>
                                </button>
                            </span>
                        `).join('')}
                    </div>
                    <form id="add-category-form" class="flex gap-2">
                        <input type="text" id="new-cat-name" placeholder="Nombre de nueva categoría" class="flex-1 rounded-lg border-stone-300 text-sm" required>
                        <button type="submit" class="rounded-lg bg-blue-600 px-4 py-2 text-white font-button text-sm hover:bg-blue-700">Añadir Categoría</button>
                    </form>
                </div>

                <!-- 2. FORMULARIO DE PLATOS (MULTICATEGORÍA) -->
                <div class="mb-10 rounded-xl bg-stone-50 p-6 border border-stone-200">
                    <h3 class="mb-4 font-bold text-stone-800 text-sm uppercase">Añadir/Editar Plato</h3>
                    <form id="add-plato-form" class="space-y-4">
                        <input type="hidden" id="edit-id" value="">
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input type="text" id="new-name" placeholder="Nombre del plato" class="rounded-lg border-stone-300 text-sm" required>
                            <input type="number" id="new-price" placeholder="Precio" class="rounded-lg border-stone-300 text-sm" required>
                        </div>

                        <div class="bg-white p-4 rounded-lg border border-stone-200">
                            <p class="text-xs font-bold text-stone-500 uppercase mb-3">Selecciona las Categorías:</p>
                            <div class="flex flex-wrap gap-3">
                                ${categorias.map(cat => `
                                    <label class="flex items-center gap-2 cursor-pointer bg-stone-50 px-3 py-2 rounded-md border border-stone-100 hover:border-primary transition-all">
                                        <input type="checkbox" name="plato-category" value="${cat.nombre}" class="h-4 w-4 rounded border-stone-300 text-primary focus:ring-primary">
                                        <span class="text-sm text-stone-700 font-medium">${cat.nombre}</span>
                                    </label>
                                `).join('')}
                            </div>
                        </div>

                        <button type="submit" class="w-full rounded-lg bg-primary py-3 text-white font-button text-sm font-bold shadow-md hover:brightness-110 transition-all">
                            Guardar en Carta
                        </button>
                    </form>
                </div>

                <!-- 3. BUSCADOR Y TABLA -->
                <div class="mb-6">
                    <input type="text" id="search-plato" placeholder="Buscar por nombre o categoría..." class="w-full rounded-xl border-stone-300 py-3 px-4 text-sm focus:ring-primary">
                </div>
                
                <div class="overflow-x-auto" id="table-container">
                    ${this.renderTableBody(platos)}
                </div>
            </div>
        </div>
    `;
    this.setupEventListeners(acciones);
}

setupEventListeners(acciones) {
    const { onAdd, onEdit, onDelete, onBack, onSearch, onAddCategory, onDeleteCategory } = acciones;

    // Botón de Volver
    document.getElementById('back-from-manage').onclick = onBack;

    // Gestión de Categorías: Añadir
    document.getElementById('add-category-form').onsubmit = (e) => {
        e.preventDefault();
        const nombre = document.getElementById('new-cat-name').value.trim();
        if (nombre) onAddCategory(nombre);
    };

    // Gestión de Categorías: Eliminar
    this.rootElement.querySelectorAll('.delete-cat-btn').forEach(btn => {
        btn.onclick = () => onDeleteCategory(btn.dataset.id);
    });

    // Guardar Plato (Multicategoría)
    document.getElementById('add-plato-form').onsubmit = (e) => {
        e.preventDefault();
        const selectedCats = Array.from(document.querySelectorAll('input[name="plato-category"]:checked')).map(cb => cb.value);
        
        if (selectedCats.length === 0) return alert("Selecciona al menos una categoría");

        const data = {
            name: document.getElementById('new-name').value,
            price: parseFloat(document.getElementById('new-price').value),
            category: selectedCats,
            imageUrl: "https://images.unsplash.com/photo-1512058564366-18510be2db19?q=80&w=1200"
        };
        onAdd(data);
    };

    // Buscador
    document.getElementById('search-plato').oninput = (e) => onSearch(e.target.value);

    // Eventos de Tabla
    this.attachTableEvents(onEdit, onDelete);
}



    attachTableEvents(onEdit, onDelete) {
        this.rootElement.querySelectorAll('.delete-btn').forEach(btn => {
            btn.onclick = () => {
                if (onDelete) onDelete(btn.dataset.id);
            };
        });
        
        this.rootElement.querySelectorAll('.edit-btn').forEach(btn => {
            btn.onclick = () => {
                if (onEdit) onEdit(btn.dataset.id);
            };
        });
    }

   // src/views/ManageCartaView.js

    renderTableBody(platos) {
        return `
            <table class="w-full text-left text-sm">
                <thead>
                    <tr class="border-b text-stone-400 uppercase text-[10px]">
                        <th class="py-3 px-2">Plato</th>
                        <th class="py-3 px-2">Categoría</th>
                        <th class="py-3 px-2">Precio</th>
                        <th class="py-3 px-2 text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody class="divide-y">
                    ${platos.length > 0 ? platos.map(plato => {
                        // Convertimos el array de categorías a texto separado por comas
                        const categoriaTexto = Array.isArray(plato.category) 
                            ? plato.category.join(', ') 
                            : plato.category;

                        return `
                        <tr class="hover:bg-stone-50 transition-colors">
                            <td class="py-4 px-2 font-bold text-stone-800">${plato.name}</td>
                            <td class="py-4 px-2">
                                <span class="rounded-full bg-stone-200 px-2 py-1 text-[10px]">${categoriaTexto}</span>
                            </td>
                            <td class="py-4 px-2 text-primary font-bold">S/ ${plato.price.toFixed(2)}</td>
                            <td class="py-4 px-2 text-right space-x-2">
                                <button class="text-blue-600 hover:underline edit-btn" data-id="${plato.id}">Editar</button>
                                <button class="text-secondary hover:underline delete-btn" data-id="${plato.id}">Eliminar</button>
                            </td>
                        </tr>`;
                    }).join('') : `<tr><td colspan="4" class="py-10 text-center text-stone-400">No se encontraron platos.</td></tr>`}
                </tbody>
            </table>
        `;
    }


    prepareEdit(plato) {
        document.getElementById('new-name').value = plato.name;
        document.getElementById('new-price').value = plato.price;
        document.getElementById('edit-id').value = plato.id;
    
        // REPARACIÓN: Desmarcar todos y marcar solo los que pertenecen al plato
        const checkboxes = document.querySelectorAll('input[name="plato-category"]');
        checkboxes.forEach(cb => {
            cb.checked = Array.isArray(plato.category) 
                ? plato.category.includes(cb.value) 
                : plato.category === cb.value;
        });
    
        const submitBtn = this.rootElement.querySelector('#add-plato-form button[type="submit"]');
        submitBtn.textContent = "Guardar Cambios";
        submitBtn.classList.replace('bg-primary', 'bg-blue-600');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}