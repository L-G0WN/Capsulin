export async function getSintomasPosibles() {
    const response = await fetch("/api/sym-list");
    if (response.ok) {
        return await response.json();
    }
    return [];
}