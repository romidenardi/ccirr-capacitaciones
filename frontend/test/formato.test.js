import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatearCosto, formatearHora, formatearModalidad } from '../src/utils/formato.js';

test('formatearCosto muestra "Sin costo" cuando no hay valor', () => {
  assert.equal(formatearCosto(null), 'Sin costo');
  assert.equal(formatearCosto('0.00'), 'Sin costo');
});

test('formatearHora recorta los segundos', () => {
  assert.equal(formatearHora('18:30:00'), '18:30');
});

test('formatearModalidad usa el nombre con tilde', () => {
  assert.equal(formatearModalidad('hibrida'), 'Híbrida');
});
