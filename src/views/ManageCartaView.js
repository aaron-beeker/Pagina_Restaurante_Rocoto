export class ManageCartaView {
    constructor(rootElement) {
        this.rootElement = rootElement;
    }

    render(platos, categorias,acciones) {
        const { onAdd, onEdit, onDelete, onBack, onSearch, onAddCategory, onDeleteCategory } = acciones;
        this.rootElement.innerHTML = `
            <div class="min-h-screen bg-stone-100 p-4 pt-20 pb-20">
                <div class="mx-auto max-w-6xl rounded-2xl bg-white p-6 shadow-xl">
                    
                    <div class="mb-8 flex items-center justify-between border-b pb-4">
                        <div>
                            <h2 class="font-h1 text-2xl text-secondary uppercase">Gestión de Carta General</h2>
                            <p class="text-sm text-stone-500">Administra todos los platos disponibles en el restaurante.</p>
                        </div>
                        <button id="back-from-manage" class="flex items-center gap-2 text-stone-400 hover:text-primary transition-colors font-button text-sm">
                            Cerrar Gestión
                        </button>
                    </div>

                    <!-- Buscador Dinámico -->
                    <div class="mb-6">
                        <div class="relative">
                            <span class="absolute inset-y-0 left-0 flex items-center pl-3">
                                <svg class="h-5 w-5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                            </span>
                            <input type="text" id="search-plato" placeholder="Buscar plato por nombre o categoría..." class="w-full rounded-xl border-stone-300 py-3 pl-10 text-sm focus:border-primary focus:ring-primary">
                        </div>
                    </div>

                    <!-- SECCIÓN NUEVA: Gestión de Categorías -->
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



                    <!-- Formulario de Platos (Existente) -->
                <div class="mb-10 rounded-xl bg-stone-50 p-6 border border-stone-200">
                    <h3 class="mb-4 font-bold text-stone-800 text-sm uppercase">Añadir/Editar Plato</h3>
                    <form id="add-plato-form" class="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <input type="hidden" id="edit-id" value="">
                        <input type="text" id="new-name" placeholder="Nombre del plato" class="rounded-lg border-stone-300 text-sm" required>
                        <input type="number" id="new-price" placeholder="Precio" class="rounded-lg border-stone-300 text-sm" required>
                        <select id="new-category" class="rounded-lg border-stone-300 text-sm">
                            ${categorias.map(cat => `<option value="${cat.nombre}">${cat.nombre}</option>`).join('')}
                        </select>
                        <button type="submit" class="rounded-lg bg-primary py-2 text-white font-button text-sm">Guardar en Carta</button>
                    </form>
                </div>

                


                    <!-- Contenedor de la Tabla (Añadimos un ID para actualizar solo el contenido) -->
                    <div class="overflow-x-auto" id="table-container">
                        ${this.renderTableBody(platos)}
                    </div>

                    
                </div>
            </div>
        `;
        this.setupEventListeners(acciones);
    }

    setupEventListeners(acciones) {
        const { onAdd, onEdit, onDelete, onBack, onSearch } = acciones;
        // 1. Cerrar Panel
        document.getElementById('back-from-manage').onclick = onBack;
        // 2. Formulario de Añadir
        document.getElementById('add-plato-form').onsubmit = (e) => {
            e.preventDefault();
            const data = {
                name: document.getElementById('new-name').value,
                price: parseFloat(document.getElementById('new-price').value),
                category: document.getElementById('new-category').value
            };
            onAdd(data);
        };

        // 3. BUSCADOR (La clave del éxito)
        const searchInput = document.getElementById('search-plato');
        if (searchInput) {
            searchInput.oninput = (e) => {
                if (onSearch) onSearch(e.target.value);
            };
        }
        // Botones de la tabla inicial
        this.attachTableEvents(onEdit, onDelete);

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.onclick = () => onDelete(btn.dataset.id);
        });
        
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.onclick = () => onEdit(btn.dataset.id);
        });


        // 4. Formulario para añadir categorías
        const addCatForm = document.getElementById('add-category-form');
        if (addCatForm) {
            addCatForm.onsubmit = (e) => {
                e.preventDefault();
                const nombre = document.getElementById('new-cat-name').value.trim();
                if (nombre) {
                    acciones.onAddCategory(nombre);
                    addCatForm.reset();
                }
            };
        }

        // 5. Botones para eliminar categorías
        this.rootElement.querySelectorAll('.delete-cat-btn').forEach(btn => {
            btn.onclick = () => {
                const id = btn.dataset.id;
                const nombre = btn.dataset.nombre;
                if (confirm(`¿Estás seguro de eliminar la categoría "${nombre}"? Los platos asociados quedarán sin categoría.`)) {
                    acciones.onDeleteCategory(id);
                }
            };
        });
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
                    ${platos.length > 0 ? platos.map(plato => `
                        <tr class="hover:bg-stone-50 transition-colors">
                            <td class="py-4 px-2 font-bold text-stone-800">${plato.name}</td>
                            <td class="py-4 px-2"><span class="rounded-full bg-stone-200 px-2 py-1 text-[10px]">${plato.category}</span></td>
                            <td class="py-4 px-2 text-primary font-bold">S/ ${plato.price.toFixed(2)}</td>
                            <td class="py-4 px-2 text-right space-x-2">
                                <button class="text-blue-600 hover:underline edit-btn" data-id="${plato.id}">Editar</button>
                                <button class="text-secondary hover:underline delete-btn" data-id="${plato.id}">Eliminar</button>
                            </td>
                        </tr>
                    `).join('') : `<tr><td colspan="4" class="py-10 text-center text-stone-400">No se encontraron platos.</td></tr>`}
                </tbody>
            </table>
        `;
    }


    prepareEdit(plato) {
        document.getElementById('new-name').value = plato.name;
        document.getElementById('new-price').value = plato.price;
        document.getElementById('new-category').value = plato.category;
        document.getElementById('edit-id').value = plato.id;
        
        // Cambiamos el texto del botón para indicar edición
        const submitBtn = this.rootElement.querySelector('#add-plato-form button[type="submit"]');
        submitBtn.textContent = "Guardar Cambios";
        submitBtn.classList.replace('bg-primary', 'bg-blue-600');
        
        // Hacemos scroll hacia arriba para que veas el formulario lleno
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}