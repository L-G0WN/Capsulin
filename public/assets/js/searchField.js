document.addEventListener("DOMContentLoaded", () => {
    // Buscador de síntomas
    const sintomaInput = document.getElementById("buscador-sintomas");
    const sintomasTable = document.getElementById("tabla-sintomas");
    if (sintomaInput && sintomasTable) {
        sintomaInput.addEventListener("input", () => {
            const value = sintomaInput.value.toLowerCase();
            Array.from(sintomasTable.tBodies[0].rows).forEach(row => {
                const nombre = row.cells[1]?.textContent?.toLowerCase() || "";
                const descripcion = row.cells[2]?.textContent?.toLowerCase() || "";
                row.style.display = (nombre.includes(value) || descripcion.includes(value)) ? "" : "none";
            });
        });
    }

    // Buscador de medicamentos
    const medicamentoInput = document.getElementById("buscador-medicamentos");
    const medicamentosTable = document.getElementById("tabla-medicamentos");
    if (medicamentoInput && medicamentosTable) {
        medicamentoInput.addEventListener("input", () => {
            const value = medicamentoInput.value.toLowerCase();
            Array.from(medicamentosTable.tBodies[0].rows).forEach(row => {
                // nombre, activo, efectos, categorias
                const nombre = row.cells[1]?.textContent?.toLowerCase() || "";
                const activo = row.cells[2]?.textContent?.toLowerCase() || "";
                const efectos = row.cells[3]?.textContent?.toLowerCase() || "";
                const categorias = row.cells[4]?.textContent?.toLowerCase() || "";
                row.style.display =
                    nombre.includes(value) ||
                    activo.includes(value) ||
                    efectos.includes(value) ||
                    categorias.includes(value)
                        ? ""
                        : "none";
            });
        });
    }

    // Buscador de relaciones
    const relacionInput = document.getElementById("buscador-relaciones");
    const relacionesTable = document.getElementById("tabla-relaciones");
    if (relacionInput && relacionesTable) {
        relacionInput.addEventListener("input", () => {
            const value = relacionInput.value.toLowerCase();
            Array.from(relacionesTable.tBodies[0].rows).forEach(row => {
                // sintoma, medicamento, intensidad
                const sintoma = row.cells[1]?.textContent?.toLowerCase() || "";
                const medicamento = row.cells[2]?.textContent?.toLowerCase() || "";
                const intensidad = row.cells[3]?.textContent?.toLowerCase() || "";
                row.style.display =
                    sintoma.includes(value) ||
                    medicamento.includes(value) ||
                    intensidad.includes(value)
                        ? ""
                        : "none";
            });
        });
    }
});