export function addChatMessage(message, isBot = false) {
    const chatContainer = document.getElementById("chat-container");
    const messageDiv = document.createElement("div");
    messageDiv.className = `chat-message ${isBot ? "" : "flex justify-end"}`;

    messageDiv.innerHTML = isBot
        ? `
        <div class="flex items-start">
            <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-label="Bot" xmlns="http://www.w3.org/2000/svg" style="min-width:20px;min-height:20px;">
                    <circle cx="10" cy="10" r="10" fill="#2563eb"/>
                    <ellipse cx="10" cy="16" rx="6" ry="3" fill="#fff"/>
                    <circle cx="7" cy="11" r="1.5" fill="#fff"/>
                    <circle cx="13" cy="11" r="1.5" fill="#fff"/>
                    <circle cx="7" cy="11" r="0.8" fill="#2563eb"/>
                    <circle cx="13" cy="11" r="0.8" fill="#2563eb"/>
                    <rect x="8" y="14" width="4" height="1.2" rx="0.6" fill="#2563eb"/>
                </svg>
            </div>
            <div class="bg-blue-100 rounded-lg p-3 sm:max-w-xl lg:max-w-md">
                ${message}
            </div>
        </div>
    `
        : `
        <div class="flex items-end">
            <div class="bg-gray-200 rounded-lg p-3 max-w-xs lg:max-w-md">
                <p class="text-gray-800"><strong>Tú:</strong> ${message}</p>
            </div>
            <div class="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center ml-2">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-label="Usuario" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="10" cy="7" r="4" fill="#fff"/>
                    <circle cx="10" cy="7" r="3" fill="#2563eb"/>
                    <rect x="4" y="13" width="12" height="5" rx="2.5" fill="#fff"/>
                    <rect x="6" y="14" width="8" height="3" rx="1.5" fill="#2563eb"/>
                </svg>
            </div>
        </div>
    `;

    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}