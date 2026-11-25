import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatearCuit, empresaAFormulario } from '../src/utils/empresaForm.js';

test('formatearCuit agrega los guiones', () => {
  assert.equal(formatearCuit('20123456786'), '20-12345678-6');
  assert.equal(formatearCuit(null), '');
  assert.equal(formatearCuit('123'), '123');
});

test('empresaAFormulario convierte nulls en vacíos', () => {
  const f = empresaAFormulario({ nombre: 'X', rubro: null, cuit: '20123456786', emailContacto: null, esSocia: 1 });
  assert.equal(f.rubro, '');
  assert.equal(f.cuit, '20-12345678-6');
  assert.equal(f.esSocia, true);
});
