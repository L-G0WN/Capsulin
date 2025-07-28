document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("sintomas-form");
    const agregarBtn = document.getElementById("btn-agregar-sintoma");
    const editarBtn = document.getElementById("btn-editar-sintoma");
    const eliminarBtn = document.getElementById("btn-eliminar-sintoma");
    const sintomasTable = document.getElementById("tabla-sintomas");
    let editId = null;

    async function cargarSintomas(pagina = 1) {
        const res = await fetch(`/api/v1/sintomas?pagina=${pagina}`);
        const { sintomas, sintTotal, PAGE_SIZE } = await res.json();
        const tbody = document.getElementById("sintomas-list");
        tbody.innerHTML = sintomas.length === 0
            ? `<tr><td colspan="2" class="text-center py-6 text-gray-400">No hay síntomas registrados.</td></tr>`
            : sintomas.map(s => `
                <tr class="border-b border-gray-300 last:border-b-0 hover:bg-gray-50 transition">
                    <td class="px-6 py-2 hidden text-sm" data-field="sintoma_id">${s.id}</td>
                    <td class="px-6 py-2 text-sm" data-field="sintoma_nombre">${s.nombre}</td>
                    <td class="px-6 py-2 text-sm" data-field="sintoma_descripcion">${s.descripcion}</td>
                </tr>
            `).join("");

        // Mostrar el total de sintomas
        document.getElementById("total-sintomas").textContent = `Total de síntomas: ${sintTotal} síntomas`;
        // Actualiza paginación
        const totalPages = Math.max(1, Math.ceil(sintTotal / PAGE_SIZE));
        document.getElementById("sint-paginacion").innerHTML = `
            <a href="#" class="px-3 py-1 rounded ${pagina === 1 ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"}" data-page="${pagina - 1}" ${pagina === 1 ? 'tabindex="-1" aria-disabled="true"' : ""}>Anterior</a>
            <span class="px-2 text-sm">Página ${pagina} de ${totalPages}</span>
            <a href="#" class="px-3 py-1 rounded ${pagina === totalPages ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"}" data-page="${pagina + 1}" ${pagina === totalPages ? 'tabindex="-1" aria-disabled="true"' : ""}>Siguiente</a>
        `;
        // Listeners
        document.querySelectorAll("#sint-paginacion a[data-page]").forEach(a => {
            a.onclick = (e) => {
                e.preventDefault();
                const page = Number(a.getAttribute("data-page"));
                if (page > 0 && page <= totalPages) cargarSintomas(page);
            };
        });
    }

    // Llama a cargarSintomas(1) al cargar la página
    cargarSintomas(1);

    // Cargar datos al hacer click en la tabla
    sintomasTable?.addEventListener("click", (e) => {
        const tr = e.target.closest("tr");
        if (!tr || tr.querySelector("td").classList.contains("text-center")) return;
        const id = tr.querySelector('[data-field="sintoma_id"]')?.textContent;
        Array.from(form.elements).forEach(el => {
            if (el.name && tr.querySelector(`[data-field="${el.name}"]`)) {
                el.value = tr.querySelector(`[data-field="${el.name}"]`).textContent;
            }
        });
        editId = id;
    });

    // POST - Agregar síntoma
    agregarBtn?.addEventListener("click", async (e) => {
        if (editId) return;
        if (form.checkValidity() === false) return;
        e.preventDefault();
        const data = Object.fromEntries(new FormData(form));
        const res = await fetch("/api/v1/sintomas", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        let msg = "Error al agregar el síntoma.";
        try {
            const json = await res.json();
            msg = json?.error || json?.message || (res.ok ? "Síntoma agregado." : msg);
        } catch {}
        alert(msg);
        if (res.ok) {
            form.reset();
            editId = null;
            cargarSintomas(1);
        }
    });

    // PUT - Editar síntoma
    editarBtn?.addEventListener("click", async (e) => {
        if (!editId) return;
        if (form.checkValidity() === false) return;
        e.preventDefault();
        if (!confirm("¿Seguro que deseas actualizar este síntoma?")) return;
        const data = Object.fromEntries(new FormData(form));
        const res = await fetch(`/api/v1/sintomas?id=${editId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        let msg = "Error al actualizar el síntoma.";
        try {
            const json = await res.json();
            msg = json?.error || json?.message || (res.ok ? "Síntoma actualizado." : msg);
        } catch {}
        alert(msg);
        if (res.ok) {
            form.reset();
            editId = null;
            cargarSintomas(1);
        }
    });

    // DELETE - Eliminar síntoma
    eliminarBtn?.addEventListener("click", async () => {
        if (!editId) return;
        const nombre = form.elements["sintoma_nombre"]?.value || "";
        if (confirm(`¿Eliminar este síntoma: ${nombre}?`)) {
            const res = await fetch(`/api/v1/sintomas?id=${editId}`, { method: "DELETE" });
            let msg = "Error al eliminar el síntoma.";
            try {
                const json = await res.json();
                msg = json?.error || json?.message || (res.ok ? "Síntoma eliminado." : msg);
            } catch {}
            alert(msg);
            if (res.ok) {
                form.reset();
                editId = null;
                cargarSintomas(1);
            }
        }
    });
});