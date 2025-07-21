import { addChatMessage } from './addChatMessage.js';
import { searchInformation } from './searchInformation.js';

document.addEventListener("DOMContentLoaded", () => {
    // Manejadores de eventos para enviar preguntas
    document.getElementById("submit-button").addEventListener("click", () => {
        const input = document.getElementById("user-input");
        const query = input.value.trim();
        if (query) {
            addChatMessage(query);
            searchInformation(query);
            input.value = "";
        }
    });

    document.getElementById("user-input").addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            const input = document.getElementById("user-input");
            const query = input.value.trim();
            if (query) {
                addChatMessage(query);
                searchInformation(query);
                input.value = "";
            }
        }
    });

    // Mensaje inicial del bot
    addChatMessage(
        `
        <p>¡Hola! Soy <span class="font-semibold">Capsulin</span>, tu asistente farmacéutico.</p>
        <p class="mt-2">Puedes preguntarme cosas como:</p>
        <ul class="list-disc pl-5 mt-1">
            <li>¿Qué sirve para alergias?</li>
            <li>Tengo gripe, ¿qué me recomiendas?</li>
            <li>Dolor de cabeza</li>
        </ul>
    `,
        true,
    );
});