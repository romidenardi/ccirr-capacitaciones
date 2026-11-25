import { test } from 'node:test';
import assert from 'node:assert/strict';
import { montoAPagar, esSocioEfectivo, armarEnvio, VALORES_INSCRIPCION } from '../src/utils/inscripcionForm.js';
import { cuitValido } from '../src/utils/cuit.js';

test('montoAPagar según sea socio o no', () => {
  const cap = { costoSocios: null, costoNoSocios: '15000.00' };
  assert.equal(montoAPagar(cap, true), null);
  assert.equal(montoAPagar(cap, false), 15000);
});

test('esSocioEfectivo: manda la empresa registrada; si es nueva, la respuesta', () => {
  assert.equal(esSocioEfectivo({ encontrada: true, esSocia: false }, 'si'), false);
  assert.equal(esSocioEfectivo({ encontrada: false }, 'si'), true);
  assert.equal(esSocioEfectivo(null, ''), null);
});

test('armarEnvio usa el nombre de la empresa registrada', () => {
  const form = { ...VALORES_INSCRIPCION, organizacion: 'escrito a mano', consentimiento: true };
  const datos = armarEnvio(form, { empresa: { encontrada: true, nombre: 'Registrada SA', esSocia: true } });
  assert.equal(datos.get('organizacion'), 'Registrada SA');
  assert.equal(datos.get('esSocio'), 'true');
  assert.equal(datos.get('consentimiento'), 'true');
  assert.equal(datos.get('comprobante'), null);
});

test('cuitValido (frontend) controla el dígito verificador', () => {
  assert.equal(cuitValido('20-12345678-6'), true);
  assert.equal(cuitValido('20-12345678-5'), false);
});
