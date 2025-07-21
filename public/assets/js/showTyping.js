export function showTyping() {
    const chatContainer = document.getElementById("chat-container");
    const typingDiv = document.createElement("div");
    typingDiv.id = "typing-indicator";
    typingDiv.className = "chat-message";
    typingDiv.innerHTML = `
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
            <div class="bg-blue-100 rounded-lg p-3 w-30">
                <p class="text-gray-800">Escribiendo...</p>
            </div>
        </div>
    `;
    chatContainer.appendChild(typingDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}