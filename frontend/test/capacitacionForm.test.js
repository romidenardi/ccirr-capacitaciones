import { test } from 'node:test';
import assert from 'node:assert/strict';
import { aFormulario, usaLugar, usaLink, linkInscripcion } from '../src/utils/capacitacionForm.js';

test('aFormulario convierte los datos del backend en valores de formulario', () => {
  const f = aFormulario({
    nombre: 'Taller',
    fecha: '2026-12-10',
    horaInicio: '18:30:00',
    horaFin: null,
    costoSocios: null,
    costoNoSocios: '15000.00',
    cupo: 30,
    exclusivoSocios: 0,
  });
  assert.equal(f.horaInicio, '18:30');
  assert.equal(f.horaFin, '');
  assert.equal(f.costoSocios, '');
  assert.equal(f.costoNoSocios, '15000');
  assert.equal(f.cupo, '30');
  assert.equal(f.exclusivoSocios, false);
  assert.equal(f.modalidad, 'presencial');
});

test('qué modalidades usan lugar y link', () => {
  assert.equal(usaLugar('presencial'), true);
  assert.equal(usaLink('presencial'), false);
  assert.equal(usaLugar('virtual'), false);
  assert.equal(usaLink('hibrida'), true);
});

test('linkInscripcion arma el link público', () => {
  assert.equal(linkInscripcion('taller', 'https://x.ar'), 'https://x.ar/inscripcion/taller');
});
