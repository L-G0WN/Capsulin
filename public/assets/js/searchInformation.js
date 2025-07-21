import { addChatMessage } from "./addChatMessage.js";
import { showTyping } from "./showTyping.js";
import { getSintomasPosibles } from "./getSymptons.js";
import { showIntensityMenu } from "./showIntensityMenu.js";

export async function searchInformation(query) {
    showTyping();

    // Obtener síntomas posibles desde la base de datos
    const sintomasPosibles = await getSintomasPosibles();
    const lowerQuery = query.toLowerCase();
    const sintomaDetectado = sintomasPosibles.find((s) =>
        lowerQuery.includes(
            (typeof s === "string" ? s : s.titulo || "").toLowerCase()
        )
    );

    // Si detecta un síntoma y no hay intensidad, obliga a seleccionar intensidad
    if (
        sintomaDetectado &&
        !["normal", "medio", "muy fuerte"].some((i) =>
            lowerQuery.includes(i),
        )
    ) {
        document.getElementById("typing-indicator")?.remove();
        showIntensityMenu(sintomaDetectado, (intensidad) => {
            if (intensidad) {
                searchInformation(`${query} ${intensidad}`);
            }
        });
        return;
    }

    try {
        const response = await fetch(
            `/api/search?query=${encodeURIComponent(query)}`,
        );

        if (!response.ok) {
            throw new Error(
                `Error ${response.status}: ${response.statusText}`,
            );
        }

        const results = await response.json();

        document.getElementById("typing-indicator")?.remove();

        let responseHTML = "";

        // Mostrar síntomas
        if (results.sintomas && results.sintomas.length > 0) {
            results.sintomas.forEach((info) => {
                if (info.sinMedicamentosPorIntensidad) {
                    responseHTML += 
                    `
                    <section class="bg-white rounded-xl shadow-sm p-4 mb-4 border border-gray-100">
                        <div class="font-semibold text-lg mb-2">${info.sintoma}</div>
                        <div class="text-red-600 text-sm">No hay medicamentos recomendados para este síntoma con la intensidad seleccionada.</div>
                    </section>
                    `;
                    return;
                }

                responseHTML += 
                `
                <section class="bg-white rounded-xl shadow-sm p-4 mb-4 border border-gray-100">
                    <div class="flex items-center mb-2">
                        <span class="font-semibold text-lg">${info.sintoma}</span>
                    </div>
                    <div class="flex flex-wrap gap-2 mb-2">
                        ${info.categoria ? `<span class="px-2 py-1 rounded-full bg-orange-100 text-xs text-orange-700">Categoría: ${info.categoria}</span>` : ""}
                        ${info.frecuencia ? `<span class="px-2 py-1 rounded-full bg-blue-100 text-xs text-blue-700">Frecuencia: ${info.frecuencia}</span>` : ""}      
                        ${info.medicamentos && info.medicamentos.length > 0
                        ? (() => {
                            const intensidadesUnicas = [
                                ...new Set(
                                    info.medicamentos
                                        .map((med) => med.intensidad)
                                        .filter(Boolean),
                                ),
                            ];
                            return intensidadesUnicas
                                .map(
                                    (intensidad) =>
                                        `<span class="px-2 py-1 rounded-full bg-red-100 text-xs text-red-700">Intensidad: ${intensidad}</span>`,
                                )
                                .join("");
                        })()
                        : ""
                    }
            </div>
            <div class="mb-2 text-sm text-gray-700">${info.descripcion} Recomendación: ${info.recomendacion}</div>
            ${info.medicamentos && info.medicamentos.length > 0
                        ? `<div class="mt-2">
                        <span class="font-medium text-gray-800">Medicamentos recomendados:</span>
                        <ul class="mt-1 space-y-1">
                            ${info.medicamentos
                            .map(
                                (med) => `
                                    <li class="pl-2 border-l-2 border-gray-300 text-sm">
                                        <span class="font-semibold text-gray-800">${med.nombre} <span class="text-xs">(${med.dosis}):</span></span>
                                        ${med.efectos ? `<span>${med.efectos}</span>` : ""}
                                        ${med.contraindicaciones ? `<br><span >Contraindicaciones: ${med.contraindicaciones}</span>` : ""}
                                        ${med.duracion ? `<br><span>Duración: ${med.duracion}</span>` : ""}
                                        ${med.presentacion ? `<br><span>Presentación: ${med.presentacion}</span>` : ""}
                                    </li>
                                `,
                            )
                            .join("")}
                        </ul>
                    </div>`
                        : ""
                    }
            <div class="mt-2 text-xs text-red-500">Emergencia: ${info.emergencia}</div>
        </section>
        `;
            });
        }
        // Mostrar medicamentos directos (si no están relacionados a síntomas)
        if (
            results.medicamentos &&
            results.medicamentos.length > 0
        ) {
            responseHTML += `
    <section class="bg-white rounded-xl shadow-sm p-4 mb-4 border border-gray-100">
        <div class="font-medium text-gray-800 mb-2">Medicamento encontrado:</div>
        <ul class="space-y-2">
            ${results.medicamentos
                    .map(
                        (med) => `
                        <li class="pl-2 border-l-2 border-gray-300 text-sm">
                            <span class="font-semibold text-gray-800">${med.nombre}</span>
                            ${med.efectos ? `<span>${med.efectos}</span>` : ""}
                            ${med.contraindicaciones ? `<br><span>Contraindicaciones: ${med.contraindicaciones}</span>` : ""}
                            ${med.duracion ? `<br><span>Duración: ${med.duracion}</span>` : ""}
                            ${med.presentacion ? `<br><span>Presentación: ${med.presentacion}</span>` : ""}
                            ${med.sintomas && med.sintomas.length > 0
                                ? `<br><span class="text-blue-800">Trata: ${med.sintomas.map((s) => s).join(", ")}</span>`
                                : ""
                            }
                        </li>
                    `,
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
                true,
            );
            return;
        }

        addChatMessage(responseHTML, true);
    } catch (error) {
        document.getElementById("typing-indicator")?.remove();
        addChatMessage(
            `<p>${error.message}. Por favor intenta nuevamente.</p>`,
            true,
        );
    }
}
