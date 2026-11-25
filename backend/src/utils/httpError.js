// Error con código HTTP, para cortar un controlador con un mensaje claro: throw httpError('No existe', 404)
export const httpError = (message, status = 400) => {
  const error = new Error(message);
  error.status = status;
  return error;
};
