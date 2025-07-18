export function cleanQuery(query: string): string {
    const stopwords: string[] = [
        "para",
        "el",
        "la",
        "los",
        "las",
        "me",
        "en",
        "un",
        "una",
        "algo",
        "quiero",
        "necesito",
        "que",
        "por",
        "favor",
        "con",
        "del",
        "tengo",
        "ayuda",
        "sobre",
        "sirve",
        "es",
        "a",
        "lo",
    ];

    // 1. Eliminar caracteres especiales ¿?¡!:;,.
    const withoutSpecialChars = query.replace(/[¿?¡!:;,.]/g, '');
    
    // 2. Normalizar acentos y diacríticos (descompone caracteres acentuados en su base + signo diacrítico)
    const normalized = withoutSpecialChars.normalize("NFD");
    
    // 3. Eliminar signos diacríticos (\u0300-\u036f es el rango Unicode para diacríticos)
    const withoutAccents = normalized.replace(/[\u0300-\u036f]/g, '');
    
    // 4. Limpiar espacios extra que puedan haber quedado
    const trimmed = withoutAccents.trim();
    
    return trimmed
        .toLowerCase()
        .split(/\s+/)
        .filter((word) => !stopwords.includes(word))
        .join(" ");
}
