document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("medicamentos-form");
    const agregarBtn = document.getElementById("btn-agregar-medicamento");
    const editarBtn = document.getElementById("btn-editar-medicamento");
    const eliminarBtn = document.getElementById("btn-eliminar-medicamento");
    const medicamentosTable = document.getElementById("tabla-medicamentos");
    let editId = null;

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
            window.location.reload();
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
            window.location.reload();
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
                window.location.reload();
            }
        }
    });
});