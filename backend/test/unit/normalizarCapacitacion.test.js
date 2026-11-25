import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizarCapacitacion } from '../../src/utils/normalizarCapacitacion.js';

test('los campos vacíos quedan como null y los costos como número', () => {
  const r = normalizarCapacitacion({
    nombre: '  Taller  ',
    lugar: '  ',
    costoSocios: '',
    costoNoSocios: '15000',
    cupo: '',
  });
  assert.equal(r.nombre, 'Taller');
  assert.equal(r.lugar, null);
  assert.equal(r.costoSocios, null);
  assert.equal(r.costoNoSocios, 15000);
  assert.equal(r.cupo, null);
});

test('exclusiva para socios: sin costo para no socios', () => {
  const r = normalizarCapacitacion({ exclusivoSocios: true, costoSocios: 5000, costoNoSocios: 9000 });
  assert.equal(r.costoNoSocios, null);
  assert.equal(r.costoSocios, 5000);
});

test('la modalidad limpia el lugar o el link que no corresponden', () => {
  assert.equal(normalizarCapacitacion({ modalidad: 'presencial', linkVirtual: 'https://meet.x' }).linkVirtual, null);
  assert.equal(normalizarCapacitacion({ modalidad: 'virtual', lugar: 'Salón' }).lugar, null);
  const hibrida = normalizarCapacitacion({ modalidad: 'hibrida', lugar: 'Salón', linkVirtual: 'https://meet.x' });
  assert.equal(hibrida.lugar, 'Salón');
  assert.equal(hibrida.linkVirtual, 'https://meet.x');
});

test('en una edición parcial usa la modalidad que ya tenía', () => {
  const r = normalizarCapacitacion({ lugar: 'Salón' }, { modalidad: 'virtual' });
  assert.equal(r.lugar, null);
});
