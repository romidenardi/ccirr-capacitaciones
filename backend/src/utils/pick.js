// Copia solo los campos permitidos de un objeto (evita que el body cambie columnas que no corresponde)
export const pick = (source, keys) =>
  Object.fromEntries(keys.filter((key) => source[key] !== undefined).map((key) => [key, source[key]]));
