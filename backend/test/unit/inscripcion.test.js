import { test } from 'node:test';
import assert from 'node:assert/strict';
import { montoAPagar, estadoPagoInicial } from '../../src/utils/inscripcion.js';

test('montoAPagar según sea socio o no', () => {
  const cap = { costoSocios: null, costoNoSocios: '15000.00' };
  assert.equal(montoAPagar(cap, true), null);
  assert.equal(montoAPagar(cap, false), 15000);
  assert.equal(montoAPagar({ costoSocios: '0.00', costoNoSocios: null }, true), null);
});

test('estadoPagoInicial', () => {
  assert.equal(estadoPagoInicial(null), 'no_corresponde');
  assert.equal(estadoPagoInicial(15000), 'pendiente');
});
