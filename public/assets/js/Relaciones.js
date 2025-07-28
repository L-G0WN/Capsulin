document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("relaciones-form");
    const crearBtn = document.getElementById("btn-crear-relacion");

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
            
        }
    });
});