// Arma un identificador para URL a partir de un texto: "Liderazgo & Equipos 2026" → "liderazgo-equipos-2026"
export const slugify = (text) =>
  String(text)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 200);
