import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  aFormulario,
  aEnvio,
  claseVacia,
  duplicarClase,
  sumarDias,
  clasesRequeridas,
  usaLugar,
  usaLink,
  linkInscripcion,
} from '../src/utils/capacitacionForm.js';

test('aFormulario convierte capacitación y clases en valores de formulario', () => {
  const f = aFormulario({
    nombre: 'Taller',
    costoSocios: null,
    costoNoSocios: '15000.00',
    cupo: 30,
    exclusivoSocios: 0,
    asistenciaMinima: 75,
    clases: [{ id: 'a1', fecha: '2026-12-10', horaInicio: '18:30:00', horaFin: null, modalidad: 'virtual' }],
  });
  assert.equal(f.costoSocios, '');
  assert.equal(f.costoNoSocios, '15000');
  assert.equal(f.cupo, '30');
  assert.equal(f.asistenciaMinima, '75');
  assert.equal(f.exclusivoSocios, false);
  assert.equal(f.clases[0].horaInicio, '18:30');
  assert.equal(f.clases[0].horaFin, '');
  assert.equal(f.clases[0].id, 'a1');
});

test('una capacitación sin clases arranca con una clase vacía', () => {
  assert.equal(aFormulario({ nombre: 'X' }).clases.length, 1);
});

test('aEnvio saca las claves internas y el id vacío de las clases nuevas', () => {
  const nueva = { ...claseVacia(), fecha: '2026-12-10', horaInicio: '18:30' };
  const envio = aEnvio({ nombre: 'X', clases: [{ ...nueva, id: 'a1' }, nueva] });
  assert.equal(envio.clases[0].id, 'a1');
  assert.equal('_clave' in envio.clases[0], false);
  assert.equal('id' in envio.clases[1], false);
});

test('duplicarClase copia la clase una semana después, como clase nueva', () => {
  const original = {
    ...claseVacia(),
    id: 'a1',
    fecha: '2026-12-29',
    horaInicio: '18:30',
    lugar: 'Salón',
    tema: 'Intro',
  };
  const copia = duplicarClase(original);
  assert.equal(copia.fecha, '2027-01-05');
  assert.equal(copia.lugar, 'Salón');
  assert.equal(copia.id, '');
  assert.equal(copia.tema, '');
  assert.notEqual(copia._clave, original._clave);
});

test('sumarDias cruza meses y años', () => {
  assert.equal(sumarDias('2027-02-26', 7), '2027-03-05');
  assert.equal(sumarDias('', 7), '');
});

test('clasesRequeridas redondea hacia arriba', () => {
  assert.equal(clasesRequeridas(4, '75'), 3);
  assert.equal(clasesRequeridas(3, 75), 3);
});

test('qué modalidades usan lugar y link', () => {
  assert.equal(usaLugar('presencial'), true);
  assert.equal(usaLink('presencial'), false);
  assert.equal(usaLink('hibrida'), true);
});

test('linkInscripcion arma el link público', () => {
  assert.equal(linkInscripcion('taller', 'https://x.ar'), 'https://x.ar/inscripcion/taller');
});
