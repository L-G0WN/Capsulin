import { addChatMessage } from "./addChatMessage.js";
import { showTyping } from "./showTyping.js";

export async function searchInformation(query) {
    showTyping();

    try {
        const response = await fetch(
            `/api/search?query=${encodeURIComponent(query)}`
        );

        if (!response.ok) {
            throw new Error(
                `Error ${response.status}: ${response.statusText}`
            );
        }

        const results = await response.json();

        document.getElementById("typing-indicator")?.remove();

        let responseHTML = "";

        // Mostrar síntomas
        if (results.sintomas && results.sintomas.length > 0) {
            results.sintomas.forEach((info) => {
                if (info.sinMedicamentosPorIntensidad) {
                    responseHTML += `
                        <section class="bg-white rounded-xl shadow-sm p-4 mb-4 border border-gray-100">
                            <div class="font-semibold text-lg mb-2">${info.nombre}</div>
                            <div class="text-red-600 text-sm">No hay medicamentos recomendados para este síntoma con la intensidad seleccionada.</div>
                        </section>
                    `;
                    return;
                }

                // Obtener intensidades únicas
                const uniqueIntensidades = [
                    ...new Set(
                        (info.medicamentos || [])
                            .filter((med) => med.intensidad)
                            .map((med) => med.intensidad)
                    ),
                ];

                responseHTML += `
                    <section class="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                        <div class="flex items-center">
                            <span class="font-semibold text-lg">${info.nombre}</span>
                        </div>
                        <div class="flex flex-wrap gap-2 mb-2">
                            ${
                                uniqueIntensidades.length > 0
                                    ? uniqueIntensidades
                                        .map(
                                            (intensidad) =>
                                                `<span class="px-2 py-1 rounded-full bg-red-100 text-xs text-red-700">Intensidad: ${intensidad}</span>`
                                        )
                                        .join("")
                                    : ""
                            }
                        </div>
                        <div class="mb-2 text-sm text-gray-700">${info.descripcion}</div>
                        ${
                            info.medicamentos && info.medicamentos.length > 0
                                ? `<div class="mt-2">
                                    <span class="font-medium text-gray-800">Medicamento(s) Recomendado(s):</span>
                                    <ul class="mt-1 space-y-1">
                                        ${info.medicamentos
                                            .map(
                                                (med) => `
                                                    <li class="pl-2 border-l-2 border-gray-300 text-sm">
                                                        <span class="font-semibold">Medicamento:</span> ${med.nombre}
                                                        <br><span class="font-semibold">Activo(s):</span> ${med.activo}
                                                        <br><span class="font-semibold">Efectos:</span> ${med.efectos}
                                                        <br><span class="font-semibold">Categorías:</span> ${med.categorias}
                                                    </li>
                                                `
                                            )
                                            .join("")}
                                    </ul>
                                </div>`
                                : ""
                        }
                    </section>
                `;
            });
        }

        // Mostrar medicamentos directos (si no están relacionados a síntomas)
        if (results.medicamentos && results.medicamentos.length > 0) {
            responseHTML += `
                <section class="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                    <div class="font-medium text-gray-800 mb-2">Medicamento(s) Encontrado(s):</div>
                    <ul class="space-y-2">
                        ${results.medicamentos
                            .map(
                                (med) => `
                                    <li class="pl-2 border-l-2 border-gray-300 text-sm">
                                        <span class="font-semibold">Medicamento:</span> ${med.nombre}
                                        <br><span class="font-semibold">Activo(s):</span> ${med.activo}
                                        <br><span class="font-semibold">Efectos:</span> ${med.efectos}
                                        <br><span class="font-semibold">Categorías:</span> ${med.categorias}
                                        ${
                                            med.sintomas && med.sintomas.length > 0
                                                ? `<br><span class="font-semibold text-blue-800">Trata:</span> ${med.sintomas
                                                      .map((s) => s)
                                                      .join(", ")}`
                                                : ""
                                        }
                                    </li>
                                `
                            )
                            .join("")}
                    </ul>
                </section>
            `;
        }

        // Si no hay resultados
        if (!responseHTML) {
            addChatMessage(
                `<section class="bg-white rounded-xl shadow-sm p-4 border border-gray-100 text-center text-gray-500">
                    No se encontró información relevante. Por favor, intenta ser más específico.
                </section>`,
                true
            );
            return;
        }

        addChatMessage(responseHTML, true);
    } catch (error) {
        document.getElementById("typing-indicator")?.remove();
        addChatMessage(
            `<p>${error.message}. Por favor intenta nuevamente.</p>`,
            true
        );
    }
}