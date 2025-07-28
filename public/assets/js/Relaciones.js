document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("relaciones-form");
    const crearBtn = document.getElementById("btn-crear-relacion");

    async function cargarRelaciones(pagina = 1) {
        const res = await fetch(`/api/v1/relaciones?pagina=${pagina}`);
        const { relaciones, relTotal, PAGE_SIZE } = await res.json();
        const tbody = document.getElementById("relaciones-list");
        tbody.innerHTML = relaciones.length === 0
            ? `<tr><td colspan="4" class="text-center py-6 text-gray-400">No hay relaciones registradas.</td></tr>`
            : relaciones.map(r => `
                <tr class="border-b border-gray-300 last:border-b-0 hover:bg-gray-50 transition">
                    <td class="px-6 py-2 text-sm max-w-xs break-words" data-field="relacion_sintoma">${r.sintoma}</td>
                    <td class="px-6 py-2 text-sm max-w-xs break-words" data-field="relacion_medicamento">${r.medicamento}</td>
                    <td class="px-6 py-2 text-sm max-w-xs break-words" data-field="relacion_intensidad">${r.intensidad}</td>
                    <td class="px-6 py-2 text-sm">
                        <button
                            type="button"
                            class="text-red-600 hover:text-red-800 btn-eliminar-relacion"
                            aria-label="Eliminar relación"
                            data-sintoma-id="${r.sintoma_id}"
                            data-medicamento-id="${r.medicamento_id}"
                            data-intensidad="${r.intensidad}"
                        >
                        <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" class="w-5 h-5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                    </td>
                </tr>
            `).join("");
            
        tbody.querySelectorAll('.btn-eliminar-relacion').forEach(btn => {
            btn.addEventListener('click', async function() {
                if (!confirm('¿Estás seguro de eliminar esta relación?')) return;
                const sintoma_id = btn.getAttribute('data-sintoma-id');
                const medicamento_id = btn.getAttribute('data-medicamento-id');
                const intensidad = btn.getAttribute('data-intensidad');
                const params = new URLSearchParams({
                    relacion_sintoma: sintoma_id,
                    relacion_medicamento: medicamento_id,
                    relacion_intensidad: intensidad
                }).toString();
                const res = await fetch(`/api/v1/relaciones?${params}`, { method: 'DELETE' });
                let msg = "Error al eliminar la relación.";
                try {
                    const json = await res.json();
                    msg = json?.error || json?.message || (res.ok ? "Relación eliminada." : msg);
                } catch {}
                alert(msg);
                if (res.ok) cargarRelaciones(1);
            });
        });
        // Mostrar el total de relaciones
        document.getElementById("total-relaciones").textContent = `Total de relaciones: ${relTotal} relaciones`;
        // Actualiza paginación
        const totalPages = Math.max(1, Math.ceil(relTotal / PAGE_SIZE));
        document.getElementById("rel-paginacion").innerHTML = `
            <a href="#" class="px-3 py-1 rounded ${pagina === 1 ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"}" data-page="${pagina - 1}" ${pagina === 1 ? 'tabindex="-1" aria-disabled="true"' : ""}>Anterior</a>
            <span class="px-2 text-sm">Página ${pagina} de ${totalPages}</span>
            <a href="#" class="px-3 py-1 rounded ${pagina === totalPages ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"}" data-page="${pagina + 1}" ${pagina === totalPages ? 'tabindex="-1" aria-disabled="true"' : ""}>Siguiente</a>
        `;
        document.querySelectorAll("#rel-paginacion a[data-page]").forEach(a => {
            a.onclick = (e) => {
                e.preventDefault();
                const page = Number(a.getAttribute("data-page"));
                if (page > 0 && page <= totalPages) cargarRelaciones(page);
            };
        });
    }

    cargarRelaciones(1);

    async function loadSintomasYMedicamentos() {
        const sintomaSelect = document.getElementById("relacion-sintoma");
        const medicamentoSelect = document.getElementById("relacion-medicamento");

        sintomaSelect.innerHTML = '<option value="">Cargando...</option>';
        try {
            const res = await fetch("/api/list/sintomas");
            const sintomas = await res.json();
            sintomaSelect.innerHTML =
                '<option value="" disabled selected>Selecciona el síntoma</option>' +
                sintomas.map(s => `<option value="${s.id}">${s.nombre}</option>`).join("");
        } catch {
            sintomaSelect.innerHTML = '<option value="" disabled>Error al cargar</option>';
        }

        sintomaSelect.addEventListener("change", async (e) => {
            const sintomaId = e.target.value;
            await cargarMedicamentosPorSintoma(sintomaId);
        });

        if (sintomaSelect.value) {
            await cargarMedicamentosPorSintoma(sintomaSelect.value);
        } else {
            medicamentoSelect.innerHTML = '<option value="" disabled>Selecciona el síntoma primero</option>';
        }
    }

    async function cargarMedicamentosPorSintoma(sintomaId) {
        const medicamentoSelect = document.getElementById("relacion-medicamento");
        medicamentoSelect.innerHTML = '<option value="">Cargando...</option>';
        try {
            const res = await fetch(`/api/list/medicamentos?sintomaId=${sintomaId}`);
            const medicamentos = await res.json();
            if (!medicamentos || medicamentos.length === 0) {
                medicamentoSelect.innerHTML = '<option value="" disabled selected>No hay medicamentos disponibles para este síntoma</option>';
            } else {
                medicamentoSelect.innerHTML =
                    '<option value="" disabled selected>Selecciona el medicamento</option>' +
                    medicamentos.map(m =>
                        `<option value="${m.id}">${m.nombre} - ${m.activo}</option>`
                    ).join("");
            }
        } catch {
            medicamentoSelect.innerHTML = '<option value="" disabled>Error al cargar</option>';
        }
    }

    loadSintomasYMedicamentos();

    crearBtn?.addEventListener("click", async (e) => {
        if (form.checkValidity() === false) return;
        e.preventDefault();
        const formData = new FormData(form);
        let data = Object.fromEntries(formData);

        let intensidades = formData.getAll("relacion_intensidad");
        data.relacion_intensidad = intensidades;

        const res = await fetch("/api/v1/relaciones", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        let msg = "Error al agregar la relación.";
        try {
            const json = await res.json();
            msg = json?.error || json?.message || (res.ok ? "Relación creada." : msg);
        } catch {}
        alert(msg);
        if (res.ok) {
            form.reset();
                cargarRelaciones(1);
        }
    });
});