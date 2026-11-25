// CUIT/CUIL argentino: 11 dígitos, el último es un dígito verificador calculado con los otros diez.

export const soloDigitos = (valor) => String(valor ?? '').replace(/\D/g, '');

export const cuitValido = (valor) => {
  const cuit = soloDigitos(valor);
  if (!/^\d{11}$/.test(cuit)) return false;
  const pesos = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  const suma = pesos.reduce((total, peso, i) => total + peso * Number(cuit[i]), 0);
  const resto = 11 - (suma % 11);
  const verificador = resto === 11 ? 0 : resto === 10 ? 9 : resto;
  return verificador === Number(cuit[10]);
};
