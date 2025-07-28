document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("medicamentos-form");
    const agregarBtn = document.getElementById("btn-agregar-medicamento");
    const editarBtn = document.getElementById("btn-editar-medicamento");
    const eliminarBtn = document.getElementById("btn-eliminar-medicamento");
    const medicamentosTable = document.getElementById("tabla-medicamentos");
    let editId = null;

    async function cargarMedicamentos(pagina = 1) {
        const res = await fetch(`/api/v1/medicamentos?pagina=${pagina}`);
        const { medicamentos, medTotal, PAGE_SIZE } = await res.json();
        const tbody = document.getElementById("medicamentos-list");
        tbody.innerHTML = medicamentos.length === 0
            ? `<tr><td colspan="4" class="text-center py-6 text-gray-400">No hay medicamentos registrados.</td></tr>`
            : medicamentos.map(m => `
                <tr class="border-b border-gray-300 last:border-b-0 hover:bg-gray-50 transition">
                    <td class="px-6 py-2 hidden text-sm" data-field="medicamento_id">${m.id}</td>
                    <td class="px-6 py-2 text-sm max-w-xs break-words" data-field="medicamento_nombre">${m.nombre}</td>
                    <td class="px-6 py-2 text-sm max-w-xs break-words" data-field="medicamento_activo">${m.activo}</td>
                    <td class="px-6 py-2 text-sm max-w-xs break-words" data-field="medicamento_efectos">${m.efectos}</td>
                    <td class="px-6 py-2 text-sm max-w-xs break-words" data-field="medicamento_categorias">${m.categorias}</td>
                </tr>
            `).join("");

        // Mostrar el total de medicamentos
        document.getElementById("total-medicamentos").textContent = `Total de medicamentos: ${medTotal} medicamentos`;
        // Actualiza paginación
        const totalPages = Math.max(1, Math.ceil(medTotal / PAGE_SIZE));
        document.getElementById("med-paginacion").innerHTML = `
            <a href="#" class="px-3 py-1 rounded ${pagina === 1 ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"}" data-page="${pagina - 1}" ${pagina === 1 ? 'tabindex="-1" aria-disabled="true"' : ""}>Anterior</a>
            <span class="px-2 text-sm">Página ${pagina} de ${totalPages}</span>
            <a href="#" class="px-3 py-1 rounded ${pagina === totalPages ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"}" data-page="${pagina + 1}" ${pagina === totalPages ? 'tabindex="-1" aria-disabled="true"' : ""}>Siguiente</a>
        `;
        document.querySelectorAll("#med-paginacion a[data-page]").forEach(a => {
            a.onclick = (e) => {
                e.preventDefault();
                const page = Number(a.getAttribute("data-page"));
                if (page > 0 && page <= totalPages) cargarMedicamentos(page);
            };
        });
    }

    cargarMedicamentos(1);

    // Cargar datos al hacer click en la tabla
    medicamentosTable?.addEventListener("click", (e) => {
        const tr = e.target.closest("tr");
        if (!tr || tr.querySelector("td").classList.contains("text-center")) return;
        const id = tr.querySelector('[data-field="medicamento_id"]')?.textContent;
        Array.from(form.elements).forEach(el => {
            if (el.name && tr.querySelector(`[data-field="${el.name}"]`)) {
                el.value = tr.querySelector(`[data-field="${el.name}"]`).textContent;
            }
        });
        editId = id;
    });

    // POST - Agregar medicamento
    agregarBtn?.addEventListener("click", async (e) => {
        if (editId) return;
        if (form.checkValidity() === false) return;
        e.preventDefault();
        const data = Object.fromEntries(new FormData(form));
        const res = await fetch("/api/v1/medicamentos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        let msg = "Error al agregar el medicamento.";
        try {
            const json = await res.json();
            msg = json?.error || json?.message || (res.ok ? "Medicamento agregado." : msg);
        } catch {}
        alert(msg);
        if (res.ok) {
            form.reset();
            editId = null;
            cargarMedicamentos(1);
        }
    });

    // PUT - Editar medicamento
    editarBtn?.addEventListener("click", async (e) => {
        if (!editId) return;
        if (form.checkValidity() === false) return;
        e.preventDefault();
        if (!confirm("¿Seguro que deseas actualizar este medicamento?")) return;
        const data = Object.fromEntries(new FormData(form));
        const res = await fetch(`/api/v1/medicamentos?id=${editId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        let msg = "Error al actualizar el medicamento.";
        try {
            const json = await res.json();
            msg = json?.error || json?.message || (res.ok ? "Medicamento actualizado." : msg);
        } catch {}
        alert(msg);
        if (res.ok) {
            form.reset();
            editId = null;
            cargarMedicamentos(1);
        }
    });

    // DELETE - Eliminar medicamento
    eliminarBtn?.addEventListener("click", async () => {
        if (!editId) return;
        if (confirm("¿Eliminar este medicamento?")) {
            const res = await fetch(`/api/v1/medicamentos?id=${editId}`, { method: "DELETE" });
            let msg = "Error al eliminar el medicamento.";
            try {
                const json = await res.json();
                msg = json?.error || json?.message || (res.ok ? "Medicamento eliminado." : msg);
            } catch {}
            alert(msg);
            if (res.ok) {
                form.reset();
                editId = null;
                cargarMedicamentos(1);
            }
        }
    });
});