import { test } from 'node:test';
import assert from 'node:assert/strict';
import { inscripcionAFormulario, aEnvioEdicion, ESTADOS_PAGO } from '../src/utils/inscripciones.js';

test('inscripcionAFormulario convierte nulls y montos', () => {
  const f = inscripcionAFormulario({ nombre: 'Ana', dni: null, monto: '12000.00', esSocio: 1 });
  assert.equal(f.dni, '');
  assert.equal(f.monto, '12000');
  assert.equal(f.esSocio, true);
  assert.equal(inscripcionAFormulario({ monto: null }).monto, '');
});

test('aEnvioEdicion no envía el CUIT', () => {
  assert.equal('cuit' in aEnvioEdicion({ cuit: '1', nombre: 'A' }), false);
});

test('hay texto para cada estado de pago', () => {
  for (const estado of ['sin_costo', 'pendiente', 'revisar', 'confirmado', 'rechazado'])
    assert.ok(ESTADOS_PAGO[estado].texto);
});
