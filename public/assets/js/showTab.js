document.addEventListener('DOMContentLoaded', () => {
    const tabIds = ['sintomas', 'medicamentos', 'relaciones'];

    tabIds.forEach(id => {
        const tabButton = document.getElementById(`tab-${id}`);
        if (tabButton) {
            tabButton.addEventListener('click', () => {
                tabIds.forEach(hideId => {
                    document.getElementById(`${hideId}-content`)?.classList.remove('active');
                    document.getElementById(`tab-${hideId}`)?.classList.remove('active');
                });
                document.getElementById(`${id}-content`)?.classList.add('active');
                tabButton.classList.add('active');
            });
        }
    });
});