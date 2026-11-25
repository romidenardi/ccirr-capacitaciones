import { test } from 'node:test';
import assert from 'node:assert/strict';
import { firmarToken, verificarToken, leerToken } from '../../src/utils/token.js';

const SECRETO = 'secreto-solo-para-pruebas-con-32-caracteres';

test('un token firmado se puede verificar con el mismo secreto', () => {
  const token = firmarToken({ id: 'abc', nombre: 'Ana' }, SECRETO);
  assert.equal(verificarToken(token, SECRETO).id, 'abc');
});

test('un token con otro secreto o adulterado no es válido', () => {
  const token = firmarToken({ id: 'abc', nombre: 'Ana' }, SECRETO);
  assert.equal(verificarToken(token, 'otro-secreto-distinto-de-32-caracteres!'), null);
  assert.equal(verificarToken(token + 'x', SECRETO), null);
});

test('leerToken saca el token del encabezado Authorization', () => {
  assert.equal(leerToken('Bearer abc.def'), 'abc.def');
  assert.equal(leerToken('abc.def'), null);
  assert.equal(leerToken(undefined), null);
});
