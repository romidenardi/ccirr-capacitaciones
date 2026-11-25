import { test } from 'node:test';
import assert from 'node:assert/strict';
import { detectarTipo, rutaDeClave } from '../../src/utils/archivos.js';

const relleno = (inicio) => Buffer.concat([Buffer.from(inicio), Buffer.alloc(20)]);

test('detectarTipo reconoce PDF, JPG, PNG y WEBP por su contenido', () => {
  assert.equal(detectarTipo(relleno('%PDF-1.7')).ext, 'pdf');
  assert.equal(detectarTipo(relleno([0xff, 0xd8, 0xff, 0xe0])).ext, 'jpg');
  assert.equal(detectarTipo(relleno([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])).ext, 'png');
  assert.equal(detectarTipo(Buffer.concat([Buffer.from('RIFF0000WEBP'), Buffer.alloc(10)])).ext, 'webp');
});

test('detectarTipo rechaza otros archivos aunque se llamen .pdf', () => {
  assert.equal(detectarTipo(relleno('MZ ejecutable')), null);
  assert.equal(detectarTipo(relleno('<html>')), null);
  assert.equal(detectarTipo(Buffer.from('%PDF')), null);
});

test('rutaDeClave no permite salir de la carpeta de archivos', () => {
  assert.throws(() => rutaDeClave('../.env'));
  assert.throws(() => rutaDeClave('comprobantes/../../server.js'));
  assert.ok(rutaDeClave('comprobantes/abc.pdf').endsWith('comprobantes/abc.pdf'));
});
