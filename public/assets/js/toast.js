export function removeToast() {
    const prev = document.getElementById("toast");
    if (prev) prev.remove();
}

export function showToast(message, type = "success", duration = 2000) {
    removeToast();
    initToastStyles();
    const toast = document.createElement("div");
    toast.id = "toast";
    toast.className = `toast ${type}`;

    const icon = document.createElement("span");
    icon.className = "inline-block";

    if (type === "success") {
        icon.innerHTML = `<svg class="-mb-1 w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 20 20"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 11l4 4L19 7"/></svg>`;
    } else if (type === "error") {
        icon.innerHTML = `<svg class="-mb-1 w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 20 20"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 6l8 8M6 14L14 6"/></svg>`;
    } else if (type === "info") {
        icon.innerHTML = `<svg class="-mb-1 w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="9" stroke-width="2"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6v2m0 4v2"/></svg>`;
    } else if (type === "warning") {
        icon.innerHTML = `<svg class="-mb-1 w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 20 20"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.29 3.86l6.18 11.09A1 1 0 0115.47 17H4.53a1 1 0 01-.87-1.5l6.18-11.09a1 1 0 011.75 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v2m0 4h.01"/></svg>`;
    }

    toast.appendChild(icon);
    toast.appendChild(document.createTextNode(message));
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add("show");
        setTimeout(() => {
            toast.classList.remove("show");
            setTimeout(removeToast, 300);
        }, duration);
    }, 100);
}

export function initToastStyles() {
    if (!document.getElementById("toast-style")) {
        const style = document.createElement("style");
        style.id = "toast-style";
        style.innerHTML = `
            .toast {
                position: fixed;
                top: 2rem;
                right: 2rem;
                min-width: 220px;
                max-width: 320px;
                z-index: 9999;
                padding: 1rem 1rem;
                border-radius: 0.5rem;
                color: #fff;
                font-weight: 450;
                box-shadow: 0 2px 12px 0 rgba(0,0,0,0.15);
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.3s, transform 0.3s;
                transform: translateY(-20px);
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            .toast.show {
                opacity: 1;
                pointer-events: auto;
                transform: translateY(0);
            }
            .toast.success { background: #16a34a; }
            .toast.error { background: #dc2626; }
            .toast.info { background: #2563eb; }
            .toast.warning { background: #f59e42; }
        `;
        document.head.appendChild(style);
    }
}