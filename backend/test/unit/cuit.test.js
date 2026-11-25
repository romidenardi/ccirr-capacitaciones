import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cuitValido, soloDigitos } from '../../src/utils/cuit.js';

test('soloDigitos saca guiones y espacios', () => {
  assert.equal(soloDigitos('30-71234567-1 '), '30712345671');
});

test('cuitValido controla el dígito verificador', () => {
  assert.equal(cuitValido('20-12345678-6'), true);
  assert.equal(cuitValido('20123456786'), true);
  assert.equal(cuitValido('20-12345678-5'), false);
  assert.equal(cuitValido('2012345678'), false);
  assert.equal(cuitValido(''), false);
});
