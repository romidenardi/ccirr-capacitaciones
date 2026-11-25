import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

// Migraciones: los cambios de base se escriben como archivos SQL numerados en backend/migrations
// (001-agregar-tal-columna.sql, 002-…) y el servidor los aplica solo, en orden, al arrancar.
// La tabla schema_migrations anota cuáles ya se aplicaron: cada una corre una sola vez por base.
//
// Base nueva (no existe la tabla `capacitaciones`): se crea completa desde los modelos con sync()
// y todas las migraciones se dan por aplicadas, porque los modelos ya tienen el esquema al día.

export const MIGRATIONS_DIR = fileURLToPath(new URL('../../migrations/', import.meta.url));
const FILE_RE = /^\d{3}-[\w-]+\.sql$/;

// Separa un archivo en sentencias: por ";" al final de una línea. Ignora los comentarios "--".
export const splitStatements = (sql) =>
  sql
    .split('\n')
    .filter((line) => !line.trim().startsWith('--'))
    .join('\n')
    .split(/;\s*(?:\n|$)/)
    .map((statement) => statement.trim())
    .filter(Boolean);

export const listMigrationFiles = async (dir = MIGRATIONS_DIR) =>
  (await fs.readdir(dir)).filter((name) => FILE_RE.test(name)).sort();

const ensureTable = (sequelize) =>
  sequelize.query(
    'CREATE TABLE IF NOT EXISTS schema_migrations (' +
      'name VARCHAR(255) NOT NULL PRIMARY KEY, ' +
      'applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)',
  );

const appliedNames = async (sequelize) => {
  const [rows] = await sequelize.query('SELECT name FROM schema_migrations');
  return new Set(rows.map((row) => row.name));
};

const markApplied = (sequelize, name) =>
  sequelize.query('INSERT INTO schema_migrations (name) VALUES (:name)', { replacements: { name } });

export const runMigrations = async (sequelize, { dir = MIGRATIONS_DIR, log = console.log } = {}) => {
  const tables = (await sequelize.getQueryInterface().showAllTables()).map((t) =>
    typeof t === 'string' ? t : t.tableName,
  );
  const fresh = !tables.includes('capacitaciones');

  await ensureTable(sequelize);
  const files = await listMigrationFiles(dir);
  const applied = await appliedNames(sequelize);

  if (fresh) {
    await sequelize.sync();
    for (const name of files) if (!applied.has(name)) await markApplied(sequelize, name);
    log(`[migraciones] Base nueva creada desde los modelos (${files.length} migraciones marcadas como aplicadas).`);
    return { fresh: true, applied: [] };
  }

  const pending = files.filter((name) => !applied.has(name));
  for (const name of pending) {
    const statements = splitStatements(await fs.readFile(`${dir}/${name}`, 'utf8'));
    log(`[migraciones] Aplicando ${name}`);
    for (const [index, statement] of statements.entries()) {
      try {
        await sequelize.query(statement);
      } catch (error) {
        error.message = `Migración ${name}, sentencia ${index + 1}: ${error.message}`;
        throw error;
      }
    }
    await markApplied(sequelize, name);
  }
  if (!pending.length) log('[migraciones] La base está al día.');
  return { fresh: false, applied: pending };
};
