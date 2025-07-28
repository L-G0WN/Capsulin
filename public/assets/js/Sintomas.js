document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("sintomas-form");
    const agregarBtn = document.getElementById("btn-agregar-sintoma");
    const editarBtn = document.getElementById("btn-editar-sintoma");
    const eliminarBtn = document.getElementById("btn-eliminar-sintoma");
    const sintomasTable = document.getElementById("tabla-sintomas");
    let editId = null;

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
            window.location.reload();
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
            window.location.reload();
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
                window.location.reload();
            }
        }
    });
});