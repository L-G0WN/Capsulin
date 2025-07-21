import { addChatMessage } from './addChatMessage.js';
import { searchInformation } from './searchInformation.js';

// Mapeo de IDs a preguntas o síntomas
const quickMap = {
    // Quick questions
    "quick-q1": "¿Qué puedo tomar para el dolor de cabeza?",
    "quick-q2": "¿Cuáles son los efectos secundarios del paracetamol?",
    "quick-q3": "Tengo fiebre, ¿qué debo hacer?",
    "quick-q4": "¿Cuánto tiempo tarda en hacer efecto el ibuprofeno?",
    // Medicamentos populares
    "show-med-paracetamol": "Información sobre paracetamol",
    "show-med-ibuprofeno": "Información sobre ibuprofeno",
    "show-med-loratadina": "Información sobre loratadina",
    "show-med-omeprazol": "Información sobre omeprazol",
    // Síntomas comunes
    "symptom-chip-1": "Tengo dolor de cabeza",
    "symptom-chip-2": "Tengo fiebre",
    "symptom-chip-3": "Tengo tos seca",
    "symptom-chip-4": "Tengo dolor de garganta",
    "symptom-chip-5": "Tengo congestión nasal",
    "symptom-chip-6": "Tengo dolor muscular"
};

// Delegación de eventos SOLO si el id está en el contenedor
document.addEventListener("click", (e) => {
    // Busca el contenedor con id relevante
    let target = e.target;
    // Sube hasta encontrar un div, button o span con id que esté en quickMap
    while (target && target !== document) {
        if (
            (target.tagName === "DIV" || target.tagName === "BUTTON" || target.tagName === "SPAN") &&
            quickMap.hasOwnProperty(target.id)
        ) {
            const pregunta = quickMap[target.id];
            addChatMessage(pregunta);
            searchInformation(pregunta);
            break;
        }
        target = target.parentElement;
    }
});