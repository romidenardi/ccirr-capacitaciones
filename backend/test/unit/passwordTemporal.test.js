import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generarPasswordTemporal } from '../../src/utils/passwordTemporal.js';

test('la contraseña temporal tiene el formato esperado y no usa caracteres confusos', () => {
  for (let i = 0; i < 200; i += 1) {
    const password = generarPasswordTemporal();
    assert.match(password, /^[a-z2-9]{4}-[a-z2-9]{4}-[a-z2-9]{4}$/);
    assert.doesNotMatch(password, /[l1io0]/);
  }
});

test('dos contraseñas temporales seguidas son distintas', () => {
  assert.notEqual(generarPasswordTemporal(), generarPasswordTemporal());
});
