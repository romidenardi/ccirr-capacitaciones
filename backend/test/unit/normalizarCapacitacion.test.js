import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizarCapacitacion, normalizarClase, clasesRequeridas } from '../../src/utils/normalizarCapacitacion.js';

test('los campos vacíos quedan como null y los costos como número', () => {
  const r = normalizarCapacitacion({
    nombre: '  Taller  ',
    temario: '  ',
    costoSocios: '',
    costoNoSocios: '15000',
    cupo: '',
  });
  assert.equal(r.nombre, 'Taller');
  assert.equal(r.temario, null);
  assert.equal(r.costoSocios, null);
  assert.equal(r.costoNoSocios, 15000);
  assert.equal(r.cupo, null);
});

test('exclusiva para socios: sin costo para no socios', () => {
  const r = normalizarCapacitacion({ exclusivoSocios: true, costoSocios: 5000, costoNoSocios: 9000 });
  assert.equal(r.costoNoSocios, null);
  assert.equal(r.costoSocios, 5000);
});

test('la asistencia mínima vacía es 100%', () => {
  assert.equal(normalizarCapacitacion({ asistenciaMinima: '' }).asistenciaMinima, 100);
  assert.equal(normalizarCapacitacion({ asistenciaMinima: '75' }).asistenciaMinima, 75);
});

test('la modalidad de cada clase limpia el lugar o el link que no corresponden', () => {
  const base = { fecha: '2026-12-10', horaInicio: '18:30', lugar: 'Salón', linkVirtual: 'https://meet.x' };
  assert.equal(normalizarClase({ ...base, modalidad: 'presencial' }).linkVirtual, null);
  assert.equal(normalizarClase({ ...base, modalidad: 'virtual' }).lugar, null);
  const hibrida = normalizarClase({ ...base, modalidad: 'hibrida' });
  assert.equal(hibrida.lugar, 'Salón');
  assert.equal(hibrida.linkVirtual, 'https://meet.x');
});

test('clasesRequeridas redondea hacia arriba', () => {
  assert.equal(clasesRequeridas(4, 75), 3);
  assert.equal(clasesRequeridas(3, 75), 3);
  assert.equal(clasesRequeridas(1, 75), 1);
  assert.equal(clasesRequeridas(10, 80), 8);
  assert.equal(clasesRequeridas(5, 100), 5);
});
