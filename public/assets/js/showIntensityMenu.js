export function showIntensityMenu(sintoma, callback) {
    const chatContainer = document.getElementById("chat-container");
    const menuDiv = document.createElement("div");
    menuDiv.id = "intensity-menu";
    menuDiv.className = "chat-message flex justify-center";
    menuDiv.innerHTML = `
        <div class="bg-white rounded-xl shadow-sm p-4 mb-4 border border-gray-100 text-center">
            <div class="mb-2 font-semibold text-gray-700">¿Qué intensidad tiene tu síntoma <span class="text-blue-700">${sintoma.titulo}</span>?</div>
            <div class="flex gap-2 justify-center">
                <button class="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-700 transition" data-intensity="Normal">Normal</button>
                <button class="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-700 transition" data-intensity="Medio">Medio</button>
                <button class="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-700 transition" data-intensity="Muy Fuerte">Muy Fuerte</button>
            </div>
        </div>
    `;
    chatContainer.appendChild(menuDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    menuDiv.querySelectorAll("button").forEach((btn) => {
        btn.addEventListener("click", () => {
            const intensidad = btn.getAttribute("data-intensity");
            menuDiv.remove();
            callback(intensidad);
        });
    });
}