import { test } from 'node:test';
import assert from 'node:assert/strict';
import { slugify } from '../../src/utils/slug.js';

test('slugify saca tildes, símbolos y espacios', () => {
  assert.equal(slugify('Liderazgo & Equipos 2026'), 'liderazgo-equipos-2026');
  assert.equal(slugify('  Comunicación Efectiva  '), 'comunicacion-efectiva');
  assert.equal(slugify('Ñandú'), 'nandu');
});
