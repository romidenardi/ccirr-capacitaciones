import { test } from 'node:test';
import assert from 'node:assert/strict';
import { splitStatements } from '../../src/db/migrations.js';

test('splitStatements separa por ";" e ignora comentarios', () => {
  const sql = '-- comentario\nALTER TABLE a ADD b INT;\nUPDATE a SET b = 1;\n';
  assert.deepEqual(splitStatements(sql), ['ALTER TABLE a ADD b INT', 'UPDATE a SET b = 1']);
});
