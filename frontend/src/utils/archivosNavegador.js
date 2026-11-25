// Abrir o descargar archivos recibidos del backend (comprobantes, Excel)

// La pestaña se abre ANTES de pedir el archivo: si se abre después, el navegador la bloquea como ventana emergente
export const abrirEnPestana = async (pedirArchivo) => {
  const pestana = window.open('', '_blank');
  try {
    const archivo = await pedirArchivo();
    const url = URL.createObjectURL(archivo);
    if (pestana) pestana.location.href = url;
    else window.location.href = url;
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  } catch (error) {
    pestana?.close();
    throw error;
  }
};

export const descargar = (archivo, nombre) => {
  const url = URL.createObjectURL(archivo);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombre;
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
};
