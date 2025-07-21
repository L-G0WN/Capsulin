export async function getSintomasPosibles() {
    const response = await fetch("/api/list/sintomas?noRelacionados=false");
    if (response.ok) {
        return await response.json();
    }
    return [];
}