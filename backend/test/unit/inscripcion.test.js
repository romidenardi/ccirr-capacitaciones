import { test } from 'node:test';
import assert from 'node:assert/strict';
import { montoAPagar, estadoPagoInicial, estadoPagoVisible, resumenAsistencia } from '../../src/utils/inscripcion.js';

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

test('estadoPagoVisible separa comprobante a revisar de pendiente sin comprobante', () => {
  assert.equal(estadoPagoVisible({ estadoPago: 'no_corresponde' }), 'sin_costo');
  assert.equal(estadoPagoVisible({ estadoPago: 'pendiente', comprobantePagoUrl: 'comprobantes/a.pdf' }), 'revisar');
  assert.equal(estadoPagoVisible({ estadoPago: 'pendiente', comprobantePagoUrl: null }), 'pendiente');
  assert.equal(estadoPagoVisible({ estadoPago: 'confirmado' }), 'confirmado');
});

test('resumenAsistencia calcula si alcanza para el certificado', () => {
  assert.deepEqual(resumenAsistencia(3, 4, 75), { asistidas: 3, totalClases: 4, requeridas: 3, cumple: true });
  assert.equal(resumenAsistencia(2, 4, 75).cumple, false);
  assert.equal(resumenAsistencia(0, 0, 75).cumple, false);
});
