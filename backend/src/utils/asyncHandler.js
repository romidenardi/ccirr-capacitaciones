// Envuelve un controlador async para que cualquier error llegue al middleware de errores
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
